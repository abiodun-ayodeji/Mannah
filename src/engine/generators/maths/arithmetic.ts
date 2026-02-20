import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

export function generateArithmetic(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const ops = ['+', '-', '×', '÷'] as const;

  let a: number, b: number, op: typeof ops[number], answer: number;

  if (difficulty <= 2) {
    op = rng() < 0.5 ? '+' : '-';
    a = randomInt(2, difficulty === 1 ? 20 : 50, rng);
    b = randomInt(2, difficulty === 1 ? 20 : 50, rng);
    if (op === '-' && b > a) [a, b] = [b, a];
    answer = op === '+' ? a + b : a - b;
  } else if (difficulty === 3) {
    const opIdx = Math.floor(rng() * 4);
    op = ops[opIdx];
    if (op === '×') {
      a = randomInt(2, 12, rng);
      b = randomInt(2, 12, rng);
      answer = a * b;
    } else if (op === '÷') {
      b = randomInt(2, 12, rng);
      answer = randomInt(2, 12, rng);
      a = b * answer;
    } else {
      a = randomInt(10, 100, rng);
      b = randomInt(10, 100, rng);
      if (op === '-' && b > a) [a, b] = [b, a];
      answer = op === '+' ? a + b : a - b;
    }
  } else {
    const opIdx = Math.floor(rng() * 4);
    op = ops[opIdx];
    if (op === '×') {
      a = randomInt(12, difficulty === 4 ? 25 : 50, rng);
      b = randomInt(2, 15, rng);
      answer = a * b;
    } else if (op === '÷') {
      b = randomInt(3, 15, rng);
      answer = randomInt(5, difficulty === 4 ? 30 : 60, rng);
      a = b * answer;
    } else {
      a = randomInt(100, difficulty === 4 ? 999 : 9999, rng);
      b = randomInt(100, difficulty === 4 ? 999 : 9999, rng);
      if (op === '-' && b > a) [a, b] = [b, a];
      answer = op === '+' ? a + b : a - b;
    }
  }

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(5, Math.floor(Math.abs(answer) * 0.2) + 1), rng);
    const d = rng() < 0.5 ? answer + offset : answer - offset;
    if (d !== answer && d >= 0) distractors.add(d);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: String(v) })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.ARITHMETIC,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `What is ${a} ${op} ${b}?`,
    options,
    correctAnswer: correctId,
    explanation: `${a} ${op} ${b} = ${answer}`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'arithmetic',
    generatorSeed: seed,
    tags: ['arithmetic', op],
  };
}
