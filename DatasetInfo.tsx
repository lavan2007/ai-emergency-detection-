import { useState } from 'react';
import { Database, ChevronDown, ChevronUp, FileText, Brain, Tags, BarChart3, KeyRound, AlertTriangle, Zap, Heart } from 'lucide-react';

interface DatasetSample {
  text: string;
  dialect: string;
  emergency: string;
  category: string;
  severity: string;
}

const DATASET_SAMPLES: DatasetSample[] = [
  { text: 'Road la accident aayiduchu, seekiram ambulance anuppunga', dialect: 'Tanglish', emergency: 'YES', category: 'Accident', severity: 'High' },
  { text: 'Veetla neruppu erikkuthu, udhavi vaangunga', dialect: 'Tanglish', emergency: 'YES', category: 'Fire', severity: 'High' },
  { text: 'மார்பு வலி, விரைவில் ஆம்புலன்ஸ் அனுப்புங்க', dialect: 'Tamil', emergency: 'YES', category: 'Medical', severity: 'High' },
  { text: 'Current shock adikkuthu, udhavi vaa', dialect: 'Tanglish', emergency: 'YES', category: 'Electrical', severity: 'Medium' },
  { text: 'Maari peyyuthu, veetla thanneer pugundhuduchu', dialect: 'Tanglish', emergency: 'YES', category: 'Flood', severity: 'Medium' },
  { text: 'Thirudan vanthu kollai adikkuthu', dialect: 'Tanglish', emergency: 'YES', category: 'Crime', severity: 'Medium' },
  { text: 'My son is missing, cannot find him anywhere', dialect: 'English', emergency: 'YES', category: 'Missing Person', severity: 'High' },
  { text: 'Everything is fine, no problem here', dialect: 'English', emergency: 'NO', category: 'Normal', severity: 'Low' },
  { text: 'Sariya irukku, onnum illai', dialect: 'Tanglish', emergency: 'NO', category: 'Normal', severity: 'Low' },
  { text: 'Building on fire, people trapped inside', dialect: 'English', emergency: 'YES', category: 'Fire', severity: 'High' },
  { text: 'Accident aairuchu', dialect: 'Tanglish', emergency: 'YES', category: 'Accident', severity: 'Low' },
];

interface KeywordGroup {
  category: string;
  color: string;
  bgColor: string;
  keywords: string[];
}

const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    category: 'Accident',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    keywords: [
      'accident', 'crash', 'collision', 'knocked down', 'run over', 'road accident',
      'bike accident', 'car accident', 'hit and run', 'smashed', 'wrecked',
      'ottal', 'oseka', 'aairuchu', 'aayiruchu', 'aayiduchu', 'aagiduchu',
      'thundhi', 'thokki', 'mookku', 'vizhundhuchu', 'vizhundhu',
      'vandi ottu', 'vandi thundhiyudan', 'vandi mookku', 'vandi thokki',
      'bike thokki', 'bike oseka', 'car thokki', 'car oseka',
      'bump adikkuthu', 'thallu', 'thalluthu', 'adichu', 'adichiruchu',
      'pattu', 'pattiruchu', 'hit aayiduchu', 'oseka pottu',
      'விபத்து', 'வண்டி ஒட்டல்', 'வண்டி தட்டியது', 'விழுந்தது', 'மோதியது',
    ],
  },
  {
    category: 'Medical',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    keywords: [
      'ambulance', 'hospital', 'doctor', 'medical', 'bleeding', 'blood',
      'heart attack', 'stroke', 'unconscious', 'collapsed', 'choking',
      'severe pain', 'breathing problem', 'not breathing', 'sick', 'vomiting',
      'fainting', 'fainted', 'fever', 'injury', 'wound', 'fracture',
      'marundhu', 'maruthuva', 'ospital', 'vali', 'valikkuthu',
      'ratham', 'irudhaya', 'idhayam', 'madi', 'maaru', 'thalai vali',
      'kaichal', 'venthing', 'manni', 'mayakki', 'mayakkam',
      'mozhiyama', 'mooschu varalai', 'udhavi', 'temperature',
      'tablet', 'injection', 'maranam', 'uyir poidu',
      'மருத்துவம்', 'ஆஸ்பத்திரி', 'வலி', 'ரத்தம்', 'மார்பு',
      'தலைவலி', 'வாந்தி', 'மயக்கம்', 'ஜுரம்', 'காச்சல்', 'இருதயம்',
    ],
  },
  {
    category: 'Fire',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    keywords: [
      'fire', 'burning', 'burn', 'smoke', 'flames', 'blaze',
      'building fire', 'house fire', 'caught fire', 'on fire',
      'wildfire', 'explosion', 'exploded', 'blast',
      'neruppu', 'thee', 'thi', 'erikkuthu', 'erikkudhu',
      'villerikkuthu', 'veetla neruppu', 'pukai', 'pugai',
      'eri poidu', 'eri aayiduchu', 'burst aayiduchu',
      'தீ', 'நெருப்பு', 'புகை', 'எரிகிறது', 'எரியும்',
      'தீ வந்தது', 'எரிந்தது', 'வெடிப்பு',
    ],
  },
  {
    category: 'Electrical',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    keywords: [
      'electric', 'electricity', 'electrocuted', 'shock', 'power line',
      'live wire', 'transformer', 'short circuit', 'voltage', 'wire', 'spark',
      'biyaram', 'byaram', 'current', 'current adikkuthu', 'shock adikkuthu',
      'kodi', 'wire oda', 'short aayiduchu', 'mitha current',
      'current poidu', 'biyaram poidu', 'spark adikkuthu',
      'மின்சாரம்', 'கரண்ட்', 'ஷாக்', 'ஷாக் அடித்தது', 'மின்',
      'கரண்ட் அடிச்சது', 'கம்பி ஒடிந்தது',
    ],
  },
  {
    category: 'Flood',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    keywords: [
      'flood', 'flooding', 'flooded', 'heavy rain', 'water logging',
      'submerged', 'overflow', 'drowning', 'drowned', 'deluge',
      'tsunami', 'cyclone', 'storm', 'landslide',
      'thanneer', 'thanner', 'neer', 'maari', 'maari peyyuthu',
      'peyyuthu', 'mazhai', 'veetla neer', 'veetla thanneer',
      'neer pugundhuduchu', 'neer ozhuguthu', 'vella',
      'வெள்ளம்', 'மழை', 'நீர்', 'தண்ணீர்', 'வெள்ளம் வந்தது',
      'மழை பெய்யுது', 'தண்ணீர் வந்தது',
    ],
  },
  {
    category: 'Crime',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 border-slate-300',
    keywords: [
      'thief', 'robbery', 'rob', 'stolen', 'murder', 'stabbed',
      'shot', 'gun', 'weapon', 'beaten up', 'mugged', 'burglary',
      'break in', 'threatened', 'kidnapped', 'kidnap', 'assault',
      'thirudan', 'thirudatha', 'kollai', 'kollai adikkuthu',
      'attack', 'attack pannuthu', 'thallu', 'thalluthu',
      'kolai', 'kolai seithaan', 'kai piditha', 'pugai',
      'kattai', 'vaal', 'arakkal', 'police',
      'திருடன்', 'கொள்ளை', 'தாக்குதல்', 'கொலை', 'திருடியது',
      'போலீஸ்', 'கத்தி', 'ஆயுதம்',
    ],
  },
  {
    category: 'Missing Person',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    keywords: [
      'missing', 'lost', 'lost child', 'lost person', 'cannot find',
      'disappeared', 'gone missing', 'not found', 'ran away',
      'kayanthu', 'kayanthu poidu', 'thedi', 'kandupidikkavillai',
      'kandu pidikkavillai', 'kanippu illai', 'magan illai',
      'magal illai', 'pillai illai', 'paapa illai',
      'veetla illai', 'varalai', 'vara villai', 'poidu',
      'காணவில்லை', 'காணாமல்', 'தேடி', 'போய்விட்டான்',
      'வரவில்லை', 'குழந்தை இல்லை',
    ],
  },
];

const CRITICAL_KEYWORDS_DISPLAY = [
  'ambulance', 'ambulance venum', 'ambulance anuppunga', 'ambulance vaangunga',
  'heart attack', 'stroke', 'not breathing', 'unconscious', 'collapsed',
  'bleeding heavily', 'dying', 'dead', 'maranam', 'saadhanai',
  'uyir poidu', 'uyir poi', 'irandu', 'mozhiyama', 'mooschu varalai',
  'mayakki', 'manni poidu', 'irudhaya vali', 'ratham varuthu',
  'murder', 'kolai', 'kidnap', 'kidnapped', 'stabbed', 'shot', 'gun',
  'drowning', 'drowned', 'explosion', 'trapped',
  'ஆம்புலன்ஸ்', 'உயிர் போகுது', 'மரணம்', 'மூச்சு விடமுடியவில்லை',
  'மயக்கம்', 'ரத்தம் வருது', 'இதயம்', 'மார்பு வலி',
];

const SEVERITY_KEYWORDS_DISPLAY = [
  'seekiram', 'udhavi', 'viraivil', 'vaangu', 'vaangunga', 'vaango',
  'save', 'save me', 'saappu', 'saappunga',
  'aazha', 'aazha vaa',
  'urgent', 'emergency', 'immediately', 'critical',
  'please come', 'danger', 'life threatening', 'help', 'help me',
  'please help', 'come quickly', 'fast', 'right now',
  'உதவி', 'விரைவில்', 'விரைவாக', 'காப்பாற்றுங்க', 'அவசரம்',
];

const NORMAL_KEYWORDS_DISPLAY = [
  'sari', 'sariya', 'nalla', 'nallathu', 'santhosham',
  'theer', 'theerntha', 'onnum illai', 'kavala', 'kavalai illai',
  'saapta', 'fine', 'okay', 'ok', 'good', 'alright', 'no problem',
  'safe', 'nothing wrong', 'all good', 'no emergency',
  'சரி', 'நல்ல', 'கவலை இல்லை', 'சந்தோஷம்', 'ஒன்றும் இல்லை',
];

export function DatasetInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-800">Dataset & Training Information</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-6 border-t border-slate-100 px-6 py-6">
          {/* Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Dataset Format</p>
                <p className="mt-1 text-sm text-slate-500">
                  CSV file with 5 columns: <code className="rounded bg-slate-200 px-1 text-xs">text</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 text-xs">dialect</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 text-xs">emergency</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 text-xs">category</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 text-xs">severity</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <Brain className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700">NLP Approach</p>
                <p className="mt-1 text-sm text-slate-500">
                  TF-IDF-style keyword matching with Logistic Regression-like scoring.
                  Keywords are weighted across 7 emergency categories plus severity signals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <Tags className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Categories</p>
                <p className="mt-1 text-sm text-slate-500">
                  Accident, Medical, Fire, Electrical, Flood, Crime, Missing Person, Normal
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Severity Levels</p>
                <p className="mt-1 text-sm text-slate-500">
                  High (urgent/life-threatening), Medium (needs attention), Low (minor)
                </p>
              </div>
            </div>
          </div>

          {/* Dialects */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Supported Dialects</p>
            <div className="flex flex-wrap gap-2">
              {['Tamil (தமிழ்)', 'Tanglish (Tamil in English)', 'English', 'Colloquial Tamil'].map((d) => (
                <span key={d} className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">How Classification Works</p>
            <ol className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                <span>Input text is normalized (lowercased, trimmed) and dialect is detected based on Unicode Tamil characters and word patterns.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
                <span>Keyword matching counts hits across all 7 emergency categories (accident, medical, fire, electrical, flood, crime, missing person).</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">!</span>
                <span><strong>Critical keywords</strong> (ambulance, heart attack, not breathing, murder, drowning, etc.) ALWAYS force HIGH severity — these indicate life-threatening situations.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
                <span>Urgency keywords (seekiram, udhavi, help, etc.) are counted and combined with category scores to boost severity to Medium or High.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">4</span>
                <span>Emergency vs. normal is decided by comparing emergency score against normal-keyword score. The highest-scoring category wins.</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">5</span>
                <span>Confidence is calculated as emergency score divided by total signal (emergency + normal scores).</span>
              </li>
            </ol>
          </div>

          {/* Keyword dictionary */}
          <div>
            <button
              onClick={() => setShowKeywords((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">
                  Emergency Keyword Dictionary ({KEYWORD_GROUPS.reduce((acc, g) => acc + g.keywords.length, 0)} words)
                </span>
              </div>
              {showKeywords ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>

            {showKeywords && (
              <div className="mt-4 space-y-4">
                {KEYWORD_GROUPS.map((group) => (
                  <div key={group.category} className={`rounded-xl border p-4 ${group.bgColor}`}>
                    <p className={`mb-3 flex items-center gap-2 text-sm font-bold ${group.color}`}>
                      <AlertTriangle className="h-4 w-4" />
                      {group.category} ({group.keywords.length} keywords)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Critical keywords - always HIGH */}
                <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-bold text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Keywords — Always HIGH Severity ({CRITICAL_KEYWORDS_DISPLAY.length} words)
                  </p>
                  <p className="mb-3 text-xs text-red-600">
                    These keywords are life-threatening indicators. If any of these appear in your message, severity is automatically set to HIGH.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CRITICAL_KEYWORDS_DISPLAY.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md border-2 border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Severity keywords */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-700">
                    <Zap className="h-4 w-4" />
                    Urgency Keywords — Boost Severity ({SEVERITY_KEYWORDS_DISPLAY.length} words)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SEVERITY_KEYWORDS_DISPLAY.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-orange-200 bg-white px-2 py-1 text-xs text-orange-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Normal keywords */}
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-green-700">
                    <Heart className="h-4 w-4" />
                    Normal / Non-Emergency Keywords ({NORMAL_KEYWORDS_DISPLAY.length} words)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {NORMAL_KEYWORDS_DISPLAY.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-green-200 bg-white px-2 py-1 text-xs text-green-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sample dataset rows */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Sample Dataset Rows</p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 font-semibold">text</th>
                    <th className="px-3 py-2 font-semibold">dialect</th>
                    <th className="px-3 py-2 font-semibold">emergency</th>
                    <th className="px-3 py-2 font-semibold">category</th>
                    <th className="px-3 py-2 font-semibold">severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DATASET_SAMPLES.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="max-w-xs truncate px-3 py-2 text-slate-700">{row.text}</td>
                      <td className="px-3 py-2 text-slate-600">{row.dialect}</td>
                      <td className="px-3 py-2">
                        <span className={row.emergency === 'YES' ? 'font-semibold text-red-600' : 'font-semibold text-green-600'}>
                          {row.emergency}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{row.category}</td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            'rounded px-2 py-0.5 text-xs font-medium',
                            row.severity === 'High' && 'bg-red-100 text-red-700',
                            row.severity === 'Medium' && 'bg-orange-100 text-orange-700',
                            row.severity === 'Low' && 'bg-green-100 text-green-700',
                          ].filter(Boolean).join(' ')}
                        >
                          {row.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CSV template */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">CSV Template</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-300">
{`text,dialect,emergency,category,severity
"Road la accident aayiduchu",tanglish,yes,accident,high
"Veetla neruppu erikkuthu",tanglish,yes,fire,high
"மார்பு வலி வருது",tamil,yes,medical,high
"Everything is fine",english,no,normal,low
"Thirudan vanthuttaan",tanglish,yes,crime,medium`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
