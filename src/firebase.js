// ─────────────────────────────────────────────────────────────────────────────
// firebase.js — MS Hospital Diversion Firebase Configuration
// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
//   1. Go to https://console.firebase.google.com
//   2. Create project: "ms-hospital-diversion"
//   3. Add a Web App → copy your firebaseConfig values below
//   4. Enable: Authentication → Email/Password + Anonymous
//   5. Enable: Firestore Database → Start in production mode
//   6. Enable: Cloud Messaging (for push notifications)
//   7. Replace the placeholder values below with your real config
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ── Replace with your Firebase project config ──────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || "ms-hospital-diversion.firebaseapp.com",
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || "ms-hospital-diversion",
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || "ms-hospital-diversion.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID|| "YOUR_SENDER_ID",
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || "YOUR_APP_ID",
  measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID     || "YOUR_MEASUREMENT_ID",
};

// ── Initialize ─────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);
export const auth    = getAuth(app);

// Messaging only works in browser (not Capacitor native layer without plugin)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.log('FCM not available in this environment');
}
export { messaging };

// ── Firestore Collection References ────────────────────────────────────────
export const HOSPITALS_COL  = 'hospitals';
export const ALERTS_COL     = 'alerts';
export const USERS_COL      = 'users';
export const SETTINGS_COL   = 'settings';

// ─────────────────────────────────────────────────────────────────────────────
// HOSPITAL OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subscribe to all hospital statuses in real time.
 * callback receives array of hospital objects.
 * Returns unsubscribe function.
 */
export const subscribeToHospitals = (callback) => {
  const q = query(collection(db, HOSPITALS_COL));
  return onSnapshot(q, (snapshot) => {
    const hospitals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to JS Dates
      updated: doc.data().updated?.toDate() || new Date(),
    }));
    callback(hospitals);
  }, (error) => {
    console.error('Hospital subscription error:', error);
  });
};

/**
 * Subscribe to alerts feed (last 60, real time).
 */
export const subscribeToAlerts = (callback) => {
  const q = query(
    collection(db, ALERTS_COL),
    orderBy('time', 'desc'),
    limit(60)
  );
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      time: doc.data().time?.toDate() || new Date(),
    }));
    callback(alerts);
  });
};

/**
 * Publish a hospital status update.
 * Called by EMS crews, nurses, and admins.
 */
export const publishHospitalUpdate = async ({
  hospitalId,
  status,
  reason,
  etaMinutes,
  capacity,
  waitEd,
  updatedBy,    // { uid, role, displayName }
}) => {
  const hospitalRef = doc(db, HOSPITALS_COL, String(hospitalId));

  // Read current status for the alert
  const snap = await getDoc(hospitalRef);
  const prev = snap.exists() ? snap.data().status : 'OPEN';

  // Update hospital document
  await updateDoc(hospitalRef, {
    status,
    reason: reason || null,
    etaMinutes: etaMinutes || null,
    capacity:   capacity   || null,
    waitEd:     waitEd     || null,
    updated:    serverTimestamp(),
    lastUpdatedBy: updatedBy,
  });

  // Write alert log entry
  const alertRef = doc(collection(db, ALERTS_COL));
  await setDoc(alertRef, {
    hospitalId,
    hospitalName: snap.data()?.name || '',
    city:         snap.data()?.city || '',
    prevStatus:   prev,
    newStatus:    status,
    reason:       reason || null,
    etaMinutes:   etaMinutes || null,
    time:         serverTimestamp(),
    updatedBy,
  });

  return { success: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign in with email/password (used by admin + nurses).
 */
export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Fetch user profile from Firestore
  const userDoc = await getDoc(doc(db, USERS_COL, cred.user.uid));
  return {
    uid:      cred.user.uid,
    email:    cred.user.email,
    ...userDoc.data(),
  };
};

export const logout = () => signOut(auth);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ─────────────────────────────────────────────────────────────────────────────
// PUSH NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const requestNotificationPermission = async (uid) => {
  if (!messaging) return null;
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });
    if (token && uid) {
      // Save FCM token to user's profile
      await updateDoc(doc(db, USERS_COL, uid), {
        fcmToken: token,
        fcmUpdated: serverTimestamp(),
      });
    }
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED SCRIPT — Run once to populate Firestore with all 24 hospitals
// Call seedHospitals() from browser console after signing in as admin
// ─────────────────────────────────────────────────────────────────────────────

export const HOSPITAL_SEED_DATA = [
  { id:"1",  name:"UMMC",             full:"Univ. of MS Medical Center",         city:"Jackson",      region:"Central",   lat:32.535, lng:-90.178, level:"I",   beds:695, phone:"(601) 984-1000", ed:"(601) 984-5500", address:"2500 N State St, Jackson, MS 39216",      specialty:["Trauma L1","Burn","Cardiac","Neuro","Pediatric","Stroke"] },
  { id:"2",  name:"Baptist Medical",  full:"Baptist Medical Center",              city:"Jackson",      region:"Central",   lat:32.298, lng:-90.184, level:"II",  beds:472, phone:"(601) 968-1000", ed:"(601) 968-1500", address:"1225 N State St, Jackson, MS 39202",      specialty:["Cardiac","Stroke","Orthopedic","OB"] },
  { id:"3",  name:"St. Dominic",      full:"St. Dominic Hospital",                city:"Jackson",      region:"Central",   lat:32.308, lng:-90.206, level:"III", beds:535, phone:"(601) 200-2000", ed:"(601) 200-6500", address:"969 Lakeland Dr, Jackson, MS 39216",      specialty:["Cardiac","Stroke","OB","Cancer"] },
  { id:"4",  name:"Merit Central",    full:"Merit Health Central",                city:"Jackson",      region:"Central",   lat:32.277, lng:-90.158, level:"III", beds:319, phone:"(601) 376-1000", ed:"(601) 376-1200", address:"1850 Chadwick Dr, Jackson, MS 39204",     specialty:["General","OB","Behavioral"] },
  { id:"5",  name:"Merit River Oaks", full:"Merit Health River Oaks",             city:"Flowood",      region:"Central",   lat:32.333, lng:-90.132, level:"III", beds:158, phone:"(601) 932-1030", ed:"(601) 932-1100", address:"1030 River Oaks Dr, Flowood, MS 39232",   specialty:["General","Ortho","Cardiac"] },
  { id:"6",  name:"Woman's Hosp.",    full:"Woman's Hospital",                    city:"Flowood",      region:"Central",   lat:32.372, lng:-90.168, level:"III", beds:180, phone:"(601) 932-1000", ed:"(601) 932-1050", address:"1026 N Flowood Dr, Flowood, MS 39232",    specialty:["OB","Gynecology","NICU","Maternal-Fetal"] },
  { id:"7",  name:"Forrest General",  full:"Forrest General Hospital",            city:"Hattiesburg",  region:"South",     lat:31.327, lng:-89.296, level:"II",  beds:537, phone:"(601) 288-7000", ed:"(601) 288-4600", address:"6051 US-49, Hattiesburg, MS 39401",       specialty:["Trauma","Cardiac","Stroke","Cancer","OB"] },
  { id:"8",  name:"Wesley Medical",   full:"Wesley Medical Center",               city:"Hattiesburg",  region:"South",     lat:31.302, lng:-89.281, level:"III", beds:211, phone:"(601) 268-8000", ed:"(601) 268-8100", address:"5001 W Hardy St, Hattiesburg, MS 39402",  specialty:["General","Cardiac","OB"] },
  { id:"9",  name:"Memorial Gulfport",full:"Memorial Hospital at Gulfport",       city:"Gulfport",     region:"Coast",     lat:30.388, lng:-89.057, level:"II",  beds:445, phone:"(228) 867-4000", ed:"(228) 867-4911", address:"4500 13th St, Gulfport, MS 39501",        specialty:["Trauma","Cardiac","Stroke","Burn","OB"] },
  { id:"10", name:"Singing River",    full:"Singing River Health System",         city:"Pascagoula",   region:"Coast",     lat:30.359, lng:-88.563, level:"II",  beds:457, phone:"(228) 809-5000", ed:"(228) 809-5100", address:"2809 Denny Ave, Pascagoula, MS 39581",    specialty:["Trauma","Cardiac","OB","Stroke"] },
  { id:"11", name:"Ocean Springs",    full:"Ocean Springs Hospital",              city:"Ocean Springs", region:"Coast",    lat:30.411, lng:-88.830, level:"III", beds:175, phone:"(228) 818-1111", ed:"(228) 818-1200", address:"3109 Bienville Blvd, Ocean Springs, MS",  specialty:["General","OB","Cardiac"] },
  { id:"12", name:"Garden Park",      full:"Garden Park Medical Center",          city:"Gulfport",     region:"Coast",     lat:30.393, lng:-89.073, level:"III", beds:130, phone:"(228) 575-7000", ed:"(228) 575-7100", address:"15200 Community Rd, Gulfport, MS 39503",  specialty:["General","Ortho","Cardiac"] },
  { id:"13", name:"Anderson Regional",full:"Anderson Regional Medical Center",    city:"Meridian",     region:"East",      lat:32.371, lng:-88.703, level:"II",  beds:260, phone:"(601) 553-6000", ed:"(601) 553-6100", address:"2124 14th St, Meridian, MS 39301",        specialty:["Cardiac","Stroke","Cancer","OB"] },
  { id:"14", name:"Rush Foundation",  full:"Rush Foundation Hospital",            city:"Meridian",     region:"East",      lat:32.364, lng:-88.697, level:"III", beds:182, phone:"(601) 483-0011", ed:"(601) 483-0100", address:"1314 19th Ave, Meridian, MS 39301",       specialty:["General","Cardiac","Ortho"] },
  { id:"15", name:"NMMC Tupelo",      full:"North MS Medical Center",             city:"Tupelo",       region:"North",     lat:34.248, lng:-88.746, level:"II",  beds:650, phone:"(662) 377-3000", ed:"(662) 377-3100", address:"830 S Gloster St, Tupelo, MS 38801",      specialty:["Trauma","Cardiac","Stroke","Cancer","OB","Pediatric"] },
  { id:"16", name:"Baptist N. MS",    full:"Baptist Memorial Hosp — North MS",   city:"Oxford",       region:"North",     lat:34.366, lng:-89.518, level:"III", beds:217, phone:"(662) 232-8100", ed:"(662) 232-8200", address:"2301 S Lamar Blvd, Oxford, MS 38655",     specialty:["General","Cardiac","OB","Stroke"] },
  { id:"17", name:"Delta Regional",   full:"Delta Regional Medical Center",       city:"Greenville",   region:"Delta",     lat:33.408, lng:-91.059, level:"II",  beds:189, phone:"(662) 725-5791", ed:"(662) 725-5800", address:"1400 E Union St, Greenville, MS 38703",   specialty:["Cardiac","Stroke","General","OB"] },
  { id:"18", name:"S. Central Reg.",  full:"South Central Regional Medical",      city:"Laurel",       region:"South",     lat:31.694, lng:-89.131, level:"III", beds:180, phone:"(601) 426-4321", ed:"(601) 426-4400", address:"1220 Jefferson St, Laurel, MS 39440",     specialty:["General","Cardiac","OB"] },
  { id:"19", name:"King's Daughters", full:"King's Daughters Medical Center",     city:"Brookhaven",   region:"Southwest", lat:31.579, lng:-90.444, level:"III", beds:122, phone:"(601) 833-6011", ed:"(601) 833-6100", address:"427 Highway 51 N, Brookhaven, MS 39601",  specialty:["General","OB","Cardiac"] },
  { id:"20", name:"SW MS Regional",   full:"SW Mississippi Regional Medical",     city:"McComb",       region:"Southwest", lat:31.245, lng:-90.453, level:"III", beds:143, phone:"(601) 249-5500", ed:"(601) 249-5600", address:"215 Marion Ave, McComb, MS 39648",        specialty:["General","OB","Cardiac"] },
  { id:"21", name:"Oktibbeha County", full:"Oktibbeha County Hospital",           city:"Starkville",   region:"East",      lat:33.460, lng:-88.818, level:"III", beds:95,  phone:"(662) 323-4320", ed:"(662) 323-4400", address:"400 Hospital Rd, Starkville, MS 39759",   specialty:["General","OB"] },
  { id:"22", name:"Merit Natchez",    full:"Merit Health Natchez",                city:"Natchez",      region:"Southwest", lat:31.558, lng:-91.403, level:"III", beds:179, phone:"(601) 443-2100", ed:"(601) 443-2200", address:"54 Seargent Prentiss Dr, Natchez, MS",    specialty:["General","Cardiac","OB"] },
  { id:"23", name:"Winston Medical",  full:"Winston Medical Center",              city:"Louisville",   region:"East",      lat:33.123, lng:-89.057, level:"IV",  beds:65,  phone:"(662) 773-6211", ed:"(662) 773-6300", address:"562 E Main St, Louisville, MS 39339",     specialty:["General"] },
  { id:"24", name:"NMMC Eupora",      full:"North MS Medical Ctr — Eupora",      city:"Eupora",       region:"North",     lat:33.540, lng:-89.289, level:"IV",  beds:72,  phone:"(662) 258-6221", ed:"(662) 258-6300", address:"70 Medical Plaza, Eupora, MS 39744",      specialty:["General"] },
];

export const seedHospitals = async () => {
  console.log('Seeding hospitals to Firestore...');
  for (const h of HOSPITAL_SEED_DATA) {
    await setDoc(doc(db, HOSPITALS_COL, h.id), {
      ...h,
      status:     'OPEN',
      reason:     null,
      etaMinutes: null,
      capacity:   65,
      waitEd:     15,
      fav:        false,
      updated:    serverTimestamp(),
      lastUpdatedBy: { uid: 'seed', role: 'admin', displayName: 'System' },
    });
    console.log(`  ✓ ${h.name}`);
  }
  console.log('Seed complete — 24 hospitals loaded.');
};

// Export Firestore utilities for use in App.jsx
export {
  collection, doc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, serverTimestamp, query, orderBy, limit, where,
};
