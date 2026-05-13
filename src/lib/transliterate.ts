export let bnToEnMap: Record<string, string> = {
  // Common Dhaka locations
  'আগারগাঁও': 'Agargaon',
  'মিরপুর': 'Mirpur',
  'মতিঝিল': 'Motijheel',
  'গুলিস্তান': 'Gulistan',
  'ফার্মগেট': 'Farmgate',
  'উত্তরা': 'Uttara',
  'গাবতলী': 'Gabtoli',
  'মহাখালী': 'Mohakhali',
  'বাড্ডা': 'Badda',
  'রামপুরা': 'Rampura',
  'মালিবাগ': 'Malibagh',
  'শান্তিনগর': 'Shantinagar',
  'কাকরাইল': 'Kakrail',
  'শাহবাগ': 'Shahbag',
  'সায়েন্সল্যাব': 'Science Lab',
  'নিউমার্কেট': 'New Market',
  'আজিমপুর': 'Azimpur',
  'মোহাম্মদপুর': 'Mohammadpur',
  'ধানমন্ডি': 'Dhanmondi',
  'কলাবাগান': 'Kalabagan',
  'পান্থপথ': 'Panthapath',
  'কারওয়ান বাজার': 'Kawran Bazar',
  'বাংলামোটর': 'Banglamotor',
  'মগবাজার': 'Moghbazar',
  'সদরঘাট': 'Sadarghat',
  'গুলশান': 'Gulshan',
  'বনানী': 'Banani',
  'বারিধারা': 'Baridhara',
  'খিলক্ষেত': 'Khilkhet',
  'কুড়িল': 'Kuril',
  'বিশ্বরোড': 'Bishwa Road',
  'নতুন বাজার': 'Natun Bazar',
  'সায়েদাবাদ': 'Sayedabad',
  'যাত্রাবাড়ী': 'Jatrabari',
  'চিটাগাং রোড': 'Chittagong Road',
  'শনির আখড়া': 'Shanir Akhra',
  'রায়েরবাগ': 'Rayerbag',
  'মাতুয়াইল': 'Matuail',
  'সাইনবোর্ড': 'Signboard',
  'মদনপুর': 'Madanpur',
  'কাঁচপুর': 'Kanchpur',
  'পোস্তগোলা': 'Postogola',
  'জুরাইন': 'Jurain',
  'দোলাইরপাড়': 'Dolairpar',
  'খিলগাঁও': 'Khilgaon',
  'বাসাবো': 'Basabo',
  'মুগদা': 'Mugda',
  'কদমতলী': 'Kadamtali',
  'বাবুবাজার': 'Babubazar',
  'জিগাতলা': 'Jigatola',
  'হাজারীবাগ': 'Hazaribagh',
  'শ্যামলী': 'Shyamoli',
  'কল্যাণপুর': 'Kalyanpur',
  'টেকনিক্যাল': 'Technical',
  'দারুস সালাম': 'Darus Salam',
  'চিড়িয়াখানা': 'Chiriakhana',
  'পল্লবী': 'Pallabi',
  'ইসিবি চত্বর': 'ECB Chattar',
  'কালশী': 'Kalshi',
  'মাটিখাঁটা': 'Matikata',
  'বনশ্রী': 'Banasree',
  'আফতাবনগর': 'Aftabnagar',
  'মেরাদিয়া': 'Meradia',
  'মহাখালী ডিওএইচএস': 'Mohakhali DOHS',
  'ক্যান্টনমেন্ট': 'Cantonment',
  'কচুক্ষেত': 'Kochukhet',
  'ভাষানটেক': 'Bhashantek',
  'দিয়াবাড়ী': 'Diabari',
  'আব্দুল্লাহপুর': 'Abdullahpur',
  'টঙ্গী': 'Tongi',
  'বোর্ডবাজার': 'Board Bazar',
  'গাজীপুর': 'Gazipur',
  'সাভার': 'Savar',
  'হেমায়েতপুর': 'Hemayetpur',
  'নবীনগর': 'Nabinagar',
  'বাইপাইল': 'Baipail',
  'আশুলিয়া': 'Ashulia',
  'চন্দ্রা': 'Chandra',
  'কালিয়াকৈর': 'Kaliakair',
  'নারায়ণগঞ্জ': 'Narayanganj',
  'চাষাড়া': 'Chashara',
  'পঞ্চবটি': 'Panchabati',
  'পাগলা': 'Pagla',
  'ফতুল্লা': 'Fatullah',
  'কাঁচপুর ব্রিজ': 'Kanchpur Bridge',
  'সিদ্ধিরগঞ্জ': 'Siddhirganj',
  'ডেমরা': 'Demra',
  'স্টাফ কোয়ার্টার': 'Staff Quarter',
  'আমুলিয়া': 'Amulia',
  'তারাবো': 'Tarabo',
  'রূপগঞ্জ': 'Rupganj',
  'ভুলতা': 'Bhulta',
  'গাউছিয়া': 'Gausia',
  'রূপনগর': 'Rupnagar',
  'শেওড়াপাড়া': 'Shewrapara',
  'কাজীপাড়া': 'Kazipara',
  'তালতলা': 'Taltala',
  'খামারবাড়ি': 'Khamarbari',
  'বিজয় সরণি': 'Bijoy Sarani',
  'তেজগাঁও': 'Tejgaon',
  'সাতরাস্তা': 'Sat Rasta',
  'নাবিস্কো': 'Nabisco',
  'মহাখালী বাস টার্মিনাল': 'Mohakhali Bus Terminal',
  'গুলশান ১': 'Gulshan 1',
  'গুলশান ২': 'Gulshan 2',
  'কাকলী': 'Kakoli',
  'বনানী বিদ্যানিকেতন': 'Banani Bidyaniketan',
  'নর্দ্দা': 'Nadda',
  'যমুনা ফিউচার পার্ক': 'Jamuna Future Park',
  'বসুন্ধরা': 'Bashundhara',
  'বিমানবন্দর': 'Biman Bandar',
  'এয়ারপোর্ট': 'Airport',
  'হজক্যাম্প': 'Hajj Camp',
  'হাতিরঝিল': 'Hatirjhil',
  'পান্থকুঞ্জ': 'Panthakunja',
  'পরীবাগ': 'Poribagh',
  'বঙ্গবন্ধু এভিনিউ': 'Bangabandhu Avenue',
  'পল্টন': 'Paltan',
  'প্রেসক্লাব': 'Press Club',
  'হাইকোর্ট': 'High Court',
  'মৎস্য ভবন': 'Motsho Bhaban',
  'টিএসসি': 'TSC',
  'বকশীবাজার': 'Bakshibazar',
  'চাঁনখারপুল': 'Chankharpul',
  'গুলিস্তান জিরো পয়েন্ট': 'Gulistan Zero Point',
  'দৈনিক বাংলা': 'Dainik Bangla',
  'ফকিরাপুল': 'Fakirapool',
  'রাজারবাগ': 'Rajarbagh',
  'কমলাপুর': 'Kamalapur',
  'মুগদাপাড়া': 'Mugdapara',
  'মাণ্ডা': 'Manda',
  'টিটি পাড়া': 'TT Para',
  'গোলাপবাগ': 'Golapbagh',
  'ধলপুর': 'Dhalpur',
  'কাজলা': 'Kajla',
  'রায়ের বাজার': 'Rayer Bazar',
  'মোহাম্মদপুর বাসস্ট্যান্ড': 'Mohammadpur Bus Stand',
  'শংকর': 'Shankar',
  'স্টার কাবাব': 'Star Kabab',
  'আড়ং': 'Aarong',
  'আসাদগেট': 'Asad Gate',
  'কলেজগেট': 'College Gate',
  'শিশুমেলা': 'Shishu Mela',
  'আগারগাঁও সিগন্যাল': 'Agargaon Signal',
  'আইডিবি': 'IDB',
  'রকেয়া সরণি': 'Rokeya Sarani',
  '১০ নং গোলচত্বর': '10 No. Golchattar',
  '১১ নং বাসস্ট্যান্ড': '11 No. Bus Stand',
  '১২ নং বাসস্ট্যান্ড': '12 No. Bus Stand',
  '১৪ নং বাসস্ট্যান্ড': '14 No. Bus Stand',
  'মিরপুর ১': 'Mirpur 1',
  'মিরপুর ২': 'Mirpur 2',
  'মিরপুর ১০': 'Mirpur 10',
  'মিরপুর ১১': 'Mirpur 11',
  'মিরপুর ১২': 'Mirpur 12',
  'মিরপুর ১৪': 'Mirpur 14'
};

const charMap: Record<string, string> = {
  'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
  'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
  'চ': 'ch', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
  'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
  'য': 'j', 'র': 'r', 'ল': 'l',
  'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h', 'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y',
  'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n',
  
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
  '্': '', 'ৗ': 'ou', '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

// Generates a phonetic English representation to be stored behind the scenes for search purposes
// Only to be used for matching logic, not for showing to the user.
export function generatePhoneticEnglish(text: string): string {
    if (!text) return "";
    let english = "";
    for(let i = 0; i < text.length; i++) {
        const char = text[i];
        if (charMap[char]) {
            english += charMap[char];
        } else {
            english += char;
        }
    }
    return english.toLowerCase().replace(/a+/g, 'a').replace(/o+/g, 'o').replace(/i+/g, 'i').replace(/u+/g, 'u').replace(/kkh/g, 'kkh').replace(/b b/g, 'bb');
}

export function transliterateBnToEn(text: string): string {
    if(!text) return "";
    
    // First, try to replace known words to get a clean English layout
    // We reverse sort the map keys so that longer phrases like 'মিরপুর ১০' are replaced before 'মিরপুর'
    const sortedKeys = Object.keys(bnToEnMap).sort((a, b) => b.length - a.length);
    let tempText = text;
    let matched = false;
    for (const key of sortedKeys) {
        if (tempText.includes(key)) {
            tempText = tempText.replace(new RegExp(key, 'g'), bnToEnMap[key]);
            matched = true;
        }
    }

    if (matched) {
       // if we mixed English and Bengali from unknown words, we will just return the phonetic for the rest
       // or just return the english words and strip out the leftover bengali
       // The best approach: just return phonetic matching representation behind the scenes.
       return tempText;
    }

    // fallback to phonetic string, suitable for search matching
    return generatePhoneticEnglish(text);
}

export function setCustomMappings(customMap: Record<string, string>) {
    bnToEnMap = { ...bnToEnMap, ...customMap };
}
