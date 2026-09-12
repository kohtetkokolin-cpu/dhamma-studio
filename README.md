# ဗုဒ္ဓဓမ္မ Studio

တရားတော်များထဲက ဗဟုသုတ / စိတ်ဝင်စားဖွယ် / မျှဝေချင်စရာ အပိုင်းများကို AI ဖြင့် အလိုအလျောက် ရွေးထုတ်ပြီး mp3 clip ဖြစ်ပေါ်စေသည့် Next.js app။

## အလုပ်လုပ်ပုံ (User Flow)

1. ဆရာတော်ကြီး ရွေးပါ
2. တရားတော် ခေါင်းစဉ် ရွေးပါ
3. **AI ဖြင့် အလိုအလျောက်** tab တွင် ထုတ်လိုသော မိနစ်ကို ရွေးချယ်ပါ → "AI ဖြင့် အကောင်းဆုံး အပိုင်းများ ရွေးထုတ်မည်" ကို နှိပ်ပါ
   - Claude က ဟောကြားချက်၏ timestamp ပါ transcript ကို ဖတ်ပြီး ဗဟုသုတ / စိတ်ဝင်စားဖွယ် / viral ဖြစ်နိုင်သော အပိုင်းများကို user ရွေးချယ်ထားသည့် မိနစ်နှင့် ကိုက်ညီအောင် ရွေးထုတ်ပေးသည်
4. "MP3 ဖိုင် ဒေါင်းလုပ်ဆွဲယူမည်" ကို နှိပ်လိုက်ရင် server ပေါ်တွင် ffmpeg က ရွေးချယ်ထားသည့် အပိုင်းများကို ဖြတ်တောက်ပြီး တစ်ဖိုင်တည်း mp3 အဖြစ် ပေါင်းစပ်ပေးသည်
5. "ကိုယ်တိုင် ဖြတ်တောက်မည်" tab က မူရင်းရှိပြီးသား waveform drag-trim manual flow ဖြစ်သည် (backup/advanced option)

## Setup

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY ထည့်ပါ
npm run dev
```

`ffmpeg-static` က ffmpeg binary ကို install ချိန်မှာ ကိုယ်တိုင်ယူသွားသဖြင့် system ပေါ်မှာ ffmpeg ထပ်ထည့်စရာ မလိုပါ။

## Deploy (Vercel စသည်)

- `/app/api/highlight` နှင့် `/app/api/export-clip` နှစ်ခုစလုံးကို **Node.js runtime** (edge မဟုတ်) မှာသာ run ရမည် — ဖိုင်ထဲတွင် `export const runtime = 'nodejs'` ထည့်ပြီးသားဖြစ်သည်
- `ANTHROPIC_API_KEY` ကို deploy environment variables ထဲ ထည့်ပေးရန် လိုအပ်သည်
- Vercel Hobby plan မှာ serverless function timeout က ၁၀ စက္ကန့်သာ ရှိသဖြင့် ရှည်လျားသော တရားတော် (၃၀+ မိနစ်) ကို export လုပ်ရင် timeout ဖြစ်နိုင်သည် — Pro plan (`maxDuration` ကို ချိန်ညှိပါ) သို့မဟုတ် self-host သုံးသင့်သည်

## Adding a real talk (transcript လိုအပ်ချက် — အရေးကြီးဆုံးအချက်)

`lib/mockData.ts` ထဲက Track တစ်ခုစီမှာ `transcript` field ပါရှိသည် - AI က ဒီ field ကိုသာ ကြည့်ပြီး အပိုင်းရွေးချယ်ခြင်းဖြစ်သည်။ ယခု data ထဲက transcript များသည် demo အတွက် ဖန်တီးထားသော နမူနာစာသားများသာ ဖြစ်ပြီး **တကယ့် အသံဖိုင်၏ စကားနှင့် မကိုက်ညီပါ**။

တကယ့်တရားတော်တစ်ပုဒ် ထည့်ချင်ပါက အောက်ပါအဆင့်များ လိုအပ်သည် -

1. **အသံဖိုင် (audioUrl)** - တကယ့် mp3/audio link ထည့်ပါ
2. **Transcript ထုတ်ခြင်း (Speech-to-Text)** - ဗမာစကားကို timestamp ပါ transcript အဖြစ် ထုတ်ပေးမည့် ASR tool တစ်ခု အသုံးပြုရမည် (ဥပမာ - OpenAI Whisper `large-v3` model, `whisper-timestamped`, သို့မဟုတ် faster-whisper)။ output ကို `{ start, end, text }` array အဖြစ် ပြောင်းပြီး `transcript` field ထဲ ထည့်ပါ
3. **durationSeconds** - အသံဖိုင်၏ အမှန်တကယ် စုစုပေါင်းကြာချိန် (စက္ကန့်) ကို ထည့်ပါ

Transcript မတိကျရင် AI ရွေးထုတ်တဲ့ အချိန်တွေ (start/end) လည်း အသံဖိုင်ရဲ့ တကယ့်အကြောင်းအရာနဲ့ မကိုက်ညီတော့ပါဘူး - ဒါကြောင့် ဒီအဆင့်က app ရဲ့ အရေးအကြီးဆုံး အစိတ်အပိုင်းဖြစ်ပါတယ်။

## AI ရွေးချယ်မှု ယုံကြည်စိတ်ချရမှု (Grounding)

`/app/api/highlight/route.ts` သည် Claude ကို timestamp အသစ် လုံးဝ မတီထွင်ပါစေဘဲ၊ ပေးထားသော transcript segment **index** များကိုသာ ရွေးချယ်ခိုင်းထားသည်။ Server ဘက်မှ index ကို original segment စာရင်းနှင့် ပြန်စစ်ပြီးမှသာ start/end timestamp များကို ffmpeg export step ဆီ ပို့သည် - ဒါက AI hallucination ကြောင့် မှားယွင်းသော အချိန်ကို ဖြတ်တောက်မိမှုကို ကာကွယ်ပေးသည်။
