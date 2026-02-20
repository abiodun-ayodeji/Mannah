import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

// [first half, second half]
const COMPOUND_WORDS: [string, string][] = [
  ['sun', 'flower'], ['rain', 'bow'], ['foot', 'ball'], ['bed', 'room'],
  ['butter', 'fly'], ['cup', 'board'], ['fire', 'place'], ['gold', 'fish'],
  ['hand', 'shake'], ['home', 'work'], ['ice', 'cream'], ['key', 'board'],
  ['lip', 'stick'], ['moon', 'light'], ['news', 'paper'], ['out', 'side'],
  ['pan', 'cake'], ['play', 'ground'], ['rain', 'coat'], ['sand', 'castle'],
  ['shoe', 'lace'], ['snow', 'ball'], ['star', 'fish'], ['tooth', 'brush'],
  ['under', 'ground'], ['water', 'fall'], ['wind', 'mill'], ['air', 'port'],
  ['arm', 'chair'], ['back', 'bone'], ['black', 'bird'], ['blue', 'bell'],
  ['book', 'shop'], ['break', 'fast'], ['candle', 'stick'], ['car', 'park'],
  ['day', 'light'], ['door', 'bell'], ['ear', 'ring'], ['eye', 'brow'],
  ['finger', 'print'], ['head', 'band'], ['heart', 'beat'], ['horse', 'shoe'],
  ['house', 'wife'], ['jelly', 'fish'], ['knee', 'cap'], ['land', 'lord'],
  ['life', 'time'], ['mail', 'box'], ['neck', 'lace'], ['note', 'book'],
  ['over', 'coat'], ['pine', 'apple'], ['pop', 'corn'], ['rain', 'drop'],
  ['sea', 'shore'], ['some', 'thing'], ['sun', 'shine'], ['table', 'cloth'],
  ['tea', 'pot'], ['thunder', 'storm'], ['time', 'table'], ['tooth', 'paste'],
  ['up', 'stairs'], ['wall', 'paper'], ['week', 'end'], ['white', 'board'],
];

// Extra halves used as wrong-answer distractors
const DISTRACTOR_HALVES_FIRST = [
  'salt', 'leaf', 'sky', 'cloud', 'lamp', 'bell', 'silk', 'oak', 'mud', 'fog',
  'bark', 'pine', 'reed', 'flint', 'cork', 'drum', 'stone', 'claw', 'fern', 'moss',
];

const DISTRACTOR_HALVES_SECOND = [
  'step', 'wing', 'drift', 'shelf', 'frame', 'plate', 'thread', 'ledge', 'vault', 'ridge',
  'crest', 'blade', 'flake', 'plank', 'trail', 'bloom', 'chunk', 'shard', 'grove', 'strand',
];

export function generateCompoundWords(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const correctIdx = randomInt(0, COMPOUND_WORDS.length - 1, rng);
  const [first, second] = COMPOUND_WORDS[correctIdx];
  const correctWord = first + second;

  // Decide which half to show and which to ask for
  const askSecondHalf = rng() < 0.5;

  let prompt: string;
  let answer: string;
  let distractorPool: string[];

  if (askSecondHalf) {
    prompt = `Which word can be added after "${first}" to make a compound word?`;
    answer = second;
    distractorPool = DISTRACTOR_HALVES_SECOND;
  } else {
    prompt = `Which word can be added before "${second}" to make a compound word?`;
    answer = first;
    distractorPool = DISTRACTOR_HALVES_FIRST;
  }

  // At higher difficulty, include other real compound-word halves as distractors
  const distractors = new Set<string>();
  if (difficulty >= 3) {
    // Use plausible but wrong compound-word parts
    const shuffled = shuffle([...COMPOUND_WORDS], rng);
    for (const [f, s] of shuffled) {
      if (distractors.size >= 3) break;
      const candidate = askSecondHalf ? s : f;
      if (candidate !== answer) distractors.add(candidate);
    }
  }

  // Fill remaining distractors from pool
  const poolShuffled = shuffle([...distractorPool], rng);
  for (const d of poolShuffled) {
    if (distractors.size >= 3) break;
    if (d !== answer) distractors.add(d);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.COMPOUND_WORDS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `The answer is "${answer}" because "${first}" + "${second}" = "${correctWord}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'compound-words',
    generatorSeed: seed,
    tags: ['compound-words', 'vocabulary'],
  };
}
