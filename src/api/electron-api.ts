/**
 * Renderer-side API: typed wrapper around window.electronAPI.
 * Provides parse + generate functions with TypeScript types.
 */

export interface LessonOverview {
  lessonTitle: string;
  grade: string;
  unit: string;
  lessonType: string;
  teachingGoals: Array<{
    dimension: string;
    content: string;
    label: string;
  }>;
  keyPoints: string;
  difficultPoints: string;
  coreLiteracy: string[];
  teachingMethods: string[];
  teachingAids: string[];
  structure: Array<{
    name: string;
    slides: number;
    method: string;
    time: string;
    contentSummary: string;
  }>;
  totalSlides: number;
  estimatedDuration: string;
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface ConfirmationItem {
  field: string;
  confidence: number;
  suggestion: string;
  action: string;
}

export interface ParseResult {
  overview: LessonOverview;
  confirmations: ConfirmationItem[];
  needsConfirmation: boolean;
}

// Access the exposed API from preload
declare global {
  interface Window {
    electronAPI: {
      parseLesson: (rawText: string, provider?: string) => Promise<ParseResult>;
      generatePPT: (overview: object, provider?: string) => Promise<string>; // base64
      onBackendError: (callback: (err: string) => void) => void;
    };
  }
}

export async function parseLesson(rawText: string, provider = "openai"): Promise<ParseResult> {
  return window.electronAPI.parseLesson(rawText, provider);
}

export async function generatePPT(overview: LessonOverview, provider = "openai"): Promise<Blob> {
  const base64 = await window.electronAPI.generatePPT(overview, provider);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
}

export function onBackendError(callback: (err: string) => void): void {
  window.electronAPI.onBackendError(callback);
}
