import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

// Each entry: [originalWord1, originalWord2, movedLetter, newWord1, newWord2]
// Moving 'movedLetter' from word1 to word2 creates two new valid words
interface MoveLetterEntry {
  word1: string;
  word2: string;
  letter: string;
  result1: string;
  result2: string;
}

const ENTRIES: MoveLetterEntry[] = [
  { word1: 'brand', word2: 'ale', letter: 'b', result1: 'rand', result2: 'bale' },
  { word1: 'spin', word2: 'pot', letter: 's', result1: 'pin', result2: 'spot' },
  { word1: 'charm', word2: 'air', letter: 'c', result1: 'harm', result2: 'cair' },
  { word1: 'wheat', word2: 'here', letter: 'w', result1: 'heat', result2: 'where' },
  { word1: 'train', word2: 'ape', letter: 't', result1: 'rain', result2: 'tape' },
  { word1: 'plane', word2: 'ink', letter: 'p', result1: 'lane', result2: 'pink' },
  { word1: 'float', word2: 'lag', letter: 'f', result1: 'loat', result2: 'flag' },
  { word1: 'crate', word2: 'lean', letter: 'c', result1: 'rate', result2: 'clean' },
  { word1: 'swing', word2: 'tar', letter: 's', result1: 'wing', result2: 'star' },
  { word1: 'bland', word2: 'rim', letter: 'b', result1: 'land', result2: 'brim' },
  { word1: 'clap', word2: 'over', letter: 'c', result1: 'lap', result2: 'cover' },
  { word1: 'scold', word2: 'nap', letter: 's', result1: 'cold', result2: 'snap' },
  { word1: 'stake', word2: 'hoe', letter: 's', result1: 'take', result2: 'shoe' },
  { word1: 'place', word2: 'ride', letter: 'p', result1: 'lace', result2: 'pride' },
  { word1: 'stone', word2: 'top', letter: 's', result1: 'tone', result2: 'stop' },
  { word1: 'glare', word2: 'row', letter: 'g', result1: 'lare', result2: 'grow' },
  { word1: 'spare', word2: 'lid', letter: 's', result1: 'pare', result2: 'slid' },
  { word1: 'trail', word2: 'hip', letter: 't', result1: 'rail', result2: 'trip' },
  { word1: 'threw', word2: 'rig', letter: 't', result1: 'hrew', result2: 'trig' },
  { word1: 'blank', word2: 'lock', letter: 'b', result1: 'lank', result2: 'block' },
  { word1: 'price', word2: 'lay', letter: 'p', result1: 'rice', result2: 'play' },
  { word1: 'gland', word2: 'rip', letter: 'g', result1: 'land', result2: 'grip' },
  { word1: 'clown', word2: 'ash', letter: 'c', result1: 'lown', result2: 'cash' },
  { word1: 'shred', word2: 'lip', letter: 's', result1: 'hred', result2: 'slip' },
  { word1: 'black', word2: 'lend', letter: 'b', result1: 'lack', result2: 'blend' },
  { word1: 'crown', word2: 'lap', letter: 'c', result1: 'rown', result2: 'clap' },
  { word1: 'print', word2: 'ear', letter: 'p', result1: 'rint', result2: 'pear' },
  { word1: 'stain', word2: 'lug', letter: 's', result1: 'tain', result2: 'slug' },
  { word1: 'braid', word2: 'one', letter: 'b', result1: 'raid', result2: 'bone' },
  { word1: 'clamp', word2: 'rash', letter: 'c', result1: 'lamp', result2: 'crash' },
];

// Only keep entries where both results are sensible (filter out 'loat', 'hrew', 'lown', 'rown', 'rint', 'tain', 'hred', 'lare', 'cair')
const VALID_ENTRIES = ENTRIES.filter(e => {
  const goodResults = [
    'rand', 'bale', 'pin', 'spot', 'heat', 'where', 'rain', 'tape',
    'lane', 'pink', 'rate', 'clean', 'wing', 'star', 'land', 'brim',
    'lap', 'cover', 'cold', 'snap', 'take', 'shoe', 'lace', 'pride',
    'tone', 'stop', 'pare', 'slid', 'rail', 'trip', 'lank', 'block',
    'rice', 'play', 'land', 'grip', 'lack', 'blend', 'lamp', 'crash',
    'raid', 'bone',
  ];
  return goodResults.includes(e.result1) && goodResults.includes(e.result2);
});

export function generateMoveALetter(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const entry = pick(VALID_ENTRIES.length > 0 ? VALID_ENTRIES : ENTRIES.slice(0, 15), rng);
  const { word1, word2, letter, result1, result2 } = entry;

  const prompt = difficulty <= 2
    ? `Move one letter from "${word1}" to the start of "${word2}" to make two new words. Which letter should you move?`
    : `Move one letter from the first word to the second word to make two new real words.\n\n${word1}    ${word2}\n\nWhich letter do you move?`;

  const answer = letter.toLowerCase();

  // Distractors: other letters from word1
  const distractors = new Set<string>();
  const letters = word1.toLowerCase().split('').filter(l => l !== answer);
  const shuffledLetters = shuffle([...new Set(letters)], rng);
  for (const l of shuffledLetters) {
    if (distractors.size >= 3) break;
    distractors.add(l);
  }
  // Fill if needed
  const extraLetters = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(l => l !== answer && !distractors.has(l));
  const shuffledExtra = shuffle(extraLetters, rng);
  for (const l of shuffledExtra) {
    if (distractors.size >= 3) break;
    distractors.add(l);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.MOVE_A_LETTER,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `Move the letter "${letter}" from "${word1}" to "${word2}" to make "${result1}" and "${result2}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'move-a-letter',
    generatorSeed: seed,
    tags: ['move-a-letter', 'word-manipulation'],
  };
}
