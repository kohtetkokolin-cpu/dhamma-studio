import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

// Needs a real Node process (spawns ffmpeg) — cannot run on the edge runtime.
export const runtime = 'nodejs';
export const maxDuration = 60;

interface ClipSegment {
  start: number;
  end: number;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error('ffmpeg binary မတွေ့ပါ (ffmpeg-static install ပြန်စစ်ပါ)'));
      return;
    }
    const proc = spawn(ffmpegPath, args);
    let stderr = '';
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });
  });
}

export async function POST(request: NextRequest) {
  const jobId = randomUUID();
  const tmpDir = os.tmpdir();
  const sourcePath = path.join(tmpDir, `${jobId}-source`);
  const listPath = path.join(tmpDir, `${jobId}-list.txt`);
  const outputPath = path.join(tmpDir, `${jobId}-output.mp3`);
  const segmentPaths: string[] = [];

  try {
    const body = await request.json();
    const { audioUrl, segments, fileName } = body as {
      audioUrl: string;
      segments: ClipSegment[];
      fileName?: string;
    };

    if (!audioUrl || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json({ error: 'audioUrl နှင့် segments လိုအပ်ပါသည်။' }, { status: 400 });
    }

    // 1) download the full source audio once
    const res = await fetch(audioUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!res.ok) {
      throw new Error(`မူရင်း အသံဖိုင် ဆွဲယူ၍ မရပါ (${res.status})`);
    }
    const arrayBuffer = await res.arrayBuffer();
    await fs.writeFile(sourcePath, Buffer.from(arrayBuffer));

    // 2) cut each AI-picked segment into its own mp3 (accurate seek: -ss after -i)
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segPath = path.join(tmpDir, `${jobId}-seg-${i}.mp3`);
      segmentPaths.push(segPath);
      await runFfmpeg([
        '-y',
        '-i', sourcePath,
        '-ss', String(Math.max(0, seg.start)),
        '-to', String(Math.max(seg.start, seg.end)),
        '-vn',
        '-acodec', 'libmp3lame',
        '-b:a', '128k',
        segPath,
      ]);
    }

    // 3) concat all the cut segments back-to-back into one mp3
    const listContent = segmentPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    await fs.writeFile(listPath, listContent);

    await runFfmpeg([
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-acodec', 'libmp3lame',
      '-b:a', '128k',
      outputPath,
    ]);

    const outputBuffer = await fs.readFile(outputPath);
    const safeName =
      (fileName || 'dhamma-clip').replace(/[^a-zA-Z0-9\u1000-\u109F_\- ]/g, '').trim() || 'dhamma-clip';

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeName)}.mp3"`,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Clip mp3 ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။' }, { status: 500 });
  } finally {
    const allPaths = [sourcePath, listPath, outputPath, ...segmentPaths];
    await Promise.all(allPaths.map((p) => fs.unlink(p).catch(() => {})));
  }
}
