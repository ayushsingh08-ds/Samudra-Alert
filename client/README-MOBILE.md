# Samudra-Alert — Native Android (Capacitor)

The same React + Vite codebase ships as web **and** a native Android app. Native features: GPS, camera, FCM push, haptics, splash.

## Prerequisites

- Node 18+, JDK 17, Android Studio (with SDK 34/35)
- A device/emulator for testing

## Daily workflow

```bash
# from repo root — build web + sync into the native shell
npm run mobile:sync

# open Android Studio (run/debug from there)
npm run mobile:android
```

Changed web code? → `npm run mobile:sync` then re-run from Android Studio.
Changed native code (manifest, plugins, gradle)? → sync happens automatically on `npx cap sync`.

### Live reload during development

1. Uncomment `server.url` in `client/capacitor.config.ts` and set your LAN IP.
2. `npm run dev:client` + `npm run dev:server`
3. Run the app from Android Studio — it loads from your dev server.
4. **Re-comment before release builds.**

## Native plugins in use

| Plugin | Purpose |
|---|---|
| `@capacitor/geolocation` | GPS autofill in report wizard (native permission flow) |
| `@capacitor/camera` | Incident photos (camera + gallery) |
| `@capacitor/push-notifications` | FCM push for broadcast alerts |
| `@capacitor/haptics` | Tactile feedback on submit/verify |
| `@capacitor/splash-screen` | Branded launch screen |
| `@capacitor/app` | Hardware back-button handling |

## Push notifications (FCM) setup

1. Create a Firebase project → add an **Android app** with package `com.nivara.alert`.
2. Download `google-services.json` → place at `client/android/app/google-services.json`.
3. Generate a service account: Project settings → Service accounts → **Generate new private key**.
4. Base64 it and give it to the server:
   ```bash
   base64 -w0 service-account.json   # paste into server .env as FIREBASE_SERVICE_ACCOUNT_B64
   ```
5. `npm run mobile:sync` and rebuild.

> Without `google-services.json` the app builds and runs fine — push just won't register.

## App icon & splash

```bash
cd client
npm i -D @capacitor/assets
# put icon-only.png (1024²) + splash.png (2732²) into client/resources/
node scripts/generate-icons.cjs
npm run mobile:sync
```

## Release build (signed AAB)

1. Generate an upload keystore (keep it safe — losing it means losing Play Store updates):
   ```bash
   keytool -genkey -v -keystore samudra-alert-upload.keystore -alias samudra-alert -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Create `client/android/key.properties` (do **not** commit):
   ```properties
   storeFile=../../samudra-alert-upload.keystore
   storePassword=YOUR_PASSWORD
   keyAlias=samudra-alert
   keyPassword=YOUR_PASSWORD
   ```
3. In `client/android/app/build.gradle`, inside `android { }`:
   ```groovy
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file("key.properties")
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile file(keystoreProperties['storeFile'])
           storePassword keystoreProperties['storePassword']
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
       }
   }
   ```
4. Build:
   ```bash
   cd client/android
   ./gradlew bundleRelease     # → app/build/outputs/bundle/release/app-release.aab
   ./gradlew assembleRelease   # → APK for direct testing
   ```

## Play Console checklist

- [ ] Privacy policy URL (you collect location + photos — **required**)
- [ ] Data safety form: declare approximate location, photos, device tokens
- [ ] Location permission declaration (background NOT requested — foreground only)
- [ ] Content rating questionnaire
- [ ] Screenshots (phone) + feature graphic
- [ ] App signing by Google (enrolled automatically with AAB)

## iOS (later)

Config is portable: `npx cap add ios` on a Mac, then build via Xcode. Requires Apple Developer account ($99/yr). All web code and most plugins are cross-platform already.
