import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function simplify(num: number, den: number): [number, number] {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(Math.abs(num), den);
  return [num / g, den / g];
}

function fractionToString(num: number, den: number): string {
  const [sn, sd] = simplify(num, den);
  if (sd === 1) return String(sn);
  if (Math.abs(sn) > sd) {
    const whole = Math.floor(Math.abs(sn) / sd);
    const rem = Math.abs(sn) % sd;
    const sign = sn < 0 ? '-' : '';
    if (rem === 0) return `${sign}${whole}`;
    return `${sign}${whole} ${rem}/${sd}`;
  }
  return `${sn}/${sd}`;
}

export function generateFractions(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let prompt: string;
  let answerNum: number;
  let answerDen: number;
  let explanation: string;
  const tags: string[] = ['fractions'];

  if (difficulty <= 2) {
    // Same denominator add/subtract
    const den = randomInt(2, difficulty === 1 ? 6 : 10, rng);
    const a = randomInt(1, den - 1, rng);
    let b = randomInt(1, den - 1, rng);
    const isAdd = rng() < 0.5;
    if (!isAdd && b > a) b = randomInt(1, a, rng);
    const op = isAdd ? '+' : '-';
    answerNum = isAdd ? a + b : a - b;
    answerDen = den;
    prompt = `What is ${a}/${den} ${op} ${b}/${den}?`;
    const [sn, sd] = simplify(answerNum, answerDen);
    explanation = `${a}/${den} ${op} ${b}/${den} = ${answerNum}/${den} = ${fractionToString(sn, sd)}`;
    tags.push(isAdd ? 'addition' : 'subtraction');
  } else if (difficulty === 3) {
    // Different denominators add/subtract, simplify
    const den1 = randomInt(2, 8, rng);
    let den2 = randomInt(2, 8, rng);
    while (den2 === den1) den2 = randomInt(2, 8, rng);
    const a = randomInt(1, den1 - 1, rng);
    const b = randomInt(1, den2 - 1, rng);
    const isAdd = rng() < 0.5;
    const commonDen = lcm(den1, den2);
    const aScaled = a * (commonDen / den1);
    const bScaled = b * (commonDen / den2);
    const resultNum = isAdd ? aScaled + bScaled : aScaled - bScaled;
    if (!isAdd && resultNum < 0) {
      // Retry with addition to avoid negatives
      answerNum = aScaled + bScaled;
      answerDen = commonDen;
      prompt = `What is ${a}/${den1} + ${b}/${den2}? Simplify your answer.`;
      const [sn, sd] = simplify(answerNum, answerDen);
      explanation = `${a}/${den1} + ${b}/${den2} = ${aScaled}/${commonDen} + ${bScaled}/${commonDen} = ${answerNum}/${commonDen} = ${fractionToString(sn, sd)}`;
      tags.push('addition');
    } else {
      const op = isAdd ? '+' : '-';
      answerNum = resultNum;
      answerDen = commonDen;
      prompt = `What is ${a}/${den1} ${op} ${b}/${den2}? Simplify your answer.`;
      const [sn, sd] = simplify(answerNum, answerDen);
      explanation = `${a}/${den1} ${op} ${b}/${den2} = ${aScaled}/${commonDen} ${op} ${bScaled}/${commonDen} = ${answerNum}/${commonDen} = ${fractionToString(sn, sd)}`;
      tags.push(isAdd ? 'addition' : 'subtraction');
    }
  } else {
    // Difficulty 4-5: Multiply/divide fractions, mixed numbers
    const isMultiply = rng() < 0.5;
    if (difficulty === 4) {
      const num1 = randomInt(1, 5, rng);
      const den1 = randomInt(2, 6, rng);
      const num2 = randomInt(1, 5, rng);
      const den2 = randomInt(2, 6, rng);
      if (isMultiply) {
        answerNum = num1 * num2;
        answerDen = den1 * den2;
        prompt = `What is ${num1}/${den1} × ${num2}/${den2}? Simplify your answer.`;
        const [sn, sd] = simplify(answerNum, answerDen);
        explanation = `${num1}/${den1} × ${num2}/${den2} = ${answerNum}/${answerDen} = ${fractionToString(sn, sd)}`;
        tags.push('multiplication');
      } else {
        answerNum = num1 * den2;
        answerDen = den1 * num2;
        prompt = `What is ${num1}/${den1} ÷ ${num2}/${den2}? Simplify your answer.`;
        const [sn, sd] = simplify(answerNum, answerDen);
        explanation = `${num1}/${den1} ÷ ${num2}/${den2} = ${num1}/${den1} × ${den2}/${num2} = ${answerNum}/${answerDen} = ${fractionToString(sn, sd)}`;
        tags.push('division');
      }
    } else {
      // Difficulty 5: mixed numbers
      const whole1 = randomInt(1, 4, rng);
      const num1 = randomInt(1, 3, rng);
      const den1 = randomInt(2, 5, rng);
      const whole2 = randomInt(1, 3, rng);
      const num2 = randomInt(1, 3, rng);
      const den2 = randomInt(2, 5, rng);
      const imp1 = whole1 * den1 + num1;
      const imp2 = whole2 * den2 + num2;
      if (isMultiply) {
        answerNum = imp1 * imp2;
        answerDen = den1 * den2;
        prompt = `What is ${whole1} ${num1}/${den1} × ${whole2} ${num2}/${den2}? Simplify your answer.`;
        const [sn, sd] = simplify(answerNum, answerDen);
        explanation = `${whole1} ${num1}/${den1} × ${whole2} ${num2}/${den2} = ${imp1}/${den1} × ${imp2}/${den2} = ${answerNum}/${answerDen} = ${fractionToString(sn, sd)}`;
        tags.push('multiplication', 'mixed_numbers');
      } else {
        answerNum = imp1 * den2;
        answerDen = den1 * imp2;
        prompt = `What is ${whole1} ${num1}/${den1} ÷ ${whole2} ${num2}/${den2}? Simplify your answer.`;
        const [sn, sd] = simplify(answerNum, answerDen);
        explanation = `${whole1} ${num1}/${den1} ÷ ${whole2} ${num2}/${den2} = ${imp1}/${den1} × ${den2}/${imp2} = ${answerNum}/${answerDen} = ${fractionToString(sn, sd)}`;
        tags.push('division', 'mixed_numbers');
      }
    }
  }

  const [sn, sd] = simplify(answerNum, answerDen);
  const answerStr = fractionToString(sn, sd);

  // Generate distractors
  const distractors = new Set<string>();
  while (distractors.size < 3) {
    let dNum = sn + randomInt(-3, 3, rng);
    let dDen = sd + randomInt(-1, 2, rng);
    if (dDen <= 0) dDen = sd + 1;
    if (dNum === 0) dNum = 1;
    const [dn, dd] = simplify(dNum, dDen);
    const dStr = fractionToString(dn, dd);
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
    topic: MathsTopic.FRACTIONS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'fractions',
    generatorSeed: seed,
    tags,
  };
}
