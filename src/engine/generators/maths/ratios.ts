import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function numericDistractors(answer: number, rng: () => number): number[] {
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.floor(Math.abs(answer) * 0.3) + 1), rng);
    const d = rng() < 0.5 ? answer + offset : answer - offset;
    if (d !== answer && d > 0) distractors.add(d);
  }
  return [...distractors];
}

export function generateRatios(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let prompt: string;
  let answer: number | string;
  let distractorValues: (number | string)[];
  let explanation: string;
  const tags: string[] = ['ratios'];

  if (difficulty <= 2) {
    // Simplify a ratio
    const g = randomInt(2, difficulty === 1 ? 5 : 8, rng);
    const a = randomInt(1, 5, rng);
    const b = randomInt(1, 5, rng);
    if (a === b) {
      // Avoid trivial 1:1
      const adjustedB = b + 1;
      const fullA = a * g;
      const fullB = adjustedB * g;
      prompt = `Simplify the ratio ${fullA} : ${fullB}`;
      answer = `${a} : ${adjustedB}`;
      explanation = `Divide both sides by ${g}: ${fullA} ÷ ${g} = ${a} and ${fullB} ÷ ${g} = ${adjustedB}. So the simplified ratio is ${a} : ${adjustedB}.`;
      distractorValues = [
        `${a + 1} : ${adjustedB}`,
        `${a} : ${adjustedB + 1}`,
        `${adjustedB} : ${a}`,
      ];
    } else {
      const fullA = a * g;
      const fullB = b * g;
      prompt = `Simplify the ratio ${fullA} : ${fullB}`;
      answer = `${a} : ${b}`;
      explanation = `Divide both sides by ${g}: ${fullA} ÷ ${g} = ${a} and ${fullB} ÷ ${g} = ${b}. So the simplified ratio is ${a} : ${b}.`;
      distractorValues = [
        `${a + 1} : ${b}`,
        `${a} : ${b + 1}`,
        `${b} : ${a}`,
      ];
    }
    tags.push('simplify');
  } else if (difficulty === 3) {
    // Share an amount in a ratio
    const a = randomInt(1, 5, rng);
    const b = randomInt(1, 5, rng);
    const total = (a + b) * randomInt(2, 8, rng);
    const share = rng() < 0.5 ? 'first' : 'second';
    const parts = a + b;
    const valuePerPart = total / parts;
    const correctShare = share === 'first' ? a * valuePerPart : b * valuePerPart;

    const names = ['Emma', 'Oliver', 'Amara', 'James', 'Sophia', 'Liam'];
    const name1 = pick(names, rng);
    let name2 = pick(names, rng);
    while (name2 === name1) name2 = pick(names, rng);

    prompt = `${name1} and ${name2} share £${total} in the ratio ${a} : ${b}. How much does ${share === 'first' ? name1 : name2} get?`;
    answer = correctShare;
    explanation = `Total parts = ${a} + ${b} = ${parts}. Each part = £${total} ÷ ${parts} = £${valuePerPart}. ${share === 'first' ? name1 : name2} gets ${share === 'first' ? a : b} × £${valuePerPart} = £${correctShare}.`;
    distractorValues = numericDistractors(correctShare, rng);
    tags.push('sharing');
  } else if (difficulty === 4) {
    // Scale a recipe
    const items = ['flour', 'sugar', 'butter', 'milk', 'eggs'];
    const units = ['g', 'g', 'g', 'ml', ''];
    const idx = randomInt(0, items.length - 1, rng);
    const item = items[idx];
    const unit = units[idx];

    const baseAmount = randomInt(2, 10, rng) * 10;
    const baseServes = randomInt(2, 4, rng);
    const targetServes = baseServes * randomInt(2, 4, rng);
    const scaleFactor = targetServes / baseServes;
    const targetAmount = baseAmount * scaleFactor;

    prompt = `A recipe for ${baseServes} people uses ${baseAmount}${unit} of ${item}. How much ${item} is needed for ${targetServes} people?`;
    answer = targetAmount;
    explanation = `Scale factor = ${targetServes} ÷ ${baseServes} = ${scaleFactor}. So ${baseAmount}${unit} × ${scaleFactor} = ${targetAmount}${unit}.`;
    distractorValues = numericDistractors(targetAmount, rng);
    tags.push('scaling');
  } else {
    // Three-part ratio or multi-step
    const a = randomInt(1, 4, rng);
    const b = randomInt(1, 4, rng);
    const c = randomInt(1, 4, rng);
    const parts = a + b + c;
    const total = parts * randomInt(3, 10, rng);
    const valuePerPart = total / parts;

    const shareIdx = randomInt(0, 2, rng);
    const shareLabels = ['first', 'second', 'third'];
    const shareValues = [a, b, c];
    const correctShare = shareValues[shareIdx] * valuePerPart;

    prompt = `Share ${total} sweets in the ratio ${a} : ${b} : ${c}. How many does the ${shareLabels[shareIdx]} person get?`;
    answer = correctShare;
    explanation = `Total parts = ${a} + ${b} + ${c} = ${parts}. Each part = ${total} ÷ ${parts} = ${valuePerPart}. The ${shareLabels[shareIdx]} person gets ${shareValues[shareIdx]} × ${valuePerPart} = ${correctShare}.`;
    distractorValues = numericDistractors(correctShare, rng);
    tags.push('three-part');
  }

  const correctId = uniqueId();
  const isNumericAnswer = typeof answer === 'number';
  const options = shuffle(
    [answer, ...distractorValues].map((v, i) => ({
      id: i === 0 ? correctId : uniqueId(),
      label: isNumericAnswer && typeof v === 'number' ? String(v) : String(v),
    })),
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.RATIOS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'ratios',
    generatorSeed: seed,
    tags,
  };
}
