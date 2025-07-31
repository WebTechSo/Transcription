#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Google Meet Transcript Capturer - Extension Validator');
console.log('=======================================================\n');

// Required files for the extension
const requiredFiles = [
  'manifest.json',
  'content.js',
  'popup.html',
  'popup.js',
  'background.js'
];

// Optional files
const optionalFiles = [
  'icon16.png',
  'icon48.png',
  'icon128.png'
];

let allGood = true;

// Check required files
console.log('📁 Checking required files:');
console.log('----------------------------');

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
    
    // Check file size
    const stats = fs.statSync(file);
    if (stats.size === 0) {
      console.log(`⚠️  ${file} - File is empty`);
      allGood = false;
    }
  } else {
    console.log(`❌ ${file} - Missing`);
    allGood = false;
  }
});

console.log('\n🎨 Checking optional icon files:');
console.log('--------------------------------');

optionalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`⚠️  ${file} - Missing (optional)`);
  }
});

// Validate manifest.json
console.log('\n📋 Validating manifest.json:');
console.log('----------------------------');

try {
  const manifestContent = fs.readFileSync('manifest.json', 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  // Check required manifest fields
  const requiredManifestFields = ['manifest_version', 'name', 'version', 'description'];
  requiredManifestFields.forEach(field => {
    if (manifest[field]) {
      console.log(`✅ ${field} - Present`);
    } else {
      console.log(`❌ ${field} - Missing`);
      allGood = false;
    }
  });
  
  // Check manifest version
  if (manifest.manifest_version === 3) {
    console.log('✅ manifest_version - Correct (V3)');
  } else {
    console.log(`⚠️  manifest_version - ${manifest.manifest_version} (should be 3)`);
  }
  
  // Check permissions
  if (manifest.permissions && Array.isArray(manifest.permissions)) {
    console.log('✅ permissions - Present');
  } else {
    console.log('❌ permissions - Missing or invalid');
    allGood = false;
  }
  
  // Check content scripts
  if (manifest.content_scripts && Array.isArray(manifest.content_scripts)) {
    console.log('✅ content_scripts - Present');
  } else {
    console.log('❌ content_scripts - Missing or invalid');
    allGood = false;
  }
  
} catch (error) {
  console.log(`❌ manifest.json - Invalid JSON: ${error.message}`);
  allGood = false;
}

// Check for common issues
console.log('\n🔍 Checking for common issues:');
console.log('-----------------------------');

// Check if any files are empty
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.trim() === '') {
      console.log(`❌ ${file} - File is empty`);
      allGood = false;
    }
  }
});

// Check for syntax errors in JS files
const jsFiles = ['content.js', 'popup.js', 'background.js'];
jsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Basic syntax check - try to parse as JSON if it looks like JSON
      if (content.trim().startsWith('{')) {
        JSON.parse(content);
      }
      console.log(`✅ ${file} - Syntax appears valid`);
    } catch (error) {
      console.log(`⚠️  ${file} - Potential syntax issue: ${error.message}`);
    }
  }
});

// Summary
console.log('\n📊 Summary:');
console.log('===========');

if (allGood) {
  console.log('✅ Extension appears to be valid and ready to load!');
  console.log('\n📋 Next steps:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode" (toggle in top right)');
  console.log('3. Click "Load unpacked"');
  console.log('4. Select this directory');
  console.log('5. The extension should load successfully');
} else {
  console.log('❌ Extension has issues that need to be fixed before loading.');
  console.log('\n🔧 Please fix the issues above and run this validator again.');
}

console.log('\n💡 Tips:');
console.log('- Make sure all files are in the same directory');
console.log('- Check that file names match exactly (case-sensitive)');
console.log('- Ensure no files are empty');
console.log('- If you see syntax errors, check the JavaScript files');
console.log('- The extension should work without icon files');