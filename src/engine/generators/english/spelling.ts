import type { Question, Difficulty } from '../../../types/question';
import { Subject, EnglishTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

interface SpellingWord {
  correct: string;
  level: 1 | 2 | 3 | 4 | 5;
}

const WORD_BANK: SpellingWord[] = [
  // Level 1 - common, simpler words
  { correct: 'because', level: 1 },
  { correct: 'friend', level: 1 },
  { correct: 'people', level: 1 },
  { correct: 'answer', level: 1 },
  { correct: 'enough', level: 1 },
  { correct: 'caught', level: 1 },
  { correct: 'again', level: 1 },
  { correct: 'through', level: 1 },
  { correct: 'where', level: 1 },
  { correct: 'thought', level: 1 },
  { correct: 'which', level: 1 },
  { correct: 'their', level: 1 },
  { correct: 'could', level: 1 },
  { correct: 'would', level: 1 },
  { correct: 'eight', level: 1 },
  { correct: 'built', level: 1 },
  { correct: 'guard', level: 1 },
  { correct: 'heard', level: 1 },
  { correct: 'whole', level: 1 },
  { correct: 'climb', level: 1 },
  // Level 2
  { correct: 'separate', level: 2 },
  { correct: 'different', level: 2 },
  { correct: 'believe', level: 2 },
  { correct: 'surprise', level: 2 },
  { correct: 'calendar', level: 2 },
  { correct: 'library', level: 2 },
  { correct: 'February', level: 2 },
  { correct: 'Wednesday', level: 2 },
  { correct: 'beautiful', level: 2 },
  { correct: 'favourite', level: 2 },
  { correct: 'important', level: 2 },
  { correct: 'necessary', level: 2 },
  { correct: 'beginning', level: 2 },
  { correct: 'business', level: 2 },
  { correct: 'complete', level: 2 },
  { correct: 'describe', level: 2 },
  { correct: 'exercise', level: 2 },
  { correct: 'imagine', level: 2 },
  { correct: 'knowledge', level: 2 },
  { correct: 'probably', level: 2 },
  // Level 3
  { correct: 'immediately', level: 3 },
  { correct: 'accommodate', level: 3 },
  { correct: 'appreciate', level: 3 },
  { correct: 'committee', level: 3 },
  { correct: 'conscience', level: 3 },
  { correct: 'definite', level: 3 },
  { correct: 'disappear', level: 3 },
  { correct: 'environment', level: 3 },
  { correct: 'equipment', level: 3 },
  { correct: 'especially', level: 3 },
  { correct: 'exaggerate', level: 3 },
  { correct: 'excellent', level: 3 },
  { correct: 'experience', level: 3 },
  { correct: 'government', level: 3 },
  { correct: 'guarantee', level: 3 },
  { correct: 'interrupt', level: 3 },
  { correct: 'mischievous', level: 3 },
  { correct: 'necessary', level: 3 },
  { correct: 'neighbour', level: 3 },
  { correct: 'opportunity', level: 3 },
  { correct: 'parliament', level: 3 },
  { correct: 'persuade', level: 3 },
  { correct: 'privilege', level: 3 },
  { correct: 'restaurant', level: 3 },
  { correct: 'rhythm', level: 3 },
  // Level 4
  { correct: 'achievement', level: 4 },
  { correct: 'acknowledgement', level: 4 },
  { correct: 'acquaintance', level: 4 },
  { correct: 'coincidence', level: 4 },
  { correct: 'communicate', level: 4 },
  { correct: 'controversial', level: 4 },
  { correct: 'correspondence', level: 4 },
  { correct: 'determination', level: 4 },
  { correct: 'embarrass', level: 4 },
  { correct: 'enthusiasm', level: 4 },
  { correct: 'explanation', level: 4 },
  { correct: 'interference', level: 4 },
  { correct: 'maintenance', level: 4 },
  { correct: 'miscellaneous', level: 4 },
  { correct: 'occasionally', level: 4 },
  { correct: 'occurrence', level: 4 },
  { correct: 'pronunciation', level: 4 },
  { correct: 'questionnaire', level: 4 },
  { correct: 'recommendation', level: 4 },
  { correct: 'temperature', level: 4 },
  // Level 5
  { correct: 'bureaucracy', level: 5 },
  { correct: 'catastrophe', level: 5 },
  { correct: 'conscientious', level: 5 },
  { correct: 'contemporary', level: 5 },
  { correct: 'encyclopedia', level: 5 },
  { correct: 'extraordinary', level: 5 },
  { correct: 'independence', level: 5 },
  { correct: 'Mediterranean', level: 5 },
  { correct: 'onomatopoeia', level: 5 },
  { correct: 'pharmaceutical', level: 5 },
  { correct: 'psychological', level: 5 },
  { correct: 'reconnaissance', level: 5 },
  { correct: 'refrigerator', level: 5 },
  { correct: 'simultaneous', level: 5 },
  { correct: 'surveillance', level: 5 },
  { correct: 'thoroughfare', level: 5 },
  { correct: 'unnecessarily', level: 5 },
  { correct: 'veterinarian', level: 5 },
  { correct: 'advertisement', level: 5 },
  { correct: 'sophisticated', level: 5 },
];

const VOWELS = 'aeiou';
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';

function createMisspelling(word: string, rng: () => number): string {
  const chars = word.toLowerCase().split('');
  if (chars.length < 3) return chars.join('');

  const strategy = randomInt(0, 4, rng);

  switch (strategy) {
    case 0: {
      // Swap two adjacent letters
      const idx = randomInt(0, chars.length - 2, rng);
      [chars[idx], chars[idx + 1]] = [chars[idx + 1], chars[idx]];
      break;
    }
    case 1: {
      // Replace a vowel with a different vowel
      const vowelIndices = chars
        .map((c, i) => (VOWELS.includes(c) ? i : -1))
        .filter((i) => i >= 0);
      if (vowelIndices.length > 0) {
        const idx = pick(vowelIndices, rng);
        const otherVowels = VOWELS.split('').filter((v) => v !== chars[idx]);
        chars[idx] = pick(otherVowels, rng);
      } else {
        // Fallback: double a consonant
        const idx = randomInt(1, chars.length - 1, rng);
        chars.splice(idx, 0, chars[idx]);
      }
      break;
    }
    case 2: {
      // Double a letter that shouldn't be doubled
      const idx = randomInt(1, chars.length - 2, rng);
      if (chars[idx] !== chars[idx - 1] && chars[idx] !== chars[idx + 1]) {
        chars.splice(idx, 0, chars[idx]);
      } else {
        // Remove one of the doubled letters
        chars.splice(idx, 1);
      }
      break;
    }
    case 3: {
      // Remove a letter
      const idx = randomInt(1, chars.length - 2, rng);
      chars.splice(idx, 1);
      break;
    }
    case 4: {
      // Replace a consonant with a similar-sounding one
      const replacements: Record<string, string[]> = {
        c: ['k', 's'],
        k: ['c'],
        s: ['c', 'z'],
        z: ['s'],
        f: ['ph'],
        j: ['g'],
        g: ['j'],
        n: ['m'],
        m: ['n'],
        b: ['p'],
        p: ['b'],
        d: ['t'],
        t: ['d'],
      };
      const consonantIndices = chars
        .map((c, i) => (CONSONANTS.includes(c) && replacements[c] ? i : -1))
        .filter((i) => i >= 0);
      if (consonantIndices.length > 0) {
        const idx = pick(consonantIndices, rng);
        const rep = pick(replacements[chars[idx]], rng);
        chars.splice(idx, 1, ...rep.split(''));
      } else {
        const idx = randomInt(0, chars.length - 2, rng);
        [chars[idx], chars[idx + 1]] = [chars[idx + 1], chars[idx]];
      }
      break;
    }
  }

  const result = chars.join('');
  // Preserve original capitalisation of first letter
  if (word[0] === word[0].toUpperCase()) {
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
}

export function generateSpelling(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  // Filter words by difficulty range
  const eligible = WORD_BANK.filter(
    (w) => w.level >= Math.max(1, difficulty - 1) && w.level <= Math.min(5, difficulty + 1)
  );
  const chosen = pick(eligible, rng);
  const correct = chosen.correct;

  // Generate a misspelling that is definitely different from the correct spelling
  let misspelled = createMisspelling(correct, rng);
  let attempts = 0;
  while (misspelled.toLowerCase() === correct.toLowerCase() && attempts < 10) {
    misspelled = createMisspelling(correct, rng);
    attempts++;
  }
  if (misspelled.toLowerCase() === correct.toLowerCase()) {
    // Fallback: just swap first two swappable characters
    const arr = correct.split('');
    [arr[0], arr[1]] = [arr[1], arr[0]];
    misspelled = arr.join('');
  }

  // Generate 3 wrong options (other misspellings)
  const wrongSet = new Set<string>([correct.toLowerCase(), misspelled.toLowerCase()]);
  const wrongOptions: string[] = [];
  let safetyCounter = 0;
  while (wrongOptions.length < 3 && safetyCounter < 50) {
    safetyCounter++;
    const wrong = createMisspelling(correct, rng);
    const lc = wrong.toLowerCase();
    if (!wrongSet.has(lc)) {
      wrongSet.add(lc);
      wrongOptions.push(wrong);
    }
  }
  // Pad if needed
  while (wrongOptions.length < 3) {
    const arr = correct.split('');
    const idx = randomInt(0, arr.length - 1, rng);
    arr[idx] = 'x';
    const padded = arr.join('');
    if (!wrongSet.has(padded.toLowerCase())) {
      wrongSet.add(padded.toLowerCase());
      wrongOptions.push(padded);
    }
  }

  const correctId = uniqueId();
  const options = shuffle(
    [
      { id: correctId, label: correct },
      ...wrongOptions.map((w) => ({ id: uniqueId(), label: w })),
    ],
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.ENGLISH,
    topic: EnglishTopic.SPELLING,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `The word "${misspelled}" is spelled incorrectly. Which is the correct spelling?`,
    options,
    correctAnswer: correctId,
    explanation: `The correct spelling is "${correct}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'spelling',
    generatorSeed: seed,
    tags: ['english', 'spelling'],
  };
}
