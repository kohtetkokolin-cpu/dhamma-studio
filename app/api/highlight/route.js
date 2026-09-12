import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Node runtime — this route calls an external API and needs a normal server.
export const runtime = 'nodejs';

interface IncomingSegment {
  index: number;
  start: number;
  end: number;
  text: string;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { segments, targetSeconds, title, description } = body as {
      segments: IncomingSegment[];
      targetSeconds: number;
      title?: string;
      description?: string;
    };

    if (!Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { error: 'ဤတရားတော်အတွက် transcript မရှိသေးပါ။ AI ဖြင့် ရွေးချယ်ဖို့ transcript လိုအပ်ပါသည်။' },
        { status: 400 }
      );
    }
    if (!targetSeconds || targetSeconds <= 0) {
      return NextResponse.json({ error: 'ထုတ်လိုသော Clip ကြာချိန်ကို မှန်ကန်စွာ ရွေးချယ်ပါ။' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server ပေါ်တွင် ANTHROPIC_API_KEY environment variable သတ်မှတ်ထားခြင်း မရှိသေးပါ။ .env.local ဖိုင်တွင် ထည့်ပေးပါ။' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const transcriptBlock = segments
      .map((s) => `[${s.index}] (${formatTime(s.start)}-${formatTime(s.end)}, ${Math.round(s.end - s.start)}s) ${s.text}`)
      .join('\n');

    const systemPrompt = `သင်သည် ဗုဒ္ဓဘာသာ တရားတော်များကို ယနေ့ခေတ် လူငယ်များအတွက် တိုတောင်းသော အနှစ်ချုပ် Clip အဖြစ် ရွေးချယ်တည်းဖြတ်ပေးသော အယ်ဒီတာတစ်ဦးဖြစ်သည်။

ရည်မှန်းချက် - ပေးထားသော transcript segment (numbered, timestamp ပါ) များထဲမှ အောက်ပါအချက်များနှင့် ကိုက်ညီသည့် အပိုင်းများကိုသာ ရွေးချယ်ရမည် -
- ဗဟုသုတ ရနိုင်သော (informative) အချက်အလက်၊ အဆုံးအမ
- စိတ်ဝင်စားဖွယ် (interesting) ဥပမာ၊ ဇာတ်လမ်း၊ နှိုင်းယှဉ်ချက်
- ပြန်လည်မျှဝေလိုစိတ် ဖြစ်စေမည့် (viral/shareable) တိုတောင်းပြတ်သားသော၊ မှတ်မိလွယ်သော စကားပိုဒ်

စည်းကမ်းအတိအကျများ -
1. ပေးထားသော transcript segment များမှသာ ရွေးချယ်ပါ။ timestamp အသစ်၊ segment အသစ် လုံးဝ မတီထွင်ရ။ index နံပါတ်များသာ အသုံးပြုပါ။
2. ရွေးချယ်ထားသော segment များ၏ ကြာချိန် (end-start) စုစုပေါင်းသည် user တောင်းဆိုထားသည့် targetSeconds ၏ 80%-120% အတွင်း ရှိရမည်။ ကျဲကျဲနေတဲ့ segment အနည်းငယ်ထက် စေ့စပ်တဲ့ ပေါင်းလဒ်ရအောင် ရွေးပါ။
3. ရွေးချယ်ထားသော segment array ကို မူရင်း timeline အစီအစဉ်အတိုင်း (index အငယ်ဆုံးမှ အကြီးဆုံး) ပြန်ပေးပါ - နားထောင်သူ အတွက် logical flow ရှိစေရန်။
4. segment တစ်ခုစီအတွက် ဘာကြောင့်ရွေးမိသလဲဆိုတာ Burmese ဖြင့် တစ်ကြောင်းတိုတိုနှင့် tag (informative / interesting / viral အနက်တစ်ခု) ပေးပါ။
5. JSON format ဖြင့်သာ ပြန်ဖြေပါ။ ရှင်းလင်းချက် စာသား၊ markdown code fence လုံးဝ မပါစေရ - JSON object တစ်ခုတည်း ဖြစ်ရမည်။`;

    const userPrompt = `ဟောကြားချက် ခေါင်းစဉ် - ${title ?? ''}
အကျဉ်းချုပ် - ${description ?? ''}
User ရွေးချယ်ထားသော ရည်ရွယ်ချိန် - ${targetSeconds} စက္ကန့် (${(targetSeconds / 60).toFixed(1)} မိနစ်ခန့်)

Transcript segments -
${transcriptBlock}

ဤ JSON schema အတိုင်းသာ ပြန်ဖြေပါ (အခြားစာသား မပါစေရ) -
{"selected": [{"index": 0, "reason": "...", "tag": "informative"}]}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('AI ထံမှ စာသား အဖြေ မရရှိပါ။');
    }

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
    let parsed: { selected: { index: number; reason: string; tag: string }[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('AI ၏ အဖြေကို ဖတ်၍မရပါ။ ထပ်စမ်းကြည့်ပါ။');
    }

    // Ground every selection back against the real segment list — never trust
    // AI-emitted timestamps directly, only the index into what we sent it.
    const segmentByIndex = new Map(segments.map((s) => [s.index, s]));
    const resolved = (parsed.selected || [])
      .filter((sel) => segmentByIndex.has(sel.index))
      .map((sel) => {
        const seg = segmentByIndex.get(sel.index)!;
        return {
          index: sel.index,
          start: seg.start,
          end: seg.end,
          text: seg.text,
          reason: sel.reason,
          tag: sel.tag,
        };
      })
      .sort((a, b) => a.start - b.start);

    if (resolved.length === 0) {
      return NextResponse.json(
        { error: 'AI က သင့်လျော်သော အပိုင်း ရွေးချယ်နိုင်ခြင်း မရှိပါ။ ထပ်စမ်းကြည့်ပါ။' },
        { status: 502 }
      );
    }

    const totalSeconds = resolved.reduce((sum, seg) => sum + (seg.end - seg.start), 0);

    return NextResponse.json({ selected: resolved, totalSeconds });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'AI ခွဲခြမ်းစိတ်ဖြာမှု မအောင်မြင်ပါ။' }, { status: 500 });
  }
}
