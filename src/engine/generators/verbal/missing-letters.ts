import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const VOWELS = new Set('aeiou');

interface WordEntry {
  word: string;
  hint: string;
}

const EASY_WORDS: WordEntry[] = [
  { word: 'apple', hint: 'A fruit' },
  { word: 'house', hint: 'A place to live' },
  { word: 'water', hint: 'You drink this' },
  { word: 'table', hint: 'Furniture you eat at' },
  { word: 'chair', hint: 'You sit on this' },
  { word: 'happy', hint: 'Feeling good' },
  { word: 'green', hint: 'A colour' },
  { word: 'money', hint: 'Used to buy things' },
  { word: 'music', hint: 'You listen to this' },
  { word: 'plant', hint: 'Grows in soil' },
  { word: 'tiger', hint: 'A big cat' },
  { word: 'river', hint: 'Water flowing' },
  { word: 'smile', hint: 'A happy face' },
  { word: 'bread', hint: 'Baked food' },
  { word: 'night', hint: 'When it is dark' },
];

const MEDIUM_WORDS: WordEntry[] = [
  { word: 'computer', hint: 'An electronic device' },
  { word: 'elephant', hint: 'A large animal' },
  { word: 'birthday', hint: 'A special day each year' },
  { word: 'football', hint: 'A popular sport' },
  { word: 'sandwich', hint: 'Food between bread' },
  { word: 'hospital', hint: 'Where doctors work' },
  { word: 'treasure', hint: 'Valuable things' },
  { word: 'mountain', hint: 'Very tall land' },
  { word: 'children', hint: 'Young people' },
  { word: 'umbrella', hint: 'Keeps rain off' },
  { word: 'dinosaur', hint: 'Extinct animal' },
  { word: 'together', hint: 'Not apart' },
  { word: 'alphabet', hint: 'A to Z' },
  { word: 'calendar', hint: 'Shows dates' },
  { word: 'painting', hint: 'Art on canvas' },
];

const HARD_WORDS: WordEntry[] = [
  { word: 'adventure', hint: 'An exciting journey' },
  { word: 'beautiful', hint: 'Very pleasing to look at' },
  { word: 'challenge', hint: 'Something difficult to do' },
  { word: 'dangerous', hint: 'Could cause harm' },
  { word: 'education', hint: 'Learning at school' },
  { word: 'furniture', hint: 'Tables, chairs, desks' },
  { word: 'geography', hint: 'Study of the Earth' },
  { word: 'happiness', hint: 'The state of being glad' },
  { word: 'important', hint: 'Has great value' },
  { word: 'knowledge', hint: 'What you know' },
  { word: 'lightning', hint: 'Flash in a storm' },
  { word: 'meanwhile', hint: 'At the same time' },
  { word: 'necessary', hint: 'Must be done' },
  { word: 'orchestra', hint: 'Group of musicians' },
  { word: 'passenger', hint: 'Rides in a vehicle' },
];

function removeLetters(word: string, mode: 'vowels' | 'consonants' | 'mixed', rng: () => number): string {
  const chars = word.split('');
  const result = [...chars];

  if (mode === 'vowels') {
    for (let i = 0; i < chars.length; i++) {
      if (VOWELS.has(chars[i])) result[i] = '_';
    }
  } else if (mode === 'consonants') {
    for (let i = 0; i < chars.length; i++) {
      if (!VOWELS.has(chars[i])) result[i] = '_';
    }
  } else {
    // Remove roughly half the letters randomly
    const indices = chars.map((_, i) => i);
    const toRemove = shuffle(indices, rng).slice(0, Math.ceil(chars.length * 0.4));
    for (const i of toRemove) {
      result[i] = '_';
    }
  }

  return result.join('');
}

export function generateMissingLetters(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let pool: WordEntry[];
  let mode: 'vowels' | 'consonants' | 'mixed';

  if (difficulty <= 2) {
    pool = EASY_WORDS;
    mode = 'vowels';
  } else if (difficulty === 3) {
    pool = MEDIUM_WORDS;
    mode = rng() < 0.5 ? 'vowels' : 'mixed';
  } else {
    pool = HARD_WORDS;
    mode = pick(['vowels', 'consonants', 'mixed'] as const, rng);
  }

  const entry = pick(pool, rng);
  const { word, hint } = entry;
  const blanked = removeLetters(word, mode, rng);

  const prompt = difficulty <= 2
    ? `Complete the word by filling in the missing letters:\n\n${blanked}\n\nHint: ${hint}`
    : `What word is this?\n\n${blanked}\n\nHint: ${hint}`;

  // Generate distractors: similar-length real words
  const allWords = [...EASY_WORDS, ...MEDIUM_WORDS, ...HARD_WORDS];
  const distractors = new Set<string>();
  const candidates = shuffle(
    allWords.filter(w => w.word !== word && Math.abs(w.word.length - word.length) <= 1),
    rng
  );
  for (const c of candidates) {
    if (distractors.size >= 3) break;
    distractors.add(c.word);
  }
  // Fill if needed
  const fallback = shuffle(allWords.filter(w => w.word !== word), rng);
  for (const f of fallback) {
    if (distractors.size >= 3) break;
    distractors.add(f.word);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [word, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.MISSING_LETTERS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `The word is "${word}" (${hint}).`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'missing-letters',
    generatorSeed: seed,
    tags: ['missing-letters', 'spelling'],
  };
}
