"use client";

import { useRef, useState, useCallback } from "react";

interface VideoSlotProps {
  segmentIndex: number;
  variantIndex: number;
  file: File | null;
  thumbnail: string | null;
  onFileChange: (
    segmentIndex: number,
    variantIndex: number,
    file: File | null
  ) => void;
}

export default function VideoSlot({
  segmentIndex,
  variantIndex,
  file,
  thumbnail,
  onFileChange,
}: VideoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type.startsWith("video/")) {
        onFileChange(segmentIndex, variantIndex, droppedFile);
      }
    },
    [segmentIndex, variantIndex, onFileChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileChange(segmentIndex, variantIndex, selectedFile);
      }
    },
    [segmentIndex, variantIndex, onFileChange]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileChange(segmentIndex, variantIndex, null);
    },
    [segmentIndex, variantIndex, onFileChange]
  );

  const handleClick = useCallback(() => {
    if (file && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      inputRef.current?.click();
    }
  }, [file, isPlaying]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <div
      className={`relative aspect-[9/16] rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
        isDragOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : file
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {file ? (
        <>
          {/* Video Preview */}
          <video
            ref={videoRef}
            src={URL.createObjectURL(file)}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            onEnded={handleVideoEnded}
            poster={thumbnail || undefined}
          />

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-3xl">
              {isPlaying ? "⏸" : "▶"}
            </span>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10"
          >
            ×
          </button>

          {/* File name */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
            {file.name}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <span className="text-2xl mb-1">📹</span>
          <span className="text-[10px]">ドロップ</span>
        </div>
      )}
    </div>
  );
}
