import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function generateLetterSeries(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let series: string[];
  let answer: string;
  let patternDesc: string;

  if (difficulty <= 2) {
    // Simple skip patterns: every 2nd or 3rd letter
    const skip = difficulty === 1 ? 2 : pick([2, 3], rng);
    const start = randomInt(0, 10, rng);
    const length = 4;
    series = [];
    for (let i = 0; i < length; i++) {
      series.push(ALPHABET[(start + i * skip) % 26]);
    }
    answer = ALPHABET[(start + length * skip) % 26];
    patternDesc = `Each letter skips ${skip - 1} letter${skip > 2 ? 's' : ''} in the alphabet.`;
  } else if (difficulty === 3) {
    // Alternating skip or reverse patterns
    const variant = Math.floor(rng() * 2);
    if (variant === 0) {
      // Alternating forward skip: +1, +3, +1, +3...
      const skipA = randomInt(1, 2, rng);
      const skipB = randomInt(2, 4, rng);
      const start = randomInt(0, 8, rng);
      series = [];
      let pos = start;
      for (let i = 0; i < 5; i++) {
        series.push(ALPHABET[pos % 26]);
        pos += i % 2 === 0 ? skipA : skipB;
      }
      answer = ALPHABET[pos % 26];
      patternDesc = `The pattern alternates between skipping +${skipA} and +${skipB}.`;
    } else {
      // Decreasing letters (reverse)
      const skip = pick([2, 3], rng);
      const start = randomInt(18, 25, rng);
      const length = 4;
      series = [];
      for (let i = 0; i < length; i++) {
        const idx = (start - i * skip + 26) % 26;
        series.push(ALPHABET[idx]);
      }
      answer = ALPHABET[(start - length * skip + 26) % 26];
      patternDesc = `Each letter goes back ${skip} position${skip > 1 ? 's' : ''} in the alphabet.`;
    }
  } else {
    // Double interleaved series or growing gaps
    const variant = Math.floor(rng() * 2);
    if (variant === 0) {
      // Two interleaved ascending series
      const startA = randomInt(0, 5, rng);
      const startB = randomInt(10, 16, rng);
      const skipA = pick([1, 2], rng);
      const skipB = pick([1, 2], rng);
      series = [];
      for (let i = 0; i < 3; i++) {
        series.push(ALPHABET[(startA + i * skipA) % 26]);
        series.push(ALPHABET[(startB + i * skipB) % 26]);
      }
      // Next in first series
      answer = ALPHABET[(startA + 3 * skipA) % 26];
      patternDesc = `Two series are interleaved: one starting at ${ALPHABET[startA]} (+${skipA}) and another at ${ALPHABET[startB]} (+${skipB}).`;
    } else {
      // Growing gap: +1, +2, +3, +4...
      const start = randomInt(0, 5, rng);
      const length = difficulty === 4 ? 5 : 6;
      series = [];
      let pos = start;
      for (let i = 0; i < length; i++) {
        series.push(ALPHABET[pos % 26]);
        pos += i + 1;
      }
      answer = ALPHABET[pos % 26];
      patternDesc = `The gap between letters increases by 1 each time: +1, +2, +3, +4...`;
    }
  }

  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const d = ALPHABET[randomInt(0, 25, rng)];
    if (d !== answer) distractors.add(d);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  const prompt = `What comes next in the series?\n${series.join(', ')}, ?`;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.LETTER_SERIES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `The answer is ${answer}. ${patternDesc}`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'letter-series',
    generatorSeed: seed,
    tags: ['letter-series', 'pattern'],
  };
}
