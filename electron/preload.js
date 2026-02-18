// Minimal preload script to expose Electron APIs safely if needed later
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    sendSyncUpdate: (data) => ipcRenderer.send('sync-status-update', data),
    onRemoteChange: (callback) => ipcRenderer.on('sync-remote-change', (event, ...args) => callback(...args)),
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    printJob: (content, printerName) => ipcRenderer.invoke('print-job', content, printerName)
});
