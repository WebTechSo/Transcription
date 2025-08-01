// Google Meet Transcript Capturer - Only capture finalized captions
let transcriptData = [];
let isCapturing = false;
let transcriptWindow = null;
let currentLine = null;
let lastText = '';
let meetingStartTime = null;
let settings = {};

// Load settings
async function loadSettings() {
    settings = await chrome.storage.sync.get({
        autoStart: false,
        windowPosition: 'top-right',
        windowSize: 'medium',
        autoSummarize: false
    });
}

// Save transcript to storage
async function saveTranscript() {
    if (transcriptData.length === 0) return;
    
    const meetingEndTime = Date.now();
    const duration = meetingStartTime ? Math.round((meetingEndTime - meetingStartTime) / 1000 / 60) : 0;
    
    const transcript = {
        meetingDate: meetingStartTime || Date.now(),
        duration: `${duration} minutes`,
        data: [...transcriptData]
    };
    
    const { transcripts = [] } = await chrome.storage.local.get('transcripts');
    transcripts.push(transcript);
    await chrome.storage.local.set({ transcripts });
    
    // Auto-summarize if enabled
    if (settings.autoSummarize) {
        try {
            const summary = await generateSummary(transcript.data);
            transcript.summary = summary;
            transcripts[transcripts.length - 1] = transcript;
            await chrome.storage.local.set({ transcripts });
        } catch (error) {
            console.error('Auto-summarization failed:', error);
        }
    }
    
    console.log('Transcript saved to storage');
}

// Generate summary using OpenAI
async function generateSummary(transcriptData) {
    const { openaiKey, summaryPrompt } = await chrome.storage.sync.get();
    
    if (!openaiKey) {
        throw new Error('OpenAI API key not configured');
    }
    
    const transcriptText = transcriptData.map(entry => 
        `${entry.timestamp} - Speaker: ${entry.text}`
    ).join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that summarizes meeting transcripts.'
                },
                {
                    role: 'user',
                    content: `${summaryPrompt}\n\nTranscript:\n${transcriptText}`
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function createTranscriptWindow() {
  if (transcriptWindow) transcriptWindow.remove();
  transcriptWindow = document.createElement('div');
  transcriptWindow.id = 'meet-transcript-window';
  
  // Apply window size setting
  const sizeMap = {
    'small': '300px 400px',
    'medium': '400px 500px',
    'large': '500px 600px'
  };
  const size = sizeMap[settings.windowSize] || '400px 500px';
  
  // Apply window position setting
  const positionMap = {
    'top-right': 'top: 20px; right: 20px;',
    'top-left': 'top: 20px; left: 20px;',
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;'
  };
  const position = positionMap[settings.windowPosition] || 'top: 20px; right: 20px;';
  
  transcriptWindow.style.cssText = `
    position: fixed;
    ${position}
    width: ${size.split(' ')[0]};
    height: ${size.split(' ')[1]};
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
      <button id="save-transcript" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 8px;">Save</button>
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
  document.getElementById('copy-transcript').addEventListener('click', copyTranscript);
  document.getElementById('save-transcript').addEventListener('click', saveTranscript);
  document.getElementById('close-transcript').addEventListener('click', () => {
    transcriptWindow.remove();
    transcriptWindow = null;
  });
  // Draggable
  let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === header) isDragging = true;
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

function updateTranscriptDisplay() {
  if (!transcriptWindow) return;
  const content = document.getElementById('transcript-content');
  if (transcriptData.length === 0) {
    content.innerHTML = '<em>No transcript data captured yet...</em>';
    return;
  }
  const transcriptText = transcriptData
    .map(entry => `${entry.timestamp} - Speaker: ${entry.text}`)
    .join('\n\n');
  content.innerHTML = transcriptText.replace(/\n/g, '<br>');
  content.scrollTop = content.scrollHeight;
}

// Only capture finalized captions
function captureCaptions() {
  const captionElements = document.querySelectorAll('div.ygicle.VbkSUe');
  let currentText = '';
  captionElements.forEach(element => {
    const text = element.textContent?.trim();
    if (text && text.length > currentText.length) {
      currentText = text;
    }
  });
  
  // If we have text and it's different from what we last processed
  if (currentText && currentText !== lastText) {
    // If this is a new line (no current line or text is shorter than current line)
    if (!currentLine || currentText.length < currentLine.text.length) {
      // Start a new line
      const timestamp = new Date().toLocaleTimeString();
      currentLine = { timestamp, text: currentText };
      transcriptData.push(currentLine);
      console.log('Started new line:', { timestamp, text: currentText });
    } else {
      // Update the current line with new text
      currentLine.text = currentText;
      console.log('Updated current line:', { text: currentText });
    }
    
    updateTranscriptDisplay();
    lastText = currentText;
  } else if (!currentText) {
    // No text found, reset current line
    currentLine = null;
    lastText = '';
  }
}

function toggleCapturing() {
  isCapturing = !isCapturing;
  if (isCapturing) {
    if (!transcriptWindow) createTranscriptWindow();
    if (!meetingStartTime) meetingStartTime = Date.now();
    window.transcriptInterval = setInterval(captureCaptions, 1000);
    console.log('Transcript capturing started');
  } else {
    if (window.transcriptInterval) {
      clearInterval(window.transcriptInterval);
      window.transcriptInterval = null;
    }
    // Save transcript when stopping
    saveTranscript();
    console.log('Transcript capturing stopped');
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleCapturing') {
    toggleCapturing();
    sendResponse({ isCapturing });
  } else if (request.action === 'getStatus') {
    sendResponse({ isCapturing, hasWindow: !!transcriptWindow });
  }
});

// Auto-start if enabled
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Meet Transcript Capturer: Content script loaded');
    await loadSettings();
    
    if (settings.autoStart) {
      // Wait a bit for the page to load completely
      setTimeout(() => {
        toggleCapturing();
      }, 3000);
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.hostname === 'meet.google.com') {
      console.log('Meet Transcript Capturer: Content script loaded');
      await loadSettings();
      
      if (settings.autoStart) {
        setTimeout(() => {
          toggleCapturing();
        }, 3000);
      }
    }
  });
} else {
  if (window.location.hostname === 'meet.google.com') {
    console.log('Meet Transcript Capturer: Content script loaded');
    loadSettings().then(() => {
      if (settings.autoStart) {
        setTimeout(() => {
          toggleCapturing();
        }, 3000);
      }
    });
  }
}