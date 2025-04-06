const { app, BrowserWindow, shell, Menu, ipcMain, session, desktopCapturer, BrowserView } = require('electron');
const path = require('path');
// Get package version for the window title
const packageInfo = require('../package.json');
const appVersion = packageInfo.version;

// Settings store will be initialized after import
let settings;
let store;

// Log all command line arguments for debugging
console.log('Command line arguments:');
console.log(process.argv);

// Check if DevTools should be enabled
const shouldEnableDevTools = process.argv.some(arg => 
  arg === '--enable-devtools' || 
  arg === '--enable-devtools-for-subframes' || 
  arg === '--devtools'
);
console.log('DevTools enabled:', shouldEnableDevTools);

// Enable context menu for all webContents (including WebContentsView)
app.on('web-contents-created', (event, contents) => {
  contents.on('context-menu', (event, params) => {
    event.preventDefault();
  });
});

// Keep a global reference of the window objects to prevent garbage collection
let mainWindow;
const windows = [];

// Define the allowed URL patterns for internal handling
const allowedUrlPatterns = [
  /.*\.grok\.com.*/,
  /.*grok\.com.*/,
  /.*\.chatgpt\.com.*/,
  /.*\.anthropic\.com.*/,
  /.*\.claude\.ai.*/,
  /.*\.googleai\.com.*/,
  /.*\.gemini\.com.*/,
  /.*accounts\.google\.com.*/,
  /.*appleid\.apple\.com.*/
];

// Store WebContentsViews for each tab
const contentViews = new Map();

// Create a new window
function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      sandbox: false,
      enableWebSQL: false,
      enableRemoteModule: false,
      spellcheck: false,
      enableBlinkFeatures: false,
      disableBlinkFeatures: false,
      defaultFontFamily: false,
      defaultFontSize: false,
      defaultMonospaceFontSize: false,
      minimumFontSize: false,
      defaultEncoding: false,
      backgroundThrottling: true,
      images: true,
      javascript: true,
      webgl: true,
      plugins: false,
      experimentalFeatures: false,
      scrollBounce: false,
      enablePreferredSizeMode: false,
      navigateOnDragDrop: false,
      autoplayPolicy: false,
      disableHtmlFullscreenWindowResize: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, './assets/images/logo.ico'),
    title: `AI Browser v${appVersion}`,
    autoHideMenuBar: true,
    frame: true,
    backgroundColor: '#ffffff',
    show: false
  });

  // Load the index.html file
  window.loadFile(path.join(__dirname, 'index.html'));

  // Set up session-wide user agent
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';
    callback({ requestHeaders: details.requestHeaders });
  });

  // Enable DevTools for WebContentsView
  window.webContents.on('did-attach-webview', (event, webContents) => {
    // Register F12 shortcut for WebContentsView
    webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12') {
        event.preventDefault();
        if (webContents.isDevToolsOpened()) {
          webContents.closeDevTools();
        } else {
          webContents.openDevTools();
        }
      }
    });
  });

  // Disable the menu bar
  Menu.setApplicationMenu(null);

  // Set up permission handling
  setupPermissionHandling(window);

  // Add to windows array to keep track of all windows
  windows.push(window);

  // Check if always-on-top is enabled in settings
  if (settings && settings.get('alwaysOnTop')) {
    window.setAlwaysOnTop(true);
  }

  // Handle window closed event
  window.on('closed', () => {
    // Remove from our windows array
    const index = windows.indexOf(window);
    if (index !== -1) {
      windows.splice(index, 1);
    }
    
    // If this was the main window, update reference
    if (window === mainWindow) {
      mainWindow = windows.length > 0 ? windows[0] : null;
    }
  });

  // Set up URL handling for this window
  setupUrlHandling(window);

  // Show the window when it's ready
  window.once('ready-to-show', () => {
    window.show();
  });

  return window;
}

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
      mainWindow = createWindow();
    }
  });

  // Create window when Electron has finished initialization
  app.whenReady().then(async () => {
    try {
      // Initialize the store first
      const Store = (await import('electron-store')).default;
      store = new Store({
        name: 'aib-settings',
        defaults: {
          alwaysOnTop: false,
          selectedMicrophone: null,
          selectedSpeaker: null
        }
      });
      settings = store;

      // Create the main window
      mainWindow = createWindow();

      // Set up IPC handlers
      setupIpcHandlers();
      
      app.on('activate', () => {
        // On macOS, re-create a window when the dock icon is clicked and no windows are open
        if (BrowserWindow.getAllWindows().length === 0) {
          mainWindow = createWindow();
        }
      });
    } catch (error) {
      console.error('Failed to start application:', error);
      app.quit();
    }
  });
}

// Open Windows system proxy settings
function openSystemProxySettings() {
  try {
    if (shouldEnableDevTools) {
      console.log('Opening system proxy settings...');
    }
    // Open Windows system proxy settings using ms-settings URI
    shell.openExternal('ms-settings:network-proxy');
    if (shouldEnableDevTools) {
      console.log('System proxy settings opened successfully');
    }
    return true;
  } catch (error) {
    console.error('Error opening system proxy settings:', error);
    return false;
  }
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle URL navigation and determine if URLs should be opened internally
function setupUrlHandling(window) {
  // Handle navigation events from webContents
  window.webContents.on('will-navigate', (event, url) => {
    // Allow local file URLs and app pages
    if (url.startsWith('file:///') || url.includes(app.getAppPath())) {
      return; // Allow navigation
    }
    
    const shouldHandleInternally = allowedUrlPatterns.some(pattern => pattern.test(url));
    
    if (!shouldHandleInternally) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  
  // Handle new window creation
  window.webContents.setWindowOpenHandler(({ url }) => {
    // Allow local file URLs and app pages
    if (url.startsWith('file:') || url.includes(app.getAppPath())) {
      return { action: 'allow' };
    }
    
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

// Set up permission handling for media devices
function setupPermissionHandling(window) {
  // Define permissions that should be automatically granted
  const grantedPermissions = [
    'media', // Microphone and camera
    'mediaKeySystem', // For DRM-protected content
    'geolocation',
    'notifications',
    'fullscreen'
  ];

  // Listen for permission requests
  window.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    const allowedPermissions = [
      'media',
      'geolocation',
      'notifications',
      'midiSysex',
      'pointerLock',
      'fullscreen',
      'openExternal',
      'unknown'
    ];

    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Set up permission check handler for webviews
  window.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    if (grantedPermissions.includes(permission)) {
      return true;
    }
    return false;
  });
}

// Set up IPC handlers for renderer-to-main process communication
function setupIpcHandlers() {
  // Handle always-on-top toggle
  ipcMain.handle('toggle-always-on-top', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const isAlwaysOnTop = !win.isAlwaysOnTop();
    win.setAlwaysOnTop(isAlwaysOnTop);
    return isAlwaysOnTop;
  });

  // Get Always on Top state
  ipcMain.handle('get-always-on-top', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win.isAlwaysOnTop();
  });

  // Create new instance
  ipcMain.handle('create-new-instance', () => {
    createWindow();
    return true;
  });

  // Handle reload request from context menu
  ipcMain.on('reload-active-tab', (event) => {
    event.sender.send('reload-active-tab');
  });
  
  // Handle getting settings
  ipcMain.handle('get-settings', async () => {
    try {
      // Load settings from storage or return defaults
      return {
        alwaysOnTop: settings ? settings.get('alwaysOnTop') : false,
        selectedMicrophone: settings ? settings.get('selectedMicrophone') : '',
        selectedSpeaker: settings ? settings.get('selectedSpeaker') : ''
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  });
  
  // Handle saving settings
  ipcMain.handle('save-settings', async (event, newSettings) => {
    try {
      // Save settings to storage
      console.log('Saving settings:', newSettings);
      
      if (settings) {
        // Save each setting to the store
        if (newSettings.alwaysOnTop !== undefined) {
          settings.set('alwaysOnTop', newSettings.alwaysOnTop);
        }
        
        if (newSettings.selectedMicrophone !== undefined) {
          settings.set('selectedMicrophone', newSettings.selectedMicrophone);
        }
        
        if (newSettings.selectedSpeaker !== undefined) {
          settings.set('selectedSpeaker', newSettings.selectedSpeaker);
        }
        
        // Apply always-on-top setting immediately if mainWindow exists
        if (mainWindow && newSettings.alwaysOnTop !== undefined) {
          mainWindow.setAlwaysOnTop(newSettings.alwaysOnTop);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  });
  
  // Handle getting audio devices
  ipcMain.handle('get-audio-devices', async () => {
    try {
      // In a production app, we would get real audio devices here
      // using navigator.mediaDevices.enumerateDevices() in a renderer process
      // or using system-specific APIs from the main process
      
      // For now, return mock audio devices
      return {
        microphones: [
          { deviceId: 'default', label: 'Default Microphone' },
          { deviceId: 'mic1', label: 'Internal Microphone' },
          { deviceId: 'mic2', label: 'External Microphone' }
        ],
        speakers: [
          { deviceId: 'default', label: 'Default Speaker' },
          { deviceId: 'speaker1', label: 'Internal Speakers' },
          { deviceId: 'speaker2', label: 'External Speakers' }
        ]
      };
    } catch (error) {
      console.error('Error getting audio devices:', error);
      throw error;
    }
  });
  
  // Handle getting version information
  ipcMain.handle('get-version-info', () => {
    return {
      app: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      v8: process.versions.v8
    };
  });

  // Open system proxy settings
  ipcMain.handle('open-system-proxy-settings', async (event) => {
    if (shouldEnableDevTools) {
      console.log('Received request to open system proxy settings');
    }
    return openSystemProxySettings();
  });

  // Handle WebContentsView creation
  ipcMain.handle('create-contents-view', async (event, { tabId, url, bounds }) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) return { success: false };

      // Use a single persistent session for all tabs
      const sessionPartition = 'persist:AIB';

      const view = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          allowRunningInsecureContent: false,
          sandbox: true,
          partition: sessionPartition,
          enableWebSQL: false,
          enableRemoteModule: false,
          spellcheck: false,
          enableBlinkFeatures: false,
          disableBlinkFeatures: false,
          defaultFontFamily: false,
          defaultFontSize: false,
          defaultMonospaceFontSize: false,
          minimumFontSize: false,
          defaultEncoding: false,
          backgroundThrottling: true,
          images: true,
          javascript: true,
          webgl: true,
          plugins: false,
          experimentalFeatures: false,
          scrollBounce: false,
          enablePreferredSizeMode: false,
          navigateOnDragDrop: false,
          autoplayPolicy: false,
          disableHtmlFullscreenWindowResize: false
        }
      });

      // Store the view
      contentViews.set(tabId, view);

      // Add the view to the window and set bounds immediately
      window.addBrowserView(view);
      view.setBounds(bounds);

      // Set up session-specific CSP handling
      view.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        const headers = details.responseHeaders;
        
        // Don't modify CSP for sites that already set it
        if (headers['content-security-policy'] || headers['Content-Security-Policy']) {
          callback({ responseHeaders: headers });
          return;
        }

        // Extract domain from URL
        const url = new URL(details.url);
        const domain = url.hostname;

        // Set default Chromium-like CSP for sites without one
        headers['Content-Security-Policy'] = [
          `default-src 'self' https: data:;` +
          `script-src 'self' 'unsafe-inline' https://${domain} https://*.${domain.split('.').slice(-2).join('.')} blob:;` +
          `style-src 'self' 'unsafe-inline' https:;` +
          `img-src 'self' https: data: blob:;` +
          `media-src 'self' https: data: blob:;` +
          `connect-src 'self' https:;` +
          `font-src 'self' https: data:;` +
          `object-src 'none';` +
          `frame-src 'self' https:;`
        ];

        callback({ responseHeaders: headers });
      });

      // Set up event listeners
      view.webContents.on('page-title-updated', (event, title) => {
        window.webContents.send(`page-title-updated-${tabId}`, title);
      });

      view.webContents.on('page-favicon-updated', (event, favicons) => {
        if (favicons && favicons.length > 0) {
          window.webContents.send(`page-favicon-updated-${tabId}`, favicons[0]);
        }
      });

      view.webContents.on('console-message', (event, level, message) => {
        window.webContents.send(`console-message-${tabId}`, message);
      });

      // Set up permission handling for this view
      setupPermissionHandling(view);

      // Set up URL handling for this view
      setupUrlHandling(view);

      // Load the URL
      await view.webContents.loadURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error creating WebContentsView:', error);
      return { success: false };
    }
  });

  // Handle showing a WebContentsView
  ipcMain.handle('show-contents-view', (event, { tabId, bounds }) => {
    const view = contentViews.get(tabId);
    if (view) {
      view.setBounds(bounds);
    }
  });

  // Handle hiding a WebContentsView
  ipcMain.handle('hide-contents-view', (event, { tabId }) => {
    const view = contentViews.get(tabId);
    if (view) {
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  });

  // Handle destroying a WebContentsView
  ipcMain.handle('destroy-contents-view', (event, { tabId }) => {
    const view = contentViews.get(tabId);
    if (view) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        window.removeBrowserView(view);
      }
      contentViews.delete(tabId);
    }
  });

  // Handle resizing a WebContentsView
  ipcMain.handle('resize-contents-view', (event, { tabId, bounds }) => {
    const view = contentViews.get(tabId);
    if (view) {
      view.setBounds(bounds);
    }
  });

  // Handle temporarily hiding a WebContentsView for menu display
  ipcMain.handle('temporary-hide-contents-view', (event, { tabId }) => {
    const view = contentViews.get(tabId);
    if (view) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        // Instead of making it invisible, move it down below the menu area
        // (menu starts at y=34 and is typically around 150-200px tall)
        const currentBounds = view.getBounds();
        view.setBounds({ 
          x: currentBounds.x, 
          y: 200, // Move down below menu area
          width: currentBounds.width, 
          height: currentBounds.height - 166 // Adjust height to keep total window size same
        });
        return true;
      }
    }
    return false;
  });

  // Handle restoring a temporarily hidden WebContentsView
  ipcMain.handle('restore-contents-view', (event, { tabId, bounds }) => {
    const view = contentViews.get(tabId);
    if (view) {
      view.setBounds(bounds);
      return true;
    }
    return false;
  });

  // Handle reloading a WebContentsView
  ipcMain.handle('reload-contents-view', (event, { tabId }) => {
    const view = contentViews.get(tabId);
    if (view) {
      view.webContents.reload();
      return true;
    }
    return false;
  });

  // Handle clearing browsing data
  ipcMain.handle('clear-browsing-data', async () => {
    try {
      if (shouldEnableDevTools) {
        console.log('Clearing browsing data...');
      }
      
      // Get the default session and clear all browser data
      const ses = session.defaultSession;
      
      await ses.clearStorageData({
        storages: [
          'appcache',
          'cookies',
          'filesystem',
          'indexdb',
          'localstorage',
          'shadercache',
          'websql',
          'serviceworkers',
          'cachestorage'
        ]
      });
      
      await ses.clearCache();
      
      await ses.clearHostResolverCache();
      
      if (shouldEnableDevTools) {
        console.log('Browsing data cleared successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing browsing data:', error);
      throw error;
    }
  });

  // Handle showing application menu
  ipcMain.handle('show-app-menu', (event, menuItems) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return false;

    const { Menu } = require('electron');
    
    const template = menuItems.map(item => ({
      label: item.label,
      click: () => {
        window.webContents.send('menu-item-clicked', item.id);
      }
    }));
    
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window });
    
    return true;
  });

  // Create settings window
  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
  });
}

// Create settings window
function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'settings-preload.js')
    },
    parent: mainWindow,
    modal: true,
    show: false
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  return settingsWindow;
} 