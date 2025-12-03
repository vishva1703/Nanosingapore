@echo off
REM Script to build development APK for Google Sign-In testing (Windows)
REM Usage: scripts\build-dev-apk.bat

echo 🚀 Building Development APK for Google Sign-In Testing
echo ==================================================
echo.

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g eas-cli
)

REM Check if logged in to Expo
echo 📋 Checking Expo login status...
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Not logged in to Expo. Please login:
    echo    eas login
    exit /b 1
)

echo ✅ Logged in to Expo
echo.

REM Build development APK
echo 🔨 Building development APK...
echo    This may take 10-20 minutes...
echo.

eas build --platform android --profile development

echo.
echo ✅ Build complete!
echo.
echo 📱 Next Steps:
echo 1. Download the APK from the link provided above
echo 2. Transfer to your Android device
echo 3. Install the APK (enable 'Install from unknown sources' if needed)
echo 4. Open the app and test Google Sign-In
echo.
echo ⚠️  Important: Make sure 'nanosingapore://redirect' is added to
echo    Google Cloud Console OAuth redirect URIs before testing!

pause







