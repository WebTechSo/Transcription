#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Chrome Extension Loading Debugger');
console.log('====================================\n');

// Check current directory
console.log('📁 Current Directory:');
console.log('---------------------');
console.log(`Working directory: ${process.cwd()}`);
console.log(`Directory exists: ${fs.existsSync('.')}`);
console.log('');

// List all files in current directory
console.log('📋 Files in current directory:');
console.log('-------------------------------');
const files = fs.readdirSync('.');
files.forEach(file => {
  const stats = fs.statSync(file);
  const size = stats.size;
  const isDir = stats.isDirectory();
  console.log(`${isDir ? '📁' : '📄'} ${file} (${size} bytes)`);
});
console.log('');

// Check for required extension files
console.log('🔍 Extension Files Check:');
console.log('-------------------------');
const requiredFiles = ['manifest.json', 'content.js', 'popup.html', 'popup.js', 'background.js'];
const optionalFiles = ['icon16.png', 'icon48.png', 'icon128.png'];

let missingFiles = [];
let emptyFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size === 0) {
      emptyFiles.push(file);
      console.log(`❌ ${file} - EXISTS BUT EMPTY`);
    } else {
      console.log(`✅ ${file} - Found (${stats.size} bytes)`);
    }
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log('\n🎨 Optional Icon Files:');
console.log('----------------------');
optionalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} - Found (${stats.size} bytes)`);
  } else {
    console.log(`⚠️  ${file} - Missing (optional)`);
  }
});

// Validate manifest.json
console.log('\n📋 Manifest.json Analysis:');
console.log('---------------------------');
if (fs.existsSync('manifest.json')) {
  try {
    const manifestContent = fs.readFileSync('manifest.json', 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('✅ JSON syntax is valid');
    console.log(`📝 Manifest version: ${manifest.manifest_version}`);
    console.log(`📝 Name: ${manifest.name}`);
    console.log(`📝 Version: ${manifest.version}`);
    
    if (manifest.permissions) {
      console.log(`📝 Permissions: ${manifest.permissions.length} items`);
    }
    
    if (manifest.content_scripts) {
      console.log(`📝 Content scripts: ${manifest.content_scripts.length} items`);
    }
    
    if (manifest.icons) {
      console.log('⚠️  Icons section found - this might cause issues if icon files are missing');
    }
    
  } catch (error) {
    console.log(`❌ JSON parsing error: ${error.message}`);
  }
} else {
  console.log('❌ manifest.json not found');
}

// Check file permissions
console.log('\n🔐 File Permissions:');
console.log('-------------------');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.accessSync(file, fs.constants.R_OK);
      console.log(`✅ ${file} - Readable`);
    } catch (error) {
      console.log(`❌ ${file} - Not readable`);
    }
  }
});

// Check for common issues
console.log('\n🚨 Common Issues Check:');
console.log('----------------------');

// Check for BOM in files
const filesToCheck = ['manifest.json', 'content.js', 'popup.js', 'background.js'];
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
      console.log(`⚠️  ${file} - Contains BOM (Byte Order Mark)`);
    }
  }
});

// Check for hidden characters
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasHiddenChars = /[\u0000-\u001F\u007F-\u009F]/.test(content);
    if (hasHiddenChars) {
      console.log(`⚠️  ${file} - Contains hidden characters`);
    }
  }
});

// Summary and recommendations
console.log('\n📊 Summary:');
console.log('===========');

if (missingFiles.length > 0) {
  console.log(`❌ Missing required files: ${missingFiles.join(', ')}`);
}

if (emptyFiles.length > 0) {
  console.log(`❌ Empty files: ${emptyFiles.join(', ')}`);
}

if (missingFiles.length === 0 && emptyFiles.length === 0) {
  console.log('✅ All required files are present and non-empty');
  console.log('\n💡 Next steps:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked"');
  console.log('4. Select this directory');
  console.log('5. Check for any error messages in the extensions page');
} else {
  console.log('\n🔧 Fix the issues above before trying to load the extension');
}

console.log('\n💡 Additional Debugging Tips:');
console.log('- Check Chrome DevTools console for JavaScript errors');
console.log('- Look for specific error messages in chrome://extensions/');
console.log('- Try loading the minimal test extension in test-minimal/ folder');
console.log('- Ensure you\'re using a recent version of Chrome');
console.log('- Try loading in an incognito window');