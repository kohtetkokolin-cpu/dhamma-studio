export interface Track {
  id: string;
  title: string;
  category: 'life' | 'vinaya' | 'deep_dhamma';
  duration: string;
  audioUrl: string;
  description: string;
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
    // Wikimedia သို့မဟုတ် direct image url သုံးပါ
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Nandamala_Bhivamsa.jpg/330px-Nandamala_Bhivamsa.jpg',
    tracks: [
      {
        id: 'ox-01',
        title: 'ဒေါသကို ဉာဏ်နဲ့ ထိန်းချုပ်နည်း',
        category: 'life',
        duration: '၂၅:၄၀',
        // public folder ထဲ ထည့်ထားသော ဖိုင် သို့မဟုတ် CORS ခွင့်ပြုထားသော အသံဖိုင်
        audioUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg', // CORS free sample
        description: 'စိတ်တိုဒေါသထွက်လွယ်သော လူငယ်များအတွက် သတိပစ္စုပ္ပန်တည့်တည့် ထားနည်း အနှစ်ချုပ်'
      },
      {
        id: 'ox-02',
        title: 'ဘုရားဆွမ်းနှင့် ပန်းများ စွန့်စားခြင်းဆိုင်ရာ ဝိနည်းဒွိဟရှင်းတမ်း',
        category: 'vinaya',
        duration: '၁၈:၁၅',
        audioUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        description: 'လူအများ နေ့စဉ် ဒွိဟဖြစ်နေရသော ပူဇော်ပြီး ဆွမ်း၊ သစ်သီးများ စွန့်စားသည့် ဝိနည်းအဆုံးအဖြတ်'
      }
    ]
  },
  {
    id: 'sitagu-sayadaw',
    name: 'သီတဂူဆရာတော်ကြီး',
    title: 'ဒေါက်တာ အရှင်ဉာဏိဿရ',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sitagu_Sayadaw.jpg/330px-Sitagu_Sayadaw.jpg',
    tracks: [
      {
        id: 'stg-01',
        title: 'Overthinking နှင့် စိုးရိမ်သောက ကင်းဝေးရေး',
        category: 'life',
        duration: '၃၂:၁၀',
        audioUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        description: 'မဖြစ်သေးသော အနာဂတ်အတွက် ပူလောင်မနေဘဲ သတ္တိရှိရှိ လက်ရှိကို ရင်ဆိုင်နည်း'
      }
    ]
  }
];
