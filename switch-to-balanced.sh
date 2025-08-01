#!/bin/bash

echo "🎤 Switching to Balanced Transcript Capture"
echo "=========================================="
echo ""

# Backup current version
echo "📦 Backing up current version..."
cp content.js content.js.backup
echo "✅ Backup created: content.js.backup"
echo ""

# Switch to balanced version
echo "🔄 Switching to balanced version..."
cp content-balanced.js content.js
echo "✅ Switched to balanced version"
echo ""

echo "📋 Next steps:"
echo "1. Go to chrome://extensions/"
echo "2. Find your extension"
echo "3. Click the refresh/reload icon"
echo "4. Test in Google Meet"
echo ""

echo "🎯 Expected results:"
echo "- Should capture actual speech"
echo "- Should filter out UI elements like 'arrow_downward', 'closed_caption_off', etc."
echo "- Should work with Urdu/Arabic text"
echo ""

echo "🔄 To switch back:"
echo "cp content.js.backup content.js"
echo ""

echo "💡 The balanced version includes:"
echo "- Specific filtering for UI elements from your example"
echo "- Less restrictive speech detection"
echo "- Support for multiple languages"
echo "- 1-second capture intervals"
echo ""

echo "🚀 Ready to test!"