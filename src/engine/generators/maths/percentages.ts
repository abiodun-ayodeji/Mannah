import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

export function generatePercentages(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['percentages'];

  let prompt: string;
  let answerStr: string;
  let explanation: string;

  if (difficulty <= 2) {
    // Find simple percentage of a number (10%, 25%, 50%)
    const simplePercents = difficulty === 1 ? [10, 25, 50] : [10, 20, 25, 50, 75];
    const pct = simplePercents[Math.floor(rng() * simplePercents.length)];
    const base = randomInt(2, difficulty === 1 ? 10 : 20, rng) * (100 / pct);
    const answer = (pct / 100) * base;
    answerStr = String(answer);
    prompt = `What is ${pct}% of ${base}?`;
    explanation = `${pct}% of ${base} = ${pct}/100 × ${base} = ${answer}`;
    tags.push('find_percentage');
  } else if (difficulty === 3) {
    // Percentage of a number with any common percentage, or convert fraction to percentage
    const type = rng() < 0.6 ? 'find' : 'convert';
    if (type === 'find') {
      const pct = randomInt(1, 9, rng) * 10; // 10% to 90%
      const base = randomInt(5, 30, rng) * 10;
      const answer = (pct / 100) * base;
      answerStr = String(answer);
      prompt = `What is ${pct}% of ${base}?`;
      explanation = `${pct}% of ${base} = ${pct}/100 × ${base} = ${answer}`;
      tags.push('find_percentage');
    } else {
      // Convert fraction to percentage
      const den = [2, 4, 5, 10, 20, 25][Math.floor(rng() * 6)];
      const num = randomInt(1, den - 1, rng);
      const answer = (num / den) * 100;
      answerStr = `${answer}%`;
      prompt = `Convert ${num}/${den} to a percentage.`;
      explanation = `${num}/${den} = ${num} ÷ ${den} = ${num / den} = ${answer}%`;
      tags.push('conversion');
    }
  } else if (difficulty === 4) {
    // Percentage of larger numbers, or convert decimal to percentage
    const type = rng() < 0.5 ? 'find' : 'convert';
    if (type === 'find') {
      const pct = randomInt(1, 19, rng) * 5; // 5% to 95%
      const base = randomInt(10, 50, rng) * 10;
      const answer = (pct / 100) * base;
      answerStr = String(answer);
      prompt = `What is ${pct}% of ${base}?`;
      explanation = `${pct}% of ${base} = ${pct}/100 × ${base} = ${answer}`;
      tags.push('find_percentage');
    } else {
      // Convert decimal to percentage
      const dec = randomInt(1, 99, rng) / 100;
      const answer = dec * 100;
      answerStr = `${answer}%`;
      prompt = `Convert ${dec} to a percentage.`;
      explanation = `${dec} × 100 = ${answer}%`;
      tags.push('conversion');
    }
  } else {
    // Difficulty 5: percentage increase/decrease, find original
    const type = rng() < 0.5 ? 'increase' : 'reverse';
    if (type === 'increase') {
      const pct = randomInt(1, 9, rng) * 10;
      const base = randomInt(5, 30, rng) * 10;
      const isIncrease = rng() < 0.5;
      const change = (pct / 100) * base;
      const answer = isIncrease ? base + change : base - change;
      const word = isIncrease ? 'increased' : 'decreased';
      answerStr = String(answer);
      prompt = `${base} is ${word} by ${pct}%. What is the new value?`;
      explanation = `${pct}% of ${base} = ${change}. ${base} ${isIncrease ? '+' : '-'} ${change} = ${answer}`;
      tags.push('percentage_change');
    } else {
      // Reverse percentage: a number after pct increase is X, find original
      const pct = [10, 20, 25, 50][Math.floor(rng() * 4)];
      const original = randomInt(4, 20, rng) * 10;
      const result = original + (pct / 100) * original;
      answerStr = String(original);
      prompt = `After a ${pct}% increase, a number is ${result}. What was the original number?`;
      explanation = `If original × ${1 + pct / 100} = ${result}, then original = ${result} ÷ ${1 + pct / 100} = ${original}`;
      tags.push('reverse_percentage');
    }
  }

  // Generate distractors
  const distractors = new Set<string>();
  const isPercentAnswer = answerStr.endsWith('%');
  const numericAnswer = parseFloat(answerStr);
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(5, Math.floor(Math.abs(numericAnswer) * 0.2) + 1), rng);
    const d = rng() < 0.5 ? numericAnswer + offset : numericAnswer - offset;
    if (d <= 0) continue;
    const dStr = isPercentAnswer ? `${d}%` : String(d);
    if (dStr !== answerStr) distractors.add(dStr);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answerStr, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.PERCENTAGES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'percentages',
    generatorSeed: seed,
    tags,
  };
}
