const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadUrl: (input) => ipcRenderer.invoke('load-url', input),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  getDownloadsFolder: () => ipcRenderer.invoke('get-downloads-folder'),
  onDownloadStarted: (callback) => ipcRenderer.on('download-started', callback),
  onDownloadUpdated: (callback) => ipcRenderer.on('download-updated', callback),
  onDownloadCompleted: (callback) => ipcRenderer.on('download-completed', callback),
  cancelDownload: (id) => ipcRenderer.send('cancel-download', id),
  detachTab: (data) => ipcRenderer.send('detach-tab', data),
  onTabDetached: (callback) => ipcRenderer.once('tab-detached', callback),
  onLoadDetachedUrl: (callback) => ipcRenderer.on('load-detached-url', callback),
  onCreateTab: (callback) => ipcRenderer.on('create-tab', callback)
});

// Log para debug
console.log('Preload script carregado com sucesso!');
