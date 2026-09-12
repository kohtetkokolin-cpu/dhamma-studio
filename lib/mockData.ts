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
    title: 'အဂ္ဂမဟာပဏ္ဍိတ ဒေါက်တာနန္ဒမာလာဘိဝံသ',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Nandamala_Bhivamsa.jpg/330px-Nandamala_Bhivamsa.jpg',
    tracks: [
      {
        id: 'ox-01',
        title: 'ဒေါသကို ဉာဏ်ဖြင့် အနိုင်ယူခြင်း တရားတော်',
        category: 'life',
        duration: '၂၄:၁၂',
        audioUrl: 'https://ia800407.us.archive.org/21/items/pa-auk-tawya-sayadaw-dhamma-talks/2012-01-20_Dhammacakkappavattana_Sutta_01.mp3',
        description: 'စိတ်တိုဒေါသထွက်လွယ်သော လူငယ်များ လက်တွေ့ စိတ်ကို ထိန်းကျောင်းနည်း အနှစ်ချုပ်'
      },
      {
        id: 'ox-02',
        title: 'ဘုရားဆွမ်းနှင့် ပန်းများ စွန့်စားခြင်းဆိုင်ရာ ဝိနည်းဒွိဟရှင်းတမ်း',
        category: 'vinaya',
        duration: '၁၈:၄၅',
        audioUrl: 'https://ia800407.us.archive.org/21/items/pa-auk-tawya-sayadaw-dhamma-talks/2012-01-21_Dhammacakkappavattana_Sutta_02.mp3',
        description: 'လူအများ နေ့စဉ် ဒွိဟဖြစ်နေရသော ပူဇော်ပြီး ဆွမ်း၊ သစ်သီးများ စွန့်စားသည့် ဝိနည်းအဆုံးအဖြတ်'
      }
    ]
  },
  {
    id: 'paauk-sayadaw',
    name: 'ဖားအောက်တောရ ဆရာတော်ကြီး',
    title: 'ဘဒ္ဒန္တ အာစိဏ္ဏ (မဟာကမ္မဋ္ဌာနာစရိယ)',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pa-Auk_Sayadaw.jpg/330px-Pa-Auk_Sayadaw.jpg',
    tracks: [
      {
        id: 'pa-01',
        title: 'သတိပဋ္ဌာန်နှင့် အနတ္တ လက္ခဏာ သဘောတရား',
        category: 'deep_dhamma',
        duration: '၄၅:၁၀',
        audioUrl: 'https://ia800407.us.archive.org/21/items/pa-auk-tawya-sayadaw-dhamma-talks/2012-01-22_Dhammacakkappavattana_Sutta_03.mp3',
        description: 'စိတ်ဖိစီးမှုနှင့် အတွေးလွန်ခြင်း (Overthinking) ကို သတိပဋ္ဌာန်ဖြင့် ချုပ်ငြိမ်းစေနည်း'
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
        title: 'လောကဓံကို ရင်ဆိုင်ကျော်လွှားနည်း ဩဝါဒ',
        category: 'life',
        duration: '၃၁:၂၀',
        audioUrl: 'https://ia800407.us.archive.org/21/items/pa-auk-tawya-sayadaw-dhamma-talks/2012-01-23_Dhammacakkappavattana_Sutta_04.mp3',
        description: 'မဖြစ်သေးသော အနာဂတ်အတွက် စိုးရိမ်သောက ကင်းဝေးပြီး သတ္တိရှိရှိ နေထိုင်နည်း'
      }
    ]
  }
];
