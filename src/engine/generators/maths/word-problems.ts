import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, uniqueId, pick } from '../../../utils/random';

const NAMES = [
  'Emma', 'Oliver', 'Amara', 'James', 'Sophia', 'Liam', 'Zara', 'Noah',
  'Priya', 'Ethan', 'Mei', 'Lucas', 'Fatima', 'Harry', 'Aisha', 'George',
];

const ITEMS = [
  'apples', 'oranges', 'books', 'pencils', 'stickers', 'marbles',
  'sweets', 'crayons', 'cards', 'biscuits', 'balloons', 'flowers',
];

interface Template {
  build: (rng: () => number) => { prompt: string; answer: number; explanation: string; tags: string[] };
}

function makeAddTemplate(rng: () => number, max: number): { prompt: string; answer: number; explanation: string; tags: string[] } {
  const name = pick(NAMES, rng);
  const item = pick(ITEMS, rng);
  const a = randomInt(3, max, rng);
  const b = randomInt(2, max, rng);
  const answer = a + b;
  return {
    prompt: `${name} has ${a} ${item}. ${pick(NAMES, rng)} gives ${name} ${b} more. How many ${item} does ${name} have now?`,
    answer,
    explanation: `${a} + ${b} = ${answer}`,
    tags: ['addition'],
  };
}

function makeSubTemplate(rng: () => number, max: number): { prompt: string; answer: number; explanation: string; tags: string[] } {
  const name = pick(NAMES, rng);
  const item = pick(ITEMS, rng);
  const total = randomInt(10, max, rng);
  const given = randomInt(2, total - 1, rng);
  const answer = total - given;
  return {
    prompt: `${name} has ${total} ${item} and gives away ${given}. How many ${item} does ${name} have left?`,
    answer,
    explanation: `${total} - ${given} = ${answer}`,
    tags: ['subtraction'],
  };
}

function makeMulTemplate(rng: () => number, max: number): { prompt: string; answer: number; explanation: string; tags: string[] } {
  const name = pick(NAMES, rng);
  const item = pick(ITEMS, rng);
  const groups = randomInt(2, 8, rng);
  const perGroup = randomInt(2, max, rng);
  const answer = groups * perGroup;
  return {
    prompt: `${name} buys ${groups} packs of ${item}. Each pack contains ${perGroup} ${item}. How many ${item} does ${name} have in total?`,
    answer,
    explanation: `${groups} × ${perGroup} = ${answer}`,
    tags: ['multiplication'],
  };
}

function makeDivTemplate(rng: () => number, max: number): { prompt: string; answer: number; explanation: string; tags: string[] } {
  const name = pick(NAMES, rng);
  const item = pick(ITEMS, rng);
  const perPerson = randomInt(2, max, rng);
  const people = randomInt(2, 8, rng);
  const total = perPerson * people;
  return {
    prompt: `${name} shares ${total} ${item} equally among ${people} friends. How many ${item} does each friend get?`,
    answer: perPerson,
    explanation: `${total} ÷ ${people} = ${perPerson}`,
    tags: ['division'],
  };
}

function makeMultiStepTemplate(rng: () => number, max: number): { prompt: string; answer: number; explanation: string; tags: string[] } {
  const name1 = pick(NAMES, rng);
  let name2 = pick(NAMES, rng);
  while (name2 === name1) name2 = pick(NAMES, rng);
  const item = pick(ITEMS, rng);
  const start = randomInt(10, max, rng);
  const bought = randomInt(5, Math.floor(max / 2), rng);
  const gave = randomInt(2, Math.floor((start + bought) / 2), rng);
  const answer = start + bought - gave;
  return {
    prompt: `${name1} has ${start} ${item}. ${name1} buys ${bought} more and then gives ${gave} to ${name2}. How many ${item} does ${name1} have now?`,
    answer,
    explanation: `${start} + ${bought} - ${gave} = ${answer}`,
    tags: ['multi_step'],
  };
}

function makeComparisonTemplate(rng: () => number, max: number): { prompt: string; answer: number; explanation: string; tags: string[] } {
  const name1 = pick(NAMES, rng);
  let name2 = pick(NAMES, rng);
  while (name2 === name1) name2 = pick(NAMES, rng);
  const item = pick(ITEMS, rng);
  const a = randomInt(5, max, rng);
  const multiplier = randomInt(2, 5, rng);
  const b = a * multiplier;
  const answer = a + b;
  return {
    prompt: `${name1} has ${a} ${item}. ${name2} has ${multiplier} times as many. How many ${item} do they have altogether?`,
    answer,
    explanation: `${name2} has ${a} × ${multiplier} = ${b}. Total = ${a} + ${b} = ${answer}`,
    tags: ['multiplication', 'addition'],
  };
}

export function generateWordProblems(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const tags: string[] = ['word_problems'];

  let result: { prompt: string; answer: number; explanation: string; tags: string[] };

  if (difficulty <= 2) {
    const max = difficulty === 1 ? 20 : 50;
    const type = rng() < 0.5 ? 'add' : 'sub';
    result = type === 'add' ? makeAddTemplate(rng, max) : makeSubTemplate(rng, max);
  } else if (difficulty === 3) {
    const roll = rng();
    const max = 12;
    if (roll < 0.33) {
      result = makeMulTemplate(rng, max);
    } else if (roll < 0.66) {
      result = makeDivTemplate(rng, max);
    } else {
      result = makeAddTemplate(rng, 100);
    }
  } else if (difficulty === 4) {
    const roll = rng();
    if (roll < 0.5) {
      result = makeMultiStepTemplate(rng, 50);
    } else {
      result = makeComparisonTemplate(rng, 20);
    }
  } else {
    // Difficulty 5: complex multi-step
    const roll = rng();
    if (roll < 0.5) {
      result = makeMultiStepTemplate(rng, 100);
    } else {
      result = makeComparisonTemplate(rng, 50);
    }
  }

  tags.push(...result.tags);
  const { answer } = result;

  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(3, Math.floor(Math.abs(answer) * 0.2) + 1), rng);
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
    topic: MathsTopic.WORD_PROBLEMS,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: result.prompt,
    options,
    correctAnswer: correctId,
    explanation: result.explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'word-problems',
    generatorSeed: seed,
    tags,
  };
}
