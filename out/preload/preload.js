"use strict";
const electron = require("electron");
const api = {
  parseLessonPlan: (content) => electron.ipcRenderer.invoke("parse-lesson-plan", content),
  generateOverview: (data) => electron.ipcRenderer.invoke("generate-overview", data),
  generatePPT: (slides) => electron.ipcRenderer.invoke("generate-ppt", slides)
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electronAPI", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electronAPI = api;
}
