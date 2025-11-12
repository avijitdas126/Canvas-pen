import {
  app,
  BrowserWindow,
  desktopCapturer,
  dialog,
  ipcMain,
  Menu,
  screen,
  Tray,
  globalShortcut,
} from "electron";
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
    x: 0,
    y: 0,
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
    width: width,
    height: height,
    x: 10,
    y: 10,
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

  ipcMain.on("get_selected_item", (event, item) => {
    console.log("Selected Tool:", item);

    // Safety check
    const iconPath = app.isPackaged
      ? path.join(process.resourcesPath, "assets", "pen.ico") // ✅ for packaged app
      : path.join(__dirname, "../assets/pen.ico");
    if (!canvasWin || canvasWin.isDestroyed()) {
      dialog.showMessageBoxSync({
        icon: iconPath,
        message: "Canvas window is unfortunatelly closed.",
      });
      console.warn("Canvas window is not ready or destroyed");
      app.quit();
      return;
    }
    if (item.tool === "capture") {
      captureScreen(canvasWin)
        .then(() => {
          console.log("Successfully saved");
        })
        .catch((err) => {
          console.error("Capture failed:", err);
        });
    }
    // --- HANDLE WINDOW CONTROL (close/minimize/restore) ---
    if (item.tool === "close") {
      try {
        if (item.isClose) {
          // Minimize the canvas window
          canvasWin.minimize();
        } else {
          // Restore if minimized
          if (
            typeof canvasWin.isMinimized === "function" &&
            canvasWin.isMinimized()
          ) {
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
  function safeSidebar(fn) {
    if (sidebarWin && !sidebarWin.isDestroyed()) {
      try {
        fn(sidebarWin);
      } catch (err) {
        console.warn("Sidebar window not ready:", err);
      }
    } else {
      console.warn("Sidebar window not ready or destroyed");
    }
  }

  function safeCanvas(fn) {
    if (canvasWin && !canvasWin.isDestroyed()) {
      try {
        fn(canvasWin);
      } catch (err) {
        console.warn("Canvas window not ready:", err);
      }
    } else {
      console.warn("Canvas window not ready or destroyed");
    }
  }

  let isDragging = false;

  ipcMain.on("set-draw-mode", (_, active) => {
    if (!isDragging) {
      safeSidebar((win) => win.setIgnoreMouseEvents(active, { forward: true }));
    }
  });

  ipcMain.on("drag-start", () => {
    isDragging = true;
    safeSidebar((win) => win.setIgnoreMouseEvents(false));
  });

  ipcMain.on("drag-end", () => {
    isDragging = false;
    safeSidebar((win) => win.setIgnoreMouseEvents(true, { forward: true }));
  });

  ipcMain.on("toggle-mouse", (_, active) => {
    if (!isDragging) {
      safeSidebar((win) =>
        win.setIgnoreMouseEvents(!active, { forward: true })
      );
    }
  });

  // Allow renderer to save captured Data URL images to disk
  ipcMain.on("save-capture", async (event, dataUrl) => {
    try {
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      const { filePath, canceled } = await dialog.showSaveDialog(sidebarWin || canvasWin, {
        title: "Save Capture",
        defaultPath: path.join(__dirname, "../assets/capture.png"),
        filters: [{ name: "PNG", extensions: ["png"] }],
      });
      if (!canceled && filePath) {
        fs.writeFileSync(filePath, buffer);
        console.log("Saved capture to:", filePath);
        event.reply && event.reply("save-capture-result", { success: true, filePath });
      } else {
        event.reply && event.reply("save-capture-result", { success: false });
      }
    } catch (err) {
      console.error("Failed to save capture:", err);
      event.reply && event.reply("save-capture-result", { success: false, error: err.message });
    }
  });

  ipcMain.on("setWinPosition", (_, pos) => {
    if (isDragging && sidebarWin && !sidebarWin.isDestroyed()) {
      try {
        // Safety check: only move when not minimized or destroyed
        if (sidebarWin.isVisible()) {
          sidebarWin.setPosition(pos.x, pos.y);
        }
      } catch (err) {
        console.error("Safe position move failed:", err);
        sidebarWin.setPosition(pos.x, pos.y);
      }
    }
  });
  // --- Keep windows properly stacked ---
  const restack = () => {
    if (!canvasWin || !sidebarWin) return;
    if (isDragging) return; // skip during drag
    try {
      if (!canvasWin.isDestroyed() && !sidebarWin.isDestroyed()) {
        canvasWin.setAlwaysOnTop(true, "screen-saver", 0);
        sidebarWin.setAlwaysOnTop(true, "screen-saver", 1);
        sidebarWin.moveTop();
      }
    } catch (e) {
      console.warn("Restack error:", e);
    }
  };

  sidebarWin.on("focus", restack);
  app.on("browser-window-focus", restack);

  // Optional: periodic re-stack (helps on Windows 11)
  setInterval(restack, 4000);
  const icon = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "pen.ico") // ✅ for packaged app
    : path.join(__dirname, "../assets/pen.ico");
  const tray = new Tray(icon);
  tray.setToolTip("Canvas Pen");
  let template = [{ label: "Exit", click: () => app.quit() }];
  let ctx = Menu.buildFromTemplate(template);
  tray.setContextMenu(ctx);
});

app.on("window-all-closed", () => {
  app.quit();
});
async function captureScreen(win) {
  try {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: { width, height },
    });

    const primarySource = sources.find(
      ({ display_id }) => Number(display_id) === screen.getPrimaryDisplay().id
    );

    if (!primarySource) throw new Error("Primary display not found");

    const img = primarySource.thumbnail;

    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Save Capture",
      defaultPath: path.join(__dirname, "../assets/"),
      filters: [{ name: "Image Files", extensions: ["png", "jpg", "jpeg"] }],
    });

    if (!canceled && filePath) {
      fs.writeFileSync(filePath, img.toPNG());
      console.log("✅ Saved capture:", filePath);
    }
  } catch (err) {
    console.error("❌ Capture failed:", err);
  }
}
