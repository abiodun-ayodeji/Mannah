import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

function numericDistractors(answer: number, rng: () => number): number[] {
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.floor(Math.abs(answer) * 0.25) + 1), rng);
    const d = rng() < 0.5 ? answer + offset : answer - offset;
    if (d !== answer && d >= 0) distractors.add(d);
  }
  return [...distractors];
}

const FRUIT = ['apples', 'oranges', 'bananas', 'grapes', 'pears'];
const COLOURS = ['red', 'blue', 'green', 'yellow', 'purple'];
const PETS = ['cats', 'dogs', 'fish', 'hamsters', 'rabbits'];
const SPORTS = ['football', 'swimming', 'tennis', 'cricket', 'running'];

export function generateDataHandling(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let prompt: string;
  let answer: number;
  let distractorValues: number[];
  let explanation: string;
  const tags: string[] = ['data-handling'];

  if (difficulty <= 2) {
    // Read values from a described table
    const categories = pick([FRUIT, COLOURS, PETS, SPORTS], rng);
    const label = categories === FRUIT ? 'fruit' : categories === COLOURS ? 'colour' : categories === PETS ? 'pet' : 'sport';
    const count = difficulty === 1 ? 3 : 4;
    const items = categories.slice(0, count);
    const values = items.map(() => randomInt(2, 15, rng));
    const total = values.reduce((s, v) => s + v, 0);

    const questionType = rng() < 0.5 ? 'total' : 'specific';

    if (questionType === 'total') {
      const tableDesc = items.map((item, i) => `${item}: ${values[i]}`).join(', ');
      prompt = `A survey asked children their favourite ${label}. The results were: ${tableDesc}. How many children were surveyed in total?`;
      answer = total;
      explanation = `Add all the values: ${values.join(' + ')} = ${total}.`;
    } else {
      const maxIdx = values.indexOf(Math.max(...values));
      const tableDesc = items.map((item, i) => `${item}: ${values[i]}`).join(', ');
      prompt = `A survey asked children their favourite ${label}. The results were: ${tableDesc}. Which ${label} was the most popular?`;
      // For this type we use text answers
      answer = values[maxIdx];
      prompt = `A survey asked children their favourite ${label}. The results were: ${tableDesc}. How many children chose ${items[maxIdx]}?`;
      explanation = `Looking at the table, ${items[maxIdx]} has ${values[maxIdx]} votes.`;
    }
    distractorValues = numericDistractors(answer, rng);
    tags.push('reading-data');
  } else if (difficulty === 3) {
    // Calculate the mean
    const count = randomInt(4, 6, rng);
    const values: number[] = [];
    for (let i = 0; i < count; i++) {
      values.push(randomInt(2, 20, rng));
    }
    // Ensure the mean is a whole number
    const currentSum = values.reduce((s, v) => s + v, 0);
    const remainder = currentSum % count;
    if (remainder !== 0) {
      values[values.length - 1] += count - remainder;
    }
    const total = values.reduce((s, v) => s + v, 0);
    const mean = total / count;

    prompt = `Find the mean of these numbers: ${values.join(', ')}`;
    answer = mean;
    explanation = `Mean = total ÷ count = (${values.join(' + ')}) ÷ ${count} = ${total} ÷ ${count} = ${mean}.`;
    distractorValues = numericDistractors(mean, rng);
    tags.push('mean');
  } else if (difficulty === 4) {
    // Median, mode, or range
    const questionType = pick(['median', 'mode', 'range'], rng);

    if (questionType === 'median') {
      const count = rng() < 0.5 ? 5 : 7; // Odd number for clean median
      const values: number[] = [];
      for (let i = 0; i < count; i++) {
        values.push(randomInt(1, 30, rng));
      }
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(count / 2)];

      prompt = `Find the median of: ${values.join(', ')}`;
      answer = median;
      explanation = `Sort the numbers: ${sorted.join(', ')}. The middle value is ${median}.`;
      tags.push('median');
    } else if (questionType === 'mode') {
      const count = randomInt(6, 8, rng);
      const values: number[] = [];
      // Ensure one value appears more than others
      const modeValue = randomInt(1, 20, rng);
      const modeCount = randomInt(3, 4, rng);
      for (let i = 0; i < modeCount; i++) {
        values.push(modeValue);
      }
      while (values.length < count) {
        let v = randomInt(1, 20, rng);
        while (v === modeValue) v = randomInt(1, 20, rng);
        values.push(v);
      }
      const shuffled = shuffle([...values], rng);

      prompt = `Find the mode of: ${shuffled.join(', ')}`;
      answer = modeValue;
      explanation = `The mode is the most frequent number. ${modeValue} appears ${modeCount} times, more than any other number.`;
      tags.push('mode');
    } else {
      const count = randomInt(5, 7, rng);
      const values: number[] = [];
      for (let i = 0; i < count; i++) {
        values.push(randomInt(1, 50, rng));
      }
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;

      prompt = `Find the range of: ${values.join(', ')}`;
      answer = range;
      explanation = `Range = highest − lowest = ${max} − ${min} = ${range}.`;
      tags.push('range');
    }
    distractorValues = numericDistractors(answer, rng);
  } else {
    // Multi-step: find mean then compare, or combined stats
    const groupA: number[] = [];
    const groupB: number[] = [];
    const count = randomInt(4, 5, rng);

    for (let i = 0; i < count; i++) {
      groupA.push(randomInt(3, 15, rng));
      groupB.push(randomInt(3, 15, rng));
    }
    // Ensure whole number means
    const sumA = groupA.reduce((s, v) => s + v, 0);
    const remA = sumA % count;
    if (remA !== 0) groupA[groupA.length - 1] += count - remA;

    const sumB = groupB.reduce((s, v) => s + v, 0);
    const remB = sumB % count;
    if (remB !== 0) groupB[groupB.length - 1] += count - remB;

    const totalA = groupA.reduce((s, v) => s + v, 0);
    const totalB = groupB.reduce((s, v) => s + v, 0);
    const meanA = totalA / count;
    const meanB = totalB / count;
    const diff = Math.abs(meanA - meanB);

    const names = ['Class A', 'Class B'];
    prompt = `${names[0]} scored: ${groupA.join(', ')}. ${names[1]} scored: ${groupB.join(', ')}. What is the difference between the mean scores?`;
    answer = diff;
    explanation = `Mean of ${names[0]} = ${totalA} ÷ ${count} = ${meanA}. Mean of ${names[1]} = ${totalB} ÷ ${count} = ${meanB}. Difference = ${Math.max(meanA, meanB)} − ${Math.min(meanA, meanB)} = ${diff}.`;
    distractorValues = numericDistractors(diff, rng);
    tags.push('mean', 'comparison');
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractorValues].map((v, i) => ({
      id: i === 0 ? correctId : uniqueId(),
      label: String(v),
    })),
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.DATA_HANDLING,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'data-handling',
    generatorSeed: seed,
    tags,
  };
}
