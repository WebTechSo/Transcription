// Balanced Content script for Google Meet Transcript Capturer
let transcriptData = [];
let isCapturing = false;
let transcriptWindow = null;
let lastProcessedText = '';

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

// Specific UI patterns to filter out (based on your example)
const UI_PATTERNS = [
  // Exact patterns from your example
  'arrow_downwardJump to bottom',
  'arrow_downward',
  'closed_caption_off',
  'closed_caption',
  'videocam',
  'jump to bottom',
  'jump to top',
  
  // Common UI elements
  'close', 'add', 'remove', 'settings', 'menu',
  'mute', 'unmute', 'camera', 'video', 'audio',
  'chat', 'participants', 'share', 'record',
  'background', 'effects', 'more', 'less',
  'expand', 'collapse', 'fullscreen', 'exit',
  'leave', 'end', 'start', 'stop', 'pause', 'play',
  
  // Navigation
  'scroll', 'next', 'previous', 'back', 'forward',
  'home', 'dashboard', 'profile', 'account',
  'preferences', 'help', 'support', 'feedback',
  
  // Meeting UI
  'meeting', 'call', 'conference', 'room', 'link',
  'invite', 'join', 'host', 'co-host', 'participant',
  'attendee', 'guest', 'moderator', 'permission',
  'request', 'approve', 'deny', 'allow', 'block',
  
  // Caption controls
  'live captions', 'captions', 'subtitles', 'transcript',
  'turn on', 'turn off', 'enable', 'disable', 'show', 'hide',
  
  // Technical
  'loading', 'connecting', 'disconnected', 'reconnecting',
  'error', 'failed', 'success', 'complete', 'done',
  'ready', 'preparing', 'initializing',
  
  // UI actions
  'click', 'press', 'tap', 'hover', 'drag', 'drop',
  'select', 'choose', 'confirm', 'cancel', 'ok',
  'yes', 'no', 'save', 'delete', 'edit', 'copy',
  'paste', 'cut', 'undo', 'redo', 'refresh', 'reload',
  
  // URLs and links
  'http', 'https', 'www', '.com', '.org', '.net',
  'meet.google.com',
  
  // Email patterns
  '@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com',
  
  // Codes and IDs
  'meeting code', 'pin', 'password', 'id', 'number', 'code',
  
  // Status messages
  'joined as', 'left the meeting', 'entered the meeting',
  'is now a host', 'is now a co-host', 'is now a participant',
  'muted', 'unmuted', 'turned on camera', 'turned off camera',
  'started sharing', 'stopped sharing'
];

// Function to check if text should be filtered out
function shouldFilterText(text) {
  if (!text || text.length < 2) return true;
  
  const lowerText = text.toLowerCase().trim();
  
  // Check against UI patterns
  for (const pattern of UI_PATTERNS) {
    if (lowerText.includes(pattern.toLowerCase())) {
      return true;
    }
  }
  
  // Check for common UI patterns
  if (
    // Single words (likely buttons)
    !lowerText.includes(' ') ||
    // All caps (likely UI labels)
    text === text.toUpperCase() ||
    // Contains special characters typical of UI
    /^[^a-zA-Z0-9\s]*$/.test(text) ||
    // Very short text (likely icons)
    text.length < 3 ||
    // Contains technical terms
    /(button|icon|arrow|close|add|remove|jump|bottom|top)/.test(lowerText) ||
    // Contains URLs
    /(http|www|\.com|\.org|meet\.google\.com)/.test(lowerText) ||
    // Contains email patterns
    /@.*\.com/.test(lowerText) ||
    // Contains meeting codes
    /[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(lowerText) ||
    // Contains specific UI patterns from your example
    /(arrow_downward|arrow_upward|closed_caption|videocam|jump to bottom)/.test(lowerText)
  ) {
    return true;
  }
  
  return false;
}

// Function to check if text looks like actual speech
function isSpeechText(text) {
  if (!text || text.length < 3) return false;
  
  const lowerText = text.toLowerCase().trim();
  
  // Must not be filtered out
  if (shouldFilterText(text)) return false;
  
  // Must contain some actual content
  if (text.length < 3) return false;
  
  // Must not be all caps (UI text)
  if (text === text.toUpperCase()) return false;
  
  return true;
}

// Function to extract speaker and message from text
function extractSpeechInfo(text) {
  if (!isSpeechText(text)) return null;
  
  let speaker = 'Unknown';
  let message = text;
  
  // Try to extract speaker from various patterns
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
      
      // Validate speaker name
      if (speaker.length < 2 || speaker.length > 50 || shouldFilterText(speaker)) {
        speaker = 'Unknown';
        message = text;
      }
      break;
    }
  }
  
  // If no pattern matched, check if it's just speech without speaker
  if (message === text) {
    // This might be just speech content
    message = text;
    speaker = 'Speaker';
  }
  
  return { speaker, message };
}

// Function to capture speech transcripts (balanced approach)
function captureSpeechTranscripts() {
  // Look for live caption elements
  const captionSelectors = [
    // Google Meet live captions
    '[data-mdc-dialog-id*="transcript"]',
    '[aria-label*="Live captions"]',
    '[aria-label*="Captions"]',
    'div[role="log"]',
    'div[aria-live="polite"]',
    'div[aria-live="assertive"]',
    // More specific selectors
    '[data-is-muted="false"] div[role="log"]',
    '[data-is-muted="false"] div[aria-live="polite"]',
    // Caption containers
    'div[data-caption-container]',
    'div[data-caption-text]',
    // Fallback: look for any text that might be captions
    'div:contains("said")',
    'span:contains("said")'
  ];
  
  let foundSpeech = [];
  
  captionSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.textContent?.trim();
        if (text && text !== lastProcessedText) {
          // Check if this looks like actual speech
          if (isSpeechText(text)) {
            const speechInfo = extractSpeechInfo(text);
            if (speechInfo) {
              foundSpeech.push({
                element: element,
                text: text,
                speaker: speechInfo.speaker,
                message: speechInfo.message
              });
            }
          }
        }
      });
    } catch (e) {
      // Ignore invalid selectors
    }
  });
  
  // Process found speech
  foundSpeech.forEach(({text, speaker, message}) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Check for duplicates (within 10 seconds)
    const existingEntry = transcriptData.find(entry => 
      entry.text === message && 
      entry.speaker === speaker &&
      Math.abs(new Date(`2000-01-01 ${entry.timestamp}`) - new Date(`2000-01-01 ${timestamp}`)) < 10000
    );
    
    if (!existingEntry && message.length > 0) {
      transcriptData.push({
        timestamp,
        speaker,
        text: message
      });
      lastProcessedText = text;
      updateTranscriptDisplay();
      console.log('Captured speech:', {timestamp, speaker, text: message});
    }
  });
}

// Function to start/stop capturing
function toggleCapturing() {
  isCapturing = !isCapturing;
  
  if (isCapturing) {
    if (!transcriptWindow) {
      createTranscriptWindow();
    }
    // Start periodic capture
    window.transcriptInterval = setInterval(captureSpeechTranscripts, 1000);
    console.log('Balanced speech transcript capturing started');
  } else {
    // Stop capturing
    if (window.transcriptInterval) {
      clearInterval(window.transcriptInterval);
      window.transcriptInterval = null;
    }
    console.log('Balanced speech transcript capturing stopped');
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
    console.log('Balanced Meet Transcript Capturer: Content script loaded');
    console.log('Looking for speech transcripts...');
  }
});

// Also initialize for dynamic content
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'meet.google.com') {
      console.log('Balanced Meet Transcript Capturer: Content script loaded');
    }
  });
} else {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Balanced Meet Transcript Capturer: Content script loaded');
  }
}