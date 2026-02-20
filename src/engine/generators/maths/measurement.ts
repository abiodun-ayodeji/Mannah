import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId } from '../../../utils/random';

interface ConversionPair {
  from: string;
  to: string;
  factor: number;
  category: string;
}

const CONVERSIONS: ConversionPair[] = [
  { from: 'cm', to: 'm', factor: 100, category: 'length' },
  { from: 'mm', to: 'cm', factor: 10, category: 'length' },
  { from: 'm', to: 'km', factor: 1000, category: 'length' },
  { from: 'g', to: 'kg', factor: 1000, category: 'mass' },
  { from: 'ml', to: 'l', factor: 1000, category: 'capacity' },
];

export function generateMeasurement(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['measurement'];

  let prompt: string;
  let answerStr: string;
  let explanation: string;

  if (difficulty <= 2) {
    // Simple unit conversion: small to large or large to small
    const conv = CONVERSIONS[Math.floor(rng() * CONVERSIONS.length)];
    const toLarger = rng() < 0.5;
    if (toLarger) {
      const value = randomInt(1, difficulty === 1 ? 5 : 10, rng) * conv.factor;
      const answer = value / conv.factor;
      answerStr = `${answer} ${conv.to}`;
      prompt = `Convert ${value} ${conv.from} to ${conv.to}.`;
      explanation = `${value} ${conv.from} ÷ ${conv.factor} = ${answer} ${conv.to}`;
    } else {
      const value = randomInt(1, difficulty === 1 ? 5 : 10, rng);
      const answer = value * conv.factor;
      answerStr = `${answer} ${conv.from}`;
      prompt = `Convert ${value} ${conv.to} to ${conv.from}.`;
      explanation = `${value} ${conv.to} × ${conv.factor} = ${answer} ${conv.from}`;
    }
    tags.push('conversion');
  } else if (difficulty === 3) {
    // Perimeter of rectangles or non-round conversions
    const type = rng() < 0.5 ? 'perimeter' : 'conversion';
    if (type === 'perimeter') {
      const length = randomInt(3, 15, rng);
      const width = randomInt(2, 12, rng);
      const perimeter = 2 * (length + width);
      answerStr = `${perimeter} cm`;
      prompt = `A rectangle has a length of ${length} cm and a width of ${width} cm. What is its perimeter?`;
      explanation = `Perimeter = 2 × (${length} + ${width}) = 2 × ${length + width} = ${perimeter} cm`;
      tags.push('perimeter');
    } else {
      const conv = CONVERSIONS[Math.floor(rng() * CONVERSIONS.length)];
      const value = randomInt(1, 20, rng) * (conv.factor / 10) + randomInt(0, conv.factor / 10, rng);
      const answer = value / conv.factor;
      answerStr = `${answer} ${conv.to}`;
      prompt = `Convert ${value} ${conv.from} to ${conv.to}.`;
      explanation = `${value} ${conv.from} ÷ ${conv.factor} = ${answer} ${conv.to}`;
      tags.push('conversion');
    }
  } else if (difficulty === 4) {
    // Area of rectangles, or perimeter of compound shapes
    const type = rng() < 0.5 ? 'area' : 'triangle_perimeter';
    if (type === 'area') {
      const length = randomInt(4, 15, rng);
      const width = randomInt(3, 12, rng);
      const area = length * width;
      answerStr = `${area} cm²`;
      prompt = `A rectangle has a length of ${length} cm and a width of ${width} cm. What is its area?`;
      explanation = `Area = ${length} × ${width} = ${area} cm²`;
      tags.push('area');
    } else {
      const a = randomInt(5, 15, rng);
      const b = randomInt(5, 15, rng);
      const c = randomInt(Math.abs(a - b) + 1, a + b - 1, rng); // valid triangle
      const perimeter = a + b + c;
      answerStr = `${perimeter} cm`;
      prompt = `A triangle has sides of ${a} cm, ${b} cm and ${c} cm. What is its perimeter?`;
      explanation = `Perimeter = ${a} + ${b} + ${c} = ${perimeter} cm`;
      tags.push('perimeter');
    }
  } else {
    // Difficulty 5: area of triangles, combined conversions, or area with mixed units
    const type = rng() < 0.5 ? 'triangle_area' : 'composite';
    if (type === 'triangle_area') {
      const base = randomInt(4, 16, rng);
      // Ensure even product for clean halving
      const height = randomInt(2, 12, rng) * 2;
      const area = (base * height) / 2;
      answerStr = `${area} cm²`;
      prompt = `A triangle has a base of ${base} cm and a height of ${height} cm. What is its area?`;
      explanation = `Area = ½ × ${base} × ${height} = ${area} cm²`;
      tags.push('area');
    } else {
      // Composite shape: L-shape (two rectangles)
      const w1 = randomInt(3, 8, rng);
      const h1 = randomInt(5, 12, rng);
      const w2 = randomInt(3, 8, rng);
      const h2 = randomInt(3, 6, rng);
      const area = w1 * h1 + w2 * h2;
      answerStr = `${area} cm²`;
      prompt = `An L-shaped figure is made of two rectangles. The first is ${w1} cm by ${h1} cm and the second is ${w2} cm by ${h2} cm. What is the total area?`;
      explanation = `Area = (${w1} × ${h1}) + (${w2} × ${h2}) = ${w1 * h1} + ${w2 * h2} = ${area} cm²`;
      tags.push('area', 'composite');
    }
  }

  // Generate distractors
  const numericMatch = answerStr.match(/^([\d.]+)\s*(.*)$/);
  const numericAnswer = numericMatch ? parseFloat(numericMatch[1]) : 0;
  const unit = numericMatch ? numericMatch[2] : '';

  const distractors = new Set<string>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.floor(numericAnswer * 0.2) + 1), rng);
    const d = rng() < 0.5 ? numericAnswer + offset : numericAnswer - offset;
    if (d > 0) {
      const dStr = `${d} ${unit}`.trim();
      if (dStr !== answerStr) distractors.add(dStr);
    }
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answerStr, ...distractors].map((v, i) => ({ id: i === 0 ? correctId : uniqueId(), label: v })),
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.MEASUREMENT,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'measurement',
    generatorSeed: seed,
    tags,
  };
}
