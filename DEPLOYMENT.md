# MS Hospital Diversion — Capacitor Deployment Guide
# From GitHub → iOS App Store, Google Play & Amazon Appstore

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

1. **Real data backend** — Firebase Firestore (already built — add .env credentials)
2. **Push notifications** — Firebase Cloud Messaging (already built — add VAPID key)
3. **MSDH API** — Contact MS Dept of Health to explore official data integration
4. **Authentication** — Replace demo PINs with secure auth (Firebase Auth already wired)

---

## AMAZON APPSTORE SUBMISSION

The Amazon Appstore is FREE to join (no annual fee) and reaches
Fire tablets widely used in healthcare and EMS dispatch settings.
Your Android build (same APK as Google Play) works on Amazon Fire OS 5+.

### STEP A — Create Amazon Developer Account

1. Go to **https://developer.amazon.com**
2. Click **Sign in** → use or create an Amazon account
3. Click **Get Started** under Apps & Games
4. Complete developer profile (name, address, tax info)
5. Account creation is **free** — no annual fee

---

### STEP B — Build a Signed APK (Android Studio)

Amazon prefers `.apk` over `.aab` (unlike Google Play).

```bash
# Open Android Studio
npm run cap:android

# In Android Studio:
# Build → Generate Signed Bundle / APK
# → Choose APK (not Bundle)
# → Create or select your keystore
#   Key alias: ms-diversion-key
#   Key validity: 25 years
# → Build Type: release
# → Finish
```

Your signed APK will be at:
`android/app/release/app-release.apk`

**Save your keystore file and password safely — you need it for every future update.**

---

### STEP C — Submit to Amazon Appstore

1. Go to **https://developer.amazon.com/apps-and-games**
2. Click **Add New App** → select **Android**
3. Fill in each tab:

**General Information tab:**
```
App title:    MS Hospital Diversion
App SKU:      MSHOSDIV001
Category:     Medical
Content rating: General
```

**Availability & Pricing tab:**
```
Price:        Free
Countries:    United States (at minimum)
```

**Description tab:**
- Paste content from `store-metadata/amazon-appstore-listing.md`
- Short Description: first paragraph of that file
- Long Description: full long description section
- Keywords: the keywords listed (one per line in Amazon's UI)

**Images & Multimedia tab:**
```
App icon:      512×512 PNG (export from assets/icon-source.svg)
Screenshots:   At least 3, recommended 5
               Sizes: 1024×600 or 1280×720 or 1920×1080
```

**Content Rating tab:**
- Answer the questionnaire (answers in amazon-appstore-listing.md)
- Expected result: **General**

**Binary File(s) tab:**
- Upload `android/app/release/app-release.apk`
- Minimum OS: Fire OS 5 (Android 5.1)
- Device support: check all Fire tablet sizes

**Notes to Reviewers:**
```
Demo credentials:
  EMS Crew:  Unit ID = MED-7  |  PIN = 1234
  Admin:     Admin ID = ADMIN  |  PIN = 9999
  Nurse:     Select UMMC       |  PIN = 5678

Public safety app for MS EMS personnel. No PHI collected.
Privacy Policy: https://ms-hospital-diversion.web.app/privacy-policy.html
```

4. Click **Submit App**
5. Amazon review: **1–3 business days**

---

### STEP D — FCM Push Notifications on Fire OS

Amazon Fire devices (Fire OS 5+) include Google Play Services compatibility.
Your existing Firebase Cloud Messaging setup works without code changes.

To verify: after installing on a Fire tablet, sign in as EMS and check
that the Settings → Notifications toggle triggers an FCM token registration.

---

### Amazon vs Google Play vs Apple — Side by Side

| Feature            | Apple App Store | Google Play  | Amazon Appstore |
|--------------------|-----------------|--------------|-----------------|
| Annual fee         | $99/yr          | $25 one-time | **Free**        |
| Review time        | 1–7 days        | 1–3 days     | 1–3 days        |
| Preferred format   | IPA (Xcode)     | AAB          | APK             |
| Fire tablet support| No              | No           | **Yes**         |
| FCM notifications  | APN (Apple)     | FCM          | FCM (Fire OS 5+)|
| EMS/Medical reach  | High            | High         | Fire tablets    |

---

### ONGOING AMAZON UPDATE WORKFLOW

Every time you release a new version:

```bash
# 1. Update version in android/app/build.gradle
#    versionCode: increment by 1 (e.g. 1 → 2)
#    versionName: update string (e.g. "1.0.1")

# 2. Rebuild and sync
npm run cap:build

# 3. Generate new signed APK in Android Studio
#    Build → Generate Signed Bundle/APK → APK → release

# 4. In Amazon Developer Console:
#    My Apps → MS Hospital Diversion → Add Upcoming Version
#    Upload new APK → submit for review
```

---

## STORE LISTING FILES

| File | Contents |
|------|----------|
| `store-metadata/app-store-listing.md` | Apple App Store + Google Play metadata |
| `store-metadata/amazon-appstore-listing.md` | Amazon Appstore metadata |

---

## SUPPORT

Bryan "BW" White
Life Still Goes On Publishing
www.lifestillgoeson.com
