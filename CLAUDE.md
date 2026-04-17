# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React Native app for **Apple TV (tvOS)** and **Android TV**, built on the `react-native-tvos` fork (installed as `react-native` via npm alias in `package.json`). Do not install upstream `react-native` — the alias is load-bearing.

## Common commands

```bash
npm install --legacy-peer-deps       # required — upstream peer-dep mismatches on the tvos fork
cd ios && pod install && cd ..       # after install and after native-dep changes

npm start                            # Metro bundler (tab 1)
npm run appletv                      # Apple TV 4K simulator (tab 2)
npm run appletv:1080p                # Apple TV 4K @ 1080p simulator
npm run appletv:basic                # non-4K Apple TV simulator
npm run tv:android                   # scripts/start-android-tv.sh — cleans ports, launches MMD_TV_Emulator AVD, starts Metro + build

npm run lint                         # eslint . (auto-run on staged files by husky)
npm run lint:fix
npm run format                       # prettier
npm run type-check                   # tsc --noEmit (no separate build step — Metro handles TS)
npm test                             # jest (preset: react-native)
npx jest path/to/file.test.tsx       # single test
```

The `appletv*` scripts prepend `/usr/local/opt/ruby/bin:/usr/local/lib/ruby/gems/4.0.0/bin` to PATH because the RN CLI shells out to CocoaPods scripts that need this specific Ruby. If pod-related commands fail with Ruby errors, verify those paths exist or adjust the script.

Xcode scheme is **`MmdAppleTvApp`** (workspace: `ios/MmdAppleTvApp.xcworkspace`). For App Store builds, archive from Xcode, not the CLI.

Android release bundle: `cd android && ./gradlew clean && ./gradlew bundleRelease` → `android/app/build/outputs/bundle/release/app-release.aab`. Requires keystore in `android/gradle.properties`.

## Architecture

### Role-gated navigation (read `src/navigation/index.tsx` + `src/store/useAuthStore.ts` together)

`RootNavigator` picks one of four stacks based on `isAuthenticated` and `selectedRole`: `AuthNavigator`, `StudentNavigator`, `DojoNavigator`, or `AdminNavigator`. The role the user taps on `RoleSelectScreen` is **not** authoritative — on successful login, the backend's `userRole.role.name` is normalized via `normalizeBackendRole` (in `src/utils/authHelpers.ts`) and overwrites `selectedRole`. If the backend role is unrecognized, the tapped role is kept as a fallback. When adding new role-specific features, treat `selectedRole` in the store as the source of truth.

### Two parallel data layers

Server state is fetched through both **React Query** (`src/hooks/useStudy.ts` etc., client in `src/services/api.ts`, 5-min `staleTime`) and **Zustand stores** (`src/store/useStudyStore.ts` etc.). Both call the same services in `src/services/`. Pick one per feature — don't mix — and look at existing screens before adding new data paths. Auth, announcements, dojo-cast, and watch history live in Zustand; study content is read through both.

### Auth storage split

`src/services/axios.ts` exports `secureStorage`: tokens (access + refresh) go to **react-native-keychain**; `selectedRole` and non-sensitive `userData` go to **AsyncStorage**. `clearAll()` wipes both. The axios response interceptor clears auth on any 401 and resets `useAuthStore` via a lazy `require()` to dodge a circular import — preserve that pattern if you touch it.

### API config

`src/config/env.ts` branches on `__DEV__` but currently both `PROD_API` and `STAGING_API` point to the same production URL (`dojo-crm-api-new.managemydojo.com/api/v1`). Switch `STAGING_API` when a staging env is actually available. All endpoints enumerated in `src/config/apiEndpoints.ts`.

### TV focus + responsive scaling

- **`src/components/ui/FocusableCard.tsx`** wraps `Pressable` with spring-animated `scale` on focus/blur. Build focusable UI on top of this, not raw `Pressable` — it handles the TV focus styling contract.
- **`TVFocusGuideView`** (e.g. `HorizontalRow.tsx`) traps directional focus — used so pressing LEFT on the first card in a row doesn't escape to an unrelated neighbor. Pass `firstCardRef` through `renderItem`'s `cardRef` prop on index 0.
- **`src/theme/responsive.ts`** exports `rs(size)` (scale for 1920×1080 base), `wp`/`hp` (percent). Always use these helpers for dimensions — do not hardcode pixels. The `darkTheme` object in `src/theme/index.ts` already wraps `spacing`/`fontSize`/`borderRadius` in `rs()`.
- `useTheme()` from `src/theme` is the only way to access theme; `ThemeContext.Provider` is set in `App.tsx`.

### Vimeo playback

`src/utils/resolveVimeoUrl.ts` scrapes `player.vimeo.com/video/{id}` to extract the HLS `.m3u8` URL from `window.playerConfig`, with in-memory caches for both the page HTML and the resolved URL. Works for private videos (OEmbed API doesn't). Direct `.m3u8`/`.mp4` URLs are returned as-is. `fetchVimeoThumbnail` tries OEmbed first, falls back to the same scrape.

### SVG handling

`metro.config.js` swaps in `react-native-svg-transformer` and moves `svg` from `assetExts` to `sourceExts`. SVGs are imported as React components, not image assets: `import Icon from '../../../assets/icons/foo.svg'` → `<Icon width={24} height={24} />`.

### Production log stripping

`babel.config.js` enables `babel-plugin-transform-remove-console` in the `production` env — all `console.*` calls are stripped from release builds. Don't rely on console output for production-only diagnostics.

### react-native-webview is disabled

`react-native.config.js` sets `ios: null, android: null` for `react-native-webview` because it's unsupported on tvOS. Don't add webview-based features.

## Conventions

- TypeScript throughout; `@typescript-eslint/no-explicit-any` is `warn` (being phased to `error` — don't add new `any`s).
- Husky + lint-staged run `eslint --fix` + `prettier` on staged JS/TS (`.lintstagedrc.js`).
- Zod schemas for form validation live in `src/validations/`; wire them with `@hookform/resolvers` + `react-hook-form`.
- Node ≥ 20 (`engines` in `package.json`).

## Clean-build recipe

After native-dep changes, branch switches, or unexplained errors:

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/MmdAppleTvApp-*
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..
npm start -- --reset-cache
```
