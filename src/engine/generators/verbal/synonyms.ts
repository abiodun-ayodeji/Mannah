import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

// [word, synonym] pairs appropriate for 10-11 year olds
const SYNONYM_PAIRS: [string, string][] = [
  // Easy
  ['happy', 'glad'], ['sad', 'unhappy'], ['big', 'large'], ['small', 'tiny'],
  ['fast', 'quick'], ['slow', 'sluggish'], ['start', 'begin'], ['end', 'finish'],
  ['look', 'gaze'], ['run', 'sprint'], ['talk', 'speak'], ['walk', 'stroll'],
  ['nice', 'pleasant'], ['mean', 'cruel'], ['old', 'ancient'], ['new', 'fresh'],
  ['hard', 'difficult'], ['easy', 'simple'], ['cold', 'chilly'], ['hot', 'boiling'],
  // Medium
  ['brave', 'courageous'], ['scared', 'frightened'], ['angry', 'furious'],
  ['quiet', 'silent'], ['loud', 'noisy'], ['clever', 'intelligent'],
  ['silly', 'foolish'], ['tired', 'exhausted'], ['hungry', 'starving'],
  ['rich', 'wealthy'], ['poor', 'destitute'], ['strong', 'powerful'],
  ['weak', 'feeble'], ['kind', 'generous'], ['rude', 'impolite'],
  ['dirty', 'filthy'], ['clean', 'spotless'], ['pretty', 'beautiful'],
  ['ugly', 'hideous'], ['bright', 'brilliant'], ['dark', 'gloomy'],
  ['wet', 'damp'], ['dry', 'parched'], ['thin', 'slender'],
  ['fat', 'plump'], ['tall', 'towering'], ['short', 'brief'],
  ['wide', 'broad'], ['narrow', 'slim'], ['deep', 'profound'],
  // Harder
  ['destroy', 'demolish'], ['build', 'construct'], ['fix', 'repair'],
  ['break', 'shatter'], ['find', 'discover'], ['lose', 'misplace'],
  ['hide', 'conceal'], ['show', 'reveal'], ['grab', 'seize'],
  ['throw', 'hurl'], ['pull', 'drag'], ['push', 'shove'],
  ['choose', 'select'], ['reject', 'refuse'], ['agree', 'consent'],
  ['argue', 'dispute'], ['help', 'assist'], ['harm', 'injure'],
  ['praise', 'compliment'], ['blame', 'accuse'], ['trust', 'rely'],
  ['doubt', 'question'], ['enjoy', 'relish'], ['hate', 'detest'],
  ['love', 'adore'], ['fear', 'dread'], ['hope', 'wish'],
  ['want', 'desire'], ['need', 'require'], ['give', 'donate'],
  ['take', 'seize'], ['buy', 'purchase'], ['sell', 'trade'],
  ['win', 'triumph'], ['fail', 'falter'], ['try', 'attempt'],
  ['stop', 'cease'], ['move', 'shift'], ['stay', 'remain'],
  ['leave', 'depart'], ['arrive', 'reach'], ['hurry', 'rush'],
  ['wait', 'linger'], ['happen', 'occur'], ['change', 'alter'],
  ['keep', 'retain'], ['drop', 'release'], ['hold', 'grasp'],
  ['carry', 'transport'], ['lift', 'raise'], ['lower', 'reduce'],
];

export function generateSynonyms(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  // Select difficulty range
  const rangeStart = difficulty <= 2 ? 0 : difficulty <= 3 ? 20 : 31;
  const rangeEnd = difficulty <= 2 ? 20 : difficulty <= 3 ? 45 : SYNONYM_PAIRS.length;

  const pairIdx = randomInt(rangeStart, rangeEnd - 1, rng);
  const [word, synonym] = SYNONYM_PAIRS[pairIdx];

  // Gather distractors: synonyms of OTHER words (not the correct one)
  const distractors = new Set<string>();
  const allSynonyms = SYNONYM_PAIRS.map(p => p[1]);
  const shuffled = shuffle([...allSynonyms], rng);
  for (const s of shuffled) {
    if (distractors.size >= 3) break;
    if (s !== synonym && s !== word) distractors.add(s);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [synonym, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  const prompt = `Which word means the same as "${word}"?`;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.SYNONYMS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `"${synonym}" means the same as "${word}".`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'synonyms',
    generatorSeed: seed,
    tags: ['synonyms', 'vocabulary'],
  };
}
