// preloader.cjs
const { contextBridge, ipcRenderer, ipcMain } = require("electron");

console.log("✅ Preload script executed (main terminal)");

// Expose API
contextBridge.exposeInMainWorld("electronCanvas", {
  sendSelectedItem: (callback) =>
    ipcRenderer.on("get-item", (_, args) => callback(args)),
  sendCapture: (callback) =>
    ipcRenderer.on("get-capture", (_, args) => callback(args)),
  sendRange: (callback) =>
    ipcRenderer.on("get-range", (_, args) => callback(args)),
  sendColor: (callback) =>
    ipcRenderer.on("get-colors", (_, args) => callback(args)),
  sendToggle: (callback) =>
    ipcRenderer.on("get-toggle", (_, args) => callback(args)),
});
