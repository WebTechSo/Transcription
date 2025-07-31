// Popup script for Meet Transcript Capturer
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggle-btn');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  
  let isCapturing = false;
  
  // Check current status when popup opens
  checkStatus();
  
  // Add click event to toggle button
  toggleBtn.addEventListener('click', function() {
    toggleCapturing();
  });
  
  // Function to check current status
  function checkStatus() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      if (activeTab.url && activeTab.url.includes('meet.google.com')) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'getStatus'}, function(response) {
          if (chrome.runtime.lastError) {
            // Content script not loaded or not on meet.google.com
            updateUI(false, 'Not on Google Meet');
            return;
          }
          
          if (response) {
            isCapturing = response.isCapturing;
            updateUI(isCapturing, isCapturing ? 'Capturing...' : 'Not capturing');
          }
        });
      } else {
        updateUI(false, 'Not on Google Meet');
      }
    });
  }
  
  // Function to toggle capturing
  function toggleCapturing() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      
      if (activeTab.url && activeTab.url.includes('meet.google.com')) {
        chrome.tabs.sendMessage(activeTab.id, {action: 'toggleCapturing'}, function(response) {
          if (chrome.runtime.lastError) {
            showError('Please refresh the Google Meet page and try again.');
            return;
          }
          
          if (response) {
            isCapturing = response.isCapturing;
            updateUI(isCapturing, isCapturing ? 'Capturing...' : 'Not capturing');
          }
        });
      } else {
        showError('Please navigate to a Google Meet page first.');
      }
    });
  }
  
  // Function to update UI
  function updateUI(capturing, status) {
    statusIndicator.className = capturing ? 'status-indicator active' : 'status-indicator';
    statusText.textContent = status;
    toggleBtn.textContent = capturing ? 'Stop Capturing' : 'Start Capturing';
  }
  
  // Function to show error
  function showError(message) {
    statusText.textContent = message;
    statusIndicator.className = 'status-indicator';
    toggleBtn.textContent = 'Start Capturing';
  }
});