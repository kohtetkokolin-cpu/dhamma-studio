'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Play, Pause, Download, Scissors, Sparkles } from 'lucide-react';
import { Track } from '@/lib/mockData';
import { trimAudio } from '@/utils/audioCutter';

export default function AudioTrimmer({ track }: { track: Track }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [regionRange, setRegionRange] = useState({ start: 0, end: 30 });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#d1d5db',
      progressColor: '#ca8a04',
      cursorColor: '#ca8a04',
      height: 90,
      url: track.audioUrl,
    });

    const wsRegions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = wsRegions;

    ws.on('ready', () => {
      const initialRegion = wsRegions.addRegion({
        start: 0,
        end: 30,
        color: 'rgba(202, 138, 4, 0.25)',
        drag: true,
        resize: true,
      });

      initialRegion.on('update-end', () => {
        setRegionRange({ start: initialRegion.start, end: initialRegion.end });
      });
    });

    ws.on('finish', () => setIsPlaying(false));
    waveSurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [track]);

  const togglePlay = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying(waveSurferRef.current.isPlaying());
    }
  };

  const applyPreset = (durationSec: number) => {
    if (!regionsRef.current) return;
    regionsRef.current.clearRegions();
    const newRegion = regionsRef.current.addRegion({
      start: 0,
      end: durationSec,
      color: 'rgba(202, 138, 4, 0.25)',
    });
    setRegionRange({ start: 0, end: durationSec });
    newRegion.on('update-end', () => {
      setRegionRange({ start: newRegion.start, end: newRegion.end });
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const audioBlob = await trimAudio(track.audioUrl, regionRange.start, regionRange.end);
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title}_clip.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('အသံဖိုင်ပိုင်းဖြတ်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{track.title}</h3>
          <p className="text-sm text-zinc-500">{track.description}</p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-full font-medium">
          {track.category === 'vinaya' ? 'ဝိနည်းဒွိဟရှင်းတမ်း' : 'လူငယ်နှင့် စိတ်ငြိမ်းချမ်းရေး'}
        </span>
      </div>

      {/* Waveform Box */}
      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl mb-4">
        <div ref={containerRef} />
      </div>

      {/* Quick Trim Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-zinc-400 self-center mr-1">ဖြတ်တောက်ရန် အချိန်ရွေးချယ်ပါ -</span>
        <button
          onClick={() => applyPreset(30)}
          className="text-xs flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium"
        >
          <Scissors className="w-3 h-3 text-amber-500" /> စက္ကန့် ၃၀ (Shorts)
        </button>
        <button
          onClick={() => applyPreset(300)}
          className="text-xs flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium"
        >
          <Scissors className="w-3 h-3 text-amber-500" /> ၅ မိနစ် (Podcast)
        </button>
        <button
          onClick={() => applyPreset(1800)}
          className="text-xs flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium"
        >
          <Scissors className="w-3 h-3 text-amber-500" /> မိနစ် ၃၀ (တရားရှည်)
        </button>
      </div>

      {/* Range Status & Actions */}
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
          Range: {Math.floor(regionRange.start)}s - {Math.floor(regionRange.end)}s 
          <span className="text-amber-600 font-semibold ml-2">({Math.floor(regionRange.end - regionRange.start)}s)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'ခဏရပ်' : 'နားထောင်မည်'}
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'ဖြတ်တောက်နေသည်...' : 'Audio Clip ရယူမည်'}
          </button>
        </div>
      </div>
    </div>
  );
}
