import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const WORD_POOLS: Record<number, string[]> = {
  3: ['CAT', 'DOG', 'BAT', 'HAT', 'PEN', 'CUP', 'RUN', 'SIT', 'RED', 'BIG', 'HOT', 'SUN', 'FUN', 'MAP', 'JAM', 'NET', 'HOP', 'MIX', 'BOX', 'FIG'],
  4: ['FISH', 'BIRD', 'HAND', 'WARM', 'COLD', 'HELP', 'MIND', 'DUST', 'LAMP', 'FROG', 'MILK', 'RING', 'STAR', 'WIND', 'JUMP', 'DARK', 'GOLD', 'SILK', 'POND', 'DRUM'],
  5: ['PLANT', 'BRING', 'CLOUD', 'FROST', 'GRAIN', 'HORSE', 'LIGHT', 'MOUSE', 'PAINT', 'TRICK', 'BLEND', 'CHARM', 'DRIFT', 'FLAME', 'GLOBE', 'KNELT', 'PRISM', 'QUEST', 'SWIFT', 'TRACE'],
};

function shiftLetter(ch: string, offset: number): string {
  const idx = ALPHABET.indexOf(ch.toUpperCase());
  if (idx === -1) return ch;
  return ALPHABET[(idx + offset + 26) % 26];
}

function shiftWord(word: string, offset: number): string {
  return word.split('').map(ch => shiftLetter(ch, offset)).join('');
}

export function generateWordLetterCodes(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  // Determine word length based on difficulty
  const wordLen = difficulty <= 2 ? 3 : difficulty <= 3 ? 4 : 5;
  const pool = WORD_POOLS[wordLen];

  // Pick shift offset: small for easy, larger for hard
  const maxShift = difficulty <= 2 ? 3 : difficulty <= 3 ? 5 : 10;
  const offset = randomInt(1, maxShift, rng);

  // Pick two different words from the pool
  const idx1 = randomInt(0, pool.length - 1, rng);
  let idx2 = randomInt(0, pool.length - 2, rng);
  if (idx2 >= idx1) idx2++;
  const exampleWord = pool[idx1];
  const questionWord = pool[idx2];

  const exampleCode = shiftWord(exampleWord, offset);
  const answerCode = shiftWord(questionWord, offset);

  // Generate distractors using different offsets
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const wrongOffset = randomInt(1, 12, rng);
    if (wrongOffset === offset) continue;
    const d = shiftWord(questionWord, wrongOffset);
    if (d !== answerCode) distractors.add(d);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answerCode, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  const prompt = `If ${exampleWord} is written as ${exampleCode} in a secret code, what would ${questionWord} be written as?`;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.WORD_LETTER_CODES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `Each letter is shifted ${offset} place${offset > 1 ? 's' : ''} forward in the alphabet. So ${questionWord} becomes ${answerCode}.`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'word-letter-codes',
    generatorSeed: seed,
    tags: ['word-letter-codes', 'cipher'],
  };
}
