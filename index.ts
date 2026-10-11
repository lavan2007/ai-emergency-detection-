import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ClassificationResult {
  is_emergency: boolean;
  category: string;
  severity: string;
  confidence: number;
  dialect: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
}

// ─── Keyword dictionaries for Tamil / Tanglish / English ───
// These cover formal Tamil, Tanglish, colloquial/regional Tamil, and English.
// Each keyword is a substring match against the normalized input text.

const EMERGENCY_KEYWORDS: Record<string, string[]> = {
  accident: [
    // English
    "accident", "crash", "collision", "knocked down", "run over",
    "road accident", "bike accident", "car accident", "head on",
    "overturned", "skidded", "pile up", "hit and run", "ran over",
    "smashed", "wrecked", "lost control",
    // Tanglish / Colloquial Tamil
    "ottal", "oseka", "aairuchu", "aayiruchu", "aayiduchu", "aayidchu",
    "aagiduchu", "aagitta", "aagithu", "aagiruchu", "aairukku",
    "thundhi", "thundhiyudan", "thundhi poidu", "thundhi aayiduchu",
    "thokki", "thokki vizhundhuchu", "thokki poidu",
    "mookku", "mookki", "mookka", "mookku poidu",
    "vizhundhuchu", "vizhundhu", "vizhundhuttu", "vizhundhatha",
    "vizhundhavan", "vizhundhuttan", "vizhunthu", "vizhunthuchu",
    "vandi ottu", "vandi thundhiyudan", "vandi mookku", "vandi thokki",
    "vandi vizhundhu", "vandi oseka", "vandi accident",
    "bump adikkuthu", "bump adithu", "bump poidu",
    "bike thokki", "bike oseka", "bike vizhundhu", "bike accident",
    "car thokki", "car oseka", "car vizhundhu", "car accident",
    "bus thokki", "bus oseka", "bus vizhundhu",
    "lorry thokki", "lorry oseka", "lorry vizhundhu",
    "auto oseka", "auto thokki", "auto vizhundhu",
    "podi aayiduchu", "podi poidu", "podi aayiruchu",
    "odivandhuchu", "odi vandhuchu", "odi poidu",
    "thallu", "thalluthu", "thallu poidu", "thallatha",
    "irangi", "irangi vizhundhu", "irangi poidu",
    "slip aayiduchu", "slip poidu", "slip aayiruchu",
    "fall aayiduchu", "fall poidu", "fallen",
    "vandi thedi", "vandi thallu", "vandi adichu",
    "adichu", "adichiruchu", "adichiddu", "adichiduchu",
    "pattu", "pattiruchu", "pattiddu", "pattidduchu",
    "vandi patti", "bike patti", "car patti",
    "hit aayiduchu", "hit poidu", "hit aayiruchu",
    "bump aayiduchu", "bump aayiruchu",
    "oseka pottu", "oseka aayiduchu", "oseka aayiruchu",
    "thundhi pottu", "thundhi aayiruchu",
    // Tamil Unicode
    "விபத்து", "வண்டி ஒட்டல்", "வண்டி தட்டியது", "விழுந்தது", "மோதியது",
    "வண்டி விழுந்தது", "விபத்து நடந்தது", "மோதப்பட்டது", "ஒட்டல்", "வண்டி",
    "வழு", "மோதல்", "விழுதல்", "தட்டு", "தட்டியது",
    "வண்டி மோதியது", "பைக் விழுந்தது", "கார் விழுந்தது",
    "வண்டி அடித்தது", "வண்டி பட்டது", "விபத்து ஆயிற்று",
  ],
  medical: [
    // English
    "ambulance", "hospital", "doctor", "nurse", "medical", "bleeding",
    "blood", "heart attack", "stroke", "unconscious", "collapsed",
    "choking", "severe pain", "breathing problem", "not breathing",
    "sick", "vomiting", "fainting", "fainted", "fever", "injury",
    "wound", "fracture", "burn", "poisoning", "allergic reaction",
    "seizure", "convulsion", "dialysis", "emergency room",
    "icu", "critical condition", "dead", "dying", "cancer",
    "covid", "corona", "virus", "infection", "pneumonia",
    "asthma", "diabetes", "pressure", "bp high", "blood pressure",
    // Tanglish / Colloquial Tamil
    "maruthuva", "maruthuvam", "marundhu", "marundhu kudi",
    "ospital", "aspathiri", "aspathri", "nursing home",
    "vali", "valikkuthu", "valikkudhu", "vali aayiduchu",
    "vali poidu", "vali varuthu", "vali adikkuthu",
    "ratham", "ratham varuthu", "ratham udhiruthu", "udhiram",
    "irudhaya", "irudhayam", "idhayam", "irudhaya vali",
    "madi", "maaru", "madi vali", "marbu vali",
    "thalai vali", "thalai", "sirai vali", "head vali",
    "udal vali", "kan vali", "kaal vali", "kai vali",
    "udal", "noi", "noi mudivu", "ullooram",
    "kaichal", "koochal", "koochi", "sorum",
    "venthing", "venthikkuthu", "venthikkudhu", "venthing varuthu",
    "vomitting", "vomitting varuthu",
    "manni", "maari", "mayakki", "mayakkam",
    "vizhundhuttan", "vizhundhavan", "vizhundhuttu",
    "manni poidu", "manni vilundhu", "mayangi vilundhu",
    "mozhiyama", "mozhi varaama", "mozhi illai",
    "mozhama", "peech illai", "speech illai",
    "breath varalai", "mooschu varalai", "mooschu adikkalai",
    "udhavi", "udhavi vaa", "udhavi vaangunga", "udhavi pannunga",
    "maruthuva udhavi", "ambulance anuppunga", "ambulance vaangunga",
    "doctor vaangunga", "doctor kuppunga",
    "temperature", "heat", "udhiram varuthu",
    "noi", "paddam", "paandu", "sori",
    "sugar", "sugar high", "sugar low", "bp", "bp high", "bp low",
    "pressure", "pressure high",
    "paal", "paal varuthu", "medicine kudi",
    "tablet", "tablet kudi", "injection", "injection pottu",
    "oottal", "oottal aayiduchu", "oodi poidu",
    "irandu", "saadhanai", "saadhanai aayiduchu", "saadhanai poidu",
    "irangi poidu", "maranam", "maranam aayiduchu",
    "uyir", "uyir poidu", "uyir poi",
    // Tamil Unicode
    "மருத்துவம்", "ஆஸ்பத்திரி", "மருத்துவமனை", "வலி", "ரத்தம்", "மார்பு",
    "தலைவலி", "வாந்தி", "மயக்கம்", "ஜுரம்", "காச்சல்", "இருதயம்",
    "மூச்சு", "மூச்சு விடமுடியவில்லை", "ரத்தம் வருகிறது", "வலிக்கிறது",
    "மருந்து", "மார்பு வலி", "இதயம்", "ஜுரம் வந்தது",
    "மயக்கம் வந்தது", "வாந்தி வருகிறது", "ரத்தம் வருது",
    "மூச்சு தூர முடியல", "உயிர் போகுது", "இறந்து",
  ],
  fire: [
    // English
    "fire", "burning", "burn", "smoke", "flames", "blaze",
    "building fire", "house fire", "caught fire", "on fire",
    "wildfire", "forest fire", "explosion", "exploded", "blast",
    // Tanglish / Colloquial Tamil
    "neruppu", "neruppu erikkuthu", "neruppu vanthuchu",
    "thee", "thee erikkuthu", "thee thee", "thee aayiduchu",
    "thi", "thi erikkuthu", "thi aayiduchu", "thi poidu",
    "erikkuthu", "erikkudhu", "erikkradhu", "erikki",
    "erikkuthu", "eri poidu", "eri aayiduchu", "eri aayiruchu",
    "villerikkuthu", "veli erikkuthu", "veetla neruppu",
    "veetla thee", "building la neruppu", "building la thee",
    "pukai", "pukai varuthu", "pukai aayiduchu",
    "pugai", "pugai varuthu", "pugai aayiduchu",
    "neruppu neruppu", "thee thee", "thinnai erikkuthu",
    "konda", "kondam", "kondam erikkuthu",
    "velicham erikkuthu", "velicham aayiduchu",
    "oottal", "oottal erikkuthu", "oottal aayiduchu",
    "burst aayiduchu", "burst poidu",
    "explosion aayiduchu", "blast aayiduchu",
    // Tamil Unicode
    "தீ", "தீ வெட்டி", "நெருப்பு", "புகை", "எரிகிறது",
    "எரியும்", "தீ வந்தது", "எரிந்தது", "வெடிப்பு",
    "புகை வருது", "நெருப்பு வந்தது", "தீ பற்றியது",
  ],
  electrical: [
    // English
    "electric", "electricity", "electrocuted", "electrocution",
    "shock", "power line", "live wire", "transformer",
    "short circuit", "voltage", "wire", "spark", "sparked",
    "power outage", "power cut", "downed wire",
    // Tanglish / Colloquial Tamil
    "biyaram", "byaram", "current", "current adikkuthu",
    "current shock", "shock adikkuthu", "shock aayiduchu",
    "shock poidu", "shock adithu",
    "kodi", "kodi oda", "kodi arikkuthu", "kodi vizhundhuchu",
    "wire", "wire oda", "wire arikkuthu", "wire vizhundhuchu",
    "vodi", "vodi arikkuthu",
    "short circuit", "short aayiduchu", "short poidu",
    "mitha", "mitha current", "smitha", "smitha current",
    "volt", "voltage", "high voltage",
    "transformer", "transformer burst",
    "line arikkuthu", "line vizhundhuchu", "line poidu",
    "current poidu", "biyaram poidu", "biyaram illai",
    "current vanthuchu", "biyaram vanthuchu",
    "spark", "spark adikkuthu", "spark aayiduchu",
    "current oottal", "current aayiduchu",
    // Tamil Unicode
    "மின்சாரம்", "கரண்ட்", "ஷாக்", "ஷாக் அடித்தது", "மின்",
    "கரண்ட் அடிச்சது", "மின்சாரம் தாக்கியது", "மின் இல்லை",
    "கம்பி ஒடிந்தது", "மின்சாரம் வந்தது", "கரண்ட் வந்தது",
  ],
  flood: [
    // English
    "flood", "flooding", "flooded", "heavy rain", "water logging",
    "submerged", "overflow", "drowning", "drowned", "deluge",
    "tsunami", "cyclone", "storm", "landslide",
    // Tanglish / Colloquial Tamil
    "flood aagiduchu", "flood aayiduchu", "flood poidu",
    "thanneer", "thanner", "thanneer vanthuchu",
    "thanneer pugundhuduchu", "thanneer pugundhu",
    "thanneer ozhuguthu", "thanneer ozhukkiradhu",
    "neer", "neer vanthuchu", "neer pugundhuduchu",
    "neer ozhuguthu", "neer ozhukkiradhu", "neer valigiradhu",
    "neer pugundhu", "neer miga", "neer nira",
    "veetla neer", "veetla thanneer", "veetle neer",
    "veetle thanneer", "veetla neer pugundhu",
    "veetla thanneer pugundhu",
    "maari", "maari peyyuthu", "maari adithu", "maari adikkuthu",
    "maari peyyuthu", "maari peyyudhu", "maari poidu",
    "peyyuthu", "peyuthu", "mazhai", "mazhai peyyuthu",
    "heavy maari", "peritha maari", "periya maari",
    "oda neer", "oda thanneer", "road la neer",
    "road la thanneer", "street la neer",
    "vella", "vella neer", "vella thanneer",
    "thanneer mela", "neer mela", "neer valikiradhu",
    "oottal", "oottal aayiduchu", "neer oottal",
    "moolam", "neer moolam", "thanneer moolam",
    "azhikkiradhu", "neer azhikkiradhu",
    "sumugam", "sumugam poidu", "sumugam aayiduchu",
    // Tamil Unicode
    "வெள்ளம்", "வெள்ளம் வந்தது", "மழை", "மழை பெய்யுது",
    "நீர்", "தண்ணீர்", "நீர் வருகிறது", "வெள்ளம் புகுந்தது",
    "தண்ணீர் வந்தது", "மழை வெள்ளம்", "நீர் புகுது",
    "வெள்ளம் புகுந்தது", "தண்ணீர் புகுந்தது",
  ],
  crime: [
    // English
    "thief", "robbery", "rob", "stolen", "murder", "stabbed",
    "shot", "gun", "weapon", "beaten up", "mugged", "burglary",
    "break in", "threatened", "kidnapped", "kidnap", "assault",
    "attacked", "gang", "fight", "danger", "intruder",
    // Tanglish / Colloquial Tamil
    "thirudan", "thirudar", "thirudatha", "thirudan vantha",
    "thirudan vanthutta", "thirudan poyitta", "thirudan irukku",
    "thiruditta", "thiruttha", "thirudi", "thirudi poidu",
    "kollai", "kollai adikkuthu", "kollai adikkiradhu",
    "kollai pidikkuthu", "kollai piditha", "kollai aayiduchu",
    "kollai poidu", "kollai vanthuchu",
    "attack", "attack pannuthu", "attack pannratha",
    "attack pannirukanga", "attack aayiduchu", "attack poidu",
    "adithu", "adithiruchu", "adichu", "adichirukanga",
    "thallu", "thalluthu", "thallatha", "thallu poidu",
    "kola", "kolai", "kolai seithaan", "kolai aayiduchu",
    "kolai poidu", "kolai seithu",
    "kai piditha", "kai pidithukondu", "kai pidithu poidu",
    "kai", "kaikittu", "kaikittu poidu", "kaiya",
    "pugai", "pugai pottu", "pugai aayiduchu",
    "kattai", "kattai adikkuthu", "kattai pottu",
    "vaal", "vaal adipu", "arakkal", "arakkal aayiduchu",
    "badhil", "badhil adikkuthu", "badhil aayiduchu",
    "thadukku", "thadukku aayiduchu",
    "police", "police vaangunga", "police kuppunga",
    // Tamil Unicode
    "திருடன்", "திருடிக்கொண்டான்", "கொள்ளை", "கொள்ளையடித்தான்",
    "தாக்குதல்", "கொலை", "திருடியது", "போலீஸ்",
    "கத்தி", "கத்தி அடி", "ஆயுதம்", "தாக்கினான்",
    "கொலை செய்தான்", "திருடி ஓடினான்", "பிடித்துச் சென்றான்",
  ],
  missing_person: [
    // English
    "missing", "lost", "lost child", "lost person", "cannot find",
    "nowhere", "disappeared", "gone missing", "not found",
    "ran away", "wandered off", "didn't come home", "haven't seen",
    // Tanglish / Colloquial Tamil
    "missing aagitta", "missing aagiduchu", "missing aagita",
    "missing poidu", "missing aayiduchu", "missing aayiruchu",
    "kayanthu", "kayanthu poidu", "kayanthu poiduchu",
    "kayanthu aayiduchu", "kayanthiruchu",
    "thedi", "thedi thedi", "thediya", "thedi poidu",
    "kidaiya", "kidaiyathu", "kidaiyathu",
    "kandupidikkavillai", "kandu pidikkavillai",
    "kandupadaam", "kandupada", "kandukondu illai",
    "kanippu illai", "kanipu illai", "kanippu",
    "illai", "illai illai", "kanam illai", "kanam",
    "kaiyil illai", "kaiyile illai",
    "magan illai", "magal illai", "payan illai",
    "ponnu illai", "pillai illai", "paapa illai",
    "paappu illai", "thai illai", "thanthai illai",
    "paiyan illai", "kuzhanthai illai", "kuzhanthai poidu",
    "baby illai", "baby missing",
    "veetla illai", "veetle illai", "veetil illai",
    "varalai", "vara villai", "varala", "varaamal",
    "poidu vanthu", "poidu", "poidu aayiduchu", "poidiruchu",
    "thedi thedi", "thedi poidu", "thedi thooki",
    "kanam aagala", "kanam poidu",
    // Tamil Unicode
    "காணவில்லை", "காணாமல்", "காணாமல் போனான்", "தெரியவில்லை",
    "காணாமல் போய்விட்டாள்", "தேடி", "கண்டுபிடிக்க முடியவில்லை",
    "போய்விட்டான்", "வரவில்லை", "குழந்தை இல்லை",
    "பையன் இல்லை", "பொண்ணு இல்லை", "வீட்டில் இல்லை",
  ],
};

// Critical keywords — these ALWAYS force HIGH severity when matched.
// Asking for ambulance, heart attack, not breathing, etc. = life-threatening.
const CRITICAL_KEYWORDS = [
  // Ambulance = someone needs urgent medical transport
  "ambulance", "ambulance venum", "ambulance anuppunga", "ambulance vaangunga",
  "ambulance anupunga", "ambulance kudu", "ambulance kudunga",
  "ஆம்புலன்ஸ்", "ஆம்புலன்ஸ் வேணும்", "ஆம்புலன்ஸ் அனுப்புங்க",
  // Life-threatening conditions
  "heart attack", "stroke", "not breathing", "unconscious", "collapsed",
  "bleeding heavily", "dying", "dead", "maranam", "maranam aayiduchu",
  "saadhanai", "saadhanai aayiduchu", "saadhanai poidu",
  "uyir poidu", "uyir poi", "uyir poganum", "uyir poguthu",
  "irandu", "irandhu poidu", "irandhiruchu",
  "mozhiyama", "mozhi illai", "peech illai", "speech illai",
  "mooschu varalai", "mooschu adikkalai", "breath varalai",
  "mayakki", "mayakkam", "manni poidu", "manni vilundhu",
  "heart vali", "irudhaya vali", "irudhaya attack",
  "ratham varuthu", "ratham udhiruthu", "udhiram varuthu",
  "உயிர் போகுது", "உயிர் போகும்", "இறந்து", "மரணம்",
  "மூச்சு விடமுடியவில்லை", "மயக்கம்", "ரத்தம் வருது",
  "இதயம்", "மார்பு வலி",
  // Fire trapped / explosion
  "people trapped", "trapped inside", "explosion", "exploded", "blast",
  // Crime — murder, kidnapping
  "murder", "kolai", "kolai seithaan", "kolai seithu", "kolai aayiduchu",
  "kidnap", "kidnapped", "kai pidithu", "kai pidithukondu",
  "stabbed", "shot", "gun", "weapon",
  // Drowning
  "drowning", "drowned", "muluguthu", "mulugi",
];

const SEVERE_KEYWORDS = [
  // Tamil/Tanglish urgency words
  "seekiram", "seekiram vaa", "seekiram ambulance",
  "udhavi", "udhavi vaa", "udhavi vaangunga", "udhavi pannunga",
  "udhavi vaaippu", "udhavi kudunga",
  "viraivil", "viraivil vaa", "viraivil udhavi", "viraivil ambulance",
  "viraivil vaango", "viraivil pannunga",
  "vaangu", "vaangunga", "vaango", "vaa", "vanga", "vaango",
  "save", "save me", "save pannunga", "saappu", "saappunga",
  "aazha", "aazha vaa", "aazhal", "aazha vaaippu",
  // English urgency words
  "urgent", "emergency", "immediately", "critical",
  "please come", "danger", "life threatening", "help",
  "help me", "please help", "come quickly", "fast",
  "right now", "as soon as possible",
  // Tamil Unicode urgency
  "உதவி", "விரைவில்", "விரைவாக", "காப்பாற்றுங்க", "விரைவு",
  "உதவி செய்யுங்க", "விரைவாக வாங்க",
  "அவசரம்", "அவசரமாக",
];

const NORMAL_KEYWORDS = [
  // Tamil/Tanglish normal words
  "sari", "sariya", "sarithaan", "sariya irukku", "sariya irukku",
  "nalla", "nallathu", "nalladhu", "nalla irukku", "nallaa irukku",
  "santhosham", "santhosama", "santhosama irukku",
  "theer", "theerntha", "theernthirukku", "theernthuduchu",
  "onnum illai", "onnum aagala", "onnum illa",
  "kavalaippadu", "kavala", "kavalaikku illai", "kavalai illai",
  "kavalai padaathinga", "kavalai illa",
  "saapta", "saappu", "saaptom", "saaptu", "saaptirukku",
  "aazh illai", "theernthuchu",
  "puri", "purithu", "puriyuthu",
  // English normal words
  "fine", "okay", "ok", "good", "alright", "no problem",
  "safe", "nothing wrong", "all good", "no emergency",
  "just checking", "everything is fine", "nothing happened",
  "no issue", "not a problem", "all well",
  // Tamil Unicode normal
  "சரி", "நல்ல", "கவலை இல்லை", "சந்தோஷம்", "ஒன்றும் இல்லை",
  "சரியா இருக்கு", "நல்லா இருக்கு", "கவலை இல்ல",
];

function normalizeText(text: string): string {
  return " " + text.toLowerCase().trim() + " ";
}

function countKeywordMatches(text: string, keywords: string[]): number {
  let count = 0;
  for (const kw of keywords) {
    const normalizedKw = kw.toLowerCase().trim();
    if (normalizedKw.length < 2) continue;
    if (text.includes(normalizedKw)) {
      count++;
    }
  }
  return count;
}

function detectDialect(text: string): string {
  const tamilUnicode = /[\u0B80-\u0BFF]/;
  if (tamilUnicode.test(text)) return "tamil";

  const tanglishPatterns = [
    "accident", "ambulance", "vali", "neruppu", "thee", "current", "shock",
    "thanneer", "neer", "maari", "thirudan", "kollai", "kayanthu",
    "marundhu", "ospital", "hospital", "vandi", "oseka", "thundhi",
    "vizhundhu", "erikkuthu", "valikkuthu", "adikkuthu", "peyyuthu",
    "udhavi", "seekiram", "viraivil", "aayiduchu", "aagiduchu",
    "poidu", "irukku", "seitha", "vanthu", "thedi", "missing",
    "sari", "nalla", "kaichal", "thalai", "irudhaya", "ratham",
    "aairuchu", "aayiruchu", "aagiruchu", "adichu", "pattu",
  ];
  let tanglishCount = 0;
  for (const pattern of tanglishPatterns) {
    if (text.includes(pattern)) tanglishCount++;
  }

  const englishPatterns = [
    "accident", "fire", "medical", "emergency", "help", "hospital",
    "ambulance", "flood", "crime", "thief", "robbery", "stolen",
    "missing", "lost", "electrocuted", "drowning", "bleeding",
    "unconscious", "stabbed", "shot", "collapsed", "choking",
    "stroke", "heart attack", "burning", "blaze", "submerged",
  ];
  let englishCount = 0;
  for (const pattern of englishPatterns) {
    if (text.includes(pattern)) englishCount++;
  }

  if (tanglishCount > 0 && tanglishCount >= englishCount) return "tanglish";
  if (englishCount > 0 && englishCount > tanglishCount) return "english";

  const colloquialPatterns = [
    "aayiduchu", "aayidchu", "poidu", "poiduchu", "irukku", "irukka",
    "adikkuthu", "valikkuthu", "erikkuthu", "peyyuthu", "aagiduchu",
    "aagitta", "aagidu", "seithaan", "seitha", "vanthutta", "vanthu",
    "aairuchu", "aayiruchu", "aagiruchu", "adichu", "pattu",
  ];
  for (const pattern of colloquialPatterns) {
    if (text.includes(pattern)) return "tanglish";
  }

  return "english";
}

function classify(text: string): ClassificationResult {
  const normalized = normalizeText(text);
  const dialect = detectDialect(normalized);

  let maxCategory = "normal";
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(EMERGENCY_KEYWORDS)) {
    const score = countKeywordMatches(normalized, keywords);
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category;
    }
  }

  const severeScore = countKeywordMatches(normalized, SEVERE_KEYWORDS);
  const normalScore = countKeywordMatches(normalized, NORMAL_KEYWORDS);
  const criticalScore = countKeywordMatches(normalized, CRITICAL_KEYWORDS);

  const emergencyScore = maxScore + severeScore * 0.5 + criticalScore;
  const isEmergency = emergencyScore > normalScore && maxScore > 0;

  let severity = "low";
  if (isEmergency) {
    // Critical keywords (ambulance, heart attack, not breathing, murder, etc.)
    // ALWAYS force HIGH severity — these are life-threatening situations.
    if (criticalScore >= 1) {
      severity = "high";
    } else if (severeScore >= 2 || (maxScore >= 3 && severeScore >= 1)) {
      severity = "high";
    } else if (severeScore >= 1 || maxScore >= 2) {
      severity = "medium";
    } else {
      severity = "low";
    }
  }

  const totalSignal = emergencyScore + normalScore;
  const confidence = totalSignal > 0
    ? Math.round((emergencyScore / totalSignal) * 100) / 100
    : 0.5;

  return {
    is_emergency: isEmergency,
    category: isEmergency ? maxCategory : "normal",
    severity: isEmergency ? severity : "low",
    confidence,
    dialect,
    latitude: null,
    longitude: null,
    location_name: null,
  };
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=en`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "EmergencyDetection/1.0" },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data && data.display_name) {
      const parts = data.display_name.split(",").slice(0, 3).join(", ");
      return parts;
    }
    return null;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text, latitude, longitude } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Text input is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = classify(text);

    let locationName: string | null = null;
    if (latitude != null && longitude != null) {
      result.latitude = latitude;
      result.longitude = longitude;
      locationName = await reverseGeocode(latitude, longitude);
      result.location_name = locationName;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await supabase
      .from("emergency_detections")
      .insert({
        original_text: text,
        dialect: result.dialect,
        is_emergency: result.is_emergency,
        category: result.category,
        severity: result.severity,
        confidence: result.confidence,
        latitude: latitude || null,
        longitude: longitude || null,
        location_name: locationName,
      });

    if (insertError) {
      console.error("Insert error:", insertError.message);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
