export interface Track {
  id: string;
  title: string;
  category: 'life' | 'vinaya' | 'deep_dhamma';
  duration: string;
  audioUrl: string;
  description: string;
  highlights?: { label: string; start: number; end: number }[];
}

export interface Master {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  tracks: Track[];
}

export const DHAMMA_DATA: Master[] = [
  {
    id: 'oxford-sayadaw',
    name: 'ပါမောက္ခချုပ်ဆရာတော်ကြီး',
    title: 'ဒေါက်တာနန္ဒမာလာဘိဝံသ',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    tracks: [
      {
        id: 'ox-01',
        title: 'ဒေါသကို ဉာဏ်နဲ့ ထိန်းချုပ်နည်း',
        category: 'life',
        duration: '25:40',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        description: 'စိတ်တိုဒေါသထွက်လွယ်တဲ့ လူငယ်တွေအတွက် သတိနဲ့ ပစ္စုပ္ပန်တည့်တည့် ထားနည်း'
      },
      {
        id: 'ox-02',
        title: 'ဘုရားဆွမ်းနှင့် ပန်းများ စွန့်စားခြင်းဆိုင်ရာ ဝိနည်းဒွိဟ',
        category: 'vinaya',
        duration: '18:15',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        description: 'လူအများ နေ့စဉ် ဒွိဟဖြစ်နေရသော ပူဇော်ပြီး ဆွမ်း၊ သစ်သီးများ စွန့်စားသည့်ကိစ္စ ရှင်းတမ်း'
      }
    ]
  },
  {
    id: 'sitagu-sayadaw',
    name: 'သီတဂူဆရာတော်ကြီး',
    title: 'ဒေါက်တာ အရှင်ဉာဏိဿရ',
    photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80',
    tracks: [
      {
        id: 'stg-01',
        title: 'Overthinking နှင့် စိုးရိမ်သောက ကင်းဝေးရေး',
        category: 'life',
        duration: '32:10',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        description: 'မဖြစ်သေးတဲ့ အနာဂတ်အတွက် ပူလောင်မနေဘဲ သတ္တိရှိရှိ ရင်ဆိုင်နည်း'
      }
    ]
  }
];
