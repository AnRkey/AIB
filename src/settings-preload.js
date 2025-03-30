// Preload script for settings page
const { contextBridge, ipcRenderer } = require('electron');

// Expose a limited set of Electron APIs safely to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings-related functions
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Audio devices
  getAudioDevices: () => ipcRenderer.invoke('get-audio-devices'),
  
  // Proxy settings
  openSystemProxySettings: () => ipcRenderer.invoke('open-system-proxy-settings'),
  
  // Data clearing
  clearBrowsingData: () => ipcRenderer.invoke('clear-browsing-data')
});

// Log that preload script has been loaded
console.log('Settings preload script loaded'); 