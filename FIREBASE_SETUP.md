# Firebase Setup Guide — MS Hospital Diversion
# From zero to live backend in ~30 minutes

---

## STEP 1 — Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Name: `ms-hospital-diversion`
4. Disable Google Analytics (optional for EMS app)
5. Click **Create project**

---

## STEP 2 — Enable Authentication

1. Left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. **Sign-in method** tab → Enable **Email/Password**
4. Click Save

---

## STEP 3 — Create Firestore Database

1. Left sidebar → **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** (our rules will handle access)
4. Choose region: **us-central1** (closest to Mississippi)
5. Click Enable

---

## STEP 4 — Deploy Security Rules

```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Login
firebase login

# In your project directory
cd Mississippi-Hospital-Diversion

# Initialize (select Firestore + Functions + Hosting)
firebase use --add ms-hospital-diversion

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## STEP 5 — Get Your Web App Credentials

1. Firebase Console → ⚙️ Project Settings → **Your apps**
2. Click **"</> Web"** icon → Add app
3. App nickname: `MS Diversion Web`
4. Check **"Also set up Firebase Hosting"**
5. Copy the `firebaseConfig` object

Create `.env.local` in your project root:

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your values:

```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=ms-hospital-diversion.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ms-hospital-diversion
REACT_APP_FIREBASE_STORAGE_BUCKET=ms-hospital-diversion.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123...
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXX
```

---

## STEP 6 — Set Up Push Notifications (FCM)

1. Firebase Console → ⚙️ Project Settings → **Cloud Messaging**
2. Under **"Web Push certificates"** → Click **Generate key pair**
3. Copy the key and add to `.env.local`:
   ```
   REACT_APP_FIREBASE_VAPID_KEY=BNtt...
   ```

---

## STEP 7 — Seed the Database with 24 Hospitals

```bash
# Build and start the app
npm install
npm start

# Open browser → open Developer Console (F12)
# Import and call the seed function:
```

In the browser console (while app is running):
```javascript
// The seedHospitals function is exported from firebase.js
// You must be signed in as admin first

import('/src/firebase.js').then(m => m.seedHospitals())
```

Or create a quick seed page — add this to App.jsx temporarily:
```javascript
import { seedHospitals } from './firebase';

// Add a button in dev mode:
{process.env.NODE_ENV === 'development' && (
  <button onClick={seedHospitals}>Seed DB</button>
)}
```

---

## STEP 8 — Provision User Accounts

### Option A — Firebase Console (manual, quick)

1. Firebase Console → Authentication → Users → **Add user**
2. Enter email + password
3. Copy the UID shown
4. Firestore → users collection → Add document with that UID:
   ```json
   {
     "uid": "abc123",
     "email": "med7@jacksonems.gov",
     "role": "ems",
     "displayName": "Medic 7",
     "unitId": "MED-7",
     "hospitalId": null,
     "region": "Central",
     "fcmToken": null,
     "active": true
   }
   ```

### Option B — Provisioning Script (bulk, recommended)

```bash
# Download service account key:
# Firebase Console → Project Settings → Service Accounts
# → Generate new private key → Save as serviceAccount.json

# Set credentials
export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccount.json"

# Edit scripts/provisionUsers.js with your user list, then:
node scripts/provisionUsers.js
```

---

## STEP 9 — Deploy Cloud Functions

```bash
cd functions
npm install
cd ..

firebase deploy --only functions
```

Functions deployed:
- `onHospitalStatusChange` — push notifications on diversion
- `autoResolveExpiredDiversions` — runs every 15 min
- `createUser` — admin account provisioning

---

## STEP 10 — Deploy Web App to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at:
**https://ms-hospital-diversion.web.app**

This URL becomes your App Store support URL and the
webView URL for the Capacitor native wrapper.

---

## STEP 11 — Update Capacitor to Point to Live URL

In `capacitor.config.ts`, update the server URL for production:

```typescript
server: {
  // Use this for PRODUCTION (hosted Firebase app)
  // url: 'https://ms-hospital-diversion.web.app',

  // Use this for DEV (local hot-reload)
  // url: 'http://192.168.1.X:3000',
  // cleartext: true,
},
```

Then rebuild native apps:
```bash
npm run cap:build
npm run cap:ios      # → Xcode → Archive → App Store
npm run cap:android  # → Android Studio → AAB → Play Store
```

---

## ONGOING WORKFLOW

```bash
# Update code → push to GitHub → deploy
git add -A && git commit -m "Update" && git push origin main

# Rebuild and deploy web
npm run build && firebase deploy --only hosting

# Sync to native apps
npx cap sync

# Submit new version to App Store via Xcode
npx cap open ios
```

---

## ENVIRONMENT CHECKLIST

- [ ] Firebase project created
- [ ] Email/Password auth enabled
- [ ] Firestore database created (us-central1)
- [ ] Security rules deployed
- [ ] `.env.local` filled with credentials
- [ ] VAPID key added for FCM
- [ ] Database seeded with 24 hospitals
- [ ] Admin user created in Firebase Auth + Firestore
- [ ] EMS/Nurse accounts provisioned
- [ ] Cloud Functions deployed
- [ ] Web app deployed to Firebase Hosting
- [ ] Capacitor synced → Xcode build ready

---

## PRIVACY POLICY URL

Your privacy policy is ready at:
`public/privacy-policy.html`

After deploying to Firebase Hosting it will be live at:
`https://ms-hospital-diversion.web.app/privacy-policy.html`

Use this URL in:
- Apple App Store Connect → App Privacy → Privacy Policy URL
- Google Play Console → Store listing → Privacy Policy
