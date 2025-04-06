// This file is required by the index.html file and will
// be executed in the renderer process for that window.

// Get required modules through the exposed API
const { ipcRenderer } = window.api.require('electron');
const { CustomTabGroup, CustomTab } = window.api.require('./custom-tabs');

// Tab management
let activeTab = null;
const tabs = [];
const tabGroup = new CustomTabGroup();

// DOM elements
const viewsContainer = document.getElementById('views');
const tabsContainer = document.querySelector('.tabs-container');
const tabScrollLeft = document.querySelector('.tab-scroll-left');
const tabScrollRight = document.querySelector('.tab-scroll-right');

// Set document title with version number
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get version from window.api if available (set in preload.js)
    if (window.api && window.api.getVersion) {
      const version = window.api.getVersion();
      document.title = `AI Browser v${version}`;
    }
  } catch (error) {
    console.error('Error setting document title:', error);
  }
});

// Handle errors in the renderer process
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  
  // Send error to the main process for logging
  if (window.api) {
    window.api.send('renderer-error', {
      message: event.error.message,
      stack: event.error.stack
    });
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Send rejection to the main process for logging
  if (window.api) {
    window.api.send('renderer-promise-rejection', {
      message: event.reason.message,
      stack: event.reason.stack
    });
  }
});

// Listen for messages from the main process
if (window.api) {
  window.api.receive('new-tab', (url) => {
    console.log('Received request to open new tab with URL:', url);
    createTab(url);
  });

  window.api.receive('close-tab', (tabId) => {
    console.log('Received request to close tab:', tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      removeTab(tab);
    }
  });

  window.api.receive('url-updated', (data) => {
    console.log('URL updated:', data);
    const tab = tabs.find(t => t.id === data.tabId);
    if (tab) {
      tab.src = data.url;
      tab.browserView.webContents.loadURL(data.url);
    }
  });
}

// Create a new tab
function createTab(url, title = 'New Tab') {
  const tabId = Date.now().toString();
  
  // Create tab element
  const tabElement = document.createElement('div');
  tabElement.className = 'tab';
  tabElement.dataset.tabId = tabId;
  
  // Create title element
  const titleElement = document.createElement('div');
  titleElement.className = 'tab-title';
  titleElement.textContent = title;
  
  // Create favicon element
  const faviconElement = document.createElement('img');
  faviconElement.className = 'tab-favicon';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'tab-close';
  closeButton.textContent = '×';
  
  // Assemble tab
  tabElement.appendChild(faviconElement);
  tabElement.appendChild(titleElement);
  tabElement.appendChild(closeButton);
  
  // Add to DOM
  tabsContainer.appendChild(tabElement);
  
  // Create view container
  const viewElement = document.createElement('div');
  viewElement.className = 'view';
  viewElement.dataset.tabId = tabId;
  viewsContainer.appendChild(viewElement);
  
  // Create WebContentsView
  ipcRenderer.invoke('create-contents-view', {
    tabId,
    url,
    bounds: {
      x: 0,
      y: 34,
      width: window.innerWidth,
      height: window.innerHeight - 34
    }
  }).then(result => {
    if (result.success) {
      // Set up event listeners
      ipcRenderer.on(`page-title-updated-${tabId}`, (event, newTitle) => {
        titleElement.textContent = newTitle;
      });
      
      ipcRenderer.on(`page-favicon-updated-${tabId}`, (event, favicon) => {
        if (favicon) {
          faviconElement.src = favicon;
        }
      });
      
      ipcRenderer.on(`console-message-${tabId}`, (event, message) => {
        console.log(`[Tab ${tabId}]`, message);
      });
    }
  });
  
  // Add to tabs array
  const tab = {
    id: tabId,
    url: url,
    element: tabElement,
    view: viewElement,
    title: titleElement,
    favicon: faviconElement
  };
  tabs.push(tab);
  
  // Set as active tab
  setActiveTab(tab);
  
  // Add click handler for the tab
  tabElement.addEventListener('click', () => {
    setActiveTab(tab);
  });
  
  // Add click handler for the close button
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    removeTab(tab);
  });
  
  return tab;
}

// Set the active tab
function setActiveTab(tab) {
  if (activeTab) {
    activeTab.element.classList.remove('active');
    activeTab.view.classList.remove('active');
    // Hide the previous WebContentsView
    ipcRenderer.invoke('hide-contents-view', { tabId: activeTab.id });
  }
  
  tab.element.classList.add('active');
  tab.view.classList.add('active');
  // Show the new WebContentsView
  ipcRenderer.invoke('show-contents-view', {
    tabId: tab.id,
    bounds: {
      x: 0,
      y: 34,
      width: window.innerWidth,
      height: window.innerHeight - 34
    }
  });
  activeTab = tab;
}

// Remove a tab
function removeTab(tab) {
  const index = tabs.indexOf(tab);
  if (index !== -1) {
    tabs.splice(index, 1);
    tab.element.remove();
    tab.view.remove();
    
    if (activeTab === tab) {
      if (tabs.length > 0) {
        setActiveTab(tabs[Math.max(0, index - 1)]);
      } else {
        activeTab = null;
        document.getElementById('welcome-screen').style.display = 'flex';
      }
    }
  }
}

// Add event listeners for toolbar buttons
document.querySelectorAll('.toolbar-button').forEach(button => {
  button.addEventListener('click', () => {
    const url = button.dataset.url;
    if (url) {
      createTab(url, button.textContent.trim());
    }
  });
});

// Add event listeners for tab scrolling
tabScrollLeft.addEventListener('click', () => {
  tabsContainer.scrollBy({ left: -100, behavior: 'smooth' });
});

tabScrollRight.addEventListener('click', () => {
  tabsContainer.scrollBy({ left: 100, behavior: 'smooth' });
});

// Listen for reload request from main process
ipcRenderer.on('reload-active-tab', () => {
  if (activeTab) {
    activeTab.reload();
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (activeTab) {
    ipcRenderer.invoke('resize-contents-view', {
      tabId: activeTab.id,
      bounds: {
        x: 0,
        y: 34,
        width: window.innerWidth,
        height: window.innerHeight - 34
      }
    });
  }
});

// Create initial tab
createTab('https://chat.openai.com', 'ChatGPT'); 