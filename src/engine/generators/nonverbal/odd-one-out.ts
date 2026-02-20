import type { Question, Difficulty } from '../../../types/question';
import { Subject, NonVerbalTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'];

type PropertyType = 'shape' | 'color' | 'size' | 'fill' | 'sides' | 'rotation';

interface ShapeSpec {
  shapeType: 'circle' | 'rect' | 'polygon';
  sides: number;
  size: number;
  color: string;
  filled: boolean;
  rotation: number;
}

function polygonPoints(cx: number, cy: number, r: number, sides: number, rotDeg: number): string {
  const pts: string[] = [];
  const rotRad = (rotDeg * Math.PI) / 180;
  for (let i = 0; i < sides; i++) {
    const angle = rotRad + (2 * Math.PI * i) / sides - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

function renderSpec(spec: ShapeSpec): string {
  const cx = 50;
  const cy = 50;
  const fillColor = spec.filled ? spec.color : 'none';
  let inner = '';

  switch (spec.shapeType) {
    case 'circle':
      inner = `<circle cx="${cx}" cy="${cy}" r="${spec.size}" fill="${fillColor}" stroke="${spec.color}" stroke-width="3"/>`;
      break;
    case 'rect': {
      const half = spec.size;
      inner = `<rect x="${cx - half}" y="${cy - half}" width="${half * 2}" height="${half * 2}" fill="${fillColor}" stroke="${spec.color}" stroke-width="3" transform="rotate(${spec.rotation},${cx},${cy})"/>`;
      break;
    }
    case 'polygon': {
      const pts = polygonPoints(cx, cy, spec.size, spec.sides, spec.rotation);
      inner = `<polygon points="${pts}" fill="${fillColor}" stroke="${spec.color}" stroke-width="3"/>`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
}

const SHAPE_TYPES_FOR_PICK = ['circle', 'rect', 'polygon'] as const;

function generateOddOneOutSet(
  property: PropertyType,
  rng: () => number,
  difficulty: Difficulty
): { specs: ShapeSpec[]; oddIndex: number; explanation: string } {
  const baseColor = pick(COLORS, rng);
  const baseSize = randomInt(20, 30, rng);
  const baseSides = pick([3, 5, 6, 8], rng);
  const baseShape = pick(SHAPE_TYPES_FOR_PICK, rng);
  const baseFilled = true;
  const baseRotation = 0;

  const base: ShapeSpec = {
    shapeType: baseShape,
    sides: baseSides,
    size: baseSize,
    color: baseColor,
    filled: baseFilled,
    rotation: baseRotation,
  };

  const normals: ShapeSpec[] = Array.from({ length: 4 }, () => ({ ...base }));
  let odd: ShapeSpec;
  let explanation: string;

  switch (property) {
    case 'shape': {
      // 4 are the same shape, 1 is different
      const otherShapes = SHAPE_TYPES_FOR_PICK.filter((s) => s !== baseShape);
      const oddShape = pick(otherShapes, rng);
      odd = { ...base, shapeType: oddShape, sides: oddShape === 'polygon' ? pick([3, 5, 6], rng) : baseSides };
      explanation = `Four shapes are ${baseShape}s, but the odd one out is a ${oddShape}.`;
      break;
    }
    case 'color': {
      const otherColors = COLORS.filter((c) => c !== baseColor);
      const oddColor = pick(otherColors, rng);
      odd = { ...base, color: oddColor };
      explanation = 'Four shapes share the same colour, but one has a different colour.';
      break;
    }
    case 'size': {
      const oddSize = baseSize + randomInt(10, 15, rng);
      odd = { ...base, size: oddSize };
      explanation = 'Four shapes are the same size, but one is noticeably larger.';
      break;
    }
    case 'fill': {
      odd = { ...base, filled: false };
      explanation = 'Four shapes are filled in, but one is only an outline.';
      break;
    }
    case 'sides': {
      // Only makes sense for polygons
      normals.forEach((n) => {
        n.shapeType = 'polygon';
        n.sides = baseSides;
      });
      const oddSides = baseSides === 3 ? 5 : baseSides === 5 ? 6 : baseSides === 6 ? 3 : 5;
      odd = { ...base, shapeType: 'polygon', sides: oddSides };
      explanation = `Four shapes have ${baseSides} sides, but the odd one out has ${oddSides} sides.`;
      break;
    }
    case 'rotation': {
      // All at same rotation except one
      const rotAngle = pick([45, 90, 135], rng);
      normals.forEach((n) => {
        n.shapeType = 'rect';
      });
      odd = { ...base, shapeType: 'rect', rotation: rotAngle };
      explanation = `Four shapes face the same direction, but the odd one out is rotated by ${rotAngle} degrees.`;
      break;
    }
    default: {
      odd = { ...base };
      explanation = '';
    }
  }

  // Add slight variety in difficulty >= 4 (vary an unrelated property slightly)
  if (difficulty >= 4) {
    normals.forEach((n, i) => {
      if (property !== 'rotation') {
        n.rotation = randomInt(0, 1, rng) * (rng() < 0.3 ? 5 : 0);
      }
    });
    if (property !== 'rotation') {
      odd.rotation = randomInt(0, 1, rng) * (rng() < 0.3 ? 5 : 0);
    }
  }

  const oddIndex = randomInt(0, 4, rng);
  const specs: ShapeSpec[] = [];
  let normalIdx = 0;
  for (let i = 0; i < 5; i++) {
    if (i === oddIndex) {
      specs.push(odd);
    } else {
      specs.push(normals[normalIdx++]);
    }
  }

  return { specs, oddIndex, explanation };
}

const PROPERTIES_BY_DIFFICULTY: Record<number, PropertyType[]> = {
  1: ['shape', 'color'],
  2: ['shape', 'color', 'size'],
  3: ['shape', 'color', 'size', 'fill'],
  4: ['color', 'size', 'fill', 'sides', 'rotation'],
  5: ['fill', 'sides', 'rotation'],
};

export function generateNVROddOneOut(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const properties = PROPERTIES_BY_DIFFICULTY[difficulty];
  const property = pick(properties, rng);

  const { specs, oddIndex, explanation } = generateOddOneOutSet(property, rng, difficulty);

  const correctId = uniqueId();
  const options = specs.map((spec, i) => ({
    id: i === oddIndex ? correctId : uniqueId(),
    label: String.fromCharCode(65 + i),
    svgData: renderSpec(spec),
  }));

  return {
    id: uniqueId(),
    subject: Subject.NON_VERBAL_REASONING,
    topic: NonVerbalTopic.ODD_ONE_OUT,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: 'Which shape is the odd one out?',
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'nvr-odd-one-out',
    generatorSeed: seed,
    tags: ['non-verbal', 'odd-one-out', property],
  };
}
