# Google Meet Transcript Capturer

A Chrome extension that captures Google Meet transcripts and displays them in a copyable window, with advanced features including AI-powered summarization.

## Features

- **Real-time Transcript Capture**: Captures live captions from Google Meet meetings
- **Smart Text Processing**: Handles incremental captions like Google Meet's native display
- **Copyable Window**: Easy-to-use floating window with copy functionality
- **Transcript Storage**: Automatically saves transcripts for later access
- **AI Summarization**: Generate meeting summaries using OpenAI
- **Customizable Settings**: Adjust window position, size, and behavior
- **Export Options**: Export transcripts as JSON files
- **Admin Panel**: Comprehensive settings and transcript management interface

## Installation

1. **Download the Extension Files**
   ```bash
   git clone <repository-url>
   cd meet-transcript-capturer
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension folder

3. **Enable Live Captions**
   - Join a Google Meet call
   - Click the "Live captions" button (CC icon) in the meeting controls
   - Select your preferred language

## Usage

### Basic Usage
1. Join a Google Meet call
2. Enable live captions in the meeting
3. Click the extension icon in your browser toolbar
4. Click "Start Capturing" to begin
5. A transcript window will appear on screen
6. Use the "Copy" button to copy all text
7. Click "Save" to store the transcript

### Admin Panel / Settings
1. Click the extension icon
2. Click "Settings" to open the admin panel
3. Configure your preferences:
   - **Auto-start**: Automatically begin capturing when joining meetings
   - **Window Position**: Choose where the transcript window appears
   - **Window Size**: Select small, medium, or large window
   - **OpenAI Integration**: Add your API key for AI summaries
   - **Custom Prompts**: Set your preferred summary style

### OpenAI Integration
1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Open the extension settings
3. Enter your API key in the "OpenAI API Key" field
4. Customize the summary prompt if desired
5. Enable "Auto-summarize" to automatically generate summaries after meetings
6. Use "Summarize with AI" button on individual transcripts

## Features in Detail

### Transcript Management
- **View All Transcripts**: See all captured transcripts in the admin panel
- **Export Individual**: Export specific transcripts as JSON files
- **Export All**: Download all transcripts in a single file
- **Delete Transcripts**: Remove individual or all transcripts
- **AI Summaries**: Generate concise meeting summaries using GPT-3.5

### Settings Options
- **Auto-start Capturing**: Begin automatically when joining meetings
- **Window Position**: Top-right, top-left, bottom-right, or bottom-left
- **Window Size**: Small (300x400), Medium (400x500), or Large (500x600)
- **Custom Summary Prompts**: Tailor AI summaries to your needs
- **Auto-summarization**: Automatically generate summaries after meetings

### Advanced Features
- **Smart Caption Handling**: Processes incremental captions like Google Meet's native display
- **Speaker Tracking**: Maintains one line per speaker until they finish speaking
- **Real-time Updates**: Transcript window updates as people speak
- **Draggable Window**: Move the transcript window anywhere on screen
- **Meeting Duration**: Tracks and displays meeting duration
- **Error Handling**: Graceful handling of network issues and API errors

## File Structure

```
meet-transcript-capturer/
├── manifest.json          # Extension configuration
├── content.js            # Main transcript capture logic
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── options.html          # Admin panel interface
├── options.js            # Admin panel functionality
├── background.js         # Background service worker
└── README.md            # This file
```

## Troubleshooting

### Extension Won't Load
- Ensure all files are present in the extension folder
- Check that `manifest.json` is valid JSON
- Verify Chrome's developer mode is enabled
- Try reloading the extension

### No Transcripts Captured
- Make sure live captions are enabled in Google Meet
- Check that you're on a `meet.google.com` page
- Verify the extension is active (blue icon in toolbar)
- Try refreshing the Google Meet page

### OpenAI Summaries Not Working
- Verify your OpenAI API key is correct
- Check that you have sufficient API credits
- Ensure the API key has access to GPT-3.5-turbo
- Check the browser console for error messages

### Window Not Appearing
- Check that the extension is active
- Try clicking "Start Capturing" again
- Verify you're on a Google Meet page
- Check browser console for errors

## Privacy & Security

- **Local Storage**: All transcripts are stored locally in your browser
- **No Data Sharing**: Transcripts are never sent to external servers (except OpenAI when generating summaries)
- **API Key Security**: Your OpenAI API key is stored locally and never shared
- **Optional Features**: AI summarization is completely optional

## Technical Details

### Permissions Used
- `activeTab`: Access to current Google Meet tab
- `storage`: Save settings and transcripts locally
- `scripting`: Inject content scripts into Google Meet

### API Integration
- **OpenAI GPT-3.5-turbo**: For meeting summarization
- **Chrome Storage API**: For local data persistence
- **Chrome Tabs API**: For tab communication

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Create an issue in the repository

---

**Note**: This extension requires Google Meet's live captions to be enabled. The extension captures the text that Google Meet displays on screen, so it cannot work without captions enabled.
