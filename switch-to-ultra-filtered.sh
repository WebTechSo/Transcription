#!/bin/bash

echo "🎤 Switching to Ultra-Filtered Transcript Capture"
echo "================================================"
echo ""

# Backup current version
echo "📦 Backing up current version..."
cp content.js content.js.backup
echo "✅ Backup created: content.js.backup"
echo ""

# Switch to ultra-filtered version
echo "🔄 Switching to ultra-filtered version..."
cp content-ultra-filtered.js content.js
echo "✅ Switched to ultra-filtered version"
echo ""

echo "📋 Next steps:"
echo "1. Go to chrome://extensions/"
echo "2. Find your extension"
echo "3. Click the refresh/reload icon"
echo "4. Test in Google Meet"
echo ""

echo "🎯 Expected results:"
echo "- Only actual speech will be captured"
echo "- No UI elements like 'arrow_downward', 'closed_caption_off', etc."
echo "- Clean transcripts with only conversation content"
echo ""

echo "🔄 To switch back:"
echo "cp content.js.backup content.js"
echo ""

echo "💡 The ultra-filtered version includes:"
echo "- 100+ UI element filters"
echo "- Aggressive pattern matching"
echo "- Support for Arabic/Persian characters"
echo "- Ultra-strict speech detection"
echo "- 3-second capture intervals"
echo ""

echo "🚀 Ready to test!"