import { app, BrowserWindow, ipcMain, screen, webContents } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const preloadPath = path.join(__dirname, "preload.cjs"); // use .cjs for reliability
  const mainWindow = new BrowserWindow({
    width: width-20,
    height: height - 20,
    x:20,
    y:30,
    resizable: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, "screen-saver");
  
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  let isDragging = false;
 ipcMain.on("toggle-mouse", (_, activate) => {
  if (!isDragging) {
    mainWindow.setIgnoreMouseEvents(!activate, { forward: true });
  }
});
 ipcMain.on("set-draw-mode", (_, activate) => {
  if (!isDragging) {
    mainWindow.setIgnoreMouseEvents(activate, { forward: true });
    console.log(activate)
  }
});
ipcMain.on("drag-end", () => {
  isDragging = false;
  mainWindow.setIgnoreMouseEvents(true, { forward: true }); // go back to transparent mode
});


ipcMain.on("drag-start", () => {
  isDragging = true;
  mainWindow.setIgnoreMouseEvents(false, { forward: true }); // allow drag
});
ipcMain.on("setWinPosition", (_, pos) => {
  if (isDragging) {
    mainWindow.setPosition(pos.x, pos.y);
  }
});
  mainWindow.loadFile(path.join(__dirname, "../../dist-react/index.html"));
 
});
