/**
 * Python Bridge: Spawn Python backend as child process and communicate via HTTP.
 */
import { spawn, ChildProcess } from "child_process";
import path from "path";
import { app } from "electron";
import fetch from "node-fetch";

const API_BASE = "http://127.0.0.1:8000";
let pythonProcess: ChildProcess | null = null;
let isReady = false;

export async function startPythonBackend(): Promise<void> {
  if (pythonProcess) return;

  const isDev = !app.isPackaged;
  let pythonPath: string;
  let scriptPath: string;

  if (isDev) {
    // Development: use local Python
    pythonPath = process.platform === "win32" ? "python" : "python3";
    scriptPath = path.join(__dirname, "../../../../python/main.py");
  } else {
    // Production: bundled Python + script
    const exeDir = path.dirname(process.execPath);
    pythonPath = path.join(exeDir, "python", "python" + (process.platform === "win32" ? ".exe" : ""));
    scriptPath = path.join(exeDir, "python", "main.py");
  }

  pythonProcess = spawn(pythonPath, [scriptPath], {
    cwd: path.dirname(scriptPath),
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    stdio: ["pipe", "pipe", "pipe"],
  });

  pythonProcess.stdout?.on("data", (data) => {
    console.log("[Python]", data.toString().trim());
  });

  pythonProcess.stderr?.on("data", (data) => {
    console.error("[Python ERR]", data.toString().trim());
  });

  pythonProcess.on("close", (code) => {
    console.log(`[Python] exited with code ${code}`);
    pythonProcess = null;
    isReady = false;
  });

  // Wait for backend to be ready (poll /health)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const resp = await fetch(`${API_BASE}/health`, { timeout: 2000 } as any);
      if (resp.ok) {
        isReady = true;
        console.log("[Python] Backend ready");
        return;
      }
    } catch {
      // not ready yet
    }
  }

  throw new Error("Python backend failed to start within 15 seconds");
}

export function stopPythonBackend(): void {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
    isReady = false;
  }
}

// API wrappers
export async function apiParse(rawText: string, provider = "openai"): Promise<any> {
  const resp = await fetch(`${API_BASE}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw_text: rawText, provider }),
  });
  if (!resp.ok) throw new Error(`Parse API error: ${resp.status}`);
  return resp.json();
}

export async function apiGenerate(overview: object, provider = "openai"): Promise<Buffer> {
  const resp = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overview, provider }),
  });
  if (!resp.ok) throw new Error(`Generate API error: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}
