import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

// Each entry: [sentence fragment (two words), hidden word, start index in joined lowercase]
// The hidden word spans across the two adjacent words.
interface HiddenWordEntry {
  wordA: string;
  wordB: string;
  hidden: string;
}

const EASY_ENTRIES: HiddenWordEntry[] = [
  { wordA: 'the', wordB: 'artist', hidden: 'hear' },
  { wordA: 'went', wordB: 'over', hidden: 'tow' },
  { wordA: 'his', wordB: 'hero', hidden: 'she' },
  { wordA: 'also', wordB: 'new', hidden: 'son' },
  { wordA: 'each', wordB: 'air', hidden: 'chair' },
  { wordA: 'car', wordB: 'pet', hidden: 'carpet' },
  { wordA: 'a', wordB: 'jar', hidden: 'jar' },
  { wordA: 'bus', wordB: 'help', hidden: 'she' },
  { wordA: 'cat', wordB: 'chin', hidden: 'catch' },
  { wordA: 'ever', wordB: 'yoke', hidden: 'every' },
  { wordA: 'be', wordB: 'long', hidden: 'belong' },
  { wordA: 'did', wordB: 'gear', hidden: 'ridge' },
  { wordA: 'two', wordB: 'nests', hidden: 'one' },
  { wordA: 'show', wordB: 'erring', hidden: 'shower' },
  { wordA: 'was', wordB: 'happy', hidden: 'ash' },
];

const MEDIUM_ENTRIES: HiddenWordEntry[] = [
  { wordA: 'almost', wordB: 'anyone', hidden: 'tan' },
  { wordA: 'butter', wordB: 'finger', hidden: 'fin' },
  { wordA: 'perhaps', wordB: 'entry', hidden: 'sent' },
  { wordA: 'window', wordB: 'ledge', hidden: 'owl' },
  { wordA: 'basket', wordB: 'ball', hidden: 'tall' },
  { wordA: 'garden', wordB: 'entry', hidden: 'dent' },
  { wordA: 'winter', wordB: 'night', hidden: 'tern' },
  { wordA: 'carpet', wordB: 'enter', hidden: 'peter' },
  { wordA: 'silent', wordB: 'ocean', hidden: 'toc' },
  { wordA: 'dinner', wordB: 'table', hidden: 'nert' },
  { wordA: 'master', wordB: 'piece', hidden: 'terp' },
  { wordA: 'problem', wordB: 'area', hidden: 'mare' },
  { wordA: 'travel', wordB: 'agent', hidden: 'page' },
  { wordA: 'planet', wordB: 'earth', hidden: 'tear' },
  { wordA: 'silver', wordB: 'arrow', hidden: 'era' },
];

const HARD_ENTRIES: HiddenWordEntry[] = [
  { wordA: 'character', wordB: 'island', hidden: 'eris' },
  { wordA: 'elephant', wordB: 'raining', hidden: 'train' },
  { wordA: 'together', wordB: 'hero', hidden: 'the' },
  { wordA: 'mountain', wordB: 'stream', hidden: 'inst' },
  { wordA: 'sandwich', wordB: 'escape', hidden: 'ices' },
  { wordA: 'treasure', wordB: 'hunter', hidden: 'rehunt' },
  { wordA: 'abstract', wordB: 'reality', hidden: 'treal' },
  { wordA: 'opposite', wordB: 'ending', hidden: 'teen' },
  { wordA: 'chocolate', wordB: 'early', hidden: 'tear' },
  { wordA: 'education', wordB: 'alone', hidden: 'ion' },
  { wordA: 'wonderful', wordB: 'under', hidden: 'lund' },
  { wordA: 'beautiful', wordB: 'lake', hidden: 'full' },
  { wordA: 'dangerous', wordB: 'outing', hidden: 'sout' },
  { wordA: 'important', wordB: 'answer', hidden: 'tan' },
  { wordA: 'excellent', wordB: 'teacher', hidden: 'lent' },
];

// Re-validate hidden words and provide properly constructed entries
const VALIDATED_ENTRIES: HiddenWordEntry[] = [
  { wordA: 'the', wordB: 'artist', hidden: 'hear' },
  { wordA: 'each', wordB: 'air', hidden: 'chair' },
  { wordA: 'car', wordB: 'pet', hidden: 'carpet' },
  { wordA: 'cat', wordB: 'chin', hidden: 'catch' },
  { wordA: 'ever', wordB: 'yoke', hidden: 'very' },
  { wordA: 'show', wordB: 'erring', hidden: 'shower' },
  { wordA: 'be', wordB: 'long', hidden: 'belong' },
  { wordA: 'far', wordB: 'mother', hidden: 'arm' },
  { wordA: 'also', wordB: 'near', hidden: 'son' },
  { wordA: 'garden', wordB: 'entry', hidden: 'dent' },
  { wordA: 'planet', wordB: 'earth', hidden: 'tear' },
  { wordA: 'silver', wordB: 'arrow', hidden: 'era' },
  { wordA: 'winter', wordB: 'night', hidden: 'tern' },
  { wordA: 'problem', wordB: 'area', hidden: 'mare' },
  { wordA: 'elephant', wordB: 'raining', hidden: 'train' },
  { wordA: 'opposite', wordB: 'ending', hidden: 'teen' },
  { wordA: 'beautiful', wordB: 'lake', hidden: 'full' },
  { wordA: 'excellent', wordB: 'teacher', hidden: 'lent' },
  { wordA: 'window', wordB: 'ledge', hidden: 'owl' },
  { wordA: 'travel', wordB: 'agent', hidden: 'page' },
];

function findHiddenWord(wordA: string, wordB: string, hidden: string): boolean {
  const combined = (wordA + wordB).toLowerCase();
  const h = hidden.toLowerCase();
  const idx = combined.indexOf(h);
  if (idx === -1) return false;
  // Must span across both words
  return idx < wordA.length && idx + h.length > wordA.length;
}

export function generateHiddenWords(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  // Filter to entries that actually work
  const valid = VALIDATED_ENTRIES.filter(e => findHiddenWord(e.wordA, e.wordB, e.hidden));

  const entry = pick(valid, rng);
  const { wordA, wordB, hidden } = entry;

  // Build a short sentence context
  const contexts = [
    `The words "${wordA} ${wordB}" contain a hidden word.`,
    `Find the word hidden in: "${wordA} ${wordB}"`,
  ];

  const prompt = difficulty <= 2
    ? `Find the word hidden across these two words: "${wordA} ${wordB}"\nHint: The hidden word has ${hidden.length} letters.`
    : `Find the word hidden across these two words: "${wordA} ${wordB}"`;

  // Generate distractors: short real words that are NOT hidden there
  const distractorWords = [
    'the', 'and', 'art', 'pen', 'hat', 'run', 'sit', 'map',
    'arm', 'top', 'ear', 'own', 'age', 'end', 'ant', 'net',
    'pan', 'tin', 'hen', 'pin', 'ape', 'ore', 'den', 'fin',
  ];

  const distractors = new Set<string>();
  const shuffledDist = shuffle([...distractorWords], rng);
  for (const d of shuffledDist) {
    if (distractors.size >= 3) break;
    if (d.toLowerCase() !== hidden.toLowerCase()) distractors.add(d);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [hidden, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.HIDDEN_WORDS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `The hidden word is "${hidden}", found spanning across "${wordA}" and "${wordB}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'hidden-words',
    generatorSeed: seed,
    tags: ['hidden-words', 'vocabulary'],
  };
}
