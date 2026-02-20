import type { Question, Difficulty } from '../../../types/question';
import { Subject, MathsTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

interface ShapeInfo {
  name: string;
  sides: number;
  sumAngles: number;
  symmetryLines: number;
}

const SHAPES: ShapeInfo[] = [
  { name: 'equilateral triangle', sides: 3, sumAngles: 180, symmetryLines: 3 },
  { name: 'isosceles triangle', sides: 3, sumAngles: 180, symmetryLines: 1 },
  { name: 'square', sides: 4, sumAngles: 360, symmetryLines: 4 },
  { name: 'rectangle', sides: 4, sumAngles: 360, symmetryLines: 2 },
  { name: 'regular pentagon', sides: 5, sumAngles: 540, symmetryLines: 5 },
  { name: 'regular hexagon', sides: 6, sumAngles: 720, symmetryLines: 6 },
  { name: 'regular octagon', sides: 8, sumAngles: 1080, symmetryLines: 8 },
  { name: 'rhombus', sides: 4, sumAngles: 360, symmetryLines: 2 },
  { name: 'parallelogram', sides: 4, sumAngles: 360, symmetryLines: 0 },
  { name: 'trapezium', sides: 4, sumAngles: 360, symmetryLines: 0 },
  { name: 'kite', sides: 4, sumAngles: 360, symmetryLines: 1 },
];

const ANGLE_TYPES: { name: string; min: number; max: number }[] = [
  { name: 'acute', min: 10, max: 89 },
  { name: 'right', min: 90, max: 90 },
  { name: 'obtuse', min: 91, max: 179 },
  { name: 'reflex', min: 181, max: 350 },
];

function numericDistractors(answer: number, rng: () => number): number[] {
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(1, Math.max(5, Math.floor(Math.abs(answer) * 0.2) + 1), rng);
    const d = rng() < 0.5 ? answer + offset : answer - offset;
    if (d !== answer && d > 0) distractors.add(d);
  }
  return [...distractors];
}

export function generateGeometry(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  let prompt: string;
  let answer: number | string;
  let distractorValues: (number | string)[];
  let explanation: string;
  let tags: string[] = ['geometry'];

  if (difficulty <= 2) {
    // Identify shape properties: sides or lines of symmetry
    const shape = pick(SHAPES.filter((s) => s.sides <= 6), rng);
    const askSides = rng() < 0.5;

    if (askSides) {
      prompt = `How many sides does a ${shape.name} have?`;
      answer = shape.sides;
      explanation = `A ${shape.name} has ${shape.sides} sides.`;
      tags.push('sides');
    } else {
      prompt = `How many lines of symmetry does a ${shape.name} have?`;
      answer = shape.symmetryLines;
      explanation = `A ${shape.name} has ${shape.symmetryLines} line${shape.symmetryLines !== 1 ? 's' : ''} of symmetry.`;
      tags.push('symmetry');
    }
    distractorValues = numericDistractors(answer as number, rng);
  } else if (difficulty === 3) {
    // Angles in triangles or identify angle types
    const questionType = rng() < 0.5 ? 'triangle_angle' : 'angle_type';

    if (questionType === 'triangle_angle') {
      const a1 = randomInt(30, 80, rng);
      const a2 = randomInt(30, 180 - a1 - 10, rng);
      const a3 = 180 - a1 - a2;
      prompt = `A triangle has angles of ${a1}° and ${a2}°. What is the third angle?`;
      answer = a3;
      explanation = `Angles in a triangle add up to 180°. So ${a1}° + ${a2}° + ? = 180°. The missing angle is ${a3}°.`;
      tags.push('triangle', 'angles');
    } else {
      const angleVal = randomInt(10, 350, rng);
      let correctType: string;
      if (angleVal < 90) correctType = 'acute';
      else if (angleVal === 90) correctType = 'right';
      else if (angleVal < 180) correctType = 'obtuse';
      else if (angleVal === 180) correctType = 'straight';
      else correctType = 'reflex';

      prompt = `What type of angle is ${angleVal}°?`;
      answer = correctType;
      explanation = `${angleVal}° is ${correctType === 'acute' ? 'less than 90°, so it is acute' : correctType === 'right' ? 'exactly 90°, so it is a right angle' : correctType === 'obtuse' ? 'between 90° and 180°, so it is obtuse' : correctType === 'straight' ? 'exactly 180°, so it is a straight angle' : 'greater than 180°, so it is reflex'}.`;
      tags.push('angle-types');

      const allTypes = ['acute', 'right', 'obtuse', 'reflex'];
      distractorValues = allTypes.filter((t) => t !== correctType).slice(0, 3);
    }
    if (!distractorValues!) {
      distractorValues = numericDistractors(answer as number, rng);
    }
  } else if (difficulty === 4) {
    // Angles on a straight line or coordinates
    const questionType = rng() < 0.6 ? 'straight_line' : 'coordinates';

    if (questionType === 'straight_line') {
      const a1 = randomInt(25, 155, rng);
      const a2 = 180 - a1;
      prompt = `Two angles on a straight line: one is ${a1}°. What is the other?`;
      answer = a2;
      explanation = `Angles on a straight line add up to 180°. So ${a1}° + ? = 180°. The missing angle is ${a2}°.`;
      tags.push('straight-line', 'angles');
    } else {
      const x = randomInt(1, 10, rng);
      const y = randomInt(1, 10, rng);
      const dx = randomInt(1, 5, rng);
      const dy = randomInt(1, 5, rng);
      const newX = x + dx;
      const newY = y + dy;
      prompt = `Point A is at (${x}, ${y}). It moves ${dx} right and ${dy} up. What are the new coordinates?`;
      answer = `(${newX}, ${newY})`;
      explanation = `Moving ${dx} right adds to x: ${x} + ${dx} = ${newX}. Moving ${dy} up adds to y: ${y} + ${dy} = ${newY}. New position: (${newX}, ${newY}).`;
      tags.push('coordinates');

      distractorValues = [
        `(${newX + randomInt(1, 3, rng)}, ${newY})`,
        `(${newX}, ${newY + randomInt(1, 3, rng)})`,
        `(${x + dy}, ${y + dx})`,
      ];
    }
    if (!distractorValues!) {
      distractorValues = numericDistractors(answer as number, rng);
    }
  } else {
    // Angles in quadrilaterals or complex angle problems
    const questionType = rng() < 0.5 ? 'quadrilateral' : 'vertically_opposite';

    if (questionType === 'quadrilateral') {
      const a1 = randomInt(50, 120, rng);
      const a2 = randomInt(50, 120, rng);
      const a3 = randomInt(50, 360 - a1 - a2 - 20, rng);
      const a4 = 360 - a1 - a2 - a3;
      prompt = `A quadrilateral has three angles of ${a1}°, ${a2}° and ${a3}°. What is the fourth angle?`;
      answer = a4;
      explanation = `Angles in a quadrilateral add up to 360°. So ${a1}° + ${a2}° + ${a3}° + ? = 360°. The missing angle is ${a4}°.`;
      tags.push('quadrilateral', 'angles');
    } else {
      const a = randomInt(20, 160, rng);
      prompt = `Two straight lines cross. One angle is ${a}°. What is the vertically opposite angle?`;
      answer = a;
      explanation = `Vertically opposite angles are equal. So the opposite angle is also ${a}°.`;
      tags.push('vertically-opposite', 'angles');
    }
    distractorValues = numericDistractors(answer as number, rng);
  }

  const correctId = uniqueId();
  const options = shuffle(
    [answer, ...distractorValues].map((v, i) => ({
      id: i === 0 ? correctId : uniqueId(),
      label: String(v) + (typeof v === 'number' && tags.includes('angles') ? '°' : ''),
    })),
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.MATHS,
    topic: MathsTopic.GEOMETRY,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'geometry',
    generatorSeed: seed,
    tags,
  };
}
