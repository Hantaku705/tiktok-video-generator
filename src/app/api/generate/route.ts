import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const execAsync = promisify(exec);

// Temp directory for processing
const TEMP_DIR = "/tmp/video-generator";

export async function POST(request: NextRequest) {
  const sessionId = uuidv4();
  const sessionDir = join(TEMP_DIR, sessionId);

  try {
    // Create temp directory
    if (!existsSync(TEMP_DIR)) {
      await mkdir(TEMP_DIR, { recursive: true });
    }
    await mkdir(sessionDir, { recursive: true });

    // Parse form data
    const formData = await request.formData();

    // Get video files (seg0.mp4 - seg5.mp4)
    const videoFiles: string[] = [];
    for (let i = 0; i < 6; i++) {
      const file = formData.get(`seg${i}`) as File | null;
      if (!file) {
        return NextResponse.json(
          { error: `Missing segment ${i}` },
          { status: 400 }
        );
      }

      const filePath = join(sessionDir, `seg${i}.mp4`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      videoFiles.push(filePath);
    }

    // Get BGM file (optional)
    const bgmFile = formData.get("bgm") as File | null;
    let bgmPath: string | null = null;
    if (bgmFile) {
      bgmPath = join(sessionDir, "bgm.mp3");
      const buffer = Buffer.from(await bgmFile.arrayBuffer());
      await writeFile(bgmPath, buffer);
    }

    // Output path
    const outputPath = join(sessionDir, "output.mp4");

    // Build FFmpeg command
    const inputArgs = videoFiles.map((f) => `-i "${f}"`).join(" ");
    const bgmInput = bgmPath ? `-i "${bgmPath}"` : "";

    // Filter complex for concatenation
    const videoCount = videoFiles.length;
    let filterComplex = videoFiles.map((_, i) => `[${i}:v]`).join("");
    filterComplex += `concat=n=${videoCount}:v=1:a=0[outv]`;

    let mapArgs: string;
    if (bgmPath) {
      // Add audio from BGM
      filterComplex += `;[${videoCount}:a]atrim=0:30,asetpts=PTS-STARTPTS[outa]`;
      mapArgs = '-map "[outv]" -map "[outa]" -c:v libx264 -preset fast -c:a aac -shortest';
    } else {
      // No audio
      mapArgs = '-map "[outv]" -c:v libx264 -preset fast -an';
    }

    const ffmpegCmd = `ffmpeg -y ${inputArgs} ${bgmInput} -filter_complex "${filterComplex}" ${mapArgs} "${outputPath}"`;

    console.log("[FFmpeg] Running:", ffmpegCmd);

    // Execute FFmpeg
    try {
      const { stdout, stderr } = await execAsync(ffmpegCmd, {
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      });
      console.log("[FFmpeg] stdout:", stdout);
      if (stderr) {
        console.log("[FFmpeg] stderr:", stderr);
      }
    } catch (execError) {
      console.error("[FFmpeg] Error:", execError);
      // Clean up on error
      await cleanupSession(sessionDir, videoFiles, bgmPath, outputPath);
      return NextResponse.json(
        { error: "FFmpeg processing failed", details: String(execError) },
        { status: 500 }
      );
    }

    // Read output file
    const outputBuffer = await readFile(outputPath);

    // Clean up temp files
    await cleanupSession(sessionDir, videoFiles, bgmPath, outputPath);

    // Return video
    return new NextResponse(outputBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="output.mp4"',
      },
    });
  } catch (error) {
    console.error("[API] Error:", error);
    // Attempt cleanup
    try {
      await unlink(sessionDir).catch(() => {});
    } catch {}

    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

async function cleanupSession(
  sessionDir: string,
  videoFiles: string[],
  bgmPath: string | null,
  outputPath: string
) {
  try {
    // Delete video files
    for (const file of videoFiles) {
      await unlink(file).catch(() => {});
    }
    // Delete BGM
    if (bgmPath) {
      await unlink(bgmPath).catch(() => {});
    }
    // Delete output
    await unlink(outputPath).catch(() => {});
    // Delete session directory
    await unlink(sessionDir).catch(() => {});
  } catch (e) {
    console.error("[Cleanup] Error:", e);
  }
}

// Config for large file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};
