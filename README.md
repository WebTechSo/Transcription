# Google Meet Transcript Capturer

A Chrome extension that captures Google Meet transcripts and displays them in a copyable window.

## Features

- 🎤 **Real-time Transcript Capture**: Automatically captures transcript data from Google Meet
- 📋 **Copyable Window**: Displays transcripts in a draggable, resizable window
- 📝 **Easy Copy**: One-click copy functionality for all captured text
- 🎨 **Modern UI**: Clean, Google-style interface that integrates seamlessly
- 🔄 **Live Updates**: Transcripts update in real-time as the meeting progresses

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download the Extension Files**
   - Clone or download this repository to your local machine

2. **Generate Icons** (if needed)
   - Open `create_icons.html` in your browser
   - Right-click on each icon and save as:
     - `icon16.png` (16x16)
     - `icon48.png` (48x48) 
     - `icon128.png` (128x128)
   - Place these files in the extension directory

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing the extension files

4. **Verify Installation**
   - The extension should appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

### Method 2: Package and Install

1. **Package the Extension**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Pack extension"
   - Select the extension folder
   - This will create a `.crx` file

2. **Install the Package**
   - Drag the `.crx` file into Chrome
   - Confirm the installation

## Usage

### Basic Usage

1. **Join a Google Meet**
   - Navigate to [meet.google.com](https://meet.google.com)
   - Join or start a meeting

2. **Start Capturing**
   - Click the extension icon in your Chrome toolbar
   - Click "Start Capturing" in the popup
   - A transcript window will appear on the page

3. **View and Copy Transcripts**
   - The transcript window shows all captured text
   - Click "Copy" to copy all transcript text to clipboard
   - Drag the window header to reposition it
   - Click "×" to close the window

### Advanced Features

- **Real-time Updates**: Transcripts update automatically as people speak
- **Speaker Identification**: Attempts to identify different speakers
- **Timestamp Tracking**: Each entry includes a timestamp
- **Draggable Window**: Move the transcript window anywhere on screen

## How It Works

The extension works by:

1. **Content Script Injection**: Automatically injects into Google Meet pages
2. **DOM Monitoring**: Watches for transcript elements in the page
3. **Data Extraction**: Captures speaker names, timestamps, and text content
4. **Real-time Display**: Updates the transcript window as new data is captured

## File Structure

```
├── manifest.json          # Extension configuration
├── content.js            # Main content script (runs on meet.google.com)
├── popup.html           # Extension popup interface
├── popup.js             # Popup functionality
├── background.js        # Background service worker
├── create_icons.html    # Icon generator (optional)
├── icon16.png          # Extension icon (16x16)
├── icon48.png          # Extension icon (48x48)
├── icon128.png         # Extension icon (128x128)
└── README.md           # This file
```

## Permissions

The extension requires the following permissions:

- **activeTab**: To interact with the current Google Meet tab
- **storage**: To save extension settings (future feature)
- **scripting**: To inject content scripts
- **host_permissions**: Access to meet.google.com

## Troubleshooting

### Extension Not Working?

1. **Check if you're on Google Meet**
   - The extension only works on `meet.google.com`
   - Make sure you're in an active meeting

2. **Refresh the Page**
   - Sometimes the content script needs a page refresh
   - Reload the Google Meet page and try again

3. **Check Console for Errors**
   - Open Chrome DevTools (F12)
   - Look for any error messages in the Console tab

4. **Reinstall the Extension**
   - Remove the extension from Chrome
   - Reload it using "Load unpacked"

### Transcript Not Capturing?

1. **Enable Live Captions**
   - Make sure live captions are enabled in your Google Meet
   - The extension captures from the live caption elements

2. **Check Meeting Settings**
   - Some meetings may have captions disabled
   - Ask the meeting organizer to enable live captions

3. **Browser Compatibility**
   - Ensure you're using the latest version of Chrome
   - The extension requires Chrome 88+ (Manifest V3)

## Development

### Making Changes

1. **Edit Files**: Modify the JavaScript, HTML, or CSS files
2. **Reload Extension**: Go to `chrome://extensions/` and click the refresh icon
3. **Test**: Navigate to Google Meet and test your changes

### Debugging

- **Content Script**: Check the Console tab in DevTools on the Google Meet page
- **Popup**: Right-click the extension icon and "Inspect popup"
- **Background**: Go to `chrome://extensions/` and click "service worker" link

## Privacy & Security

- **Local Processing**: All transcript processing happens locally in your browser
- **No Data Collection**: The extension doesn't send any data to external servers
- **Open Source**: All code is visible and can be audited
- **Minimal Permissions**: Only requests necessary permissions for functionality

## Contributing

Feel free to contribute improvements:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the console for error messages
3. Create an issue in the repository

---

**Note**: This extension is designed for educational and productivity purposes. Please respect privacy and obtain consent when recording or sharing meeting transcripts.
