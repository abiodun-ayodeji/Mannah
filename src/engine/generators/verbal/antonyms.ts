import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

// [word, antonym] pairs appropriate for 10-11 year olds
const ANTONYM_PAIRS: [string, string][] = [
  // Easy
  ['happy', 'sad'], ['big', 'small'], ['hot', 'cold'], ['fast', 'slow'],
  ['up', 'down'], ['in', 'out'], ['day', 'night'], ['light', 'dark'],
  ['open', 'closed'], ['new', 'old'], ['hard', 'soft'], ['wet', 'dry'],
  ['long', 'short'], ['tall', 'short'], ['fat', 'thin'], ['full', 'empty'],
  ['rich', 'poor'], ['clean', 'dirty'], ['loud', 'quiet'], ['right', 'wrong'],
  // Medium
  ['brave', 'cowardly'], ['kind', 'cruel'], ['strong', 'weak'],
  ['clever', 'foolish'], ['honest', 'dishonest'], ['polite', 'rude'],
  ['gentle', 'rough'], ['smooth', 'bumpy'], ['sharp', 'blunt'],
  ['deep', 'shallow'], ['wide', 'narrow'], ['thick', 'thin'],
  ['heavy', 'light'], ['loose', 'tight'], ['ancient', 'modern'],
  ['beautiful', 'ugly'], ['cheerful', 'gloomy'], ['generous', 'selfish'],
  ['patient', 'impatient'], ['careful', 'careless'], ['tidy', 'messy'],
  ['early', 'late'], ['simple', 'complex'], ['natural', 'artificial'],
  ['guilty', 'innocent'], ['visible', 'invisible'], ['possible', 'impossible'],
  ['common', 'rare'], ['ordinary', 'unusual'], ['noisy', 'peaceful'],
  // Harder
  ['accept', 'refuse'], ['agree', 'disagree'], ['arrive', 'depart'],
  ['attack', 'defend'], ['begin', 'finish'], ['borrow', 'lend'],
  ['capture', 'release'], ['create', 'destroy'], ['encourage', 'discourage'],
  ['expand', 'shrink'], ['forgive', 'blame'], ['gather', 'scatter'],
  ['include', 'exclude'], ['increase', 'decrease'], ['join', 'separate'],
  ['laugh', 'cry'], ['love', 'hate'], ['obey', 'disobey'],
  ['praise', 'criticise'], ['remember', 'forget'], ['reward', 'punish'],
  ['save', 'spend'], ['succeed', 'fail'], ['trust', 'suspect'],
  ['victory', 'defeat'], ['whisper', 'shout'], ['advance', 'retreat'],
  ['permit', 'forbid'], ['appear', 'vanish'], ['admire', 'despise'],
  ['benefit', 'harm'], ['comfort', 'distress'], ['demand', 'offer'],
  ['export', 'import'], ['flexible', 'rigid'], ['genuine', 'fake'],
  ['humble', 'proud'], ['inherit', 'forfeit'], ['joyful', 'miserable'],
  ['maximum', 'minimum'], ['permanent', 'temporary'], ['tragedy', 'comedy'],
];

export function generateAntonyms(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const rangeStart = difficulty <= 2 ? 0 : difficulty <= 3 ? 20 : 31;
  const rangeEnd = difficulty <= 2 ? 20 : difficulty <= 3 ? 45 : ANTONYM_PAIRS.length;

  const pairIdx = randomInt(rangeStart, rangeEnd - 1, rng);
  const [word, antonym] = ANTONYM_PAIRS[pairIdx];

  // Gather distractors: antonyms of OTHER words
  const distractors = new Set<string>();
  const allAntonyms = ANTONYM_PAIRS.map(p => p[1]);
  const shuffled = shuffle([...allAntonyms], rng);
  for (const a of shuffled) {
    if (distractors.size >= 3) break;
    if (a !== antonym && a !== word) distractors.add(a);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [antonym, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  const prompt = `Which word means the opposite of "${word}"?`;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.ANTONYMS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `"${antonym}" means the opposite of "${word}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'antonyms',
    generatorSeed: seed,
    tags: ['antonyms', 'vocabulary'],
  };
}
