"use client";

/**
 * Concatenate video clips and add BGM via server-side FFmpeg API
 * @param clips Array of video File objects in order (6 segments)
 * @param bgm BGM audio File (optional)
 */
export async function concatenateVideos(
  clips: File[],
  bgm: File | null
): Promise<Blob> {
  // Build FormData
  const formData = new FormData();

  // Add video segments
  for (let i = 0; i < clips.length; i++) {
    formData.append(`seg${i}`, clips[i]);
  }

  // Add BGM if provided
  if (bgm) {
    formData.append("bgm", bgm);
  }

  // Call API
  const response = await fetch("/api/generate", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  // Return blob
  return response.blob();
}

/**
 * Generate thumbnail from video file
 */
export async function generateThumbnail(
  videoFile: File,
  timeSeconds: number = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeSeconds, video.duration);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      URL.revokeObjectURL(video.src);
      resolve(thumbnail);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Failed to load video"));
    };

    video.src = URL.createObjectURL(videoFile);
  });
}
