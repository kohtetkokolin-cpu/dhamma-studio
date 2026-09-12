'use client';

import React, { useMemo, useRef, useState } from 'react';
import { BookOpen, Flame, Loader2, Play, Pause, Sparkles, Download, AlertCircle, Wand2 } from 'lucide-react';
import { Track } from '@/lib/mockData';

interface SelectedSegment {
  index: number;
  start: number;
  end: number;
  text: string;
  reason: string;
  tag: string;
}

const PRESET_MINUTES = [1, 3, 5, 10];

const TAG_META: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  informative: {
    label: 'ဗဟုသုတ',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  interesting: {
    label: 'စိတ်ဝင်စားဖွယ်',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    className: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  },
  viral: {
    label: 'Viral ဖြစ်နိုင်',
    icon: <Flame className="w-3.5 h-3.5" />,
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
};

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AIHighlightPicker({ track }: { track: Track }) {
  const [targetMinutes, setTargetMinutes] = useState(3);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'analyzed' | 'exporting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedSegment[]>([]);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasTranscript = !!track.transcript && track.transcript.length > 0;
  const proxiedAudioUrl = `/api/proxy-audio?url=${encodeURIComponent(track.audioUrl)}`;

  const totalSelectedSeconds = useMemo(
    () => selected.reduce((sum, s) => sum + (s.end - s.start), 0),
    [selected]
  );

  const runAnalysis = async () => {
    if (!hasTranscript) return;
    setStatus('analyzing');
    setErrorMsg(null);
    setSelected([]);
    try {
      const res = await fetch('/api/highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: track.transcript!.map((s, i) => ({ index: i, start: s.start, end: s.end, text: s.text })),
          targetSeconds: Math.round(targetMinutes * 60),
          title: track.title,
          description: track.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI ခွဲခြမ်းစိတ်ဖြာမှု မအောင်မြင်ပါ။');
      setSelected(data.selected);
      setStatus('analyzed');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const previewSegment = (seg: SelectedSegment, idx: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingIdx === idx) {
      audio.pause();
      setPlayingIdx(null);
      return;
    }
    audio.currentTime = seg.start;
    audio.play();
    setPlayingIdx(idx);

    const onTime = () => {
      if (audio.currentTime >= seg.end) {
        audio.pause();
        setPlayingIdx(null);
        audio.removeEventListener('timeupdate', onTime);
      }
    };
    audio.addEventListener('timeupdate', onTime);
  };

  const handleDownload = async () => {
    if (selected.length === 0) return;
    setStatus('exporting');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/export-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: track.audioUrl,
          segments: selected.map((s) => ({ start: s.start, end: s.end })),
          fileName: track.title,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'mp3 ထုတ်ယူရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.title}_AI_clip.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('analyzed');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div>
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-600" /> {track.title}
        </h3>
        <p className="text-sm text-zinc-500 mt-1">{track.description}</p>
      </div>

      <audio ref={audioRef} src={proxiedAudioUrl} preload="none" />

      {!hasTranscript && (
        <div className="flex items-start gap-2 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            ဤတရားတော်အတွက် transcript (အချိန်တံဆိပ်ပါ စာသားထုတ်ချက်) ထည့်သွင်းရန် လိုအပ်ပါသည်။ transcript
            ရှိမှသာ AI က တိကျစွာ အပိုင်းရွေးချယ် ဖြတ်တောက်နိုင်ပါမည်။ ယခုအတွက် &quot;ကိုယ်တိုင် ဖြတ်တောက်မည်&quot;
            tab ကို အသုံးပြုပါ။
          </span>
        </div>
      )}

      {hasTranscript && (
        <>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
              ထုတ်လိုသော Clip ကြာချိန် (မိနစ်)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_MINUTES.map((m) => (
                <button
                  key={m}
                  onClick={() => setTargetMinutes(m)}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition ${
                    targetMinutes === m
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-100 hover:text-amber-900'
                  }`}
                >
                  {m} မိနစ်
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(Math.max(0.5, Number(e.target.value)))}
                  className="w-20 text-sm px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
                <span className="text-xs text-zinc-500">ကိုယ်တိုင်သတ်မှတ်</span>
              </div>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            disabled={status === 'analyzing'}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow transition disabled:opacity-50"
          >
            {status === 'analyzing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> AI က တရားတော်ကို ခွဲခြမ်းစိတ်ဖြာနေပါသည်...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> AI ဖြင့် အကောင်းဆုံး အပိုင်းများ ရွေးထုတ်မည်
              </>
            )}
          </button>

          {errorMsg && (
            <div className="flex items-start gap-2 text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{errorMsg}</span>
            </div>
          )}

          {selected.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  AI ရွေးချယ်ထားသော အပိုင်း {selected.length} ခု
                </h4>
                <span className="text-sm font-mono text-amber-600 font-bold">
                  {formatTime(totalSelectedSeconds)} ({Math.round(totalSelectedSeconds)}s)
                </span>
              </div>

              <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {selected.map((seg, idx) => {
                  const meta = TAG_META[seg.tag] ?? TAG_META.informative;
                  return (
                    <li
                      key={`${seg.index}-${idx}`}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-start gap-3"
                    >
                      <button
                        onClick={() => previewSegment(seg, idx)}
                        className="shrink-0 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-950 text-amber-600"
                      >
                        {playingIdx === idx ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-zinc-500">
                            {formatTime(seg.start)} - {formatTime(seg.end)}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium ${meta.className}`}
                          >
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">{seg.text}</p>
                        <p className="text-xs text-zinc-400 mt-1 italic">{seg.reason}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button
                onClick={handleDownload}
                disabled={status === 'exporting'}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 dark:bg-amber-600 hover:opacity-90 text-white rounded-xl text-sm font-semibold shadow transition disabled:opacity-50"
              >
                {status === 'exporting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> mp3 ပြင်ဆင်နေပါသည်...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> MP3 ဖိုင် ဒေါင်းလုပ်ဆွဲယူမည်
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
