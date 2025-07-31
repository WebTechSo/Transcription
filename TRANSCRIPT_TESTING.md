# 🎤 Google Meet Transcript Capture Testing Guide

## 🚨 **IMPORTANT: Enable Live Captions First**

Before testing the extension, you **MUST** enable live captions in Google Meet:

1. **Join a Google Meet call**
2. **Click the "Live captions" button** (usually in the bottom toolbar)
3. **Select your language** (English, Spanish, etc.)
4. **Verify captions are appearing** on screen

**Without live captions enabled, the extension cannot capture transcripts!**

## 🔧 **Testing Steps**

### **Step 1: Load the Extension**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the extension directory
5. Verify the extension appears in the list

### **Step 2: Test on Google Meet**
1. Go to [meet.google.com](https://meet.google.com)
2. Join or start a meeting
3. **Enable live captions** (critical!)
4. Click the extension icon
5. Click "Start Capturing"
6. A transcript window should appear

### **Step 3: Verify Capture**
1. **Speak clearly** in the meeting
2. **Watch for live captions** appearing on screen
3. **Check the transcript window** for captured text
4. **Look for console logs** (F12 → Console tab)

## 🔍 **Debugging Console Messages**

Open Chrome DevTools (F12) and check the Console tab for these messages:

### **✅ Success Messages:**
```
Meet Transcript Capturer: Content script loaded
Looking for transcript elements...
Transcript capturing started
Captured transcript: {timestamp: "10:30:45", speaker: "John", text: "Hello everyone"}
```

### **❌ Error Messages:**
```
No transcript elements found
No live captions detected
Extension not working on this page
```

## 🛠️ **Troubleshooting Common Issues**

### **Issue 1: "No transcript data captured yet..."**

**Possible Causes:**
- Live captions not enabled
- No one speaking in the meeting
- Extension not detecting caption elements

**Solutions:**
1. **Enable live captions** in Google Meet
2. **Speak clearly** and wait for captions to appear
3. **Check console** for error messages
4. **Try the enhanced version** (`content-enhanced.js`)

### **Issue 2: Extension loads but doesn't capture**

**Possible Causes:**
- Google Meet's DOM structure changed
- Caption elements not being detected
- Permissions issues

**Solutions:**
1. **Refresh the page** after loading the extension
2. **Check console** for specific error messages
3. **Try different selectors** (see below)
4. **Use the enhanced version** with MutationObserver

### **Issue 3: Capturing UI text instead of transcripts**

**Possible Causes:**
- Extension capturing button labels
- Wrong elements being selected

**Solutions:**
1. **Check the console** for what's being captured
2. **Look for UI keywords** in captured text
3. **Use the enhanced version** with better filtering

## 🔧 **Manual Testing with Console**

You can manually test the transcript detection:

1. **Open Chrome DevTools** (F12)
2. **Go to Console tab**
3. **Paste this code** to test selectors:

```javascript
// Test different selectors
const selectors = [
  '[data-mdc-dialog-id*="transcript"]',
  '[aria-label*="transcript"]',
  '[aria-label*="caption"]',
  'div[role="log"]',
  'div[aria-live="polite"]',
  '[data-speaker-id]'
];

selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`${selector}: ${elements.length} elements found`);
  elements.forEach(el => {
    console.log('  Text:', el.textContent?.trim());
  });
});
```

## 📋 **Testing Checklist**

- [ ] Extension loads without errors
- [ ] Live captions are enabled in Google Meet
- [ ] Captions appear on screen when speaking
- [ ] Extension popup opens when clicked
- [ ] "Start Capturing" button works
- [ ] Transcript window appears
- [ ] Console shows "Transcript capturing started"
- [ ] Speaking produces captions on screen
- [ ] Captured text appears in transcript window
- [ ] Copy button works
- [ ] Window can be dragged

## 🎯 **Expected Behavior**

### **When Working Correctly:**
1. **Live captions appear** on Google Meet screen
2. **Extension captures** the caption text
3. **Transcript window shows** captured text with timestamps
4. **Console logs** show successful captures
5. **Copy button** copies all transcript text

### **When Not Working:**
1. **No live captions** on screen
2. **Empty transcript window**
3. **Console errors** or no logs
4. **Extension doesn't respond**

## 🔄 **Alternative Testing Methods**

### **Method 1: Test with Enhanced Version**
1. Replace `content.js` with `content-enhanced.js`
2. Reload the extension
3. Test again

### **Method 2: Manual Element Detection**
1. Open DevTools
2. Inspect live caption elements
3. Note the actual selectors used
4. Update the extension selectors

### **Method 3: Test with Different Languages**
1. Try different caption languages
2. Check if language affects detection
3. Test with multiple speakers

## 📊 **Performance Monitoring**

Monitor these metrics:
- **Capture frequency** (how often text is captured)
- **Response time** (delay between speech and capture)
- **Accuracy** (how well captions match speech)
- **Memory usage** (console memory tab)

## 🚨 **Common Google Meet Issues**

### **Captions Not Available:**
- Some meetings disable captions
- Host must enable captions
- Language not supported

### **Captions Delayed:**
- Network issues
- Speech not clear enough
- Google's caption service slow

### **Captions Inaccurate:**
- Background noise
- Multiple speakers
- Poor audio quality

## 💡 **Pro Tips**

1. **Test with clear speech** - Speak slowly and clearly
2. **Use a quiet environment** - Reduce background noise
3. **Test with one speaker first** - Multiple speakers can confuse captions
4. **Check console regularly** - Look for error messages
5. **Try different browsers** - Edge, Brave, etc.
6. **Test in incognito mode** - Eliminates extension conflicts

## 🆘 **Getting Help**

If you're still having issues:

1. **Check the console** for specific error messages
2. **Verify live captions** are working in Google Meet
3. **Test with the enhanced version**
4. **Try the manual testing code** above
5. **Check if captions work** without the extension

**Remember:** The extension can only capture what Google Meet's live captions provide. If live captions aren't working, the extension won't work either.