/**
 * A simple custom tabs implementation for Electron
 */
const { BrowserView } = window.api.require('electron');

class CustomTabGroup {
  constructor(options = {}) {
    this.options = options;
    this.tabs = [];
    this.activeTab = null;
    this.tabsContainer = document.querySelector('.etabs-tabs');
    this.viewsContainer = document.querySelector('.etabs-views');
    
    if (!this.tabsContainer || !this.viewsContainer) {
      throw new Error('Required DOM elements not found');
    }
  }

  addTab(options = {}) {
    const tab = new CustomTab(this, options);
    this.tabs.push(tab);
    
    if (options.active || this.tabs.length === 1) {
      this.setActiveTab(tab);
    }
    
    return tab;
  }

  setActiveTab(tab) {
    if (this.activeTab) {
      this.activeTab.deactivate();
    }
    
    tab.activate();
    this.activeTab = tab;
  }

  removeTab(tab) {
    const index = this.tabs.indexOf(tab);
    if (index !== -1) {
      this.tabs.splice(index, 1);
      
      if (this.activeTab === tab) {
        if (this.tabs.length > 0) {
          this.setActiveTab(this.tabs[Math.max(0, index - 1)]);
        } else {
          this.activeTab = null;
        }
      }
      
      tab.destroy();
    }
  }
}

class CustomTab {
  constructor(tabGroup, options = {}) {
    this.tabGroup = tabGroup;
    this.id = options.id;
    this.title = options.title || 'New Tab';
    this.src = options.src || '';
    this.view = options.view;
    this.tab = options.tab;
    this.titleElement = options.titleElement;
    this.faviconElement = options.faviconElement;
    this.browserView = null;
    this.setupBrowserView();
  }

  setupBrowserView() {
    const { remote } = window.api.require('electron');
    const mainWindow = remote.getCurrentWindow();
    
    this.browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        sandbox: true,
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

    // Set the bounds of the BrowserView
    const bounds = mainWindow.getBounds();
    this.browserView.setBounds({ x: 0, y: 0, width: bounds.width, height: bounds.height });

    // Add the BrowserView to the window
    mainWindow.addBrowserView(this.browserView);

    // Load the URL if provided
    if (this.src) {
      this.browserView.webContents.loadURL(this.src);
    }

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.browserView) return;

    const webContents = this.browserView.webContents;

    // Update title when page title changes
    webContents.on('page-title-updated', (event, title) => {
      this.title = title;
      if (this.titleElement) {
        this.titleElement.textContent = title;
      }
    });

    // Update favicon when it changes
    webContents.on('page-favicon-updated', (event, favicons) => {
      if (this.faviconElement && favicons.length > 0) {
        this.faviconElement.src = favicons[0];
      }
    });

    // Handle new window requests
    webContents.setWindowOpenHandler(({ url }) => {
      const { shell } = window.api.require('electron');
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // Handle console messages
    webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`[${this.title}] ${message}`);
    });
  }

  show() {
    if (this.browserView) {
      this.browserView.setBounds({ x: 0, y: 0, width: 1200, height: 800 });
    }
  }

  hide() {
    if (this.browserView) {
      this.browserView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  }

  reload() {
    if (this.browserView) {
      this.browserView.webContents.reload();
    }
  }

  destroy() {
    if (this.browserView) {
      const { remote } = window.api.require('electron');
      const mainWindow = remote.getCurrentWindow();
      mainWindow.removeBrowserView(this.browserView);
      this.browserView = null;
    }
  }
}

module.exports = { CustomTabGroup, CustomTab }; 