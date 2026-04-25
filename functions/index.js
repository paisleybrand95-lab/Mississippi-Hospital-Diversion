// ─────────────────────────────────────────────────────────────────────────────
// functions/index.js — MS Hospital Diversion Cloud Functions
// ─────────────────────────────────────────────────────────────────────────────
// Deploy with: firebase deploy --only functions
// ─────────────────────────────────────────────────────────────────────────────

const functions  = require('firebase-functions');
const admin      = require('firebase-admin');

admin.initializeApp();

const db  = admin.firestore();
const fcm = admin.messaging();

// ── Status severity ranking ─────────────────────────────────────────────────
const STATUS_RANK = { OPEN: 0, ADVISORY: 1, DIVERSION: 2, BYPASS: 3 };

const STATUS_LABELS = {
  OPEN:     '🟢 OPEN',
  ADVISORY: '🟡 ADVISORY',
  DIVERSION:'🔴 DIVERSION',
  BYPASS:   '🚫 BYPASS',
};

// ─────────────────────────────────────────────────────────────────────────────
// TRIGGER: onHospitalStatusChange
// Fires whenever a hospital document is updated.
// Sends push notifications to all EMS units and admins.
// ─────────────────────────────────────────────────────────────────────────────
exports.onHospitalStatusChange = functions.firestore
  .document('hospitals/{hospitalId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    // Only proceed if status actually changed
    if (before.status === after.status) return null;

    const prevRank = STATUS_RANK[before.status] || 0;
    const newRank  = STATUS_RANK[after.status]  || 0;

    // Only notify on escalations (getting worse) or bypass
    // Comment out the if-block below to notify on ALL changes
    const isEscalation = newRank > prevRank;
    const isBypass     = after.status === 'BYPASS';
    if (!isEscalation && !isBypass) return null;

    const hospitalName = after.name    || 'Unknown Hospital';
    const city         = after.city    || '';
    const reason       = after.reason  ? `\nReason: ${after.reason}` : '';
    const eta          = after.etaMinutes
      ? `\nEst. clear: ~${after.etaMinutes} min` : '';

    const title = isBypass
      ? `🚫 BYPASS — ${hospitalName}`
      : `⚠️ DIVERSION — ${hospitalName}`;

    const body = [
      `${city}, MS`,
      `${STATUS_LABELS[before.status]} → ${STATUS_LABELS[after.status]}`,
      reason,
      eta,
    ].filter(Boolean).join('\n');

    // Fetch all FCM tokens from users collection
    const usersSnap = await db.collection('users')
      .where('fcmToken', '!=', null)
      .get();

    if (usersSnap.empty) {
      console.log('No users with FCM tokens found.');
      return null;
    }

    const tokens = usersSnap.docs
      .map(d => d.data().fcmToken)
      .filter(Boolean);

    if (tokens.length === 0) return null;

    // Build FCM multicast message
    const message = {
      tokens,
      notification: { title, body },
      data: {
        hospitalId: String(context.params.hospitalId),
        status:     after.status,
        prevStatus: before.status,
        reason:     after.reason || '',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: isBypass ? 'high' : 'normal',
        notification: {
          channelId: 'diversion_alerts',
          color:     isBypass ? '#c62828' : '#ff5722',
          sound:     'default',
          priority:  isBypass ? 'max' : 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            alert:            { title, body },
            sound:            'default',
            badge:            1,
            'content-available': 1,
          },
        },
      },
    };

    try {
      const response = await fcm.sendEachForMulticast(message);
      console.log(
        `Notifications sent: ${response.successCount} success, ` +
        `${response.failureCount} failed for ${hospitalName}`
      );

      // Clean up invalid tokens
      const invalidTokenUids = [];
      response.responses.forEach((res, idx) => {
        if (!res.success) {
          const code = res.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokenUids.push(usersSnap.docs[idx].id);
          }
        }
      });

      // Remove stale tokens
      const batch = db.batch();
      invalidTokenUids.forEach(uid => {
        batch.update(db.collection('users').doc(uid), { fcmToken: null });
      });
      if (invalidTokenUids.length > 0) await batch.commit();

    } catch (error) {
      console.error('FCM send error:', error);
    }

    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULED: Daily midnight reset of ADVISORY status if eta has passed
// ─────────────────────────────────────────────────────────────────────────────
exports.autoResolveExpiredDiversions = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const snap = await db.collection('hospitals')
      .where('status', 'in', ['ADVISORY', 'DIVERSION'])
      .get();

    const batch = db.batch();
    let resolved = 0;

    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.etaMinutes || !data.updated) return;

      const updatedMs  = data.updated.toMillis();
      const etaMs      = data.etaMinutes * 60 * 1000;
      const resolveAt  = updatedMs + etaMs;

      if (now.toMillis() >= resolveAt) {
        batch.update(docSnap.ref, {
          status:     'OPEN',
          reason:     null,
          etaMinutes: null,
          updated:    admin.firestore.FieldValue.serverTimestamp(),
          lastUpdatedBy: { uid: 'system', role: 'system', displayName: 'Auto-Resolve' },
        });
        resolved++;
      }
    });

    if (resolved > 0) {
      await batch.commit();
      console.log(`Auto-resolved ${resolved} expired diversions.`);
    }

    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// HTTP: createUser — Admin-only endpoint to provision new EMS/nurse accounts
// Call via: firebase functions:call createUser
// ─────────────────────────────────────────────────────────────────────────────
exports.createUser = functions.https.onCall(async (data, context) => {
  // Verify caller is admin
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only.');
  }

  const { email, password, role, displayName, hospitalId, unitId } = data;

  if (!email || !password || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'email, password, and role required.');
  }

  if (!['ems', 'nurse', 'admin'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'role must be ems, nurse, or admin.');
  }

  // Create Firebase Auth account
  const userRecord = await admin.auth().createUser({ email, password, displayName });

  // Create Firestore user profile
  await db.collection('users').doc(userRecord.uid).set({
    uid:        userRecord.uid,
    email,
    role,
    displayName: displayName || email,
    hospitalId:  hospitalId || null,
    unitId:      unitId     || null,
    fcmToken:    null,
    createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    createdBy:   context.auth.uid,
  });

  return { uid: userRecord.uid, message: `User ${email} created with role: ${role}` };
});
