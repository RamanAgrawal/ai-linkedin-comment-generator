# 💡 LinkedComment AI

**Smart LinkedIn commenting assistant powered by AI**

LinkedComment AI is a Chrome browser extension that enhances your LinkedIn experience by adding AI-powered comment generation directly into LinkedIn's interface. Get thoughtful, relevant comment suggestions with just one click!

<!-- ![LinkedComment AI Demo](https://via.placeholder.com/800x400?text=LinkedComment+AI+Demo) -->

## ✨ Features

- **🤖 AI-Powered Comments**: Generates professional, contextual comments for LinkedIn posts using DeepSeek AI
- **🇮🇳 Hinglish Support**: Automatically detects Hindi content and uses Hindi-English mix for more personal, relatable comments
- **🎯 Native Integration**: AI button seamlessly integrated next to LinkedIn's Send button
- **🎨 Multiple Tones**: Choose between Professional, Friendly, or Witty comment styles
- **⚡ One-Click Magic**: Generate and auto-insert comments with a single button click
- **🎛️ Customizable Settings**: Control tone, behavior, and API preferences
- **🔒 Privacy-First**: No data tracking or logging of your activity
- **🚀 Fast & Lightweight**: Minimal performance impact on LinkedIn
- **📱 Responsive Design**: Works seamlessly on desktop and mobile LinkedIn

## 🚀 Quick Start

### Installation

1. **Download the Extension**

   ```bash
   git clone https://github.com/yourusername/linkedcomment-ai.git
   cd linkedcomment-ai
   ```

2. **Load in Chrome**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select the extension folder
   - The LinkedComment AI icon should appear in your extensions bar

3. **Configure Settings**

   - Click the LinkedComment AI icon in your Chrome toolbar
   - Configure your preferences (tone, auto-generation, etc.)
   - Optionally add your DeepSeek API key for enhanced AI comments

4. **Start Using**
   - Navigate to [LinkedIn](https://www.linkedin.com/feed/)
   - Look for the "🤖 AI Comment" button next to the Send button on posts
   - Click it to generate and auto-insert a comment!

### First Use

1. **Without API Key (Free)**: The extension works immediately with high-quality mock comments
2. **With DeepSeek API Key**: Add your API key in settings for AI-generated comments

## 🎯 How It Works

1. **Seamless Integration**: AI buttons appear naturally in LinkedIn's interface
2. **Smart Detection**: Automatically detects and processes LinkedIn posts
3. **One-Click Generation**: Click the AI button to generate a relevant comment
4. **Auto-Insert**: Comments are automatically inserted into LinkedIn's comment box
5. **Visual Feedback**: Button shows loading, success, and error states

## 🛠️ Configuration

### Settings Options

| Setting              | Description                                   | Default           |
| -------------------- | --------------------------------------------- | ----------------- |
| **Enable Extension** | Turn AI comments on/off                       | ✅ Enabled        |
| **Comment Tone**     | Professional, Friendly, or Witty              | 👔 Professional   |
| **Auto-generate**    | Show AI buttons automatically while scrolling | ✅ Enabled        |
| **DeepSeek API Key** | Optional key for AI-powered comments          | Empty (uses mock) |

### Getting a DeepSeek API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into LinkedComment AI settings

**Note**: API usage charges apply based on DeepSeek's pricing. The extension uses DeepSeek Chat model for high-quality results at affordable rates.

## 📱 Usage Tips

- **Look for the Robot**: Find the "🤖 AI Comment" button next to Send on each post
- **Try Different Tones**: Experiment with Professional, Friendly, and Witty styles
- **Quick Feedback**: Button changes color to show success (green) or error (red)
- **Review Before Posting**: Always review AI-generated content before submitting
- **Respect LinkedIn's ToS**: Use thoughtfully and authentically

## 🔧 Technical Details

### Architecture

```
LinkedComment AI/
├── manifest.json          # Extension configuration
├── content.js            # Main content script (post detection & UI)
├── background.js         # Service worker (API calls & settings)
├── popup.html/js         # Settings interface
├── injection.js          # Additional post processing utilities
├── styles.css           # LinkedIn-native button styling
└── icons/               # Extension icons
```

### Browser Compatibility

- ✅ Chrome 88+ (Manifest V3)
- ✅ Edge 88+ (Chromium-based)
- ⚠️ Firefox (requires Manifest V2 adaptation)

### Permissions Used

- `scripting`: Inject content script into LinkedIn
- `activeTab`: Access current LinkedIn tab
- `storage`: Save user preferences
- `host_permissions`: Access linkedin.com domain

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Test Thoroughly** on LinkedIn
5. **Submit a Pull Request**

### Development Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/linkedcomment-ai.git
cd linkedcomment-ai

# Load in Chrome for testing
# (See installation instructions above)

# Make changes and reload extension to test
```

## 🐛 Troubleshooting

### Common Issues

**AI buttons not appearing?**

- Check if extension is enabled in popup settings
- Refresh LinkedIn page after installation
- Ensure you're on linkedin.com (not other LinkedIn domains)

**Button not working?**

- Try clicking "Comment" on the LinkedIn post first
- Check browser console for any errors
- Make sure the extension has proper permissions

**API errors?**

- Verify your DeepSeek API key is correct
- Check your DeepSeek account has sufficient credits
- Try using mock comments first (no API key needed)

**Comment insertion not working?**

- Ensure the comment section is expanded first
- Some LinkedIn UI updates may require extension updates
- Try refreshing the page

### Support

- 📧 **Email**: support@linkedcommentai.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/linkedcomment-ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/linkedcomment-ai/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- LinkedIn for providing the platform
- DeepSeek for providing affordable, high-quality AI API
- Chrome Extensions community for best practices
- All contributors and users who make this project better

## ⚠️ Disclaimer

LinkedComment AI is an independent project and is not affiliated with, endorsed by, or sponsored by LinkedIn Corporation. Use responsibly and in accordance with LinkedIn's Terms of Service.

---

<!-- **Made with ❤️ for the LinkedIn community**

[Website](https://linkedcommentai.com) • [Privacy Policy](https://linkedcommentai.com/privacy) • [Terms of Service](https://linkedcommentai.com/terms) -->
