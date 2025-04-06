const { contextBridge, ipcRenderer } = require('electron');
const packageInfo = require('../package.json');

// Validate channel name against allowed patterns
function isValidChannel(channel) {
  const validChannels = [
    'create-contents-view',
    'show-contents-view',
    'hide-contents-view',
    'destroy-contents-view',
    'resize-contents-view',
    'reload-contents-view',
    'toggle-always-on-top',
    'get-always-on-top',
    'create-new-instance',
    'reload-active-tab',
    'get-settings',
    'save-settings',
    'get-audio-devices',
    'clear-browsing-data'
  ];

  // Also allow dynamic channels for specific tab events
  const validPatterns = [
    /^page-title-updated-\d+$/,
    /^page-favicon-updated-\d+$/,
    /^console-message-\d+$/
  ];

  return validChannels.includes(channel) || 
         validPatterns.some(pattern => pattern.test(channel));
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api',
  {
    // Send a message to the main process
    send: (channel, data) => {
      // Whitelist channels
      const validChannels = ['tab-created', 'tab-closed', 'navigate-to-url', 'renderer-error', 'renderer-promise-rejection'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive a message from the main process
    receive: (channel, func) => {
      if (isValidChannel(channel)) {
        // Strip event as it includes `sender` and other internal electron properties
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Get the version of the application
    getVersion: () => {
      return packageInfo.version;
    },
    // Handle IPC calls
    invoke: (channel, data) => {
      if (isValidChannel(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
    },
    // Expose required modules
    require: (module) => {
      const allowedModules = ['electron', './custom-tabs'];
      if (allowedModules.includes(module)) {
        return require(module);
      }
      return null;
    },
    // Expose settings functions
    settings: {
      get: () => ipcRenderer.invoke('get-settings'),
      save: (settings) => ipcRenderer.invoke('save-settings', settings),
      getAudioDevices: () => ipcRenderer.invoke('get-audio-devices'),
      clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data')
    },
    openSettings: () => ipcRenderer.invoke('open-settings')
  }
); 