// Background service worker for Meet Transcript Capturer

// Handle extension installation
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('Meet Transcript Capturer installed');
    
    // Open welcome page or show notification
    chrome.tabs.create({
      url: 'https://meet.google.com'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
  // This will only trigger if no popup is defined
  // Since we have a popup, this won't be called
  console.log('Extension icon clicked');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      sendResponse({tab: tabs[0]});
    });
    return true; // Keep message channel open for async response
  }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('meet.google.com')) {
    // Content script should be automatically injected via manifest
    console.log('Google Meet page loaded, content script should be active');
  }
});