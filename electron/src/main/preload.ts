/**
 * Preload script: safely expose API to renderer process.
 */
import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  parseLesson: (rawText: string, provider?: string) => Promise<any>;
  generatePPT: (overview: object, provider?: string) => Promise<string>; // base64
  onBackendError: (callback: (err: string) => void) => void;
}

const api: ElectronAPI = {
  parseLesson: (rawText: string, provider?: string) =>
    ipcRenderer.invoke("api:parse", rawText, provider),

  generatePPT: (overview: object, provider?: string) =>
    ipcRenderer.invoke("api:generate", overview, provider),

  onBackendError: (callback: (err: string) => void) => {
    ipcRenderer.on("backend-error", (_event, err) => callback(err));
  },
};

contextBridge.exposeInMainWorld("electronAPI", api);
