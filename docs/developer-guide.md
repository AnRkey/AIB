# AIB - Developer Guide

This guide provides information for developers who want to understand, modify, or contribute to the AIB project.

## Project Overview

AIB (AI Browser) is an Electron-based desktop application that provides a convenient way to access various AI services in a tabbed browser interface. It's designed to be simple, lightweight, and optimized for AI interactions.

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **HTML/CSS/JavaScript**: Frontend components
- **Node.js**: JavaScript runtime
- **Electron Builder**: Packaging and distribution

## Project Structure

```
AIB/
├── src/                    # Source code
│   ├── main.js             # Main Electron process
│   ├── preload.js          # Preload script for webviews
│   ├── renderer.js         # Renderer process code
│   ├── custom-tabs.js      # Custom tabs implementation
│   ├── AIB.ico             # Application icon
│   ├── AIB_logo.png        # Application logo
│   └── AIB_background.jpg  # Welcome screen background
├── build/                  # Build output directory
├── docs/                   # Documentation
├── assets/                 # Additional assets
├── node_modules/           # Dependencies (not in repo)
├── index.html              # Main application HTML
├── styles.css              # Application styles
├── package.json            # Project configuration and dependencies
├── package-lock.json       # Dependency lock file
├── build.bat               # Windows build script
├── .gitignore              # Git ignore configuration
├── .gitattributes          # Git attributes configuration
├── LICENSE                 # GPL-2.0 license
├── LICENSE_Electron        # Electron license
├── CONTRIBUTING.md         # Contribution guidelines
└── README.md               # Project overview
```

## Setting Up the Development Environment

### Prerequisites

- Windows 10 or 11
- Node.js 14+ installed
- Git (optional but recommended)

### Installation Steps

1. Clone the repository (or download the source code):
   ```
   git clone https://github.com/AnRkey/AIB.git
   cd AIB
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the application in development mode:
   ```
   npm start
   ```

## Key Components

### Main Process (`main.js`)

The main Electron process that:
- Creates the application window
- Sets up IPC communication
- Handles application lifecycle events
- Manages "Always on Top" functionality
- Handles new instance creation

### Preload Script (`preload.js`)

A script that runs in the context of the webview before the web content loads, which:
- Bridges between the renderer process and Node.js/Electron APIs
- Exposes selected APIs to the webview content safely

### Renderer Process (`renderer.js`)

Handles user interface interactions:
- Tab management
- Event listeners for UI components
- Dynamic content updates

### Custom Tabs Implementation (`custom-tabs.js`)

Custom implementation for browser-like tabs:
- Tab creation, activation, and closing
- Tab scrolling for many open tabs
- Tab titles and favicons

### HTML/CSS Structure

- `index.html`: Main application structure with comprehensive comments
- `styles.css`: Styling for the application, including theme support

## Build Process

The application can be built using the included build script or npm commands.

### Using the Build Script (Windows)

Run the `build.bat` script:
```
build.bat
```

### Using npm Commands

```
npm run build
```

This will:
1. Clean previous build files
2. Create the build directory
3. Install dependencies if needed
4. Build the application for Windows
5. Place all outputs in the `build` directory

## Customization Guide

### Adding New AI Services

To add a new AI service to the sidebar:

1. Open `index.html`
2. Locate the `.left-controls` div
3. Add a new button with a data-url attribute:
   ```html
   <button class="toolbar-button" data-url="https://new-ai-service.com">Service Name</button>
   ```

### Modifying Theme/Styling

The application uses CSS variables for theming. To modify the appearance:

1. Open `styles.css` or edit the `<style>` section in `index.html`
2. Modify the CSS variables in the `:root` selector for light mode
3. Modify the variables in the `@media (prefers-color-scheme: dark)` section for dark mode

### Adding Features

When adding new features, follow these guidelines:

1. Use the existing code structure and patterns
2. Add appropriate documentation via comments
3. Test thoroughly across different scenarios
4. Update the documentation if the feature changes user interaction

## Debugging

### Development Tools

When running in development mode, you can access the Developer Tools:

1. Press `Ctrl+Shift+I` to open the main window's Developer Tools
2. Right-click on a webview and select "Inspect Element" to open Developer Tools for that webview

### Common Issues

1. **Webview Not Loading**
   - Check the Content Security Policy in `index.html`
   - Verify the URL is correctly formatted
   - Check browser console for errors

2. **IPC Communication Failures**
   - Ensure the channel names match between main and renderer processes
   - Check that the required methods are exposed in the preload script

## Building for Distribution

### Windows Installer

To build a Windows installer:

```
npm run build-installer
```

### Portable Version

To build a portable executable:

```
npm run build-portable
```

## Contributing

Contributions to AIB are welcome. Please follow these steps:

1. Contact the developer at anrkey@gmail.com to discuss your proposed changes
2. Fork the repository
3. Create a branch for your feature or fix
4. Make your changes with appropriate comments
5. Test thoroughly
6. Submit a pull request or share your changes as described in CONTRIBUTING.md

## License

This project is licensed under GPL-2.0. Make sure to comply with the license terms when modifying or distributing the code.

The Electron framework is licensed separately under the MIT license (see LICENSE_Electron).

## Further Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [HTML/CSS/JavaScript References](https://developer.mozilla.org/) 