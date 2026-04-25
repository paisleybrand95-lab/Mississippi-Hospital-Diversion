# MS Hospital Diversion — Capacitor Deployment Guide
# From GitHub → iOS App Store & Google Play

---

## PREREQUISITES (install on your Mac before starting)

| Tool | Download | Purpose |
|------|----------|---------|
| Node.js 18+ | nodejs.org | Run npm commands |
| Xcode 15+ | Mac App Store | Build iOS app |
| Android Studio | developer.android.com/studio | Build Android app |
| Apple Developer Account | developer.apple.com | $99/yr — required for App Store |
| Google Play Account | play.google.com/console | $25 one-time — required for Play Store |

---

## STEP 1 — Clone & Install

```bash
# Clone your repo
git clone https://github.com/paisleybrand95-lab/Mississippi-Hospital-Diversion.git
cd Mississippi-Hospital-Diversion

# Install all dependencies (React + Capacitor)
npm install
```

---

## STEP 2 — Build the React App

```bash
npm run build
```

This creates the `/build` folder — the compiled web app that Capacitor wraps.

---

## STEP 3 — Initialize Capacitor (first time only)

```bash
npx cap init "MS Hospital Diversion" "com.msems.hospitaldiversion" --web-dir build
```

---

## STEP 4 — Add iOS & Android Platforms

```bash
# Add iOS (requires Mac + Xcode)
npx cap add ios

# Add Android
npx cap add android
```

This creates `/ios` and `/android` folders with native project files.

---

## STEP 5 — Sync Web Code to Native Projects

```bash
npx cap sync
```

Run this every time you update the React code.

---

## STEP 6 — Apply iOS Permissions (required for GPS + Notifications)

Open `ios/App/App/Info.plist` in a text editor and add the contents
from `ios-config/Info.plist.additions` inside the root `<dict>` block.

Specifically, these keys are REQUIRED for App Store approval:
- NSLocationWhenInUseUsageDescription
- NSLocationAlwaysAndWhenInUseUsageDescription
- UIBackgroundModes

---

## STEP 7 — Apply Android Theme

Copy these files from `android-config/` to your Android project:

```
android-config/colors.xml  →  android/app/src/main/res/values/colors.xml
android-config/styles.xml  →  android/app/src/main/res/values/styles.xml
```

Add the permissions from `android-config/AndroidManifest.additions.xml`
into `android/app/src/main/AndroidManifest.xml`.

---

## STEP 8 — Open in Xcode (iOS)

```bash
npx cap open ios
```

In Xcode:
1. Select your Team (Apple Developer account)
2. Set Bundle Identifier: `com.msems.hospitaldiversion`
3. Set Version: `1.0.0` and Build: `1`
4. Product → Archive → Distribute App → App Store Connect

---

## STEP 9 — Open in Android Studio (Android)

```bash
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Choose "Android App Bundle" (.aab) for Play Store
3. Create or use existing keystore
4. Build release variant
5. Upload .aab to Google Play Console

---

## STEP 10 — App Store Connect Setup

1. Go to https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Fill in:
   - Platform: iOS
   - Name: MS Hospital Diversion
   - Bundle ID: com.msems.hospitaldiversion
   - SKU: MSHOSDIV001
4. Paste content from `store-metadata/app-store-listing.md`
5. Upload screenshots (see sizes in store-metadata file)
6. Add App Review credentials:
   - EMS login: Unit ID = MED-7 | PIN = 1234
7. Submit for review

---

## ONGOING WORKFLOW (after initial setup)

Every time you update the app code:

```bash
# 1. Make changes to src/App.jsx
# 2. Rebuild and sync
npm run cap:build

# 3. Open and submit from Xcode
npm run cap:ios
```

---

## LIVE RELOAD (during development)

To test on a real device with hot reload:

1. Find your Mac's local IP: `ipconfig getifaddr en0`
2. In capacitor.config.ts, uncomment the server block:
   ```
   server: {
     url: 'http://YOUR_IP:3000',
     cleartext: true,
   }
   ```
3. Run: `npm start` (keep running)
4. In another terminal: `npx cap run ios --livereload`

---

## NEXT STEPS AFTER LAUNCH

1. **Real data backend** — Connect to Firebase or Supabase for live hospital updates
2. **Push notifications** — Add Firebase Cloud Messaging for diversion alerts
3. **MSDH API** — Contact MS Dept of Health to explore official data integration
4. **Authentication** — Replace demo PINs with secure auth (Supabase Auth or AWS Cognito)

---

## SUPPORT

Bryan "BW" White
Life Still Goes On Publishing
www.lifestillgoeson.com
