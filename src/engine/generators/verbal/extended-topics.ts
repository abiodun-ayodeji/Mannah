import type { Difficulty, Question } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, pick, randomInt, shuffle, uniqueId } from '../../../utils/random';

type Level = 1 | 2 | 3 | 4 | 5;

function createMCQ(
  rng: () => number,
  {
    topic,
    difficulty,
    prompt,
    correct,
    distractors,
    explanation,
    generatorId,
    tags,
    timeLimit = 30,
  }: {
    topic: VerbalReasoningTopic;
    difficulty: Difficulty;
    prompt: string;
    correct: string;
    distractors: string[];
    explanation: string;
    generatorId: string;
    tags: string[];
    timeLimit?: number;
  },
): Question {
  const correctId = uniqueId();
  const options = shuffle(
    [
      { id: correctId, label: correct },
      ...distractors.map((value) => ({ id: uniqueId(), label: value })),
    ],
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit,
    xpReward: 10,
    isGenerated: true,
    generatorId,
    generatorSeed: Math.floor(rng() * 1_000_000_000),
    tags: ['verbal', ...tags],
  };
}

interface PairEntry {
  correct: string;
  distractors: string[];
  explanation: string;
  level: Level;
}

const ANTONYM_PAIR_ENTRIES: PairEntry[] = [
  {
    correct: 'ancient — modern',
    distractors: ['happy — joyful', 'large — huge', 'quick — rapid'],
    explanation: '"Ancient" and "modern" have opposite meanings.',
    level: 1,
  },
  {
    correct: 'expand — contract',
    distractors: ['allow — permit', 'calm — peaceful', 'brave — fearless'],
    explanation: '"Expand" means get bigger, while "contract" means get smaller.',
    level: 2,
  },
  {
    correct: 'scarce — abundant',
    distractors: ['brief — short', 'silent — quiet', 'error — mistake'],
    explanation: '"Scarce" means limited, while "abundant" means plenty.',
    level: 3,
  },
  {
    correct: 'optimistic — pessimistic',
    distractors: ['fair — just', 'vivid — bright', 'mend — repair'],
    explanation: 'These are opposite attitudes toward outcomes.',
    level: 4,
  },
  {
    correct: 'transparent — opaque',
    distractors: ['fragile — delicate', 'humid — damp', 'rapid — swift'],
    explanation: '"Transparent" allows light through; "opaque" does not.',
    level: 5,
  },
];

interface ConnectionEntry {
  left: string;
  right: string;
  correct: string;
  distractors: string[];
  explanation: string;
  level: Level;
}

const WORD_CONNECTION_ENTRIES: ConnectionEntry[] = [
  {
    left: 'birthday',
    right: 'wedding',
    correct: 'celebration',
    distractors: ['pencil', 'winter', 'distance'],
    explanation: 'Both birthdays and weddings are celebrations.',
    level: 1,
  },
  {
    left: 'captain',
    right: 'pilot',
    correct: 'leader',
    distractors: ['shadow', 'lantern', 'riddle'],
    explanation: 'Both roles lead people or vehicles.',
    level: 2,
  },
  {
    left: 'microscope',
    right: 'telescope',
    correct: 'observation',
    distractors: ['construction', 'navigation', 'transport'],
    explanation: 'Both are used for observation, at different scales.',
    level: 3,
  },
  {
    left: 'thesis',
    right: 'argument',
    correct: 'evidence',
    distractors: ['melody', 'harvest', 'gravity'],
    explanation: 'Strong theses and arguments rely on evidence.',
    level: 4,
  },
  {
    left: 'constitution',
    right: 'parliament',
    correct: 'governance',
    distractors: ['expedition', 'evaporation', 'nutrition'],
    explanation: 'Both relate to governance and how a nation is run.',
    level: 5,
  },
];

interface OddEntry {
  words: [string, string, string, string];
  oddWord: string;
  explanation: string;
  level: Level;
}

const ODD_ONE_OUT_ENTRIES: OddEntry[] = [
  {
    words: ['apple', 'banana', 'carrot', 'orange'],
    oddWord: 'carrot',
    explanation: 'Three are fruits; carrot is a vegetable.',
    level: 1,
  },
  {
    words: ['square', 'triangle', 'circle', 'guitar'],
    oddWord: 'guitar',
    explanation: 'Three are shapes; guitar is an instrument.',
    level: 1,
  },
  {
    words: ['whisper', 'murmur', 'shout', 'speak'],
    oddWord: 'shout',
    explanation: 'The others are relatively quiet forms of speech.',
    level: 2,
  },
  {
    words: ['evaporation', 'condensation', 'precipitation', 'multiplication'],
    oddWord: 'multiplication',
    explanation: 'Three are parts of the water cycle.',
    level: 3,
  },
  {
    words: ['metaphor', 'simile', 'alliteration', 'equation'],
    oddWord: 'equation',
    explanation: 'The others are literary techniques.',
    level: 4,
  },
  {
    words: ['pharaoh', 'pyramid', 'mummy', 'satellite'],
    oddWord: 'satellite',
    explanation: 'Three terms are linked to ancient Egypt.',
    level: 5,
  },
];

interface MeaningEntry {
  word: string;
  correct: string;
  distractors: string[];
  explanation: string;
  level: Level;
}

const CLOSEST_MEANING_ENTRIES: MeaningEntry[] = [
  {
    word: 'brisk',
    correct: 'quick',
    distractors: ['silent', 'heavy', 'faint'],
    explanation: '"Brisk" means fast or energetic.',
    level: 1,
  },
  {
    word: 'reluctant',
    correct: 'unwilling',
    distractors: ['joyful', 'patient', 'certain'],
    explanation: '"Reluctant" means not eager to do something.',
    level: 2,
  },
  {
    word: 'vivid',
    correct: 'bright',
    distractors: ['hidden', 'narrow', 'fragile'],
    explanation: '"Vivid" often means bright, clear, and striking.',
    level: 3,
  },
  {
    word: 'meticulous',
    correct: 'careful',
    distractors: ['reckless', 'brief', 'noisy'],
    explanation: '"Meticulous" means very careful about detail.',
    level: 4,
  },
  {
    word: 'ephemeral',
    correct: 'short-lived',
    distractors: ['immortal', 'gigantic', 'deliberate'],
    explanation: '"Ephemeral" describes something lasting a short time.',
    level: 5,
  },
];

interface SentenceTemplate {
  sentence: string;
  answer: string;
  distractors: string[];
  explanation: string;
  level: Level;
}

const VERBAL_SENTENCE_COMPLETION: SentenceTemplate[] = [
  {
    sentence: 'The coach praised the team for their effort ___ they did not win.',
    answer: 'although',
    distractors: ['because', 'unless', 'therefore'],
    explanation: '"Although" introduces contrast.',
    level: 1,
  },
  {
    sentence: 'The clues were subtle, so only the most ___ readers solved the riddle quickly.',
    answer: 'observant',
    distractors: ['careless', 'ordinary', 'silent'],
    explanation: 'Riddles are solved quickly by observant readers.',
    level: 2,
  },
  {
    sentence: 'To stay objective, the writer presented both sides before drawing a ___ conclusion.',
    answer: 'balanced',
    distractors: ['confused', 'reckless', 'casual'],
    explanation: 'Presenting both sides helps produce a balanced conclusion.',
    level: 3,
  },
  {
    sentence: 'The witness gave a ___ account, with each detail matching the timeline exactly.',
    answer: 'coherent',
    distractors: ['fragmented', 'delayed', 'biased'],
    explanation: 'A coherent account is clear and logically consistent.',
    level: 4,
  },
  {
    sentence: 'Because the evidence was inconclusive, the committee remained ___ and delayed its verdict.',
    answer: 'undecided',
    distractors: ['triumphant', 'exhausted', 'unaware'],
    explanation: 'Inconclusive evidence leads to an undecided position.',
    level: 5,
  },
];

interface RelatedWordEntry {
  target: string;
  correct: string;
  distractors: string[];
  explanation: string;
  level: Level;
}

const RELATED_WORD_ENTRIES: RelatedWordEntry[] = [
  {
    target: 'library',
    correct: 'books',
    distractors: ['paddles', 'engines', 'helmets'],
    explanation: 'Libraries are strongly associated with books.',
    level: 1,
  },
  {
    target: 'astronomy',
    correct: 'stars',
    distractors: ['roots', 'rivers', 'volcanoes'],
    explanation: 'Astronomy is the study of stars and celestial objects.',
    level: 2,
  },
  {
    target: 'nutrition',
    correct: 'diet',
    distractors: ['velocity', 'altitude', 'geometry'],
    explanation: 'Nutrition is directly linked to diet.',
    level: 3,
  },
  {
    target: 'democracy',
    correct: 'election',
    distractors: ['eruption', 'erosion', 'equation'],
    explanation: 'Elections are a key feature of democracy.',
    level: 4,
  },
  {
    target: 'ecosystem',
    correct: 'interdependence',
    distractors: ['isolation', 'prediction', 'domination'],
    explanation: 'Ecosystems depend on interdependence among organisms.',
    level: 5,
  },
];

interface CreateWordEntry {
  letters: string;
  answer: string;
  distractors: string[];
  explanation: string;
  level: Level;
}

const CREATE_WORD_ENTRIES: CreateWordEntry[] = [
  {
    letters: 'R E A C T',
    answer: 'trace',
    distractors: ['cratee', 'reach', 'teacher'],
    explanation: '"Trace" can be formed exactly using the given letters.',
    level: 1,
  },
  {
    letters: 'S I L E N T',
    answer: 'listen',
    distractors: ['silentt', 'tinselz', 'lines'],
    explanation: '"Listen" is a valid rearrangement of the given letters.',
    level: 2,
  },
  {
    letters: 'S A V E R',
    answer: 'versa',
    distractors: ['savera', 'ravess', 'serve'],
    explanation: '"Versa" uses each letter exactly once.',
    level: 3,
  },
  {
    letters: 'P A R T I C L E',
    answer: 'article',
    distractors: ['particlee', 'partial', 'recitals'],
    explanation: '"Article" can be built from the supplied letters.',
    level: 4,
  },
  {
    letters: 'R E F O R M A T I O N',
    answer: 'information',
    distractors: ['reformationa', 'formation', 'informant'],
    explanation: '"Information" is the exact anagram.',
    level: 5,
  },
];

function eligibleByDifficulty<T extends { level: Level }>(items: T[], difficulty: Difficulty) {
  return items.filter(
    (item) => item.level >= Math.max(1, difficulty - 1) && item.level <= Math.min(5, difficulty + 1),
  );
}

export function generateAntonymPairs(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(ANTONYM_PAIR_ENTRIES, difficulty), rng);
  return createMCQ(rng, {
    topic: VerbalReasoningTopic.ANTONYM_PAIRS,
    difficulty,
    prompt: 'Which pair of words are opposites (antonyms)?',
    correct: entry.correct,
    distractors: entry.distractors,
    explanation: entry.explanation,
    generatorId: 'antonym-pairs',
    tags: ['antonym-pairs'],
  });
}

function alphaValue(word: string) {
  return word
    .toUpperCase()
    .split('')
    .reduce((sum, ch) => sum + (ch.charCodeAt(0) - 64), 0);
}

function valueBreakdown(word: string) {
  return word
    .toUpperCase()
    .split('')
    .map((ch) => `${ch}=${ch.charCodeAt(0) - 64}`)
    .join(', ');
}

const CODE_WORDS: Record<Level, string[]> = {
  1: ['CAT', 'DOG', 'SUN', 'MAP', 'HAT'],
  2: ['BOOK', 'STAR', 'MATH', 'FROG', 'WIND'],
  3: ['BRAIN', 'QUIET', 'LEARN', 'TRICK', 'POINT'],
  4: ['REASON', 'SYSTEM', 'BALANCE', 'JOURNEY', 'TENSION'],
  5: ['ANALYSE', 'INSIGHT', 'LOGICAL', 'PATTERN', 'CONCEPT'],
};

export function generateNumberLetterCodes(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const level = Math.min(Math.max(difficulty, 1), 5) as Level;
  const word = pick(CODE_WORDS[level], rng);
  const correctValue = alphaValue(word);

  const distractorValues = new Set<number>();
  while (distractorValues.size < 3) {
    const offset = randomInt(2, 11, rng) * (rng() < 0.5 ? 1 : -1);
    const candidate = correctValue + offset;
    if (candidate > 0 && candidate !== correctValue) {
      distractorValues.add(candidate);
    }
  }

  return createMCQ(rng, {
    topic: VerbalReasoningTopic.NUMBER_LETTER_CODES,
    difficulty,
    prompt: `If A=1, B=2, ... Z=26, what is the code value of "${word}"?`,
    correct: String(correctValue),
    distractors: Array.from(distractorValues).map(String),
    explanation: `${valueBreakdown(word)} so the total is ${correctValue}.`,
    generatorId: 'number-letter-codes',
    tags: ['number-letter-codes', 'cipher'],
  });
}

export function generateWordConnections(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(WORD_CONNECTION_ENTRIES, difficulty), rng);
  return createMCQ(rng, {
    topic: VerbalReasoningTopic.WORD_CONNECTIONS,
    difficulty,
    prompt: `Which word best connects both "${entry.left}" and "${entry.right}"?`,
    correct: entry.correct,
    distractors: entry.distractors,
    explanation: entry.explanation,
    generatorId: 'word-connections',
    tags: ['word-connections'],
  });
}

export function generateVROddOneOut(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(ODD_ONE_OUT_ENTRIES, difficulty), rng);
  const options = shuffle(
    entry.words.map((word) => ({ id: uniqueId(), label: word })),
    rng,
  );
  const correctOption = options.find((option) => option.label === entry.oddWord);
  const correctId = correctOption?.id ?? options[0].id;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.ODD_ONE_OUT,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: 'Which word is the odd one out?',
    options,
    correctAnswer: correctId,
    explanation: entry.explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'verbal-odd-one-out',
    generatorSeed: seed,
    tags: ['verbal', 'odd-one-out'],
  };
}

export function generateClosestMeaning(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(CLOSEST_MEANING_ENTRIES, difficulty), rng);
  return createMCQ(rng, {
    topic: VerbalReasoningTopic.CLOSEST_MEANING,
    difficulty,
    prompt: `Which word is closest in meaning to "${entry.word}"?`,
    correct: entry.correct,
    distractors: entry.distractors,
    explanation: entry.explanation,
    generatorId: 'closest-meaning',
    tags: ['closest-meaning', 'vocabulary'],
  });
}

export function generateVRSentenceCompletion(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(VERBAL_SENTENCE_COMPLETION, difficulty), rng);
  return createMCQ(rng, {
    topic: VerbalReasoningTopic.SENTENCE_COMPLETION,
    difficulty,
    prompt: `Choose the best option to complete the sentence:\n\n"${entry.sentence}"`,
    correct: entry.answer,
    distractors: entry.distractors,
    explanation: entry.explanation,
    generatorId: 'vr-sentence-completion',
    tags: ['sentence-completion'],
  });
}

export function generateRelatedWords(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(RELATED_WORD_ENTRIES, difficulty), rng);
  return createMCQ(rng, {
    topic: VerbalReasoningTopic.RELATED_WORDS,
    difficulty,
    prompt: `Which word is most closely related to "${entry.target}"?`,
    correct: entry.correct,
    distractors: entry.distractors,
    explanation: entry.explanation,
    generatorId: 'related-words',
    tags: ['related-words'],
  });
}

export function generateCreateAWord(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const entry = pick(eligibleByDifficulty(CREATE_WORD_ENTRIES, difficulty), rng);
  return createMCQ(rng, {
    topic: VerbalReasoningTopic.CREATE_A_WORD,
    difficulty,
    prompt: `Which word can be made using only these letters:\n\n${entry.letters}`,
    correct: entry.answer,
    distractors: entry.distractors,
    explanation: entry.explanation,
    generatorId: 'create-a-word',
    tags: ['create-a-word', 'anagram'],
  });
}
