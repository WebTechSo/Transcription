// Popup script for Meet Transcript Capturer
document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    
    // Check current status
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        
        if (currentTab.url && currentTab.url.includes('meet.google.com')) {
            chrome.tabs.sendMessage(currentTab.id, {action: 'getStatus'}, function(response) {
                if (chrome.runtime.lastError) {
                    updateStatus('Not on Google Meet', 'inactive');
                    toggleBtn.disabled = true;
                    toggleBtn.textContent = 'Not Available';
                    return;
                }
                
                if (response && response.isCapturing) {
                    updateStatus('Currently capturing', 'active');
                    toggleBtn.textContent = 'Stop Capturing';
                } else {
                    updateStatus('Ready to capture', 'inactive');
                    toggleBtn.textContent = 'Start Capturing';
                }
            });
        } else {
            updateStatus('Not on Google Meet', 'inactive');
            toggleBtn.disabled = true;
            toggleBtn.textContent = 'Not Available';
        }
    });
    
    // Toggle capturing
    toggleBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            
            if (currentTab.url && currentTab.url.includes('meet.google.com')) {
                chrome.tabs.sendMessage(currentTab.id, {action: 'toggleCapturing'}, function(response) {
                    if (response && response.isCapturing) {
                        updateStatus('Currently capturing', 'active');
                        toggleBtn.textContent = 'Stop Capturing';
                    } else {
                        updateStatus('Ready to capture', 'inactive');
                        toggleBtn.textContent = 'Start Capturing';
                    }
                });
            }
        });
    });
    
    // Open settings
    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
    
    function updateStatus(text, className) {
        statusText.textContent = text;
        statusDiv.className = `status ${className}`;
    }
});