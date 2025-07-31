# 🔧 Chrome Extension Troubleshooting Guide

## Common Issues and Solutions

### ❌ "Unable to load this extension"

#### **Issue 1: Missing Files**
**Symptoms:** Extension won't load, shows error about missing files
**Solution:**
- Run `node validate_extension.js` to check for missing files
- Ensure all required files are present in the same directory:
  - `manifest.json`
  - `content.js`
  - `popup.html`
  - `popup.js`
  - `background.js`

#### **Issue 2: Invalid JSON in manifest.json**
**Symptoms:** Extension fails to load with JSON parsing errors
**Solution:**
- Check that `manifest.json` has valid JSON syntax
- Use a JSON validator online to check syntax
- Ensure no trailing commas or missing quotes

#### **Issue 3: JavaScript Syntax Errors**
**Symptoms:** Extension loads but doesn't work, console shows errors
**Solution:**
- Check browser console for JavaScript errors
- Validate JS files with `node -c filename.js`
- Look for missing semicolons, brackets, or quotes

#### **Issue 4: Permission Issues**
**Symptoms:** Extension loads but can't access meet.google.com
**Solution:**
- Check that `host_permissions` includes `"https://meet.google.com/*"`
- Ensure `permissions` array includes necessary permissions
- Try refreshing the Google Meet page after installing

#### **Issue 5: Manifest Version Issues**
**Symptoms:** Extension won't load in newer Chrome versions
**Solution:**
- Ensure `manifest_version` is set to `3`
- Check that all APIs used are compatible with Manifest V3

### 🔍 Step-by-Step Debugging

#### **Step 1: Validate Extension Files**
```bash
node validate_extension.js
```

#### **Step 2: Check Chrome Console**
1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for any error messages
4. Check for extension-related errors

#### **Step 3: Check Extension Page**
1. Go to `chrome://extensions/`
2. Find your extension in the list
3. Click "Details" to see more information
4. Look for any error messages or warnings

#### **Step 4: Test on Google Meet**
1. Navigate to `meet.google.com`
2. Join a test meeting
3. Open DevTools console
4. Look for extension-related messages

### 🛠️ Quick Fixes

#### **Fix 1: Reload Extension**
1. Go to `chrome://extensions/`
2. Find your extension
3. Click the refresh/reload icon
4. Try again

#### **Fix 2: Clear Browser Cache**
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Try loading the extension again

#### **Fix 3: Check File Permissions**
```bash
ls -la *.js *.json *.html
```
Ensure all files are readable.

#### **Fix 4: Verify Directory Structure**
```bash
tree -I '.git'
```
Should show all extension files in the same directory.

### 📋 Installation Checklist

- [ ] All required files are present
- [ ] `manifest.json` has valid JSON syntax
- [ ] JavaScript files have no syntax errors
- [ ] Chrome Developer mode is enabled
- [ ] Extension directory is selected correctly
- [ ] No error messages in Chrome extensions page
- [ ] Extension appears in the extensions list
- [ ] Extension icon appears in toolbar

### 🚨 Common Error Messages

#### **"Could not load extension"**
- Check file permissions
- Verify all files are in the same directory
- Ensure no files are empty

#### **"Manifest file is missing or unreadable"**
- Check that `manifest.json` exists
- Verify file is readable
- Check JSON syntax

#### **"Invalid manifest"**
- Validate JSON syntax
- Check required fields are present
- Ensure manifest_version is 3

#### **"Permission denied"**
- Check file permissions
- Ensure directory is accessible
- Try moving files to a different location

### 💡 Pro Tips

1. **Use the validator script** - Run `node validate_extension.js` before loading
2. **Check console logs** - Always check browser console for errors
3. **Test incrementally** - Start with a minimal extension and add features
4. **Keep backups** - Save working versions before making changes
5. **Use version control** - Track changes to easily revert if needed

### 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Run the validator**: `node validate_extension.js`
2. **Check the console**: Look for specific error messages
3. **Try a fresh install**: Remove extension completely and reinstall
4. **Test in incognito**: Try loading in an incognito window
5. **Check Chrome version**: Ensure you're using a recent version of Chrome

### 📞 Getting Help

When asking for help, include:
- The exact error message
- Output from `node validate_extension.js`
- Chrome version you're using
- Steps you've already tried
- Any console error messages