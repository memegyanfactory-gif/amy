import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Where the visitor studies. The landing page reads everything that differs by country from here:
 * class names, exams, boards, example wording and which set of student photos to show.
 *
 * Detection runs in the browser only (time zone first, then language), so nothing is sent anywhere
 * and there is no permission prompt. The visitor can change it, and the choice is remembered.
 */

/** Student photo sets in public/art: `<set>1..4.webp`, youngest to oldest. */
type PhotoSet = 'stage' | 'west' | 'sea' | 'af';

export interface Region {
  code: string;
  name: string;
  boards: string[];
  /** Four stages, youngest to oldest. */
  tags: [string, string, string, string];
  /** "Your AI tutor from <span>." */
  span: string;
  /** "From first sums to <end>." */
  end: string;
  all: string;
  junior: string;
  senior: string;
  math: 'Maths' | 'Math';
  photos: PhotoSet;
  third?: string;
  last?: string;
  examQs?: string[];
}

const SENIOR_QS = ['Explain integration by parts', 'How does a p-n junction work?', 'Quiz me on chemical bonding'];

export const REGIONS: Region[] = [
  {
    code: 'IN', name: 'India', boards: ['CBSE', 'ICSE', 'ISC', 'State Board', 'NIOS'],
    tags: ['Class 1 to 5', 'Class 6 to 8', 'Class 9 to 12', 'NEET'],
    span: 'Class 1 to Class 12 and NEET', end: 'NEET', all: 'Class 1 to 12', junior: 'Class 1 to 8', senior: 'Class 9 to 12 · NEET',
    math: 'Maths', photos: 'stage', third: 'The board exam years', last: 'Preparing for NEET',
    examQs: ['Quiz me on human physiology', 'Explain the Krebs cycle step by step', 'Make me a mock paper on genetics']
  },
  {
    code: 'US', name: 'United States', boards: ['US curriculum (Common Core)', 'AP', 'SAT / ACT prep'],
    tags: ['Grades K to 5', 'Grades 6 to 8', 'Grades 9 to 12', 'SAT / ACT'],
    span: 'Kindergarten to Grade 12, with SAT and ACT prep', end: 'the SAT', all: 'Grades K to 12', junior: 'Grades K to 8', senior: 'Grades 9 to 12 · AP',
    math: 'Math', photos: 'west', third: 'The high school years', last: 'Preparing for the SAT and ACT',
    examQs: ['Quiz me on SAT math', 'Explain integration by parts', 'Quiz me on chemical bonding']
  },
  {
    code: 'GB', name: 'United Kingdom', boards: ['National Curriculum (England)', 'GCSE', 'A-Level', 'Scottish Nationals / Highers'],
    tags: ['Years 1 to 6', 'Years 7 to 9', 'GCSE', 'A-Level'],
    span: 'Year 1 to A-Level', end: 'A-Level', all: 'Year 1 to A-Level', junior: 'Years 1 to 9', senior: 'GCSE · A-Level',
    math: 'Maths', photos: 'west', third: 'The GCSE years', last: 'The A-Level years'
  },
  {
    code: 'AU', name: 'Australia', boards: ['Australian Curriculum', 'HSC (NSW)', 'VCE (Victoria)', 'QCE (Queensland)', 'WACE (WA)'],
    tags: ['Foundation to Year 6', 'Years 7 to 8', 'Years 9 to 10', 'Years 11 to 12'],
    span: 'Foundation to Year 12', end: 'Year 12', all: 'Foundation to Year 12', junior: 'Foundation to Year 8', senior: 'Years 9 to 12',
    math: 'Maths', photos: 'west', last: 'The final school years'
  },
  {
    code: 'CA', name: 'Canada', boards: ['Ontario curriculum', 'BC curriculum', 'Alberta curriculum', 'Quebec curriculum'],
    tags: ['Grades 1 to 5', 'Grades 6 to 8', 'Grades 9 to 10', 'Grades 11 to 12'],
    span: 'Grade 1 to Grade 12', end: 'Grade 12', all: 'Grades 1 to 12', junior: 'Grades 1 to 8', senior: 'Grades 9 to 12',
    math: 'Math', photos: 'west', last: 'The final school years'
  },
  {
    code: 'SG', name: 'Singapore', boards: ['PSLE', 'O-Level (Singapore)', 'A-Level (Singapore)'],
    tags: ['Primary 1 to 6', 'Secondary 1 to 2', 'O-Level', 'A-Level'],
    span: 'Primary 1 to A-Level', end: 'A-Level', all: 'Primary 1 to A-Level', junior: 'Primary 1 to Secondary 2', senior: 'O-Level · A-Level',
    math: 'Maths', photos: 'sea', third: 'The O-Level years', last: 'The A-Level years'
  },
  {
    code: 'MY', name: 'Malaysia', boards: ['KSSM / SPM', 'STPM'],
    tags: ['Year 1 to 6', 'Form 1 to 3', 'SPM', 'STPM'],
    span: 'Year 1 to STPM', end: 'STPM', all: 'Year 1 to STPM', junior: 'Year 1 to Form 3', senior: 'SPM · STPM',
    math: 'Maths', photos: 'sea', third: 'The SPM years', last: 'The STPM years'
  },
  {
    code: 'PH', name: 'Philippines', boards: ['DepEd K to 12'],
    tags: ['Grades 1 to 6', 'Grades 7 to 8', 'Grades 9 to 10', 'Senior High'],
    span: 'Grade 1 to Senior High', end: 'Senior High', all: 'Grades 1 to 12', junior: 'Grades 1 to 8', senior: 'Grades 9 to 12',
    math: 'Math', photos: 'sea', last: 'The Senior High years'
  },
  {
    code: 'PK', name: 'Pakistan', boards: ['Matric (SSC)', 'Intermediate (FSc / HSSC)'],
    tags: ['Class 1 to 5', 'Class 6 to 8', 'Matric', 'Intermediate'],
    span: 'Class 1 to Intermediate', end: 'Intermediate', all: 'Class 1 to 12', junior: 'Class 1 to 8', senior: 'Matric · Intermediate',
    math: 'Maths', photos: 'stage', third: 'The Matric years', last: 'The Intermediate years'
  },
  {
    code: 'BD', name: 'Bangladesh', boards: ['SSC (Bangladesh)', 'HSC (Bangladesh)'],
    tags: ['Class 1 to 5', 'Class 6 to 8', 'SSC', 'HSC'],
    span: 'Class 1 to HSC', end: 'HSC', all: 'Class 1 to 12', junior: 'Class 1 to 8', senior: 'SSC · HSC',
    math: 'Maths', photos: 'stage', third: 'The SSC years', last: 'The HSC years'
  },
  {
    code: 'NP', name: 'Nepal', boards: ['SEE (Nepal)', 'NEB (+2)'],
    tags: ['Class 1 to 5', 'Class 6 to 8', 'SEE', 'NEB +2'],
    span: 'Class 1 to +2', end: '+2', all: 'Class 1 to 12', junior: 'Class 1 to 8', senior: 'SEE · NEB +2',
    math: 'Maths', photos: 'stage', third: 'The SEE years', last: 'The +2 years'
  },
  {
    code: 'LK', name: 'Sri Lanka', boards: ['O/L (Sri Lanka)', 'A/L (Sri Lanka)'],
    tags: ['Grades 1 to 5', 'Grades 6 to 9', 'O/L', 'A/L'],
    span: 'Grade 1 to A/L', end: 'A/L', all: 'Grades 1 to 13', junior: 'Grades 1 to 9', senior: 'O/L · A/L',
    math: 'Maths', photos: 'stage', third: 'The O/L years', last: 'The A/L years'
  },
  {
    code: 'NG', name: 'Nigeria', boards: ['WAEC (WASSCE)', 'NECO', 'JAMB (UTME) prep'],
    tags: ['Primary 1 to 6', 'JSS 1 to 3', 'WAEC / NECO', 'JAMB'],
    span: 'Primary 1 to SS3, with JAMB prep', end: 'JAMB', all: 'Primary 1 to SS3', junior: 'Primary 1 to JSS 3', senior: 'SS1 to SS3 · JAMB',
    math: 'Maths', photos: 'af', third: 'The WAEC and NECO years', last: 'Preparing for JAMB'
  },
  {
    code: 'KE', name: 'Kenya', boards: ['CBC (Kenya)', 'KCSE'],
    tags: ['Grades 1 to 6', 'Grades 7 to 9', 'Senior School', 'KCSE'],
    span: 'Grade 1 to KCSE', end: 'KCSE', all: 'Grade 1 to KCSE', junior: 'Grades 1 to 9', senior: 'Senior School · KCSE',
    math: 'Maths', photos: 'af', third: 'Senior School', last: 'Preparing for KCSE'
  },
  {
    code: 'ZA', name: 'South Africa', boards: ['CAPS (NSC)', 'IEB'],
    tags: ['Grades 1 to 6', 'Grades 7 to 9', 'Grades 10 to 11', 'Matric'],
    span: 'Grade 1 to Matric', end: 'Matric', all: 'Grades 1 to 12', junior: 'Grades 1 to 9', senior: 'Grades 10 to 12',
    math: 'Maths', photos: 'af', last: 'Preparing for Matric'
  },
  {
    code: 'INT', name: 'International school', boards: ['IB', 'IGCSE', 'Cambridge (O / AS / A Level)', 'American curriculum', 'British curriculum'],
    tags: ['Primary', 'Middle years', 'IGCSE', 'IB / A Level'],
    span: 'primary school to IB and A Level', end: 'the IB', all: 'Primary to IB', junior: 'Primary and middle years', senior: 'IGCSE · IB · A Level',
    math: 'Maths', photos: 'west', third: 'The IGCSE years', last: 'The IB and A Level years'
  }
];

const BY_CODE = new Map(REGIONS.map(r => [r.code, r]));
const FALLBACK = 'INT';

/** Example questions for the four stages of a region. */
export function stageQuestions(r: Region): string[][] {
  return [
    ['Why does ice float on water?', 'What makes a rainbow?', 'How do plants drink water?'],
    ['Solve 3x + 7 = 22 step by step', 'Why does the moon change shape?', 'What is photosynthesis?'],
    ['Explain Newton’s third law with an example', 'Quiz me on the mole concept', 'Prove the Pythagoras theorem'],
    r.examQs ?? SENIOR_QS
  ];
}

/** The photo for stage `n` (1 to 4) in this region. */
export const stagePhoto = (r: Region, n: number) => `${r.photos}${n}`;

/* ---------------- detection ---------------- */

const TZ: Record<string, string> = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Europe/London': 'GB', 'Europe/Belfast': 'GB',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD', 'Asia/Dacca': 'BD',
  'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP',
  'Asia/Colombo': 'LK',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Johannesburg': 'ZA',
  'Pacific/Honolulu': 'US'
};
const CA_ZONES = ['Toronto', 'Vancouver', 'Edmonton', 'Winnipeg', 'Halifax', 'St_Johns', 'Regina', 'Montreal', 'Moncton', 'Whitehorse', 'Yellowknife', 'Iqaluit', 'Glace_Bay', 'Goose_Bay', 'Thunder_Bay', 'Swift_Current', 'Dawson', 'Fort_Nelson', 'Rankin_Inlet', 'Resolute', 'Cambridge_Bay', 'Inuvik', 'Creston', 'Dawson_Creek', 'Atikokan', 'Blanc-Sablon', 'Nipigon', 'Rainy_River', 'Pangnirtung'];
const US_ZONES = ['New_York', 'Chicago', 'Denver', 'Los_Angeles', 'Phoenix', 'Anchorage', 'Detroit', 'Boise', 'Juneau', 'Sitka', 'Nome', 'Adak', 'Menominee', 'Metlakatla', 'Yakutat', 'Indianapolis', 'Louisville'];

function fromTimeZone(tz: string): string | null {
  if (TZ[tz]) return TZ[tz];
  if (tz.startsWith('Australia/')) return 'AU';
  if (tz.startsWith('America/')) {
    const city = tz.slice('America/'.length);
    if (CA_ZONES.includes(city)) return 'CA';
    if (US_ZONES.includes(city) || /^(Indiana|Kentucky|North_Dakota)\//.test(city)) return 'US';
  }
  return null;
}

function fromLanguages(langs: readonly string[]): string | null {
  for (const l of langs) {
    const cc = l.split('-').pop()?.toUpperCase();
    if (cc && cc.length === 2 && BY_CODE.has(cc)) return cc;
    if (cc === 'UK') return 'GB';
  }
  return null;
}

export type RegionSource = 'chosen' | 'detected' | 'default';

export function detectRegion(): { code: string; source: RegionSource } {
  // 1. ?country=US in the address, for sharing a link or testing
  try {
    const q = new URLSearchParams(location.search).get('country') ?? new URLSearchParams(location.hash.split('?')[1] ?? '').get('country');
    const code = q?.toUpperCase();
    if (code && BY_CODE.has(code)) return { code, source: 'chosen' };
  } catch {
    /* no address to read */
  }
  // 2. what this visitor picked last time
  try {
    const saved = localStorage.getItem('amy-country');
    if (saved && BY_CODE.has(saved)) return { code: saved, source: 'chosen' };
  } catch {
    /* storage blocked */
  }
  // 3. the device: time zone is the better signal, language the backup
  try {
    const tz = fromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone ?? '');
    if (tz) return { code: tz, source: 'detected' };
  } catch {
    /* no Intl */
  }
  const lang = fromLanguages(navigator.languages ?? [navigator.language]);
  if (lang) return { code: lang, source: 'detected' };
  return { code: FALLBACK, source: 'default' };
}

/* ---------------- context ---------------- */

interface RegionCtx {
  region: Region;
  source: RegionSource;
  setRegion: (code: string) => void;
}
const Ctx = createContext<RegionCtx>({ region: BY_CODE.get(FALLBACK)!, source: 'default', setRegion: () => {} });

export function RegionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(detectRegion);
  const value = useMemo<RegionCtx>(
    () => ({
      region: BY_CODE.get(state.code) ?? BY_CODE.get(FALLBACK)!,
      source: state.source,
      setRegion: code => {
        if (!BY_CODE.has(code)) return;
        try {
          localStorage.setItem('amy-country', code);
        } catch {
          /* storage blocked */
        }
        setState({ code, source: 'chosen' });
      }
    }),
    [state]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useRegion = () => useContext(Ctx);
