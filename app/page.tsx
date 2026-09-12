'use client';

import React, { useState } from 'react';
import { DHAMMA_DATA, Master, Track } from '@/lib/mockData';
import AudioTrimmer from '@/components/AudioTrimmer';
import { Sparkles, BookOpen, Compass } from 'lucide-react';

export default function Home() {
  const [selectedMaster, setSelectedMaster] = useState<Master>(DHAMMA_DATA[0]);
  const [selectedTrack, setSelectedTrack] = useState<Track>(DHAMMA_DATA[0].tracks[0]);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-lg">
              ဓ
            </div>
            <h1 className="text-lg font-bold">ဗုဒ္ဓဓမ္မ Studio</h1>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Short Video & Audio Creator
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Step 1: ဆရာတော်များ ရွေးချယ်ခြင်း */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Compass className="w-4 h-4 text-amber-500" /> ၁။ ဆရာတော်ကြီးများ ရွေးချယ်ပါ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DHAMMA_DATA.map((master) => {
              const isSelected = selectedMaster.id === master.id;
              return (
                <button
                  key={master.id}
                  onClick={() => {
                    setSelectedMaster(master);
                    setSelectedTrack(master.tracks[0]);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  <img src={master.photoUrl} alt={master.name} className="w-14 h-14 rounded-full object-cover border border-zinc-200" />
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{master.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{master.title}</p>
                    <span className="text-xs text-amber-600 font-medium mt-1 block">တရားတော် {master.tracks.length} ပုဒ်</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: တရားတော် နှင့် ဝိနည်းဒွိဟခေါင်းစဉ်များ ရွေးချယ်ခြင်း */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <BookOpen className="w-4 h-4 text-amber-500" /> ၂။ ဟောကြားချက် ခေါင်းစဉ် ရွေးချယ်ပါ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedMaster.tracks.map((track) => {
              const isSelected = selectedTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-amber-600">{track.duration}</span>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                      {track.category === 'vinaya' ? 'ဝိနည်း' : 'ဘဝလမ်းညွှန်'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{track.title}</h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{track.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Audio Trimmer & Export */}
        <section>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <Sparkles className="w-4 h-4 text-amber-500" /> ၃။ အသံဖိုင် ဖြတ်တောက်ပြီး အသုံးပြုပါ
          </h2>
          <AudioTrimmer key={selectedTrack.id} track={selectedTrack} />
        </section>
      </div>
    </main>
  );
}
