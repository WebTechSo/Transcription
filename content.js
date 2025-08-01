// Google Meet Transcript Capturer
let transcriptData = [];
let isCapturing = false;
let transcriptWindow = null;
let lastProcessedText = '';

// Create transcript window
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

  // Event listeners
  document.getElementById('copy-transcript').addEventListener('click', copyTranscript);
  document.getElementById('close-transcript').addEventListener('click', () => {
    transcriptWindow.remove();
    transcriptWindow = null;
  });

  // Make window draggable
  let isDragging = false;
  let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

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
      transcriptWindow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
  }

  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
  }
}

// Copy transcript to clipboard
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

// Update transcript display
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

// UI patterns to filter out
const UI_PATTERNS = [
  'arrow_downward', 'arrow_upward', 'closed_caption_off', 'closed_caption',
  'videocam', 'jump to bottom', 'jump to top', 'close', 'add', 'remove',
  'settings', 'menu', 'mute', 'unmute', 'camera', 'video', 'audio',
  'chat', 'participants', 'share', 'record', 'background', 'effects',
  'more', 'less', 'expand', 'collapse', 'fullscreen', 'exit', 'leave',
  'end', 'start', 'stop', 'pause', 'play', 'scroll', 'next', 'previous',
  'back', 'forward', 'home', 'dashboard', 'profile', 'account',
  'preferences', 'help', 'support', 'feedback', 'meeting', 'call',
  'conference', 'room', 'link', 'invite', 'join', 'host', 'co-host',
  'participant', 'attendee', 'guest', 'moderator', 'permission',
  'request', 'approve', 'deny', 'allow', 'block', 'live captions',
  'captions', 'subtitles', 'transcript', 'turn on', 'turn off',
  'enable', 'disable', 'show', 'hide', 'loading', 'connecting',
  'disconnected', 'reconnecting', 'error', 'failed', 'success',
  'complete', 'done', 'ready', 'preparing', 'initializing', 'click',
  'press', 'tap', 'hover', 'drag', 'drop', 'select', 'choose',
  'confirm', 'cancel', 'ok', 'yes', 'no', 'save', 'delete', 'edit',
  'copy', 'paste', 'cut', 'undo', 'redo', 'refresh', 'reload',
  'http', 'https', 'www', '.com', '.org', '.net', 'meet.google.com',
  '@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com',
  'meeting code', 'pin', 'password', 'id', 'number', 'code',
  'joined as', 'left the meeting', 'entered the meeting',
  'is now a host', 'is now a co-host', 'is now a participant',
  'muted', 'unmuted', 'turned on camera', 'turned off camera',
  'started sharing', 'stopped sharing'
];

// Check if text should be filtered out
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
    !lowerText.includes(' ') ||
    text === text.toUpperCase() ||
    /^[^a-zA-Z0-9\s]*$/.test(text) ||
    text.length < 3 ||
    /(button|icon|arrow|close|add|remove|jump|bottom|top)/.test(lowerText) ||
    /(http|www|\.com|\.org|meet\.google\.com)/.test(lowerText) ||
    /@.*\.com/.test(lowerText) ||
    /[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(lowerText) ||
    /(arrow_downward|arrow_upward|closed_caption|videocam|jump to bottom)/.test(lowerText)
  ) {
    return true;
  }
  
  return false;
}

// Check if text looks like actual speech
function isSpeechText(text) {
  if (!text || text.length < 3) return false;
  
  const lowerText = text.toLowerCase().trim();
  
  if (shouldFilterText(text)) return false;
  if (text.length < 3) return false;
  if (text === text.toUpperCase()) return false;
  
  return true;
}

// Extract speaker and message from text
function extractSpeechInfo(text) {
  if (!isSpeechText(text)) return null;
  
  let speaker = 'Unknown';
  let message = text;
  
  // Try to extract speaker from various patterns
  const patterns = [
    /^([^:]+):\s*(.+)$/,
    /^([^:]+)\s+said:\s*(.+)$/,
    /^([^:]+)\s*-\s*(.+)$/,
    /^([^:]+)\s*:\s*(.+)$/,
    /^([^:]+)\s*said\s*(.+)$/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      speaker = match[1].trim();
      message = match[2].trim();
      
      if (speaker.length < 2 || speaker.length > 50 || shouldFilterText(speaker)) {
        speaker = 'Unknown';
        message = text;
      }
      break;
    }
  }
  
  if (message === text) {
    message = text;
    speaker = 'Speaker';
  }
  
  return { speaker, message };
}

// Capture speech transcripts
function captureSpeechTranscripts() {
  const captionSelectors = [
    '[data-mdc-dialog-id*="transcript"]',
    '[aria-label*="Live captions"]',
    '[aria-label*="Captions"]',
    'div[role="log"]',
    'div[aria-live="polite"]',
    'div[aria-live="assertive"]',
    '[data-is-muted="false"] div[role="log"]',
    '[data-is-muted="false"] div[aria-live="polite"]',
    'div[data-caption-container]',
    'div[data-caption-text]',
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

// Start/stop capturing
function toggleCapturing() {
  isCapturing = !isCapturing;
  
  if (isCapturing) {
    if (!transcriptWindow) {
      createTranscriptWindow();
    }
    window.transcriptInterval = setInterval(captureSpeechTranscripts, 1000);
    console.log('Transcript capturing started');
  } else {
    if (window.transcriptInterval) {
      clearInterval(window.transcriptInterval);
      window.transcriptInterval = null;
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Meet Transcript Capturer: Content script loaded');
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hostname === 'meet.google.com') {
      console.log('Meet Transcript Capturer: Content script loaded');
    }
  });
} else {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Meet Transcript Capturer: Content script loaded');
  }
}