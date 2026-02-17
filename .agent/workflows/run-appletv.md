---
description: Run the Apple TV app on an Apple TV simulator from the terminal
---

# Run Apple TV App

## Prerequisites
- **Ruby via Homebrew** (`brew install ruby`) — the macOS system Ruby is too old
- Xcode with tvOS SDK installed
- CocoaPods dependencies installed (`cd ios && pod install`)
- Node modules installed (`npm install`)

## Steps

1. Make sure Metro bundler is running (if not already):
// turbo
```bash
npm start
```

2. Build and launch on Apple TV 4K simulator:
// turbo
```bash
npm run appletv
```

## Alternative Simulators

- **Apple TV 4K at 1080p**: `npm run appletv:1080p`
- **Apple TV (basic)**: `npm run appletv:basic`

## Troubleshooting

- If the simulator doesn't boot, try: `xcrun simctl boot "Apple TV 4K (3rd generation)"`
- If build fails, clean and retry: `cd ios && rm -rf build && pod install && cd .. && npm run appletv`
- To list available tvOS simulators: `xcrun simctl list devices available "Apple TV"`
