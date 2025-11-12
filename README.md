# Canvas Pen

Canvas Pen is a lightweight Electron + React drawing utility that provides a transparent drawing canvas over the desktop with a compact tools sidebar. It is designed for quick annotations, sketching, and screen captures while staying out of the way of other windows.

## Key features

- Floating sidebar with tools: pencil, eraser, shapes, text, stroke color/width, and a whiteboard toggle.
- Transparent, always-on-top canvas window for drawing over other applications.
- Selection mode that lets clicks pass through to underlying windows.
- Capture tool: select a resizable area and export it to PNG (Data URL currently; can be saved or sent to main process).
- Smooth, responsive resize and drag handling (pointer events + rAF batching).

## Additional built-in features

- Multi-monitor aware — the canvas and capture tools work across displays and use the primary display's work area by default.
- Lightweight clipboard export: copy the captured area or full-canvas PNG to the clipboard (optional via main process).
- Pressure/tilt friendly input: pointer events are used so pen tablets and styluses with pressure may be supported by Fabric.js brushes.
- Small footprint: windows are frameless, transparent, skip the taskbar and keep a low memory/CPU profile while idle.
- Pixel-perfect capture: capture area supports exact pixel coordinates relative to the canvas for crisp exports.
- Safe window stacking: periodic re-stack and focus handling to keep the toolbar above the canvas on Windows.

## Project structure

- `src/` — React UI and renderer code (components live under `src/ui`).
- `src/electron/` — main Electron process, preload scripts, and IPC bridges.
- `dist-react/` — built renderer assets produced by Vite (used by Electron in production builds).

## Running in development

This project expects Node.js and npm/yarn installed. From the project root (Windows PowerShell):

```powershell
# install
npm install

# start the renderer dev server (if using Vite) and then run Electron in dev mode
npm run dev
```

Check `package.json` for scripts specific to your setup (`dev`, `start`, `build`, etc.).

## Notes for contributors / maintainers

- Dragging the sidebar uses pointer capture and window-level listeners to ensure drag-end is always detected (main process tracks dragging state). If `isDragging` in main ever stays true, check the renderer for lost drag-end events or IPC failures.
- The canvas uses Fabric.js for drawing. The eraser is implemented both as a brush and a click-to-remove handler; that handler is registered and removed cleanly to avoid accidental deletion when the eraser isn't active.
- Resizing logic updates DOM styles directly during drag to avoid re-render thrash; heavier work (committing size to Fabric or saving capture data) is deferred to the end of the resize.

## Next improvements (ideas)

- Persist capture images to disk or copy to clipboard via the Electron main process.
- Add undo/redo and export/import for drawings.
- Improve accessibility and keyboard support for tools and the sidebar.

If you'd like, I can update this README with exact commands from your `package.json` scripts or add build badges.
