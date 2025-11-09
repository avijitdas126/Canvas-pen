// preload.cjs
const { contextBridge, ipcRenderer, ipcMain } = require("electron");

console.log("✅ Preload script executed (main terminal)");

// Expose API
contextBridge.exposeInMainWorld("electron", {
  getDrawMode: (cb) => {
    ipcRenderer.on("set-draw-mode", (_, data) => {
      cb(data);
    });
  },
  setRange:(range)=>ipcRenderer.send("set-range", range),
  setColors:(color)=>ipcRenderer.send("set-colors", color),
  toggleWin:(toggle)=>ipcRenderer.send("toggle-win", toggle),
  getSelectedOption:(item) => ipcRenderer.send("get_selected_item", item),
  setDrawMode: (isActive) => ipcRenderer.send("set-draw-mode", isActive),
  allowSidebarClicks: (isActive) => ipcRenderer.send("toggle-mouse", isActive),
  dragStart: () => ipcRenderer.send("drag-start"),
  dragEnd: () => ipcRenderer.send("drag-end"),
  setWinPosition: (pos) => ipcRenderer.send("setWinPosition", pos),
});
