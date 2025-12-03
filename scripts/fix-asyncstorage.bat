@echo off
REM Script to fix AsyncStorage native module issue
REM Usage: scripts\fix-asyncstorage.bat

echo 🔧 Fixing AsyncStorage Native Module Issue
echo ===========================================
echo.

echo 📦 Step 1: Reinstalling AsyncStorage...
call npm uninstall @react-native-async-storage/async-storage
call npm install @react-native-async-storage/async-storage
echo.

echo 🧹 Step 2: Clearing Metro bundler cache...
call npx expo start --clear
echo.

echo ✅ Steps completed!
echo.
echo 📱 Next Steps:
echo 1. If using Expo Go: The app should work now after restart
echo 2. If using Development Build: You need to rebuild the app:
echo    - Run: npx expo prebuild --clean
echo    - Then: npx expo run:android (or run:ios)
echo 3. If using EAS Build: Rebuild with: eas build --platform android --profile development
echo.
echo ⚠️  Important: After rebuilding, restart the Metro bundler with --clear flag
echo.

pause






