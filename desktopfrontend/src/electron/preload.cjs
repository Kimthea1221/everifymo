const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onDeepLinkToken: (callback) => {
    ipcRenderer.on('deep-link-token', (event, token) => callback(token))
  },
  removeDeepLinkToken: (callback) => {
    ipcRenderer.removeListener("deep-link-token", callback)
  },
})
