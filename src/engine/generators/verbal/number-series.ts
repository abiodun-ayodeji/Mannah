import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

export function generateNumberSeries(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let series: number[];
  let answer: number;
  let patternDesc: string;

  if (difficulty <= 2) {
    // Simple add constant
    const step = difficulty === 1 ? pick([2, 3, 5, 10], rng) : pick([3, 4, 6, 7, 8, 9], rng);
    const start = randomInt(1, 20, rng);
    const length = difficulty === 1 ? 4 : 5;
    series = [];
    for (let i = 0; i < length; i++) {
      series.push(start + i * step);
    }
    answer = start + length * step;
    patternDesc = `Each number increases by ${step}.`;
  } else if (difficulty === 3) {
    const variant = Math.floor(rng() * 3);
    if (variant === 0) {
      // Multiply by constant
      const mult = pick([2, 3], rng);
      const start = randomInt(1, 5, rng);
      series = [];
      let val = start;
      for (let i = 0; i < 4; i++) {
        series.push(val);
        val *= mult;
      }
      answer = val;
      patternDesc = `Each number is multiplied by ${mult}.`;
    } else if (variant === 1) {
      // Alternating add two different values
      const addA = randomInt(2, 5, rng);
      const addB = randomInt(3, 7, rng);
      const start = randomInt(1, 10, rng);
      series = [start];
      for (let i = 1; i < 5; i++) {
        series.push(series[i - 1] + (i % 2 === 1 ? addA : addB));
      }
      answer = series[4] + addA;
      patternDesc = `The pattern alternates between adding ${addA} and adding ${addB}.`;
    } else {
      // Fibonacci-like: each number is sum of previous two
      const a = randomInt(1, 5, rng);
      const b = randomInt(1, 5, rng);
      series = [a, b];
      for (let i = 2; i < 5; i++) {
        series.push(series[i - 1] + series[i - 2]);
      }
      answer = series[4] + series[3];
      patternDesc = `Each number is the sum of the two numbers before it (like Fibonacci).`;
    }
  } else {
    // Difficulty 4-5: subtract, square, or mixed patterns
    const variant = Math.floor(rng() * 3);
    if (variant === 0) {
      // Decreasing by growing amounts: -1, -2, -3, -4...
      const start = randomInt(40, 80, rng);
      series = [start];
      for (let i = 1; i < 5; i++) {
        series.push(series[i - 1] - i);
      }
      answer = series[4] - 5;
      patternDesc = `The amount subtracted increases by 1 each time: -1, -2, -3, -4, -5.`;
    } else if (variant === 1) {
      // Square numbers +/- offset
      const offset = randomInt(0, 3, rng);
      series = [];
      const startN = randomInt(1, 4, rng);
      for (let i = 0; i < 5; i++) {
        series.push((startN + i) * (startN + i) + offset);
      }
      answer = (startN + 5) * (startN + 5) + offset;
      patternDesc = offset === 0
        ? `The numbers are perfect squares: ${startN}^2, ${startN + 1}^2, ${startN + 2}^2...`
        : `Each number is a perfect square plus ${offset}.`;
    } else {
      // Multiply then add: ×2+1
      const mult = pick([2, 3], rng);
      const add = randomInt(1, 3, rng);
      const start = randomInt(1, 4, rng);
      series = [start];
      for (let i = 1; i < 5; i++) {
        series.push(series[i - 1] * mult + add);
      }
      answer = series[4] * mult + add;
      patternDesc = `Each number is the previous number multiplied by ${mult} then plus ${add}.`;
    }
  }

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(5, Math.floor(Math.abs(answer) * 0.15) + 1), rng);
    const d = rng() < 0.5 ? answer + offset : answer - offset;
    if (d !== answer && d >= 0) distractors.add(d);
  }
  // Fill remaining if needed
  let fill = 1;
  while (distractors.size < 3) {
    if (answer + fill !== answer) distractors.add(answer + fill);
    fill++;
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: String(v) })),
    rng
  );

  const prompt = `What comes next in the series?\n${series.join(', ')}, ?`;

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.NUMBER_SERIES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation: `The answer is ${answer}. ${patternDesc}`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'number-series',
    generatorSeed: seed,
    tags: ['number-series', 'pattern'],
  };
}
