// Enhanced Content script for Google Meet Transcript Capturer
let transcriptData = [];
let isCapturing = false;
let transcriptWindow = null;
let lastProcessedText = '';
let observer = null;

// Function to create the transcript window
function createTranscriptWindow() {
  if (transcriptWindow) {
    transcriptWindow.remove();
  }

  transcriptWindow = document.createElement('div');
  transcriptWindow.id = 'meet-transcript-window';
  transcriptWindow.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    height: 500px;
    background: white;
    border: 2px solid #4285f4;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: 'Google Sans', Arial, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    background: #4285f4;
    color: white;
    padding: 12px 16px;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <span>Meet Transcript</span>
    <div>
      <button id="copy-transcript" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Copy</button>
      <button id="close-transcript" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
    </div>
  `;

  const content = document.createElement('div');
  content.id = 'transcript-content';
  content.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #f8f9fa;
    font-size: 14px;
    line-height: 1.5;
  `;

  transcriptWindow.appendChild(header);
  transcriptWindow.appendChild(content);
  document.body.appendChild(transcriptWindow);

  // Add event listeners
  document.getElementById('copy-transcript').addEventListener('click', copyTranscript);
  document.getElementById('close-transcript').addEventListener('click', () => {
    transcriptWindow.remove();
    transcriptWindow = null;
  });

  // Make window draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === header) {
      isDragging = true;
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      setTranslate(currentX, currentY, transcriptWindow);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
}

// Function to copy transcript to clipboard
function copyTranscript() {
  const content = document.getElementById('transcript-content');
  const text = content.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.getElementById('copy-transcript');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#34a853';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = 'rgba(255,255,255,0.2)';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy transcript:', err);
  });
}

// Function to update transcript display
function updateTranscriptDisplay() {
  if (!transcriptWindow) return;
  
  const content = document.getElementById('transcript-content');
  if (transcriptData.length === 0) {
    content.innerHTML = '<em>No transcript data captured yet...</em>';
    return;
  }

  const transcriptText = transcriptData
    .map(entry => `${entry.timestamp} - ${entry.speaker}: ${entry.text}`)
    .join('\n\n');
  
  content.innerHTML = transcriptText.replace(/\n/g, '<br>');
  content.scrollTop = content.scrollHeight;
}

// Enhanced function to find and monitor transcript elements
function findTranscriptElements() {
  const selectors = [
    // Google Meet specific selectors
    '[data-mdc-dialog-id*="transcript"]',
    '[aria-label*="transcript"]',
    '[aria-label*="caption"]',
    '[data-speaker-id]',
    // Live captions
    'div[role="log"]',
    'div[aria-live="polite"]',
    'div[aria-live="assertive"]',
    // More specific selectors
    '[data-is-muted="false"] div[role="log"]',
    '[data-is-muted="false"] div[aria-live="polite"]',
    // Caption containers
    'div[data-caption-container]',
    'div[data-caption-text]',
    // Fallback selectors
    'div:contains("said")',
    'span:contains("said")',
    // Look for any div that might contain captions
    'div[class*="caption"]',
    'div[class*="transcript"]',
    'span[class*="caption"]',
    'span[class*="transcript"]'
  ];

  let foundElements = [];
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.textContent && el.textContent.trim().length > 0) {
          foundElements.push(el);
        }
      });
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  return foundElements;
}

// Function to process and capture transcript text
function processTranscriptText(text) {
  if (!text || text.length === 0 || text === lastProcessedText) {
    return null;
  }

  // Skip UI text
  const uiKeywords = [
    'button', 'menu', 'settings', 'mute', 'camera', 'leave', 'chat', 
    'participants', 'share', 'record', 'background', 'effects', 'more',
    'turn on', 'turn off', 'click', 'press', 'enter', 'exit'
  ];

  const lowerText = text.toLowerCase();
  if (uiKeywords.some(keyword => lowerText.includes(keyword))) {
    return null;
  }

  // Extract speaker and message
  let speaker = 'Unknown';
  let message = text;

  // Try various patterns to extract speaker
  const patterns = [
    /^([^:]+):\s*(.+)$/,  // "Speaker: message"
    /^([^:]+)\s+said:\s*(.+)$/,  // "Speaker said: message"
    /^([^:]+)\s*-\s*(.+)$/,  // "Speaker - message"
    /^([^:]+)\s*:\s*(.+)$/,   // "Speaker : message" (with spaces)
    /^([^:]+)\s*said\s*(.+)$/i,  // "Speaker said message"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      speaker = match[1].trim();
      message = match[2].trim();
      break;
    }
  }

  // If no pattern matched, check if it looks like a caption
  if (message === text) {
    // Check if this looks like a caption (not UI text)
    const isCaption = text.length > 5 && 
                     text.length < 500 &&
                     !text.includes('http') &&
                     !text.includes('www') &&
                     !text.match(/^\d+$/) && // Not just numbers
                     !text.match(/^[A-Z\s]+$/) && // Not all caps
                     text.includes(' '); // Has spaces (likely a sentence)

    if (isCaption) {
      message = text;
      speaker = 'Speaker';
    } else {
      return null; // Skip non-caption text
    }
  }

  return { speaker, message };
}

// Function to capture transcript data
function captureTranscript() {
  const elements = findTranscriptElements();
  
  elements.forEach(element => {
    const text = element.textContent?.trim();
    if (!text) return;

    const processed = processTranscriptText(text);
    if (!processed) return;

    const { speaker, message } = processed;
    const timestamp = new Date().toLocaleTimeString();

    // Check for duplicates (within 5 seconds)
    const existingEntry = transcriptData.find(entry => 
      entry.text === message && 
      entry.speaker === speaker &&
      Math.abs(new Date(`2000-01-01 ${entry.timestamp}`) - new Date(`2000-01-01 ${timestamp}`)) < 5000
    );

    if (!existingEntry && message.length > 0) {
      transcriptData.push({
        timestamp,
        speaker,
        text: message
      });
      lastProcessedText = text;
      updateTranscriptDisplay();
      console.log('Captured transcript:', {timestamp, speaker, text: message});
    }
  });
}

// Function to set up MutationObserver for real-time monitoring
function setupTranscriptObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver((mutations) => {
    if (!isCapturing) return;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              const processed = processTranscriptText(text);
              if (processed) {
                const { speaker, message } = processed;
                const timestamp = new Date().toLocaleTimeString();

                // Check for duplicates
                const existingEntry = transcriptData.find(entry => 
                  entry.text === message && 
                  entry.speaker === speaker &&
                  Math.abs(new Date(`2000-01-01 ${entry.timestamp}`) - new Date(`2000-01-01 ${timestamp}`)) < 5000
                );

                if (!existingEntry && message.length > 0) {
                  transcriptData.push({
                    timestamp,
                    speaker,
                    text: message
                  });
                  lastProcessedText = text;
                  updateTranscriptDisplay();
                  console.log('Captured transcript (observer):', {timestamp, speaker, text: message});
                }
              }
            }
          }
        });
      }
    });
  });

  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

// Function to start/stop capturing
function toggleCapturing() {
  isCapturing = !isCapturing;
  
  if (isCapturing) {
    if (!transcriptWindow) {
      createTranscriptWindow();
    }
    
    // Set up observer for real-time monitoring
    setupTranscriptObserver();
    
    // Also do periodic checks as backup
    window.transcriptInterval = setInterval(captureTranscript, 1000);
    
    console.log('Transcript capturing started');
  } else {
    // Stop capturing
    if (window.transcriptInterval) {
      clearInterval(window.transcriptInterval);
      window.transcriptInterval = null;
    }
    
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    console.log('Transcript capturing stopped');
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleCapturing') {
    toggleCapturing();
    sendResponse({ isCapturing });
  } else if (request.action === 'getStatus') {
    sendResponse({ isCapturing, hasWindow: !!transcriptWindow });
  }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Enhanced Meet Transcript Capturer: Content script loaded');
    console.log('Looking for transcript elements...');
  }
});

// Also initialize for dynamic content
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'meet.google.com') {
      console.log('Enhanced Meet Transcript Capturer: Content script loaded');
    }
  });
} else {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Enhanced Meet Transcript Capturer: Content script loaded');
  }
}