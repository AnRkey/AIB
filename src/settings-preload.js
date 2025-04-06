// Preload script for settings page
const { contextBridge, ipcRenderer } = require('electron');

// Expose a limited set of Electron APIs safely to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Settings-related functions
  invoke: (channel, data) => {
    const validChannels = ['get-settings', 'save-settings', 'get-audio-devices', 'open-system-proxy-settings', 'clear-browsing-data'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
  settings: {
    save: (settings) => ipcRenderer.invoke('save-settings', settings),
    clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data')
  }
});

// Log that preload script has been loaded
console.log('Settings preload script loaded'); 