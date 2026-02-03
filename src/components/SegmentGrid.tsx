"use client";

import VideoSlot from "./VideoSlot";
import { SEGMENT_LABELS, VARIANT_LABELS, SEGMENTS, VARIANTS } from "@/types";

interface GridState {
  files: (File | null)[][];
  thumbnails: (string | null)[][];
}

interface SegmentGridProps {
  grid: GridState;
  onFileChange: (
    segmentIndex: number,
    variantIndex: number,
    file: File | null
  ) => void;
}

export default function SegmentGrid({ grid, onFileChange }: SegmentGridProps) {
  const uploadedCount = grid.files
    .flat()
    .filter((f) => f !== null).length;
  const totalSlots = SEGMENTS * VARIANTS;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          素材アップロード
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {uploadedCount}/{totalSlots} ({Math.round((uploadedCount / totalSlots) * 100)}%)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(uploadedCount / totalSlots) * 100}%` }}
        />
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Time Labels Row */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `60px repeat(${SEGMENTS}, 1fr)` }}>
            <div /> {/* Empty corner cell */}
            {SEGMENT_LABELS.map((label, i) => (
              <div
                key={i}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Variant Rows */}
          {Array.from({ length: VARIANTS }).map((_, variantIndex) => (
            <div
              key={variantIndex}
              className="grid gap-2 mb-2"
              style={{ gridTemplateColumns: `60px repeat(${SEGMENTS}, 1fr)` }}
            >
              {/* Variant Label */}
              <div className="flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
                {VARIANT_LABELS[variantIndex]}
              </div>

              {/* Video Slots */}
              {Array.from({ length: SEGMENTS }).map((_, segmentIndex) => (
                <VideoSlot
                  key={`${segmentIndex}-${variantIndex}`}
                  segmentIndex={segmentIndex}
                  variantIndex={variantIndex}
                  file={grid.files[segmentIndex]?.[variantIndex] || null}
                  thumbnail={grid.thumbnails[segmentIndex]?.[variantIndex] || null}
                  onFileChange={onFileChange}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
