# App Icon & Splash Screen Guide
# MS Hospital Diversion

---

## SOURCE FILE
`assets/icon-source.svg` — 1024×1024 master icon
Design: Navy-to-crimson gradient background, white medical cross, red lightning bolt overlay

---

## GENERATE ALL SIZES (Mac — one command)

Install sharp-cli first:
```bash
npm install -g sharp-cli
```

Then run this script from your project root:
```bash
node assets/generate-icons.js
```

Or manually export with any tool (Figma, Sketch, GIMP, Inkscape).

---

## iOS REQUIRED SIZES
Place in: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

| File Name           | Size (px)  | Usage                          |
|---------------------|------------|--------------------------------|
| icon-20.png         | 20×20      | Notification (1x)              |
| icon-20@2x.png      | 40×40      | Notification (2x)              |
| icon-20@3x.png      | 60×60      | Notification (3x)              |
| icon-29.png         | 29×29      | Settings (1x)                  |
| icon-29@2x.png      | 58×58      | Settings (2x)                  |
| icon-29@3x.png      | 87×87      | Settings (3x)                  |
| icon-40.png         | 40×40      | Spotlight (1x)                 |
| icon-40@2x.png      | 80×80      | Spotlight (2x)                 |
| icon-40@3x.png      | 120×120    | Spotlight (3x)                 |
| icon-60@2x.png      | 120×120    | App icon (2x) ← most phones   |
| icon-60@3x.png      | 180×180    | App icon (3x) ← Pro phones    |
| icon-76.png         | 76×76      | iPad (1x)                      |
| icon-76@2x.png      | 152×152    | iPad (2x)                      |
| icon-83.5@2x.png    | 167×167    | iPad Pro                       |
| icon-1024.png       | 1024×1024  | App Store listing ✦ NO ALPHA   |

✦ The 1024×1024 App Store icon must have NO transparent pixels.
  Use solid background (already handled in our SVG).

---

## ANDROID REQUIRED SIZES
Place in: `android/app/src/main/res/`

| Folder              | File            | Size (px) |
|---------------------|-----------------|-----------|
| mipmap-mdpi/        | ic_launcher.png | 48×48     |
| mipmap-hdpi/        | ic_launcher.png | 72×72     |
| mipmap-xhdpi/       | ic_launcher.png | 96×96     |
| mipmap-xxhdpi/      | ic_launcher.png | 144×144   |
| mipmap-xxxhdpi/     | ic_launcher.png | 192×192   |
| mipmap-xxxhdpi/     | ic_launcher_foreground.png | 432×432 (adaptive) |

Also create `ic_launcher_round.png` versions in each folder (same sizes).

---

## SPLASH SCREEN SIZES

### iOS
| Device              | Size (px)       |
|---------------------|-----------------|
| iPhone (portrait)   | 1290×2796       |
| iPhone (landscape)  | 2796×1290       |
| iPad Pro 13"        | 2064×2752       |

Background color: `#06090f` (near-black navy)
Center the icon at ~300×300px on the splash

### Android
Use a single `splash.png` at 1920×1920 with centered icon.
Android Capacitor handles scaling automatically.

---

## QUICK EXPORT WITH FIGMA (free)

1. Open Figma → New file
2. Create a 1024×1024 frame
3. Paste the SVG: File → Place image → icon-source.svg
4. Select the frame → Export panel (right sidebar)
5. Add exports:
   - 1024w PNG → App Store
   - 180w PNG → icon-60@3x
   - 152w PNG → icon-76@2x
   - (etc for all sizes above)

---

## CAPACITOR SPLASH SCREEN CONFIG

After placing `splash.png` in `android/app/src/main/res/drawable/`:

In `capacitor.config.ts` (already configured):
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  launchAutoHide: true,
  backgroundColor: '#06090f',
  androidSplashResourceName: 'splash',
  androidScaleType: 'CENTER_CROP',
  showSpinner: false,
}
```

---

## DESIGN SPECS (for designer handoff)

**Icon concept:** Medical cross (white) + lightning bolt (crimson #c62828)
**Background:** Linear gradient — Navy #0a1628 → Dark #1a0f1f → Crimson #6b0f0f
**Brand red:** #c62828
**Brand navy:** #06090f
**Font (app):** JetBrains Mono / Courier New (monospace)
**Style:** Dark, high-contrast, emergency services aesthetic
