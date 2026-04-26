// ─────────────────────────────────────────────────────────────────────────────
// scripts/provisionUsers.js
// MS Hospital Diversion — Admin User Provisioning Script
//
// Run with: node scripts/provisionUsers.js
// Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
// Or run from Firebase emulator: firebase emulators:exec "node scripts/provisionUsers.js"
// ─────────────────────────────────────────────────────────────────────────────

const admin = require("firebase-admin");

// Initialize with service account (download from Firebase Console →
// Project Settings → Service Accounts → Generate new private key)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "ms-hospital-diversion",
  });
}

const db  = admin.firestore();
const auth = admin.auth();

// ─────────────────────────────────────────────────────────────────────────────
// USER ROSTER
// Edit this list to add/update personnel
// Roles: "admin" | "nurse" | "ems"
// hospitalId: null for EMS/admin, hospital numeric ID for nurses
// ─────────────────────────────────────────────────────────────────────────────
const USERS = [

  // ── ADMINISTRATORS ────────────────────────────────────────────────────────
  {
    email:       "admin@msems.gov",
    password:    "ChangeMe2024!",
    displayName: "MS EMS Bureau Admin",
    role:        "admin",
    hospitalId:  null,
    unitId:      "ADMIN-01",
    region:      null,
  },

  // ── EMS SUPERVISORS ───────────────────────────────────────────────────────
  {
    email:       "supervisor.central@msems.gov",
    password:    "ChangeMe2024!",
    displayName: "Central Region Supervisor",
    role:        "admin",
    hospitalId:  null,
    unitId:      "SUP-CEN",
    region:      "Central",
  },
  {
    email:       "supervisor.coast@msems.gov",
    password:    "ChangeMe2024!",
    displayName: "Coast Region Supervisor",
    role:        "admin",
    hospitalId:  null,
    unitId:      "SUP-CST",
    region:      "Coast",
  },

  // ── EMS CREWS (add as many as needed) ────────────────────────────────────
  {
    email:       "med7@jacksonems.gov",
    password:    "ChangeMe2024!",
    displayName: "Medic 7 — Jackson",
    role:        "ems",
    hospitalId:  null,
    unitId:      "MED-7",
    region:      "Central",
  },
  {
    email:       "als12@jacksonems.gov",
    password:    "ChangeMe2024!",
    displayName: "ALS 12 — Jackson",
    role:        "ems",
    hospitalId:  null,
    unitId:      "ALS-12",
    region:      "Central",
  },
  {
    email:       "rescue3@gulfportems.gov",
    password:    "ChangeMe2024!",
    displayName: "Rescue 3 — Gulfport",
    role:        "ems",
    hospitalId:  null,
    unitId:      "RES-3",
    region:      "Coast",
  },

  // ── CHARGE NURSES (hospitalId must match hospital ID in Firestore) ────────
  {
    email:       "charge.ummc@ummc.edu",
    password:    "ChangeMe2024!",
    displayName: "UMMC ED Charge Nurse",
    role:        "nurse",
    hospitalId:  "1",   // UMMC
    unitId:      null,
    region:      "Central",
  },
  {
    email:       "charge.baptist@baptistms.org",
    password:    "ChangeMe2024!",
    displayName: "Baptist Medical ED Charge Nurse",
    role:        "nurse",
    hospitalId:  "2",   // Baptist Medical
    unitId:      null,
    region:      "Central",
  },
  {
    email:       "charge.stdom@stdom.com",
    password:    "ChangeMe2024!",
    displayName: "St. Dominic ED Charge Nurse",
    role:        "nurse",
    hospitalId:  "3",   // St. Dominic
    unitId:      null,
    region:      "Central",
  },
  {
    email:       "charge.forrest@forrestgeneral.com",
    password:    "ChangeMe2024!",
    displayName: "Forrest General ED Charge Nurse",
    role:        "nurse",
    hospitalId:  "7",   // Forrest General
    unitId:      null,
    region:      "South",
  },
  {
    email:       "charge.memorial@memorialgulfport.com",
    password:    "ChangeMe2024!",
    displayName: "Memorial Gulfport ED Charge Nurse",
    role:        "nurse",
    hospitalId:  "9",   // Memorial Gulfport
    unitId:      null,
    region:      "Coast",
  },
  {
    email:       "charge.nmmc@nmhs.net",
    password:    "ChangeMe2024!",
    displayName: "NMMC Tupelo ED Charge Nurse",
    role:        "nurse",
    hospitalId:  "15",  // NMMC Tupelo
    unitId:      null,
    region:      "North",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROVISION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
async function provisionUser(user) {
  const { email, password, displayName, role, hospitalId, unitId, region } = user;

  try {
    // Check if user already exists
    let uid;
    try {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
      console.log(`  ↻ Updating existing: ${email}`);
    } catch {
      // Create new Auth user
      const created = await auth.createUser({ email, password, displayName });
      uid = created.uid;
      console.log(`  ✓ Created new: ${email}`);
    }

    // Write / update Firestore profile
    await db.collection("users").doc(uid).set({
      uid,
      email,
      displayName,
      role,
      hospitalId:  hospitalId || null,
      unitId:      unitId     || null,
      region:      region     || null,
      fcmToken:    null,
      active:      true,
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, uid, email };
  } catch (err) {
    console.error(`  ✗ Failed: ${email} — ${err.message}`);
    return { success: false, email, error: err.message };
  }
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  MS Hospital Diversion — User Setup    ║");
  console.log("╚════════════════════════════════════════╝\n");
  console.log(`Provisioning ${USERS.length} users...\n`);

  const results = [];
  for (const user of USERS) {
    process.stdout.write(`[${user.role.toUpperCase().padEnd(5)}] ${user.email} ... `);
    const result = await provisionUser(user);
    results.push(result);
  }

  const success = results.filter(r => r.success).length;
  const failed  = results.filter(r => !r.success).length;

  console.log("\n─────────────────────────────────────────");
  console.log(`✓ ${success} users provisioned successfully`);
  if (failed) console.log(`✗ ${failed} failed — check errors above`);
  console.log("\n⚠  Remind all users to change their passwords on first login.");
  console.log("─────────────────────────────────────────\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
