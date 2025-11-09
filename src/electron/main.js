import { app, BrowserWindow, ipcMain, Menu, screen, Tray } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const preloadPath = path.join(__dirname, "preload.cjs");
const preloaderPath = path.join(__dirname, "preloader.cjs");

let sidebarWin, canvasWin;

/**
 * Create the sidebar window (tools panel)
 */
function createSidebar(_, height) {
  sidebarWin = new BrowserWindow({
    width: 420,
    height: height - 20,
    x: 20,
    y: 30,
    resizable: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
    },
  });

  sidebarWin.once("ready-to-show", () => {
    sidebarWin.showInactive();
    sidebarWin.setAlwaysOnTop(true, "screen-saver", 1);
  });

  sidebarWin.loadFile(path.join(__dirname, "../../dist-react/index.html"));
}

/**
 * Create the canvas window (draw surface)
 */
function createCanvas(width, height) {
  canvasWin = new BrowserWindow({
    width: width - 20,
    height: height - 20,
    x: 0,
    y: 0,
    resizable: false,
    focusable: true, // must be true for text input
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      preload: preloaderPath,
      sandbox: false,
      contextIsolation: true,
    },
  });

  canvasWin.once("ready-to-show", () => {
    canvasWin.showInactive();
    canvasWin.setAlwaysOnTop(true, "screen-saver", 0);
    canvasWin.setIgnoreMouseEvents(true, { forward: true }); // default pass-through
  });
  
  canvasWin.loadFile(path.join(__dirname, "../../dist-react/canvas.html"));
}

/**
 * Setup event bridges and app lifecycle
 */
app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  createSidebar(width, height);
  createCanvas(width, height);

  // --- IPC Communication ---

  ipcMain.on("get_selected_item", (_, item) => {
  console.log("Selected Tool:", item);

  // Safety check
  if (!canvasWin || canvasWin.isDestroyed()) {
    console.warn("Canvas window is not ready or destroyed");
    return;
  }

  // --- HANDLE WINDOW CONTROL (close/minimize/restore) ---
  if (item.tool === "close") {
    try {
      if (item.isClose) {
        // Minimize the canvas window
        canvasWin.minimize();
      } else {
        // Restore if minimized
        if (typeof canvasWin.isMinimized === "function" && canvasWin.isMinimized()) {
          canvasWin.restore();
        } else {
          // Try maximize or show safely
          try {
            canvasWin.maximize();
          } catch (e) {
            console.warn("Maximize failed, fallback to show():", e);
            try {
              canvasWin.show();
            } catch (err) {
              console.error("Failed to show canvasWin:", err);
            }
          }
        }
      }
    } catch (e) {
      console.error("Error toggling minimize/restore/maximize:", e);
    }

    return; // prevent further handling
  }

  // --- HANDLE DRAWING + TOOL LOGIC ---
  try {
    if (item.tool === "select") {
      // Select tool → should be interactive for shape selection
      if (!canvasWin.isDestroyed()) {
        canvasWin.setFocusable(true);
        setTimeout(() => {
          try {
            if (!canvasWin.isDestroyed()) {
              canvasWin.setIgnoreMouseEvents(false);
              canvasWin.focus();
              canvasWin.webContents.send("get-item", item);
            }
          } catch (err) {
            console.error("Error during select mode setTimeout:", err);
          }
        }, 100);
      }
    } else {
      // Drawing or text tool
      if (!canvasWin.isDestroyed()) {
        canvasWin.setFocusable(true);
        setTimeout(() => {
          try {
            if (!canvasWin.isDestroyed()) {
              canvasWin.setIgnoreMouseEvents(false);
              canvasWin.focus();
              canvasWin.webContents.send("get-item", item);
            }
          } catch (err) {
            console.error("Error sending draw mode item:", err);
          }
        }, 100);
      }
    }
  } catch (e) {
    console.error("Error in get_selected_item handler:", e);
  }
});


  ipcMain.on("set-range", (_, range) => {
    if (canvasWin && !canvasWin.isDestroyed()) {
      canvasWin.webContents.send("get-range", range);
    }
  });

  ipcMain.on("set-colors", (_, color) => {
    if (canvasWin && !canvasWin.isDestroyed()) {
      canvasWin.webContents.send("get-colors", color);
    }
  });

  ipcMain.on("toggle-win", (_, toggle) => {
    if (canvasWin && !canvasWin.isDestroyed()) {
      canvasWin.webContents.send("get-toggle", toggle);
    }
  });

  // --- Mouse + Drag Handling ---

  let isDragging = false;

  ipcMain.on("toggle-mouse", (_, active) => {
    if (!isDragging) {
      sidebarWin.setIgnoreMouseEvents(!active, { forward: true });
    }
  });

  ipcMain.on("set-draw-mode", (_, active) => {
    if (!isDragging) {
      sidebarWin.setIgnoreMouseEvents(active, { forward: true });
    }
  });

  ipcMain.on("drag-start", () => {
    isDragging = true;
    sidebarWin.setIgnoreMouseEvents(false); // allow dragging
  });

  ipcMain.on("drag-end", () => {
    isDragging = false;
    sidebarWin.setIgnoreMouseEvents(true, { forward: true }); // back to transparent
  });

  ipcMain.on("setWinPosition", (_, pos) => {
    if (isDragging && sidebarWin && !sidebarWin.isDestroyed()) {
      sidebarWin.setPosition(pos.x, pos.y);
    }
  });

  // --- Keep windows properly stacked ---
  const restack = () => {
    if (!canvasWin || !sidebarWin) return;
    canvasWin.setAlwaysOnTop(true, "screen-saver", 0);
    sidebarWin.setAlwaysOnTop(true, "screen-saver", 1);
    sidebarWin.moveTop();
  };

  sidebarWin.on("focus", restack);
  app.on("browser-window-focus", restack);
   
  // Optional: periodic re-stack (helps on Windows 11)
  setInterval(restack, 4000);
  const tray=new Tray(path.join(__dirname,'../assets/pen.ico'))
  tray.setToolTip('Canvas Pen')
   let template=[{label:'Exit' ,click:()=>app.quit()}]
   let ctx=Menu.buildFromTemplate(template)
   tray.setContextMenu(ctx)
});

app.on("window-all-closed", () => {
  app.quit();
});
