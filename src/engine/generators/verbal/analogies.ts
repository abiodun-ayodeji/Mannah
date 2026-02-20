import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

// [A, B, C, D] meaning "A is to B as C is to D"
type AnalogyEntry = [string, string, string, string];

const EASY_ANALOGIES: AnalogyEntry[] = [
  // Part / whole
  ['finger', 'hand', 'toe', 'foot'],
  ['page', 'book', 'key', 'piano'],
  ['wheel', 'car', 'wing', 'bird'],
  ['petal', 'flower', 'branch', 'tree'],
  ['room', 'house', 'cabin', 'ship'],
  // Category
  ['dog', 'animal', 'rose', 'flower'],
  ['apple', 'fruit', 'carrot', 'vegetable'],
  ['hammer', 'tool', 'guitar', 'instrument'],
  ['red', 'colour', 'french', 'language'],
  ['football', 'sport', 'chess', 'game'],
  // Young / adult
  ['kitten', 'cat', 'puppy', 'dog'],
  ['cub', 'bear', 'lamb', 'sheep'],
  ['calf', 'cow', 'foal', 'horse'],
  ['chick', 'hen', 'duckling', 'duck'],
  ['tadpole', 'frog', 'caterpillar', 'butterfly'],
  // Male / female
  ['king', 'queen', 'prince', 'princess'],
  ['boy', 'girl', 'man', 'woman'],
  ['uncle', 'aunt', 'nephew', 'niece'],
  ['brother', 'sister', 'father', 'mother'],
  ['husband', 'wife', 'groom', 'bride'],
];

const MEDIUM_ANALOGIES: AnalogyEntry[] = [
  // Tool / user
  ['brush', 'painter', 'pen', 'writer'],
  ['stethoscope', 'doctor', 'whisk', 'chef'],
  ['hammer', 'carpenter', 'needle', 'tailor'],
  ['hose', 'firefighter', 'tractor', 'farmer'],
  ['camera', 'photographer', 'microphone', 'singer'],
  // Place / person
  ['school', 'teacher', 'hospital', 'doctor'],
  ['kitchen', 'chef', 'court', 'judge'],
  ['farm', 'farmer', 'library', 'librarian'],
  ['stage', 'actor', 'pitch', 'footballer'],
  ['studio', 'artist', 'lab', 'scientist'],
  // Product / source
  ['milk', 'cow', 'egg', 'chicken'],
  ['wool', 'sheep', 'silk', 'worm'],
  ['honey', 'bee', 'pearl', 'oyster'],
  ['bread', 'wheat', 'wine', 'grape'],
  ['paper', 'tree', 'glass', 'sand'],
  // Synonym-type
  ['happy', 'joyful', 'angry', 'furious'],
  ['quick', 'rapid', 'slow', 'sluggish'],
  ['brave', 'courageous', 'scared', 'terrified'],
  ['big', 'enormous', 'small', 'minute'],
  ['pretty', 'gorgeous', 'ugly', 'hideous'],
];

const HARD_ANALOGIES: AnalogyEntry[] = [
  // Degree / intensity
  ['warm', 'hot', 'cool', 'cold'],
  ['damp', 'soaked', 'hungry', 'starving'],
  ['annoyed', 'furious', 'pleased', 'delighted'],
  ['jog', 'sprint', 'walk', 'march'],
  ['whisper', 'shout', 'drizzle', 'downpour'],
  // Function
  ['eye', 'see', 'ear', 'hear'],
  ['nose', 'smell', 'tongue', 'taste'],
  ['lock', 'key', 'question', 'answer'],
  ['thermometer', 'temperature', 'clock', 'time'],
  ['map', 'direction', 'dictionary', 'meaning'],
  // Antonym pairs
  ['tall', 'short', 'wide', 'narrow'],
  ['entrance', 'exit', 'question', 'answer'],
  ['victory', 'defeat', 'success', 'failure'],
  ['dawn', 'dusk', 'birth', 'death'],
  ['ancient', 'modern', 'stale', 'fresh'],
  // Abstract
  ['author', 'book', 'composer', 'symphony'],
  ['captain', 'ship', 'pilot', 'plane'],
  ['student', 'learn', 'teacher', 'teach'],
  ['telescope', 'stars', 'microscope', 'cells'],
  ['chapter', 'novel', 'act', 'play'],
];

export function generateAnalogies(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let pool: AnalogyEntry[];
  if (difficulty <= 2) {
    pool = EASY_ANALOGIES;
  } else if (difficulty === 3) {
    pool = MEDIUM_ANALOGIES;
  } else {
    pool = HARD_ANALOGIES;
  }

  const [a, b, c, d] = pick(pool, rng);

  // Distractors: D-values from other analogies
  const allDs = [...EASY_ANALOGIES, ...MEDIUM_ANALOGIES, ...HARD_ANALOGIES].map(e => e[3]);
  const distractors = new Set<string>();
  const shuffled = shuffle([...allDs], rng);
  for (const val of shuffled) {
    if (distractors.size >= 3) break;
    if (val !== d && val !== a && val !== b && val !== c) distractors.add(val);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [d, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  const prompt = `${a} is to ${b} as ${c} is to ?`;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.ANALOGIES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `"${a}" is to "${b}" as "${c}" is to "${d}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'analogies',
    generatorSeed: seed,
    tags: ['analogies', 'reasoning'],
  };
}
