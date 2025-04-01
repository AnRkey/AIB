# AIB - Architecture Overview

This document provides a high-level overview of the AIB application architecture, explaining how the different components interact and the design principles behind the application.

## Application Architecture

AIB is built using Electron, which follows a multi-process architecture:

![Architecture Diagram](../assets/images/logo.png)

### Process Structure

AIB uses Electron's main process and renderer process architecture:

1. **Main Process** (`main.js`)
   - Single process that controls the application lifecycle
   - Creates and manages browser windows
   - Handles system events and IPC communication
   - Manages settings storage and retrieval
   - Runs Node.js APIs

2. **Renderer Process** (HTML, CSS, JavaScript in the browser window)
   - Handles the UI and user interactions
   - Contains the tab management system
   - Manages webviews that display the AI services

3. **Settings Window Process**
   - Dedicated window for application settings
   - Communicates with main process via IPC
   - Handles user preferences and configuration

4. **Webview Processes**
   - Each webview runs in its own separate process
   - Loads and displays external AI services
   - Isolated from the main application

## Core Components

### Main Process Components

- **Application Lifecycle Management**
  - Window creation and configuration
  - System event handling (close, minimize, etc.)
  - App menu creation

- **Settings Management**
  - Persistent storage using electron-store
  - IPC handlers for settings operations
  - Settings window creation and management

- **IPC Communication**
  - `toggle-always-on-top`: Toggles window always-on-top state
  - `get-always-on-top`: Gets current always-on-top state
  - `create-new-instance`: Creates a new application window
  - `get-settings`: Retrieves application settings
  - `save-settings`: Saves user settings
  - `get-audio-devices`: Gets available audio devices
  - `open-system-proxy-settings`: Opens system proxy configuration
  - `clear-browsing-data`: Clears session data

### Renderer Process Components

- **Tab Management System**
  - Creates, activates, and closes tabs
  - Manages tab visibility and scrolling
  - Handles tab titles and favicons

- **UI Components**
  - Toolbar with AI service buttons
  - Tab bar with scrolling functionality
  - Control buttons (Always on Top, New Instance, Settings)

- **Theme System**
  - CSS variables for consistent theming
  - Dark mode support via media query
  - Consistent styling across components

### Settings System

- **Settings Window**
  - Separate window with dedicated preload script
  - Tabbed interface for organized settings categories
  - Reactive UI that responds to user changes
  - Secure IPC communication with main process

- **Settings Categories**
  - General: Application behavior settings
  - Audio: Microphone and speaker selection
  - Privacy: Data management and clearing
  - Proxy: System proxy configuration access

- **Settings Storage**
  - Persistent storage using electron-store
  - Configuration applied across application instances
  - Real-time updates when settings change

### Webview Management

- **Webview Creation and Configuration**
  - Created dynamically when opening new tabs
  - Configured with appropriate permissions
  - Event listeners for page navigation
  - Standardized Chrome 134 user-agent string for consistent site compatibility

- **Webview Communication**
  - Event handling for page-title-updated and page-favicon-updated
  - Permission handling for media access and other features

## Data Flow

1. **User Interaction Flow**
   - User clicks an AI service button in the toolbar
   - Tab Manager creates a new tab and webview
   - Webview loads the requested AI service URL
   - Tab is activated and displays the content

2. **Tab Management Flow**
   - Tab creation adds entries to the tabs array
   - Tab activation updates UI state and visibility
   - Tab closing removes elements and updates the array

3. **IPC Communication Flow**
   - User clicks "Always on Top" button in renderer
   - Renderer sends IPC message to main process
   - Main process toggles window state
   - Main process returns new state to renderer
   - Renderer updates UI to reflect state change

4. **Settings Flow**
   - User opens settings window via UI button
   - Main process creates settings window
   - Settings window loads saved settings via IPC
   - User changes settings, triggering UI updates
   - Save button appears when changes detected
   - User saves settings via IPC to main process
   - Main process stores settings and applies relevant changes
   - Save button disappears until next change

## Design Patterns and Principles

### Module Pattern

The application uses the module pattern for code organization:

```javascript
// Example: Tab Manager module
const tabManager = {
  tabs: [],
  activeTabId: null,
  // Methods for tab management
  init() { /* ... */ },
  createTab() { /* ... */ },
  activateTab() { /* ... */ }
};
```

### Event-Driven Architecture

The application is heavily event-driven:

- DOM events for user interactions
- Electron events for system operations
- Webview events for content interactions
- Settings change events for configuration updates

### Separation of Concerns

The code is organized to separate:

- Tab management logic (tabManager)
- UI event handling (DOM event listeners)
- System operations (IPC to main process)
- Content display (webviews)
- Settings management (dedicated window and storage)

## Security Considerations

1. **Content Security Policy**
   - Defined in index.html to restrict script execution
   - Controls what resources can be loaded

2. **Webview Isolation**
   - Each webview runs in a separate process
   - Prevents cross-site scripting between AI services

3. **Permission Handling**
   - Explicit permission controls for features like microphone access
   - Controlled through the webview permission-request event

4. **Browser Fingerprinting**
   - Consistent user-agent string across the application
   - Helps avoid detection as a non-standard browser
   - Set to Chrome 134 for optimal compatibility with AI services

5. **Secure IPC Communication**
   - Limited exposure of system APIs through preload scripts
   - Controlled access to settings and system functions

## Performance Considerations

1. **Process Isolation**
   - Each webview in a separate process for stability
   - Main application remains responsive if a service crashes

2. **Resource Management**
   - Cleaning up closed tabs to release memory
   - Efficient DOM updates

3. **Lazy Loading**
   - Services only load when requested
   - No pre-loading of AI services that aren't being used

4. **Settings Optimization**
   - Settings only saved when changes are detected
   - Efficient change detection for UI updates

## Future Architecture Considerations

Potential areas for architectural enhancement:

1. **State Management**
   - More formal state management approach for complex state
   - Potentially using a lightweight state management library

2. **Component Structure**
   - Further modularization of UI components
   - Potential use of Web Components for better encapsulation

3. **Service Worker Integration**
   - Offline capabilities and better caching
   - Background synchronization for improved performance

4. **Extension System**
   - Plugin architecture to allow custom AI service integrations
   - User-defined customizations without modifying core code

5. **Enhanced Settings System**
   - Additional settings categories
   - User profiles for different configurations
   - Import/export of settings 