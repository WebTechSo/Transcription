#!/bin/bash

# Google Meet Transcript Capturer - Installation Script

echo "🎤 Google Meet Transcript Capturer - Installation Helper"
echo "======================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found!"
    echo "Please run this script from the extension directory."
    exit 1
fi

echo "✅ Found extension files"
echo ""

# Check for icons
if [ ! -f "icon16.png" ] || [ ! -f "icon48.png" ] || [ ! -f "icon128.png" ]; then
    echo "⚠️  Icon files not found. You can generate them using create_icons.html"
    echo "   Open create_icons.html in your browser and save the icons as:"
    echo "   - icon16.png"
    echo "   - icon48.png" 
    echo "   - icon128.png"
    echo ""
fi

echo "📋 Installation Instructions:"
echo "============================"
echo ""
echo "1. Open Google Chrome"
echo "2. Navigate to: chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this directory: $(pwd)"
echo ""
echo "✅ The extension should now appear in your extensions list"
echo ""
echo "🎯 Usage:"
echo "========"
echo "1. Go to meet.google.com"
echo "2. Join a meeting"
echo "3. Click the extension icon"
echo "4. Click 'Start Capturing'"
echo "5. A transcript window will appear"
echo ""
echo "🔧 Troubleshooting:"
echo "=================="
echo "- Make sure you're on meet.google.com"
echo "- Enable live captions in your Google Meet"
echo "- Refresh the page if the extension doesn't work"
echo "- Check Chrome DevTools console for errors"
echo ""
echo "📚 For more help, see README.md"
echo ""
echo "Happy transcribing! 🎤"