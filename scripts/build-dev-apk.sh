#!/bin/bash

# Script to build development APK for Google Sign-In testing
# Usage: ./scripts/build-dev-apk.sh

echo "🚀 Building Development APK for Google Sign-In Testing"
echo "=================================================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in to Expo
echo "📋 Checking Expo login status..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Not logged in to Expo. Please login:"
    echo "   eas login"
    exit 1
fi

echo "✅ Logged in to Expo"
echo ""

# Build development APK
echo "🔨 Building development APK..."
echo "   This may take 10-20 minutes..."
echo ""

eas build --platform android --profile development

echo ""
echo "✅ Build complete!"
echo ""
echo "📱 Next Steps:"
echo "1. Download the APK from the link provided above"
echo "2. Transfer to your Android device"
echo "3. Install the APK (enable 'Install from unknown sources' if needed)"
echo "4. Open the app and test Google Sign-In"
echo ""
echo "⚠️  Important: Make sure 'nanosingapore://redirect' is added to"
echo "   Google Cloud Console OAuth redirect URIs before testing!"





