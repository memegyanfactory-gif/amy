/**
 * Lessons Amy can teach in this preview. Each one has everything the lesson page uses:
 * the teaching in short parts with a question after each, slides, an infographic, a mind map,
 * practice questions, a "spot the mistake" problem, an "explain it back" check and the quiz.
 * A lesson is keyed by its concept name, as it appears in a course's chapters.
 */

export interface Q {
  q: string;
  options: string[];
  right: number;
  why: string;
}

export interface Part {
  /** What Amy says, one paragraph per entry. */
  text: string[];
  /** The board slide that draws this part, shown inline when Always draw is on. */
  slide: number;
  /** The question she asks after it. */
  ask: string;
  /** A numeric answer, checked within a small margin. */
  num?: number;
  /** Words that make a written answer right. */
  accept?: string[];
  /** Words that make it wrong even if an accepted word is in it (e.g. "non-uniform"). */
  reject?: string[];
  hint: string;
  answer: string;
  /** Open the table on the board with this part. */
  table?: boolean;
  /** The same idea, explained another way. */
  again: string;
}

export interface LessonContent {
  minutes: number;
  hello: string;
  parts: Part[];
  slides: { title: string; points: string[] }[];
  info: { title: string; summary: string; steps: { icon: string; title: string; text: string; tags: string[] }[]; remember: string };
  /** A table for the board's Table tab. One column can be highlighted. */
  table: { title: string; columns: string[]; rows: string[][]; highlight?: number; note?: string };
  map: { center: string; branches: { title: string; points: string[] }[] };
  practice: Q[];
  quiz: Q[];
  mistake: { problem: string; steps: string[]; wrong: number; why: string };
  explain: { prompt: string; points: { text: string; words: string[] }[] };
}

export const LESSONS: Record<string, LessonContent> = {
  /* ---------------------------------------------------------------- */
  'Acceleration: speeding up and slowing down': {
    minutes: 18,
    hello: 'Today we look at what happens when velocity changes: speeding up, slowing down, and why a ball thrown up stops for a moment at the top.',
    parts: [
      {
        text: ['A car pulling away, a bike braking, a ball thrown up: in each one the velocity is changing. Acceleration tells you how fast it changes.', 'a = (v − u) / t. Here u is the starting velocity, v the final velocity and t the time taken. The unit is metres per second squared, m/s².'],
        slide: 1,
        ask: 'A cycle goes from 2 m/s to 8 m/s in 3 seconds. What is its acceleration, in m/s²?',
        num: 2,
        hint: 'The change in velocity is 8 − 2. Now divide that by the time.',
        answer: 'a = (8 − 2) / 3 = 2 m/s².',
        again: 'Think of a speedometer. If the needle climbs by 2 every second, the acceleration is 2 m/s². Here it climbs from 2 to 8, which is 6, over 3 seconds: 6 ÷ 3.'
      },
      {
        text: ['When something slows down, v is smaller than u, so v − u is negative. A negative acceleration is called retardation, or deceleration.', 'A ball thrown up loses about 9.8 m/s of speed every second. It stops for an instant at the top, then speeds up on the way down.'],
        slide: 2,
        ask: 'A bus moving at 20 m/s brakes and stops in 5 s. What is its acceleration, in m/s²?',
        num: -4,
        hint: 'It stops, so the final velocity is 0. That makes v − u = 0 − 20.',
        answer: 'a = (0 − 20) / 5 = −4 m/s². The minus sign says it is slowing down.',
        again: 'Slowing down is just acceleration pointing against the motion. Losing 20 m/s over 5 seconds means losing 4 m/s every second, so −4 m/s².'
      },
      {
        text: ['Uniform acceleration means the velocity changes by the same amount every second, like a stone falling freely. Non-uniform acceleration changes unevenly, like a car in traffic.'],
        slide: 3,
        table: true,
        ask: "A falling stone's velocity is 0, 9.8, 19.6 and 29.4 m/s after each second. Is its acceleration uniform or non-uniform?",
        accept: ['uniform'],
        reject: ['non', 'not uniform'],
        hint: 'Is the jump from one second to the next always the same?',
        answer: 'Uniform. It gains exactly 9.8 m/s every second.',
        again: 'Subtract each value from the next: 9.8, 9.8, 9.8. The change never varies, and that is what uniform means.'
      }
    ],
    slides: [
      { title: 'Velocity can change', points: ['Speeding up, slowing down or turning all change velocity.', 'Acceleration measures how quickly that happens.'] },
      { title: 'The formula', points: ['a = (v − u) / t', 'u: starting velocity, v: final velocity, t: time', 'Unit: m/s²'] },
      { title: 'Slowing down', points: ['If v < u, acceleration is negative.', 'This is called retardation or deceleration.'] },
      { title: 'Uniform or not', points: ['Uniform: same change every second, like free fall.', 'Non-uniform: uneven change, like a car in traffic.'] },
      { title: 'The ball thrown up', points: ['Loses 9.8 m/s every second on the way up.', 'v = 0 for an instant at the top.', 'Gains 9.8 m/s every second on the way down.'] }
    ],
    info: {
      title: 'Acceleration',
      summary: 'How fast velocity changes, and in which direction.',
      steps: [
        { icon: 'speed', title: 'Notice the change', text: 'Velocity is changing whenever something speeds up, slows down or turns.', tags: ['Speed up', 'Slow down'] },
        { icon: 'formula', title: 'Measure it', text: 'Subtract the starting velocity from the final velocity, then divide by the time.', tags: ['a = (v − u) / t', 'm/s²'] },
        { icon: 'sign', title: 'Read the sign', text: 'Positive means speeding up along the motion. Negative means slowing down.', tags: ['Retardation', 'Deceleration'] },
        { icon: 'chart', title: 'Check if it is steady', text: 'If the change is the same every second, the acceleration is uniform.', tags: ['Uniform', 'Non-uniform'] }
      ],
      remember: 'Acceleration is the change in velocity divided by the time it took: a = (v − u) / t.'
    },
    table: {
      title: 'A stone falling freely',
      columns: ['Time (s)', 'Velocity (m/s)', 'Change this second (m/s)'],
      rows: [['0', '0', '—'], ['1', '9.8', '+9.8'], ['2', '19.6', '+9.8'], ['3', '29.4', '+9.8'], ['4', '39.2', '+9.8']],
      highlight: 2,
      note: 'The change is the same every second, so the acceleration is uniform: 9.8 m/s².'
    },
    map: {
      center: 'Acceleration',
      branches: [
        { title: 'Meaning', points: ['Rate of change of velocity', 'A vector: it has a direction'] },
        { title: 'Formula', points: ['a = (v − u) / t', 'Unit m/s²'] },
        { title: 'Negative', points: ['v smaller than u', 'Called retardation', 'Brakes, a ball going up'] },
        { title: 'Kinds', points: ['Uniform: free fall', 'Non-uniform: traffic'] }
      ]
    },
    practice: [
      { q: 'What is the SI unit of acceleration?', options: ['m/s', 'm/s²', 'm²/s', 'km/h'], right: 1, why: 'Velocity (m/s) divided by time (s) gives m/s².' },
      { q: 'A car goes from 0 to 20 m/s in 4 s. Its acceleration is', options: ['4 m/s²', '5 m/s²', '20 m/s²', '80 m/s²'], right: 1, why: '(20 − 0) / 4 = 5 m/s².' },
      { q: 'A negative acceleration means the object is', options: ['Speeding up', 'At rest', 'Slowing down', 'Moving in a circle'], right: 2, why: 'v is less than u, so it is losing velocity.' },
      { q: 'A freely falling stone has', options: ['Uniform acceleration', 'Non-uniform acceleration', 'No acceleration', 'Negative speed'], right: 0, why: 'It gains 9.8 m/s every second.' }
    ],
    quiz: [
      { q: 'Acceleration is the rate of change of', options: ['Distance', 'Displacement', 'Velocity', 'Mass'], right: 2, why: 'It measures how fast velocity changes.' },
      { q: 'In a = (v − u) / t, u stands for', options: ['Final velocity', 'Initial velocity', 'Time', 'Distance'], right: 1, why: 'u is the velocity at the start.' },
      { q: 'A train goes from 10 m/s to 25 m/s in 5 s. Its acceleration is', options: ['2 m/s²', '3 m/s²', '5 m/s²', '7 m/s²'], right: 1, why: '(25 − 10) / 5 = 3 m/s².' },
      { q: 'A scooter at 15 m/s stops in 3 s. Its acceleration is', options: ['5 m/s²', '−5 m/s²', '45 m/s²', '−45 m/s²'], right: 1, why: '(0 − 15) / 3 = −5 m/s².' },
      { q: 'At the very top of its path, a ball thrown straight up has a velocity of', options: ['9.8 m/s', 'Zero', 'Its starting velocity', 'It keeps rising forever'], right: 1, why: 'It stops for an instant before falling back.' },
      { q: 'A car in city traffic most likely has', options: ['Uniform acceleration', 'Non-uniform acceleration', 'Zero acceleration all the time', 'Only negative acceleration'], right: 1, why: 'Its velocity changes unevenly.' },
      { q: 'An object moves at a constant 12 m/s in a straight line. Its acceleration is', options: ['12 m/s²', '1 m/s²', '0 m/s²', '−12 m/s²'], right: 2, why: 'Its velocity does not change, so a = 0.' }
    ],
    mistake: { problem: 'A car speeds up from 10 m/s to 30 m/s in 4 s. Find its acceleration.', steps: ['Write the formula: a = (v − u) / t', 'Put in the values: a = (10 − 30) / 4', 'Work it out: a = −20 / 4', 'So a = −5 m/s²'], wrong: 1, why: 'u is the starting velocity (10) and v is the final one (30), so it should be (30 − 10) / 4 = 5 m/s². A car that is speeding up cannot have a negative acceleration.' },
    explain: {
      prompt: 'In your own words, what is acceleration and how do you work it out?',
      points: [
        { text: 'It is how fast velocity changes', words: ['velocity', 'speed'] },
        { text: 'a = (v − u) / t, change in velocity over time', words: ['v - u', 'v−u', 'v-u', 'divide', 'over time', '/t', '/ t', 'per second'] },
        { text: 'The unit is m/s²', words: ['m/s2', 'm/s²', 'metre', 'meter', 'squared'] },
        { text: 'Negative acceleration means slowing down', words: ['negative', 'slow', 'retard', 'decelerat', 'minus'] }
      ]
    }
  },

  /* ---------------------------------------------------------------- */
  'Atomic mass': {
    minutes: 15,
    hello: 'Today we find out how chemists weigh things that are far too small to put on any scale: atoms and molecules.',
    parts: [
      {
        text: ['A single hydrogen atom weighs about 1.7 × 10⁻²⁴ g. Numbers that tiny are hard to use, so chemists compare atoms with a standard instead.', 'The standard is one twelfth of the mass of a carbon-12 atom. That amount is called 1 atomic mass unit, written 1 u.'],
        slide: 1,
        ask: 'Which atom is used as the standard for 1 u? Give the element and its mass number.',
        accept: ['carbon-12', 'carbon 12', 'carbon12', 'c-12', 'c12', 'c 12'],
        hint: 'It is a kind of carbon atom, with mass number 12.',
        answer: 'Carbon-12. 1 u is one twelfth of the mass of a carbon-12 atom.',
        again: 'Picture a scale that counts in "carbon twelfths". Chemists take one carbon-12 atom, imagine it cut into 12 equal parts, and call each part 1 u. Every other atom is measured in those parts.'
      },
      {
        text: ['Molecular mass is the sum of the atomic masses of every atom in a molecule.', 'Water, H₂O, has two hydrogen atoms at 1 u each and one oxygen atom at 16 u: 2 × 1 + 16 = 18 u.'],
        slide: 3,
        table: true,
        ask: 'Find the molecular mass of carbon dioxide, CO₂. (C = 12 u, O = 16 u)',
        num: 44,
        hint: 'One carbon and two oxygens: 12 + 2 × 16.',
        answer: '12 + 2 × 16 = 44 u.',
        again: 'Read the formula like a shopping list. CO₂ means one C and two O. Price each one with its atomic mass and add the bill: 12 + 16 + 16.'
      },
      {
        text: ['Ionic compounds such as sodium chloride are not made of separate molecules. For them we use the formula unit mass. You work it out in exactly the same way.', 'NaCl: 23 + 35.5 = 58.5 u.'],
        slide: 4,
        ask: 'Find the formula unit mass of calcium chloride, CaCl₂. (Ca = 40 u, Cl = 35.5 u)',
        num: 111,
        hint: 'One calcium and two chlorines: 40 + 2 × 35.5.',
        answer: '40 + 2 × 35.5 = 40 + 71 = 111 u.',
        again: 'Same shopping list idea: one Ca at 40 and two Cl at 35.5 each. Two chlorines make 71, and 40 + 71 = 111.'
      }
    ],
    slides: [
      { title: 'Atoms are tiny', points: ['A hydrogen atom: about 1.7 × 10⁻²⁴ g.', 'Grams are no use at this scale.'] },
      { title: 'The standard', points: ['1 u = 1/12 of the mass of a carbon-12 atom.', 'Every atom is compared with it.'] },
      { title: 'Some atomic masses', points: ['H = 1 u, C = 12 u, N = 14 u', 'O = 16 u, Na = 23 u, Cl = 35.5 u'] },
      { title: 'Molecular mass', points: ['Add the masses of all atoms in a molecule.', 'H₂O = 2 × 1 + 16 = 18 u'] },
      { title: 'Formula unit mass', points: ['For ionic compounds like NaCl.', 'Worked out the same way: 23 + 35.5 = 58.5 u'] }
    ],
    info: {
      title: 'Atomic and molecular mass',
      summary: 'Weighing particles by comparing them with carbon-12.',
      steps: [
        { icon: 'atom', title: 'Pick a standard', text: 'One twelfth of a carbon-12 atom is 1 atomic mass unit.', tags: ['1 u', 'Carbon-12'] },
        { icon: 'scale', title: 'Look up atomic masses', text: 'Each element has an atomic mass in u, such as O = 16 u.', tags: ['H = 1', 'O = 16'] },
        { icon: 'count', title: 'Count the atoms', text: 'Read the formula to see how many of each atom there are.', tags: ['H₂O', '2 H, 1 O'] },
        { icon: 'add', title: 'Add them up', text: 'Multiply and add to get the molecular or formula unit mass.', tags: ['18 u', '58.5 u'] }
      ],
      remember: 'Molecular mass is the sum of the atomic masses of all the atoms in the formula.'
    },
    table: {
      title: 'Atomic masses to remember',
      columns: ['Element', 'Symbol', 'Atomic mass (u)', 'Used in'],
      rows: [['Hydrogen', 'H', '1', 'H₂O, NH₃, CH₄'], ['Carbon', 'C', '12', 'CO₂, CH₄'], ['Nitrogen', 'N', '14', 'NH₃'], ['Oxygen', 'O', '16', 'H₂O, CO₂'], ['Sodium', 'Na', '23', 'NaCl'], ['Sulphur', 'S', '32', 'H₂SO₄'], ['Chlorine', 'Cl', '35.5', 'NaCl, CaCl₂'], ['Calcium', 'Ca', '40', 'CaCl₂']],
      highlight: 2,
      note: 'Molecular mass = add the atomic mass of every atom in the formula.'
    },
    map: {
      center: 'Atomic mass',
      branches: [
        { title: 'Standard', points: ['Carbon-12', '1 u = 1/12 of its mass'] },
        { title: 'Atomic mass', points: ['Mass of one atom in u', 'O = 16 u, Na = 23 u'] },
        { title: 'Molecular mass', points: ['Sum over all atoms', 'H₂O = 18 u, CO₂ = 44 u'] },
        { title: 'Formula unit mass', points: ['For ionic compounds', 'NaCl = 58.5 u'] }
      ]
    },
    practice: [
      { q: '1 atomic mass unit is defined using', options: ['Hydrogen-1', 'Oxygen-16', 'Carbon-12', 'Nitrogen-14'], right: 2, why: '1 u is one twelfth of the mass of a carbon-12 atom.' },
      { q: 'The molecular mass of H₂O is', options: ['17 u', '18 u', '16 u', '20 u'], right: 1, why: '2 × 1 + 16 = 18 u.' },
      { q: 'For sodium chloride we talk about its', options: ['Molecular mass', 'Formula unit mass', 'Atomic number', 'Valency'], right: 1, why: 'It is ionic, so it has formula units, not molecules.' },
      { q: 'The molecular mass of NH₃ (N = 14, H = 1) is', options: ['15 u', '16 u', '17 u', '18 u'], right: 2, why: '14 + 3 × 1 = 17 u.' }
    ],
    quiz: [
      { q: 'Atomic masses are measured in', options: ['grams', 'u', 'moles', 'litres'], right: 1, why: 'Atomic mass unit, u.' },
      { q: 'One atomic mass unit equals', options: ['The mass of one hydrogen atom', '1/12 of the mass of a carbon-12 atom', '1/16 of an oxygen atom', '1 gram'], right: 1, why: 'Carbon-12 is the standard.' },
      { q: 'The molecular mass of O₂ is', options: ['16 u', '32 u', '8 u', '64 u'], right: 1, why: '2 × 16 = 32 u.' },
      { q: 'The molecular mass of CO₂ is', options: ['28 u', '40 u', '44 u', '56 u'], right: 2, why: '12 + 2 × 16 = 44 u.' },
      { q: 'The formula unit mass of NaCl (Na = 23, Cl = 35.5) is', options: ['58.5 u', '58 u', '23 u', '35.5 u'], right: 0, why: '23 + 35.5 = 58.5 u.' },
      { q: 'The molecular mass of CH₄ (C = 12, H = 1) is', options: ['13 u', '14 u', '16 u', '18 u'], right: 2, why: '12 + 4 × 1 = 16 u.' },
      { q: 'The formula unit mass of CaCl₂ (Ca = 40, Cl = 35.5) is', options: ['75.5 u', '111 u', '115 u', '95.5 u'], right: 1, why: '40 + 2 × 35.5 = 111 u.' }
    ],
    mistake: { problem: 'Find the molecular mass of H₂SO₄. (H = 1 u, S = 32 u, O = 16 u)', steps: ['H₂SO₄ has 2 H, 1 S and 4 O atoms', 'Hydrogen: 2 × 1 = 2 u', 'Sulphur: 1 × 32 = 32 u', 'Oxygen: 4 × 16 = 48 u', 'Total: 2 + 32 + 48 = 82 u'], wrong: 3, why: '4 × 16 is 64, not 48. With the right oxygen mass the total is 2 + 32 + 64 = 98 u.' },
    explain: {
      prompt: 'In your own words, how do you find the molecular mass of a compound?',
      points: [
        { text: 'Atomic masses are compared with carbon-12', words: ['carbon', 'c-12', 'c12', 'twelfth', '1/12'] },
        { text: 'Masses are measured in u', words: [' u ', 'u.', 'atomic mass unit', 'amu'] },
        { text: 'Count each atom in the formula', words: ['count', 'number of', 'how many', 'each atom', 'subscript'] },
        { text: 'Add the atomic masses together', words: ['add', 'sum', 'total', 'plus'] }
      ]
    }
  },

  /* ---------------------------------------------------------------- */
  'Plant and animal cells': {
    minutes: 15,
    hello: 'Today we put a plant cell and an animal cell side by side and find out what they share, and what only plants have.',
    parts: [
      {
        text: ['Plant and animal cells share the basics: a cell membrane around the outside, cytoplasm inside, a nucleus in control, and mitochondria for energy.', 'But a plant has to make its own food and stand upright without a skeleton, so its cells need a few extra parts.'],
        slide: 0,
        ask: 'Name one part that both plant and animal cells have.',
        accept: ['nucleus', 'membrane', 'cytoplasm', 'mitochondri', 'ribosome', 'golgi', 'endoplasmic'],
        hint: 'Think of the part that controls the cell.',
        answer: 'The nucleus. The cell membrane, cytoplasm and mitochondria are in both as well.',
        again: 'Think of both cells as houses. Both have walls of skin (the membrane), rooms full of stuff (the cytoplasm), a head office (the nucleus) and a power plant (the mitochondria).'
      },
      {
        text: ['Outside its membrane, a plant cell has a stiff cell wall made of cellulose. That gives it a firm, box-like shape.', 'Plant cells in leaves also have chloroplasts. They hold the green pigment chlorophyll and make food by photosynthesis.'],
        slide: 2,
        ask: 'Which part makes food in a plant cell?',
        accept: ['chloroplast'],
        hint: 'It is green, and it holds chlorophyll.',
        answer: 'Chloroplasts.',
        again: 'Animals eat their food; plants cook it. The kitchen in a plant cell is the chloroplast, and it uses sunlight as the stove.'
      },
      {
        text: ['A plant cell usually has one large central vacuole full of cell sap, which keeps the cell firm. Animal cells have small vacuoles, or none at all.', 'Animal cells have centrioles, which help when the cell divides. Most plant cells do not.'],
        slide: 3,
        table: true,
        ask: 'Which cell has one large central vacuole, plant or animal?',
        accept: ['plant'],
        reject: ['animal'],
        hint: 'Think of the cell that needs to stay firm and upright.',
        answer: 'The plant cell.',
        again: 'The big vacuole works like a water balloon inside the cell. Pumped full, it pushes outwards and keeps the plant crisp. That is why a plant wilts when it is short of water.'
      }
    ],
    slides: [
      { title: 'What they share', points: ['Cell membrane, cytoplasm, nucleus', 'Mitochondria, ribosomes, Golgi'] },
      { title: 'Cell wall', points: ['Plants only, made of cellulose.', 'Gives a fixed, box-like shape.'] },
      { title: 'Chloroplasts', points: ['Plants only, hold chlorophyll.', 'Make food by photosynthesis.'] },
      { title: 'Vacuoles', points: ['Plant: one large central vacuole.', 'Animal: small or none.'] },
      { title: 'Centrioles', points: ['Animal cells have them.', 'They help in cell division.'] }
    ],
    info: {
      title: 'Plant and animal cells',
      summary: 'The same basic plan, with a few extras for plants.',
      steps: [
        { icon: 'cells', title: 'Shared parts', text: 'Both have a membrane, cytoplasm, a nucleus and mitochondria.', tags: ['Nucleus', 'Mitochondria'] },
        { icon: 'shield', title: 'Cell wall', text: 'Only plant cells have a stiff cellulose wall outside the membrane.', tags: ['Cellulose', 'Fixed shape'] },
        { icon: 'leaf', title: 'Chloroplasts', text: 'Only plant cells have chloroplasts, where food is made.', tags: ['Chlorophyll', 'Photosynthesis'] },
        { icon: 'drop', title: 'Vacuoles and centrioles', text: 'Plants have one big vacuole; animal cells have centrioles.', tags: ['Cell sap', 'Cell division'] }
      ],
      remember: 'Cell wall, chloroplasts and a large vacuole: plant. Centrioles and small vacuoles: animal.'
    },
    table: {
      title: 'Plant cell or animal cell?',
      columns: ['Part', 'Plant cell', 'Animal cell'],
      rows: [['Cell membrane', 'Yes', 'Yes'], ['Nucleus', 'Yes', 'Yes'], ['Mitochondria', 'Yes', 'Yes'], ['Cell wall', 'Yes, cellulose', 'No'], ['Chloroplasts', 'Yes', 'No'], ['Vacuole', 'One large, central', 'Small or none'], ['Centrioles', 'Usually no', 'Yes'], ['Shape', 'Fixed, box-like', 'Rounded, varies']],
      note: 'Cell wall, chloroplasts and one big vacuole: plant. Centrioles: animal.'
    },
    map: {
      center: 'Plant vs animal cell',
      branches: [
        { title: 'Both have', points: ['Membrane and cytoplasm', 'Nucleus and mitochondria'] },
        { title: 'Plant only', points: ['Cellulose cell wall', 'Chloroplasts'] },
        { title: 'Vacuole', points: ['Plant: one large', 'Animal: small or none'] },
        { title: 'Animal only', points: ['Centrioles', 'No fixed shape'] }
      ]
    },
    practice: [
      { q: 'Which part is found only in plant cells?', options: ['Nucleus', 'Cell wall', 'Mitochondria', 'Cell membrane'], right: 1, why: 'Animal cells have no cell wall.' },
      { q: 'Chloroplasts contain', options: ['Haemoglobin', 'Chlorophyll', 'Cellulose', 'DNA only'], right: 1, why: 'Chlorophyll traps sunlight for photosynthesis.' },
      { q: 'The plant cell wall is made of', options: ['Protein', 'Cellulose', 'Fat', 'Starch'], right: 1, why: 'Cellulose is a tough carbohydrate.' },
      { q: 'Centrioles are found in', options: ['Plant cells', 'Animal cells', 'Both equally', 'Neither'], right: 1, why: 'They help animal cells divide.' }
    ],
    quiz: [
      { q: 'Both plant and animal cells have a', options: ['Cell wall', 'Chloroplast', 'Nucleus', 'Large central vacuole'], right: 2, why: 'The nucleus is in both.' },
      { q: 'Photosynthesis takes place in the', options: ['Mitochondria', 'Chloroplasts', 'Nucleus', 'Vacuole'], right: 1, why: 'Chloroplasts make food.' },
      { q: 'Which gives a plant cell its fixed shape?', options: ['Cell membrane', 'Cell wall', 'Cytoplasm', 'Nucleus'], right: 1, why: 'The stiff cellulose wall.' },
      { q: 'A large central vacuole is typical of', options: ['Animal cells', 'Plant cells', 'Bacteria only', 'All cells'], right: 1, why: 'It stores cell sap and keeps the plant firm.' },
      { q: 'Centrioles help in', options: ['Making food', 'Cell division', 'Storing water', 'Releasing energy'], right: 1, why: 'They organise the cell as it divides.' },
      { q: 'The powerhouse of both kinds of cell is the', options: ['Nucleus', 'Mitochondria', 'Golgi body', 'Chloroplast'], right: 1, why: 'Mitochondria release energy from food.' },
      { q: 'A plant wilts when short of water because its', options: ['Cell walls dissolve', 'Vacuoles lose sap and shrink', 'Chloroplasts stop working', 'Nucleus breaks down'], right: 1, why: 'Without water the vacuoles shrink and the cells go limp.' }
    ],
    mistake: { problem: 'List three differences between plant and animal cells.', steps: ['Plant cells have a cell wall; animal cells do not.', 'Plant cells have chloroplasts; animal cells do not.', 'Animal cells have one large central vacuole; plant cells have small ones.', 'Animal cells have centrioles; most plant cells do not.'], wrong: 2, why: 'It is the other way round. Plant cells have one large central vacuole, and animal cells have small vacuoles or none.' },
    explain: {
      prompt: 'In your own words, how is a plant cell different from an animal cell?',
      points: [
        { text: 'Plant cells have a cell wall', words: ['wall', 'cellulose'] },
        { text: 'Plant cells have chloroplasts', words: ['chloroplast', 'chlorophyll', 'photosynth'] },
        { text: 'Plant cells have a large vacuole', words: ['vacuole', 'sap'] },
        { text: 'Animal cells have centrioles', words: ['centriole'] }
      ]
    }
  },

  /* ---------------------------------------------------------------- */
  'Word problems': {
    minutes: 15,
    hello: 'Today we turn everyday sentences into equations with two unknowns, then find answers that fit.',
    parts: [
      {
        text: ['Every word problem hides an equation. First give each unknown a letter, say x and y. Then turn the words into maths, phrase by phrase.', 'A pen costs ₹x and a pencil ₹y. "A pen and two pencils cost ₹27" becomes x + 2y = 27.'],
        slide: 1,
        table: true,
        ask: 'A notebook costs ₹x and a pen ₹y. Two notebooks and three pens cost ₹60. Write the equation.',
        accept: ['2x+3y=60', '3y+2x=60', '60=2x+3y'],
        hint: 'Two notebooks is 2x. Three pens is 3y. Together they make 60.',
        answer: '2x + 3y = 60.',
        again: 'Read it like a bill: 2 notebooks at x each is 2x, 3 pens at y each is 3y. The bill totals 60, so 2x + 3y = 60.'
      },
      {
        text: ['An equation in two variables has many solutions, not just one. To find one, choose a value for one letter and work out the other.', 'In x + 2y = 27, if x = 7, then 2y = 20, so y = 10. The pair (7, 10) is a solution.'],
        slide: 2,
        ask: 'In 2x + 3y = 60, if x = 15, what is y?',
        num: 10,
        hint: '2 × 15 = 30, so 3y = 60 − 30.',
        answer: '2 × 15 = 30, so 3y = 30 and y = 10.',
        again: 'Put 15 where x is: 2 × 15 + 3y = 60, which is 30 + 3y = 60. Take 30 from both sides to get 3y = 30, then divide by 3.'
      },
      {
        text: ['To check a solution, put both values back into the equation. If the two sides match, it works.', 'Every solution is a point on the line of the equation. That is why its graph is a straight line.'],
        slide: 4,
        ask: 'Is x = 3, y = 18 a solution of 2x + 3y = 60? Answer yes or no.',
        accept: ['yes'],
        reject: ['no', 'not'],
        hint: 'Work out 2 × 3 + 3 × 18 and compare it with 60.',
        answer: 'Yes. 2 × 3 + 3 × 18 = 6 + 54 = 60.',
        again: 'Swap the letters for the numbers: 2 × 3 is 6 and 3 × 18 is 54. Add them: 60. Both sides match, so it is a solution.'
      }
    ],
    slides: [
      { title: 'Words hide an equation', points: ['Give each unknown a letter.', 'Turn each phrase into maths.'] },
      { title: 'Words into maths', points: ['"a pen and two pencils" → x + 2y', '"cost ₹27" → = 27'] },
      { title: 'Many solutions', points: ['Pick a value for x.', 'Work out y from the equation.'] },
      { title: 'An example', points: ['x + 2y = 27, x = 7', '2y = 20, so y = 10'] },
      { title: 'Check it', points: ['Put both values back in.', 'Both sides match? It is a solution.', 'Each solution is a point on a straight line.'] }
    ],
    info: {
      title: 'Solving word problems',
      summary: 'From a sentence to an equation to answers that fit.',
      steps: [
        { icon: 'text', title: 'Read and name', text: 'Pick a letter for each unknown, such as x for a pen and y for a pencil.', tags: ['x', 'y'] },
        { icon: 'formula', title: 'Translate', text: 'Turn each phrase into maths and join them into one equation.', tags: ['x + 2y = 27'] },
        { icon: 'calc', title: 'Find a solution', text: 'Choose a value for one letter and work out the other.', tags: ['x = 7', 'y = 10'] },
        { icon: 'check', title: 'Check it', text: 'Put both values back in. The two sides should match.', tags: ['7 + 20 = 27'] }
      ],
      remember: 'Name the unknowns, translate the words, then check your answer by putting it back in.'
    },
    table: {
      title: 'Words into maths',
      columns: ['In words', 'In maths', 'Example'],
      rows: [['sum of, more than, total', '+', 'x more than y → y + x'], ['difference, less than', '−', '5 less than x → x − 5'], ['times, twice, three times', '×', 'twice y → 2y'], ['per, shared equally', '÷', 'x shared by 4 → x / 4'], ['is, costs, equals', '=', 'costs ₹27 → = 27']],
      highlight: 1,
      note: 'Read the problem one phrase at a time and write each piece as you go.'
    },
    map: {
      center: 'Word problems',
      branches: [
        { title: 'Name', points: ['A letter for each unknown', 'x and y'] },
        { title: 'Translate', points: ['Words into + − × ÷ =', 'One equation'] },
        { title: 'Solve', points: ['Pick x, find y', 'Many solutions'] },
        { title: 'Check', points: ['Put values back in', 'Both sides match'] }
      ]
    },
    practice: [
      { q: '"Twice a number x" is written as', options: ['x + 2', '2x', 'x²', 'x / 2'], right: 1, why: 'Twice means two times.' },
      { q: 'A bat costs ₹x and a ball ₹y. A bat and 3 balls cost ₹500. The equation is', options: ['3x + y = 500', 'x + 3y = 500', 'x + y = 500', '3xy = 500'], right: 1, why: 'One bat is x, three balls are 3y.' },
      { q: 'In x + y = 10, if x = 4, then y is', options: ['4', '6', '10', '14'], right: 1, why: '10 − 4 = 6.' },
      { q: 'Is (2, 3) a solution of x + 2y = 8?', options: ['Yes', 'No'], right: 0, why: '2 + 2 × 3 = 8.' }
    ],
    quiz: [
      { q: 'A linear equation in two variables has', options: ['Exactly one solution', 'No solution', 'Many solutions', 'Two solutions'], right: 2, why: 'Every point on its line is a solution.' },
      { q: '"5 less than x" is', options: ['5 − x', 'x − 5', 'x + 5', '5x'], right: 1, why: 'Start with x and take 5 away.' },
      { q: 'A book costs ₹x and a pen ₹y. 2 books and 5 pens cost ₹130. The equation is', options: ['2x + 5y = 130', '5x + 2y = 130', '2x + 5y = 7', 'x + y = 130'], right: 0, why: '2 books is 2x, 5 pens is 5y.' },
      { q: 'In 3x + y = 20, if x = 5, y is', options: ['15', '5', '20', '0'], right: 1, why: '3 × 5 = 15, and 20 − 15 = 5.' },
      { q: 'Is (1, 4) a solution of 2x + y = 6?', options: ['Yes', 'No'], right: 0, why: '2 × 1 + 4 = 6.' },
      { q: 'Is (4, 1) a solution of 2x + y = 6?', options: ['Yes', 'No'], right: 1, why: '2 × 4 + 1 = 9, not 6.' },
      { q: 'The graph of a linear equation in two variables is', options: ['A circle', 'A curve', 'A straight line', 'A single point'], right: 2, why: 'All its solutions lie on one straight line.' }
    ],
    mistake: { problem: 'In 2x + 3y = 60, find y when x = 12.', steps: ['Put x = 12 in: 2 × 12 + 3y = 60', 'Work out 2 × 12: 24 + 3y = 60', 'Take 24 from both sides: 3y = 84', 'Divide by 3: y = 28'], wrong: 2, why: 'Taking 24 from both sides gives 3y = 60 − 24 = 36, not 84. So y = 12.' },
    explain: {
      prompt: 'In your own words, how do you solve a word problem with two unknowns?',
      points: [
        { text: 'Give each unknown a letter', words: ['letter', 'variable', 'x and y', 'unknown'] },
        { text: 'Turn the words into an equation', words: ['equation', 'translate', 'turn', 'write'] },
        { text: 'Pick a value for one and find the other', words: ['pick', 'choose', 'put', 'substitut', 'find'] },
        { text: 'Check by putting the values back in', words: ['check', 'back in', 'both sides', 'verify'] }
      ]
    }
  }
};

/** Checks a typed answer against a lesson part. */
export function isRight(part: Part, answer: string): boolean {
  const a = answer.toLowerCase().replace(/[−–]/g, '-').trim();
  if (!a) return false;
  if (part.num !== undefined) {
    const n = a.match(/-?\d+(\.\d+)?/);
    return !!n && Math.abs(Number(n[0]) - part.num) < 0.05 + Math.abs(part.num) * 0.01;
  }
  const tight = a.replace(/\s+/g, '');
  if (part.reject?.some(r => new RegExp(`\\b${r}\\b`).test(a))) return false;
  return !!part.accept?.some(w => a.includes(w) || tight.includes(w.replace(/\s+/g, '')));
}
