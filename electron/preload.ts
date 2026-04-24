import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  parseLessonPlan: (content: string) => Promise<unknown>
  generateOverview: (data: unknown) => Promise<unknown>
  generatePPT: (slides: unknown[]) => Promise<unknown>
}

const api: ElectronAPI = {
  parseLessonPlan: (content: string) => ipcRenderer.invoke('parse-lesson-plan', content),
  generateOverview: (data: unknown) => ipcRenderer.invoke('generate-overview', data),
  generatePPT: (slides: unknown[]) => ipcRenderer.invoke('generate-ppt', slides)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electronAPI = api
}
