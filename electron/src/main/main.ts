/**
 * Main process entry for lesson-ppt-generator.
 * Handles window creation, Python backend lifecycle, and IPC.
 */
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { startPythonBackend, stopPythonBackend, apiParse, apiGenerate } from "./ipc/python-bridge";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hiddenInset",
    show: false,
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC handlers
ipcMain.handle("api:parse", async (_event, rawText: string, provider?: string) => {
  return apiParse(rawText, provider || "openai");
});

ipcMain.handle("api:generate", async (_event, overview: object, provider?: string) => {
  const buffer = await apiGenerate(overview, provider || "openai");
  return buffer.toString("base64"); // Send as base64 to renderer
});

// App lifecycle
app.whenReady().then(async () => {
  try {
    await startPythonBackend();
    createWindow();
  } catch (err) {
    console.error("Failed to start Python backend:", err);
    // Show error window or fallback
    createWindow();
    mainWindow?.webContents.once("dom-ready", () => {
      mainWindow?.webContents.send("backend-error", String(err));
    });
  }
});

app.on("window-all-closed", () => {
  stopPythonBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("before-quit", () => {
  stopPythonBackend();
});
