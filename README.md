# AIB - AI Browser

AIB is a desktop application that provides a convenient way to access various AI services in a tabbed browser interface.

## Features

- Simple, clean interface optimized for AI interactions
- Support for multiple services:
  - Grok
  - ChatGPT
  - Claude
  - Google Gemini 
  - Google AI Studio
- Tab-based browsing with the ability to open multiple AI services at once
- "Always on top" mode to keep the application visible while working in other windows
- Ability to launch multiple instances of the application

## Installation

### Windows

1. Download the latest release from the releases page
2. Run the installer or use the portable version

### From Source

1. Clone this repository
2. Install dependencies with `npm install`
3. Run the application with `npm start`
4. Build with `npm run build`

## Usage

- Click on any AI service button in the left sidebar to open it in the current tab or create a new tab
- Use the "+" button in the tab bar to create a new tab
- Toggle "Always on top" to keep the window visible on top of other applications
- Click the "+ Instance" button to open a new instance of the application

## Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run the app
npm start

# Build the app
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Electron
- Uses a native browser approach to respect websites' security requirements

## Disclaimer

This app is not affiliated with any of the AI services it provides access to. It is simply a browser interface for accessing these services.
