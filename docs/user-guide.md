# AIB - User Guide

## Introduction

AIB (AI Browser) is a desktop application designed to provide a clean, simple interface for accessing various AI services in a tabbed browser environment. This guide will help you get started with AIB and make the most of its features.

## Installation

### System Requirements
- Windows 10 or 11
- Internet connection
- Accounts for the AI services you wish to use (ChatGPT, Claude, Gemini, Grok)

### Installation Options

AIB can be installed in two ways:

1. **Installer Version**
   - Download [AIB_Installer-v1.0.0-b4.exe](https://github.com/AnRkey/AIB/releases/download/v1.0.0-b4/AIB_Installer-v1.0.0-b4.exe)
   - Run the installer and follow the on-screen instructions
   - The application will be installed in your Program Files directory
   - A desktop shortcut will be created automatically

2. **Portable Version**
   - Download [AIB_Portable-v1.0.0-b4.exe](https://github.com/AnRkey/AIB/releases/download/v1.0.0-b4/AIB_Portable-v1.0.0-b4.exe) or [AIB_Portable-v1.0.0-b4.zip](https://github.com/AnRkey/AIB/releases/download/v1.0.0-b4/AIB_Portable-v1.0.0-b4.zip)
   - For the EXE version, simply run the executable from any location
   - For the ZIP version, extract the contents to a location of your choice and run the executable

## Getting Started

### Launching AIB

1. Start the application using the desktop shortcut or executable file
2. You will see the welcome screen with the AIB background
3. Choose an AI service to begin chatting with by clicking one of the buttons in the left sidebar

### Interface Overview

The AIB interface consists of the following components:

- **Left Sidebar**: Contains buttons for accessing different AI services (ChatGPT, Claude, Gemini, Grok)
- **Tab Bar**: Shows open tabs with website names and favicons
- **"+" Button**: Appears after opening the first tab, allows creating additional tabs
- **Right Controls**:
  - **+Window**: Opens a new instance of AIB
  - **AOT**: Toggles "Always on Top" mode to keep AIB visible over other windows
  - **Settings**: Opens the application settings window

## Using AIB

### Working with Tabs

- **Opening a New Tab**: Click on any AI service button in the left sidebar
- **Creating Additional Tabs**: Click the "+" button in the tab bar
- **Switching Between Tabs**: Click on any tab to make it active
- **Closing a Tab**: Click the "×" button on the right side of a tab
- **Scrolling Tabs**: If you have many tabs open, use the "<" and ">" buttons to scroll through them

### Feature Usage

#### Multiple AI Services
You can have different AI services open simultaneously in different tabs, making it easy to compare responses or work with multiple services at once.

#### Always on Top Mode
The "AOT" button in the top-right corner toggles "Always on Top" mode. When active (button highlighted), the AIB window will stay on top of other windows, making it easy to reference AI responses while working in other applications.

#### Multiple Instances
The "+Window" button opens a new instance of AIB, allowing you to organize your AI interactions in separate windows. Each instance operates independently.

### Application Settings

Access the settings window by clicking the Settings icon in the top-right corner. The settings window includes several tabs:

#### General
- **Application Behavior**: Configure startup settings
  - **Always on top when application starts**: When enabled, new application windows will open in "Always on Top" mode. This setting only affects windows created after changing the setting and does not modify the state of currently open windows.

#### Audio
- **Microphone**: Select your default microphone for voice interactions with AI services
- **Audio Output**: Select your default speaker for AI voice responses

#### Privacy
- **Browser Data**: Manage your browsing data
  - **Clear All Browsing Data**: Removes cookies, login sessions, and other browsing data for all AI services

#### Proxy
- **Proxy Configuration**: Access your system proxy settings
  - **Open System Proxy Settings**: Opens the Windows network proxy configuration

#### Saving Settings
When you make changes to settings in the General or Audio sections:
1. A "Save Settings" button will appear at the bottom of the window
2. Click the button to save your changes
3. The button will disappear after saving
4. The button will reappear only when you make new changes

## Tips and Tricks

1. **Comparing AI Responses**: Open different AI services in separate tabs to easily compare their responses to the same prompt.

2. **Quick Reference**: Use "Always on Top" mode to keep AIB visible while working in other applications, perfect for following instructions or referencing information.

3. **Organization by Task**: Use multiple instances of AIB to separate different projects or tasks, keeping your AI interactions organized.

4. **Tab Management**: Close tabs you're no longer using to keep the interface clean and reduce resource usage.

5. **Browser Compatibility**: AIB identifies as Chrome 134 to all websites, ensuring optimal compatibility with AI services and avoiding "unsupported browser" messages.

6. **Audio Device Selection**: Configure your preferred microphone and speaker in the Settings window for consistent audio experience.

## Troubleshooting

### Common Issues

1. **AI Service Not Loading**
   - Ensure you have an active internet connection
   - Verify that you have an account for the service and are logged in
   - Try refreshing the tab or reopening the service in a new tab

2. **Performance Issues**
   - Close unused tabs to free up resources
   - Restart the application if it becomes sluggish after extended use

3. **Login Issues**
   - AIB uses your system's persistent storage for cookies, so you should stay logged in to services between sessions
   - If you're repeatedly asked to log in, check if your browser's cookies are being cleared automatically
   - If you're still having issues, try using the "Clear All Browsing Data" button in Settings > Privacy and logging in again

### Getting Help

If you encounter any issues not covered in this guide, please:

1. Check for updated documentation on the [GitHub repository](https://github.com/AnRkey/AIB)
2. Submit an issue on GitHub with details about your problem
3. Contact the developer directly at anrkey@gmail.com

## Feedback

Your feedback helps improve AIB! Please share your thoughts, suggestions, and feature requests by:

- Submitting an issue on GitHub
- Sending an email to anrkey@gmail.com with the subject "AIB Feedback"
- Leaving a comment on the releases page 