'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { Play, Pause, Download, Scissors, AlertCircle, Loader2 } from 'lucide-react';
import { Track } from '@/lib/mockData';
import { trimAudio } from '@/utils/audioCutter';

export default function AudioTrimmer({ track }: { track: Track }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [regionRange, setRegionRange] = useState({ start: 0, end: 30 });
  const [isExporting, setIsExporting] = useState(false);

  // Next.js internal proxy URL သို့ ပြောင်းလဲခြင်း
  const proxiedAudioUrl = `/api/proxy-audio?url=${encodeURIComponent(track.audioUrl)}`;

  useEffect(() => {
    if (!containerRef.current) return;
    setIsLoading(true);
    setLoadError(null);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#d97706',
      progressColor: '#92400e',
      cursorColor: '#b45309',
      height: 85,
      url: proxiedAudioUrl,
    });

    const wsRegions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = wsRegions;

    ws.on('ready', () => {
      setIsLoading(false);
      const initialRegion = wsRegions.addRegion({
        start: 0,
        end: 30,
        color: 'rgba(217, 119, 6, 0.25)',
        drag: true,
        resize: true,
      });

      initialRegion.on('update-end', () => {
        setRegionRange({ start: initialRegion.start, end: initialRegion.end });
      });
    });

    ws.on('error', (err) => {
      console.error(err);
      setIsLoading(false);
      setLoadError('တရားတော် အသံဖိုင် ဆွဲယူ၍ မရနိုင်ပါ။');
    });

    ws.on('finish', () => setIsPlaying(false));
    waveSurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [track, proxiedAudioUrl]);

  const togglePlay = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
      setIsPlaying(waveSurferRef.current.isPlaying());
    }
  };

  const applyPreset = (durationSec: number) => {
    if (!regionsRef.current || !waveSurferRef.current) return;
    const totalDuration = waveSurferRef.current.getDuration();
    const targetEnd = Math.min(durationSec, totalDuration || durationSec);

    regionsRef.current.clearRegions();
    const newRegion = regionsRef.current.addRegion({
      start: 0,
      end: targetEnd,
      color: 'rgba(217, 119, 6, 0.25)',
    });
    setRegionRange({ start: 0, end: targetEnd });
    newRegion.on('update-end', () => {
      setRegionRange({ start: newRegion.start, end: newRegion.end });
    });
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const audioBlob = await trimAudio(proxiedAudioUrl, regionRange.start, regionRange.end);
      const downloadUrl = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${track.title}_clip.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error(err);
      alert('အသံဖိုင် ဖြတ်တောက်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်- ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{track.title}</h3>
          <p className="text-sm text-zinc-500 mt-1">{track.description}</p>
        </div>
        <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full font-medium">
          {track.category === 'vinaya' ? 'ဝိနည်းဒွိဟရှင်းတမ်း' : 'စိတ်ငြိမ်းချမ်းရေး'}
        </span>
      </div>

      {/* Waveform Visualization */}
      <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl mb-4 relative min-h-[105px] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-50/80 dark:bg-zinc-950/80 z-10 text-amber-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">တရားတော် အသံလှိုင်း ဆွဲယူနေပါသည်...</span>
          </div>
        )}
        {loadError && (
          <div className="text-red-500 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" /> {loadError}
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Quick Trim Preset Options */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-zinc-500 mr-1">ဖြတ်တောက်မည့် အချိန်သတ်မှတ်ပါ —</span>
        <button
          onClick={() => applyPreset(30)}
          className="text-xs flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 hover:text-amber-900 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium transition"
        >
          <Scissors className="w-3.5 h-3.5 text-amber-600" /> စက္ကန့် ၃၀ (Shorts/Reels)
        </button>
        <button
          onClick={() => applyPreset(300)}
          className="text-xs flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 hover:text-amber-900 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium transition"
        >
          <Scissors className="w-3.5 h-3.5 text-amber-600" /> ၅ မိနစ် (Podcast)
        </button>
        <button
          onClick={() => applyPreset(1800)}
          className="text-xs flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 hover:text-amber-900 px-3 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 font-medium transition"
        >
          <Scissors className="w-3.5 h-3.5 text-amber-600" /> မိနစ် ၃၀ (တရားရှည်)
        </button>
      </div>

      {/* Range Status & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 gap-4">
        <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
          ရွေးချယ်ထားသည့် အပိုင်း - {Math.floor(regionRange.start)}s မှ {Math.floor(regionRange.end)}s အထိ 
          <span className="text-amber-600 font-bold ml-2">({Math.floor(regionRange.end - regionRange.start)} စက္ကန့်)</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={isLoading || !!loadError}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'ခဏရပ်' : 'နားထောင်မည်'}
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || isLoading || !!loadError}
            className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium shadow transition disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'ဖြတ်တောက်နေသည်...' : 'Audio Clip ရယူမည်'}
          </button>
        </div>
      </div>
    </div>
  );
}
