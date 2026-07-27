const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onDeepLinkToken: (callback) => {
    ipcRenderer.on('deep-link-token', (event, token) => callback(token))
  }
})
