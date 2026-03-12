# MMD Apple TV App

A React Native app for **Apple TV (tvOS)** and **Android TV**, built on the [react-native-tvos](https://github.com/react-native-tvos/react-native-tvos) fork.

---

## Prerequisites

- macOS with Xcode installed (for tvOS builds)
- Node.js ≥ 18 and npm
- CocoaPods (`sudo gem install cocoapods`)
- Android Studio + ADB (for Android TV builds)

---

## Initial Setup

```bash
npm install --legacy-peer-deps
cd ios && pod install && cd ..
```

---

## 🍎 Apple TV Commands

The Xcode scheme is **`MmdAppleTvApp`**.

### Run on Simulator

```bash
npm start                    # Tab 1 — Metro bundler
npm run appletv              # Tab 2 — Apple TV 4K simulator
```

### Run on Physical Device

```bash
npx react-native run-ios --scheme "MmdAppleTvApp" --device "Your_Device_Name"
```

### Clean Build

Run this after updating native deps, switching branches, or hitting unexplained errors.

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/MmdAppleTvApp-*
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
npm start -- --reset-cache
```

### Production / Release Build

```bash
rm -rf ios/build
cd ios && pod install && cd ..
npx react-native run-ios --scheme "MmdAppleTvApp" --mode Release
```

> For App Store distribution, open `MmdAppleTvApp.xcworkspace` in Xcode and use **Product → Archive**.

---

## 🤖 Android TV Commands

### Development

```bash
adb connect <tv_ip_address>          # Connect to Android TV over network
npx react-native start               # Tab 1 — Metro bundler
npx react-native run-android --active-arch-only   # Tab 2 — build & install
```

### Production Build (Google Play)

Always clean before a new release build to avoid caching issues.

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

> Output AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Test Release Build Locally

```bash
npx react-native run-android --mode="release" --active-arch-only
```

> Signed release builds require a keystore configured in `android/gradle.properties`.

---

## Troubleshooting

### Pod install fails / linker errors

```bash
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
```

### Metro not picking up changes

```bash
npm start -- --reset-cache
```

### Android ADB device not found

```bash
adb kill-server && adb start-server
adb connect <tv_ip_address>
```
