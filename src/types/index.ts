// Video slot representing a single 5-second clip
export interface VideoSlot {
  segmentIndex: number; // 0-5 (which 5-second segment)
  variantIndex: number; // 0-4 (which variant A-E)
  file: File | null;
  url: string | null; // Object URL for preview
  thumbnail: string | null; // Thumbnail image
}

// Grid state for all 30 slots (6 segments × 5 variants)
export type VideoGrid = VideoSlot[][];

// BGM state
export interface BGMState {
  file: File | null;
  url: string | null;
  duration: number | null;
}

// Generation settings
export interface GenerationSettings {
  count: number; // Number of videos to generate
}

// Generated video output
export interface GeneratedVideo {
  id: string;
  combination: number[]; // e.g., [0, 2, 1, 4, 3, 0] = A,C,B,E,D,A
  url: string;
  filename: string;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

// App state
export interface AppState {
  grid: VideoGrid;
  bgm: BGMState;
  settings: GenerationSettings;
  outputs: GeneratedVideo[];
  isGenerating: boolean;
  progress: {
    current: number;
    total: number;
  };
}

// Constants
export const SEGMENTS = 6;
export const VARIANTS = 5;
export const SEGMENT_DURATION = 5; // seconds
export const TOTAL_DURATION = SEGMENTS * SEGMENT_DURATION; // 30 seconds
export const MAX_COMBINATIONS = Math.pow(VARIANTS, SEGMENTS); // 15,625

export const SEGMENT_LABELS = ["0-5s", "5-10s", "10-15s", "15-20s", "20-25s", "25-30s"];
export const VARIANT_LABELS = ["A", "B", "C", "D", "E"];
