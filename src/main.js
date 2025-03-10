const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window objects to prevent garbage collection
let mainWindow;
const windows = [];

// Define the allowed URL patterns for internal handling
const allowedUrlPatterns = [
  /.*\.grok\.com.*/,
  /.*\.x\.ai.*/,
  /.*\.chatgpt\.com.*/,
  /.*\.anthropic\.com.*/,
  /.*\.claude\.ai.*/,
  /.*\.googleai\.com.*/,
  /.*\.gemini\.com.*/,
  /.*accounts\.google\.com.*/,
  /.*appleid\.apple\.com.*/
];

// Force single instance application
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If we couldn't get the lock, it means another instance is already running
  // Quit this instance
  app.quit();
} else {
  // This is the first instance - set up second-instance handler
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      // If for some reason main window doesn't exist, create one
      createWindow();
    }
  });

  // Create window when Electron has finished initialization
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      // On macOS, re-create a window when the dock icon is clicked and no windows are open
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function createWindow() {
  // Create the browser window
  const newWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // Enable Node.js integration
      contextIsolation: false, // Disable context isolation for this use case
      webviewTag: true // Enable webview tag for tabs
    },
    icon: path.join(__dirname, 'AIB.ico'),
    title: 'AIB'
  });

  // Disable the menu bar
  Menu.setApplicationMenu(null);

  // Load the index.html file
  newWindow.loadFile(path.join(__dirname, '../index.html'));

  // Store the window reference
  if (!mainWindow) {
    // First window is the main window
    mainWindow = newWindow;
  }
  
  // Add to windows array to keep track of all windows
  windows.push(newWindow);

  // Handle window closed event
  newWindow.on('closed', () => {
    // Remove from our windows array
    const index = windows.indexOf(newWindow);
    if (index !== -1) {
      windows.splice(index, 1);
    }
    
    // If this was the main window, update reference
    if (newWindow === mainWindow) {
      mainWindow = windows.length > 0 ? windows[0] : null;
    }
  });

  // Set up URL handling for this window
  setupUrlHandling(newWindow);
  
  return newWindow;
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle URL navigation and determine if URLs should be opened internally
function setupUrlHandling(window) {
  // Handle navigation events from webContents
  window.webContents.on('will-navigate', (event, url) => {
    const shouldHandleInternally = allowedUrlPatterns.some(pattern => pattern.test(url));
    
    if (!shouldHandleInternally) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  
  // Handle new window creation
  window.webContents.setWindowOpenHandler(({ url }) => {
    const shouldHandleInternally = allowedUrlPatterns.some(pattern => pattern.test(url));
    
    if (shouldHandleInternally) {
      // Allow creating a new tab/window within the app
      return { action: 'allow' };
    } else {
      // Open in external browser
      shell.openExternal(url);
      return { action: 'deny' };
    }
  });
}

// Set up IPC handlers for renderer-to-main process communication
function setupIpcHandlers() {
  // Handle always-on-top toggle
  ipcMain.handle('toggle-always-on-top', (event) => {
    // Get the window that sent the request
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      const isAlwaysOnTop = window.isAlwaysOnTop();
      window.setAlwaysOnTop(!isAlwaysOnTop);
      return !isAlwaysOnTop;
    }
    return false;
  });

  // Handle new window creation within the same instance
  ipcMain.handle('create-new-instance', () => {
    // Create a new window in the same instance instead of spawning a new process
    const newWindow = createWindow();
    return true;
  });
}

// Set up IPC handlers
setupIpcHandlers(); 