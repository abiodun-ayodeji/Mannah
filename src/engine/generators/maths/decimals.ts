import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

function round(value: number, dp: number): number {
  const factor = Math.pow(10, dp);
  return Math.round(value * factor) / factor;
}

export function generateDecimals(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['decimals'];

  let prompt: string;
  let answer: number;
  let explanation: string;

  if (difficulty <= 2) {
    // Add/subtract decimals with 1 decimal place
    const a = round(randomInt(10, difficulty === 1 ? 50 : 100, rng) / 10, 1);
    const b = round(randomInt(10, difficulty === 1 ? 50 : 100, rng) / 10, 1);
    const isAdd = rng() < 0.5;
    if (isAdd) {
      answer = round(a + b, 1);
      prompt = `What is ${a.toFixed(1)} + ${b.toFixed(1)}?`;
      explanation = `${a.toFixed(1)} + ${b.toFixed(1)} = ${answer.toFixed(1)}`;
      tags.push('addition');
    } else {
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      answer = round(big - small, 1);
      prompt = `What is ${big.toFixed(1)} - ${small.toFixed(1)}?`;
      explanation = `${big.toFixed(1)} - ${small.toFixed(1)} = ${answer.toFixed(1)}`;
      tags.push('subtraction');
    }
  } else if (difficulty === 3) {
    // Add/subtract with 2 decimal places or multiply 1dp
    const type = rng() < 0.5 ? 'add' : 'multiply';
    if (type === 'add') {
      const a = round(randomInt(100, 999, rng) / 100, 2);
      const b = round(randomInt(100, 999, rng) / 100, 2);
      const isAdd = rng() < 0.5;
      if (isAdd) {
        answer = round(a + b, 2);
        prompt = `What is ${a.toFixed(2)} + ${b.toFixed(2)}?`;
        explanation = `${a.toFixed(2)} + ${b.toFixed(2)} = ${answer.toFixed(2)}`;
        tags.push('addition');
      } else {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        answer = round(big - small, 2);
        prompt = `What is ${big.toFixed(2)} - ${small.toFixed(2)}?`;
        explanation = `${big.toFixed(2)} - ${small.toFixed(2)} = ${answer.toFixed(2)}`;
        tags.push('subtraction');
      }
    } else {
      const a = round(randomInt(10, 99, rng) / 10, 1);
      const b = randomInt(2, 9, rng);
      answer = round(a * b, 1);
      prompt = `What is ${a.toFixed(1)} × ${b}?`;
      explanation = `${a.toFixed(1)} × ${b} = ${answer}`;
      tags.push('multiplication');
    }
  } else if (difficulty === 4) {
    // Multiply two decimals or round to dp
    const type = rng() < 0.5 ? 'multiply' : 'round';
    if (type === 'multiply') {
      const a = round(randomInt(10, 99, rng) / 10, 1);
      const b = round(randomInt(10, 99, rng) / 10, 1);
      answer = round(a * b, 2);
      prompt = `What is ${a.toFixed(1)} × ${b.toFixed(1)}?`;
      explanation = `${a.toFixed(1)} × ${b.toFixed(1)} = ${answer}`;
      tags.push('multiplication');
    } else {
      const raw = round(randomInt(1000, 9999, rng) / 1000, 3);
      const dp = randomInt(1, 2, rng);
      answer = round(raw, dp);
      prompt = `Round ${raw.toFixed(3)} to ${dp} decimal place${dp > 1 ? 's' : ''}.`;
      explanation = `${raw.toFixed(3)} rounded to ${dp} decimal place${dp > 1 ? 's' : ''} is ${answer.toFixed(dp)}`;
      tags.push('rounding');
    }
  } else {
    // Difficulty 5: multi-step or larger multiplications
    const type = rng() < 0.5 ? 'multiply' : 'multi_step';
    if (type === 'multiply') {
      const a = round(randomInt(100, 999, rng) / 100, 2);
      const b = round(randomInt(10, 99, rng) / 10, 1);
      answer = round(a * b, 2);
      prompt = `What is ${a.toFixed(2)} × ${b.toFixed(1)}?`;
      explanation = `${a.toFixed(2)} × ${b.toFixed(1)} = ${answer}`;
      tags.push('multiplication');
    } else {
      const a = round(randomInt(100, 500, rng) / 100, 2);
      const b = round(randomInt(100, 500, rng) / 100, 2);
      const c = round(randomInt(10, 99, rng) / 10, 1);
      answer = round(a + b + c, 2);
      prompt = `What is ${a.toFixed(2)} + ${b.toFixed(2)} + ${c.toFixed(1)}?`;
      explanation = `${a.toFixed(2)} + ${b.toFixed(2)} + ${c.toFixed(1)} = ${answer}`;
      tags.push('addition');
    }
  }

  // Format answer for display
  const answerStr = Number.isInteger(answer) ? String(answer) : String(answer);

  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const offset = round(randomInt(1, Math.max(5, Math.floor(Math.abs(answer) * 20) + 1), rng) / 100, 2);
    const d = rng() < 0.5 ? round(answer + offset, 2) : round(answer - offset, 2);
    const dStr = String(d);
    if (dStr !== answerStr && d >= 0) distractors.add(dStr);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answerStr, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.DECIMALS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'decimals',
    generatorSeed: seed,
    tags,
  };
}
