#!/bin/bash

# ============================================================
# MMD Android TV Emulator Startup Script (v4)
# Optimized for Intel Mac with Software Rendering
# ============================================================

echo "=== Step 1: Aggressive Cleanup ==="

echo "Killing any process on port 8081..."
lsof -t -i:8081 | xargs kill -9 2>/dev/null || true

echo "Killing ghost processes on emulator ports 5554 and 5556..."
lsof -t -i:5554 | xargs kill -9 2>/dev/null || true
lsof -t -i:5556 | xargs kill -9 2>/dev/null || true

echo "Killing orphaned qemu-system processes..."
pkill -9 qemu-system 2>/dev/null || true

echo "Killing orphaned emulator processes..."
pkill -9 emulator 2>/dev/null || true

echo "Removing AVD lock files..."
rm -f ~/.android/avd/MMD_TV_Emulator.avd/*.lock
rm -f ~/.android/avd/MMD_TV_Emulator.avd/hardware-qemu.ini.lock

echo "Waiting for OS to release ports..."
sleep 2

echo ""
echo "=== Step 2: ADB Server Reset ==="
adb kill-server > /dev/null 2>&1
adb start-server > /dev/null 2>&1
echo "ADB server restarted."

echo ""
echo "=== Step 3: Emulator Launch (Software Rendering) ==="
echo "Launching MMD_TV_Emulator with swiftshader_indirect. Logs -> /tmp/android_tv_emulator.log..."
/usr/local/share/android-commandlinetools/emulator/emulator @MMD_TV_Emulator -no-snapshot-load -gpu swiftshader_indirect -qemu -m 2048 > /tmp/android_tv_emulator.log 2>&1 &
EMU_PID=$!
echo "Emulator PID: $EMU_PID"

echo ""
echo "=== Step 4: Smart Boot Polling (No adb wait-for-device) ==="
echo -n "Part A: Waiting for emulator to appear as 'device' (not 'offline')"
DEVICE_ID=""
while [ -z "$DEVICE_ID" ]; do
    # Sanity check: has the emulator process died?
    if ! kill -0 $EMU_PID 2>/dev/null; then
        echo ""
        echo "ERROR: Emulator process (PID $EMU_PID) has crashed!"
        echo "Check /tmp/android_tv_emulator.log for details:"
        tail -20 /tmp/android_tv_emulator.log
        exit 1
    fi

    DEVICE_ID=$(adb devices | grep -E '^emulator-' | grep -v 'offline' | grep 'device' | awk '{print $1}' | head -n 1)
    if [ -z "$DEVICE_ID" ]; then
        echo -n "."
        sleep 3
    fi
done
echo ""
echo "Device connected: $DEVICE_ID"

echo -n "Part B: Waiting for Android OS to fully boot"
while [ "$(adb -s "$DEVICE_ID" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    echo -n "."
    sleep 3
done
echo ""
echo "Emulator fully booted!"

echo ""
echo "=== Step 5: Metro Bundler ==="
echo "Opening Metro bundler in a new Terminal window..."
osascript -e 'tell application "Terminal"
    do script "cd \"'"$PWD"'\" && npm start -- --reset-cache"
end tell'

echo ""
echo "=== Step 6: React Native Build ==="
echo "Building and installing on $DEVICE_ID..."
npx react-native run-android --device "$DEVICE_ID"
