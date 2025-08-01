// Options page for Meet Transcript Capturer
class OptionsManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.loadTranscripts();
    }

    async loadSettings() {
        const settings = await chrome.storage.sync.get({
            autoStart: false,
            windowPosition: 'top-right',
            windowSize: 'medium',
            openaiKey: '',
            summaryPrompt: 'Summarize this meeting transcript in a concise way, highlighting key points, action items, and important decisions made.',
            autoSummarize: false
        });

        document.getElementById('autoStart').checked = settings.autoStart;
        document.getElementById('windowPosition').value = settings.windowPosition;
        document.getElementById('windowSize').value = settings.windowSize;
        document.getElementById('openaiKey').value = settings.openaiKey;
        document.getElementById('summaryPrompt').value = settings.summaryPrompt;
        document.getElementById('autoSummarize').checked = settings.autoSummarize;
    }

    setupEventListeners() {
        // Save settings on change
        document.getElementById('autoStart').addEventListener('change', () => this.saveSettings());
        document.getElementById('windowPosition').addEventListener('change', () => this.saveSettings());
        document.getElementById('windowSize').addEventListener('change', () => this.saveSettings());
        document.getElementById('openaiKey').addEventListener('input', () => this.saveSettings());
        document.getElementById('summaryPrompt').addEventListener('input', () => this.saveSettings());
        document.getElementById('autoSummarize').addEventListener('change', () => this.saveSettings());

        // Transcript management buttons
        document.getElementById('exportAll').addEventListener('click', () => this.exportAllTranscripts());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAllTranscripts());
        document.getElementById('deleteAll').addEventListener('click', () => this.deleteAllData());
    }

    async saveSettings() {
        const settings = {
            autoStart: document.getElementById('autoStart').checked,
            windowPosition: document.getElementById('windowPosition').value,
            windowSize: document.getElementById('windowSize').value,
            openaiKey: document.getElementById('openaiKey').value,
            summaryPrompt: document.getElementById('summaryPrompt').value,
            autoSummarize: document.getElementById('autoSummarize').checked
        };

        await chrome.storage.sync.set(settings);
        this.showStatus('Settings saved successfully!', 'success');
    }

    async loadTranscripts() {
        const { transcripts = [] } = await chrome.storage.local.get('transcripts');
        const transcriptList = document.getElementById('transcriptList');
        
        if (transcripts.length === 0) {
            transcriptList.innerHTML = '<p style="text-align: center; color: #5f6368; padding: 20px;">No transcripts found. Start a meeting and capture some transcripts to see them here.</p>';
            return;
        }

        transcriptList.innerHTML = '';
        transcripts.forEach((transcript, index) => {
            const transcriptItem = this.createTranscriptItem(transcript, index);
            transcriptList.appendChild(transcriptItem);
        });
    }

    createTranscriptItem(transcript, index) {
        const item = document.createElement('div');
        item.className = 'transcript-item';
        
        const meetingDate = new Date(transcript.meetingDate || Date.now()).toLocaleDateString();
        const meetingTime = new Date(transcript.meetingDate || Date.now()).toLocaleTimeString();
        
        item.innerHTML = `
            <h3>Meeting Transcript - ${meetingDate} ${meetingTime}</h3>
            <div class="timestamp">Duration: ${transcript.duration || 'Unknown'}</div>
            <div class="text">${this.formatTranscriptText(transcript.data)}</div>
            <div class="button-group">
                <button class="btn" onclick="optionsManager.exportTranscript(${index})">Export</button>
                <button class="btn btn-success" onclick="optionsManager.summarizeTranscript(${index})">Summarize with AI</button>
                <button class="btn btn-secondary" onclick="optionsManager.deleteTranscript(${index})">Delete</button>
            </div>
            ${transcript.summary ? `
                <div class="summary-box">
                    <h4>AI Summary</h4>
                    <div>${transcript.summary}</div>
                </div>
            ` : ''}
        `;
        
        return item;
    }

    formatTranscriptText(data) {
        if (!data || !Array.isArray(data)) return 'No transcript data';
        
        return data.map(entry => 
            `${entry.timestamp} - Speaker: ${entry.text}`
        ).join('<br><br>');
    }

    async exportAllTranscripts() {
        const { transcripts = [] } = await chrome.storage.local.get('transcripts');
        
        if (transcripts.length === 0) {
            this.showStatus('No transcripts to export', 'info');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            totalTranscripts: transcripts.length,
            transcripts: transcripts
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meet-transcripts-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('All transcripts exported successfully!', 'success');
    }

    async clearAllTranscripts() {
        if (!confirm('Are you sure you want to clear all transcripts? This action cannot be undone.')) {
            return;
        }

        await chrome.storage.local.remove('transcripts');
        this.loadTranscripts();
        this.showStatus('All transcripts cleared successfully!', 'success');
    }

    async deleteAllData() {
        if (!confirm('Are you sure you want to delete ALL data including settings? This action cannot be undone.')) {
            return;
        }

        await chrome.storage.local.clear();
        await chrome.storage.sync.clear();
        this.loadSettings();
        this.loadTranscripts();
        this.showStatus('All data deleted successfully!', 'success');
    }

    async exportTranscript(index) {
        const { transcripts = [] } = await chrome.storage.local.get('transcripts');
        const transcript = transcripts[index];
        
        if (!transcript) {
            this.showStatus('Transcript not found', 'error');
            return;
        }

        const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date(transcript.meetingDate).toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showStatus('Transcript exported successfully!', 'success');
    }

    async deleteTranscript(index) {
        if (!confirm('Are you sure you want to delete this transcript?')) {
            return;
        }

        const { transcripts = [] } = await chrome.storage.local.get('transcripts');
        transcripts.splice(index, 1);
        await chrome.storage.local.set({ transcripts });
        this.loadTranscripts();
        this.showStatus('Transcript deleted successfully!', 'success');
    }

    async summarizeTranscript(index) {
        const settings = await chrome.storage.sync.get();
        if (!settings.openaiKey) {
            this.showStatus('Please enter your OpenAI API key in the settings first', 'error');
            return;
        }

        const { transcripts = [] } = await chrome.storage.local.get('transcripts');
        const transcript = transcripts[index];
        
        if (!transcript) {
            this.showStatus('Transcript not found', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            const summary = await this.generateSummary(transcript.data, settings.summaryPrompt, settings.openaiKey);
            
            // Update transcript with summary
            transcript.summary = summary;
            transcripts[index] = transcript;
            await chrome.storage.local.set({ transcripts });
            
            this.loadTranscripts();
            this.showStatus('Summary generated successfully!', 'success');
        } catch (error) {
            console.error('Summary generation error:', error);
            this.showStatus(`Error generating summary: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateSummary(transcriptData, prompt, apiKey) {
        const transcriptText = transcriptData.map(entry => 
            `${entry.timestamp} - Speaker: ${entry.text}`
        ).join('\n');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
                        content: `${prompt}\n\nTranscript:\n${transcriptText}`
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

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        loadingDiv.style.display = show ? 'block' : 'none';
    }
}

// Initialize options manager
const optionsManager = new OptionsManager();