"use client";

import { useRef, useState, useCallback } from "react";

interface BGMUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function BGMUploader({ file, onFileChange }: BGMUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

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
      if (droppedFile && droppedFile.type.startsWith("audio/")) {
        onFileChange(droppedFile);
      }
    },
    [onFileChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        onFileChange(selectedFile);
      }
    },
    [onFileChange]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onFileChange(null);
      setDuration(null);
      setIsPlaying(false);
    },
    [onFileChange]
  );

  const handleClick = useCallback(() => {
    if (file && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      inputRef.current?.click();
    }
  }, [file, isPlaying]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">BGM音声</h3>
      <div
        className={`relative p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
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
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {file ? (
          <div className="flex items-center gap-3">
            <audio
              ref={audioRef}
              src={URL.createObjectURL(file)}
              onEnded={handleAudioEnded}
              onLoadedMetadata={handleLoadedMetadata}
            />

            <button
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              {duration && (
                <p className="text-xs text-gray-500">
                  {formatDuration(duration)}
                  {duration < 30 && (
                    <span className="ml-2 text-orange-500">
                      (推奨: 30秒以上)
                    </span>
                  )}
                </p>
              )}
            </div>

            <button
              onClick={handleRemove}
              className="w-8 h-8 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-gray-400">
            <span className="text-3xl mb-2">🎵</span>
            <span className="text-sm">BGMファイルをドロップまたはクリック</span>
            <span className="text-xs mt-1">(.mp3, .wav, .m4a)</span>
          </div>
        )}
      </div>
    </div>
  );
}
