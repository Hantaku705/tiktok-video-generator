"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import SegmentGrid from "@/components/SegmentGrid";
import BGMUploader from "@/components/BGMUploader";
import GeneratePanel from "@/components/GeneratePanel";
import OutputList from "@/components/OutputList";
import {
  SEGMENTS,
  VARIANTS,
  GeneratedVideo,
} from "@/types";
import { generateCombinations, combinationToFilename } from "@/lib/generator";
import { concatenateVideos, generateThumbnail } from "@/lib/ffmpeg";

// Initialize empty grid
function createEmptyGrid<T>(defaultValue: T): T[][] {
  return Array.from({ length: SEGMENTS }, () =>
    Array.from({ length: VARIANTS }, () => defaultValue)
  );
}

export default function Home() {
  // Grid state: files and thumbnails
  const [files, setFiles] = useState<(File | null)[][]>(() =>
    createEmptyGrid(null)
  );
  const [thumbnails, setThumbnails] = useState<(string | null)[][]>(() =>
    createEmptyGrid(null)
  );

  // BGM state
  const [bgmFile, setBgmFile] = useState<File | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputs, setOutputs] = useState<GeneratedVideo[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Calculate upload stats
  const uploadedCount = files.flat().filter((f) => f !== null).length;
  const totalSlots = SEGMENTS * VARIANTS;
  const isReady = uploadedCount === totalSlots;

  // Handle file change for a slot
  const handleFileChange = useCallback(
    async (segmentIndex: number, variantIndex: number, file: File | null) => {
      // Update files
      setFiles((prev) => {
        const newFiles = prev.map((row) => [...row]);
        newFiles[segmentIndex][variantIndex] = file;
        return newFiles;
      });

      // Generate and update thumbnail
      if (file) {
        try {
          const thumb = await generateThumbnail(file);
          setThumbnails((prev) => {
            const newThumbnails = prev.map((row) => [...row]);
            newThumbnails[segmentIndex][variantIndex] = thumb;
            return newThumbnails;
          });
        } catch (error) {
          console.error("Failed to generate thumbnail:", error);
        }
      } else {
        setThumbnails((prev) => {
          const newThumbnails = prev.map((row) => [...row]);
          newThumbnails[segmentIndex][variantIndex] = null;
          return newThumbnails;
        });
      }
    },
    []
  );

  // Handle BGM change
  const handleBgmChange = useCallback((file: File | null) => {
    setBgmFile(file);
  }, []);

  // Generate videos
  const handleGenerate = useCallback(
    async (count: number) => {
      if (!isReady) return;

      setIsGenerating(true);
      setOutputs([]);
      setProgress({ current: 0, total: count });

      // Generate random combinations
      const combinations = generateCombinations(count);

      // Create pending output entries
      const pendingOutputs: GeneratedVideo[] = combinations.map((combo) => ({
        id: uuidv4(),
        combination: combo,
        url: "",
        filename: `video_${combinationToFilename(combo)}.mp4`,
        status: "pending" as const,
      }));
      setOutputs(pendingOutputs);

      // Process each combination
      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i];
        const outputId = pendingOutputs[i].id;

        // Update status to processing
        setOutputs((prev) =>
          prev.map((o) =>
            o.id === outputId ? { ...o, status: "processing" as const } : o
          )
        );

        try {
          // Get clips for this combination
          const clips: File[] = [];
          for (let seg = 0; seg < SEGMENTS; seg++) {
            const variantIdx = combo[seg];
            const file = files[seg][variantIdx];
            if (!file) {
              throw new Error(`Missing file for segment ${seg}, variant ${variantIdx}`);
            }
            clips.push(file);
          }

          // Concatenate videos via API
          const blob = await concatenateVideos(clips, bgmFile);
          const url = URL.createObjectURL(blob);

          // Update with completed status
          setOutputs((prev) =>
            prev.map((o) =>
              o.id === outputId
                ? { ...o, status: "completed" as const, url }
                : o
            )
          );
        } catch (error) {
          console.error(`Error generating video ${i + 1}:`, error);
          setOutputs((prev) =>
            prev.map((o) =>
              o.id === outputId
                ? {
                    ...o,
                    status: "error" as const,
                    error: error instanceof Error ? error.message : "Unknown error",
                  }
                : o
            )
          );
        }

        // Update progress
        setProgress({ current: i + 1, total: count });
      }

      setIsGenerating(false);
    },
    [isReady, files, bgmFile]
  );

  // Download all videos
  const handleDownloadAll = useCallback(() => {
    const completedVideos = outputs.filter(
      (v) => v.status === "completed" && v.url
    );

    completedVideos.forEach((video, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = video.url;
        a.download = video.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 200); // Stagger downloads
    });
  }, [outputs]);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            🎬 TikTok 5^6 Video Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            30素材から最大15,625パターンの動画を自動生成
          </p>
          <p className="text-sm text-green-500 mt-2">
            ✓ サーバーサイドFFmpeg
          </p>
        </header>

        {/* Main Grid */}
        <section className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-lg">
          <SegmentGrid
            grid={{ files, thumbnails }}
            onFileChange={handleFileChange}
          />
        </section>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* BGM Upload */}
          <section className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-lg">
            <BGMUploader file={bgmFile} onFileChange={handleBgmChange} />
          </section>

          {/* Generate Panel */}
          <section className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-lg">
            <GeneratePanel
              isReady={isReady}
              isGenerating={isGenerating}
              uploadedCount={uploadedCount}
              totalSlots={totalSlots}
              onGenerate={handleGenerate}
            />
          </section>
        </div>

        {/* Output List */}
        {(outputs.length > 0 || isGenerating) && (
          <section className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-xl shadow-lg">
            <OutputList
              videos={outputs}
              progress={progress}
              isGenerating={isGenerating}
              onDownloadAll={handleDownloadAll}
            />
          </section>
        )}

        {/* Stats Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            5^6 = {(5 ** 6).toLocaleString()} 組み合わせ | 6セグメント × 5バリエーション
          </p>
        </footer>
      </div>
    </main>
  );
}
