// Content script for Google Meet Transcript Capturer
let transcriptData = [];
let isCapturing = false;
let transcriptWindow = null;

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

// Function to capture transcript data
function captureTranscript() {
  // Look for transcript elements in Google Meet
  const transcriptElements = document.querySelectorAll('[data-mdc-dialog-id*="transcript"], [aria-label*="transcript"], .transcript-item, [data-speaker-id]');
  
  transcriptElements.forEach(element => {
    const text = element.textContent?.trim();
    if (text && text.length > 0) {
      // Extract speaker and timestamp if available
      const speakerMatch = text.match(/^([^:]+):/);
      const speaker = speakerMatch ? speakerMatch[1].trim() : 'Unknown';
      const messageText = speakerMatch ? text.substring(speakerMatch[0].length).trim() : text;
      
      // Generate timestamp
      const timestamp = new Date().toLocaleTimeString();
      
      // Check if this entry already exists
      const existingEntry = transcriptData.find(entry => 
        entry.text === messageText && 
        entry.speaker === speaker &&
        entry.timestamp === timestamp
      );
      
      if (!existingEntry) {
        transcriptData.push({
          timestamp,
          speaker,
          text: messageText
        });
        updateTranscriptDisplay();
      }
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
    window.transcriptInterval = setInterval(captureTranscript, 1000);
  } else {
    // Stop capturing
    if (window.transcriptInterval) {
      clearInterval(window.transcriptInterval);
      window.transcriptInterval = null;
    }
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
  // Check if we're in a Google Meet
  if (window.location.hostname === 'meet.google.com') {
    console.log('Meet Transcript Capturer: Content script loaded');
  }
});

// Also initialize for dynamic content
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