import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

export function generateAlgebra(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['algebra'];

  let prompt: string;
  let answer: number;
  let explanation: string;

  if (difficulty <= 2) {
    // Simple one-step: x + a = b  or  x - a = b
    const isAdd = rng() < 0.5;
    const a = randomInt(1, difficulty === 1 ? 10 : 20, rng);
    const x = randomInt(1, difficulty === 1 ? 10 : 20, rng);
    if (isAdd) {
      const b = x + a;
      prompt = `Find x: x + ${a} = ${b}`;
      explanation = `x + ${a} = ${b}, so x = ${b} - ${a} = ${x}`;
      tags.push('addition');
    } else {
      const b = x - a > 0 ? x - a : x + a;
      if (x - a > 0) {
        prompt = `Find x: x - ${a} = ${x - a}`;
        explanation = `x - ${a} = ${x - a}, so x = ${x - a} + ${a} = ${x}`;
      } else {
        // Use addition instead to keep positive
        const b2 = x + a;
        prompt = `Find x: x + ${a} = ${b2}`;
        explanation = `x + ${a} = ${b2}, so x = ${b2} - ${a} = ${x}`;
      }
    }
    answer = x;
  } else if (difficulty === 3) {
    // One-step multiply/divide: ax = b  or  x/a = b
    const isMultiply = rng() < 0.5;
    if (isMultiply) {
      const a = randomInt(2, 10, rng);
      const x = randomInt(2, 12, rng);
      const b = a * x;
      prompt = `Find x: ${a}x = ${b}`;
      explanation = `${a}x = ${b}, so x = ${b} ÷ ${a} = ${x}`;
      answer = x;
      tags.push('multiplication');
    } else {
      const a = randomInt(2, 8, rng);
      const x = randomInt(2, 12, rng);
      const b = x * a;
      prompt = `Find x: x ÷ ${a} = ${x}`;
      // Actually b/a = x, so ask: b ÷ a = x means find b? No, let's keep it standard.
      // x / a = result, find x
      const result = x;
      prompt = `Find x: x ÷ ${a} = ${result}`;
      answer = result * a;
      explanation = `x ÷ ${a} = ${result}, so x = ${result} × ${a} = ${answer}`;
      tags.push('division');
    }
  } else if (difficulty === 4) {
    // Two-step: ax + b = c  or  ax - b = c
    const a = randomInt(2, 8, rng);
    const x = randomInt(1, 12, rng);
    const b = randomInt(1, 15, rng);
    const isAdd = rng() < 0.5;
    if (isAdd) {
      const c = a * x + b;
      prompt = `Find x: ${a}x + ${b} = ${c}`;
      explanation = `${a}x + ${b} = ${c} → ${a}x = ${c} - ${b} = ${c - b} → x = ${c - b} ÷ ${a} = ${x}`;
    } else {
      const c = a * x - b;
      if (c > 0) {
        prompt = `Find x: ${a}x - ${b} = ${c}`;
        explanation = `${a}x - ${b} = ${c} → ${a}x = ${c} + ${b} = ${c + b} → x = ${c + b} ÷ ${a} = ${x}`;
      } else {
        const c2 = a * x + b;
        prompt = `Find x: ${a}x + ${b} = ${c2}`;
        explanation = `${a}x + ${b} = ${c2} → ${a}x = ${c2} - ${b} = ${c2 - b} → x = ${c2 - b} ÷ ${a} = ${x}`;
      }
    }
    answer = x;
    tags.push('two_step');
  } else {
    // Difficulty 5: Two-step with larger numbers or x on both sides simplified
    const type = rng() < 0.5 ? 'two_step_large' : 'both_sides';
    if (type === 'two_step_large') {
      const a = randomInt(3, 12, rng);
      const x = randomInt(2, 15, rng);
      const b = randomInt(5, 30, rng);
      const c = a * x + b;
      prompt = `Find x: ${a}x + ${b} = ${c}`;
      explanation = `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${c - b} ÷ ${a} = ${x}`;
      answer = x;
      tags.push('two_step');
    } else {
      // ax + b = cx + d where a > c
      const x = randomInt(1, 10, rng);
      const a = randomInt(4, 10, rng);
      const c = randomInt(1, a - 1, rng);
      const d = randomInt(1, 20, rng);
      const b = c * x + d - a * x;
      // Ensure b makes sense (could be negative, present as subtraction)
      const lhs = a * x + b;
      const rhs = c * x + d;
      if (b >= 0) {
        prompt = `Find x: ${a}x + ${b} = ${c}x + ${d}`;
        explanation = `${a}x + ${b} = ${c}x + ${d} → ${a - c}x = ${d - b} → x = ${d - b} ÷ ${a - c} = ${x}`;
      } else {
        prompt = `Find x: ${a}x - ${Math.abs(b)} = ${c}x + ${d}`;
        explanation = `${a}x - ${Math.abs(b)} = ${c}x + ${d} → ${a - c}x = ${d + Math.abs(b)} → x = ${d + Math.abs(b)} ÷ ${a - c} = ${x}`;
      }
      answer = x;
      tags.push('both_sides');
    }
  }

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.floor(answer * 0.3) + 1), rng);
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
    topic: MathsTopic.ALGEBRA,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'algebra',
    generatorSeed: seed,
    tags,
  };
}
