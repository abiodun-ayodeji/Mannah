import type { Question, Difficulty } from '../../../types/question';
import { Subject, NonVerbalTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

function polygonPoints(cx: number, cy: number, r: number, sides: number, rotDeg: number): string {
  const pts: string[] = [];
  const rotRad = (rotDeg * Math.PI) / 180;
  for (let i = 0; i < sides; i++) {
    const angle = rotRad + (2 * Math.PI * i) / sides - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

interface ShapeConfig {
  type: 'asymmetric-polygon' | 'arrow' | 'l-shape' | 'flag' | 'composite';
  color: string;
}

function renderBaseShape(config: ShapeConfig, rotation: number): string {
  const cx = 50;
  const cy = 50;
  let inner = '';

  switch (config.type) {
    case 'asymmetric-polygon': {
      // An L-like polygon that is clearly asymmetric
      inner = `<polygon points="30,25 60,25 60,45 50,45 50,70 30,70" fill="${config.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    }
    case 'arrow': {
      // Arrow pointing right
      inner = `<polygon points="25,40 55,40 55,30 75,50 55,70 55,60 25,60" fill="${config.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    }
    case 'l-shape': {
      // An L shape
      inner = [
        `<rect x="30" y="20" width="15" height="55" fill="${config.color}" stroke="#1E293B" stroke-width="2"/>`,
        `<rect x="30" y="60" width="35" height="15" fill="${config.color}" stroke="#1E293B" stroke-width="2"/>`,
      ].join('');
      break;
    }
    case 'flag': {
      // Flag on a pole
      inner = [
        `<rect x="35" y="20" width="4" height="60" fill="#1E293B"/>`,
        `<polygon points="39,20 70,30 39,42" fill="${config.color}" stroke="#1E293B" stroke-width="1.5"/>`,
      ].join('');
      break;
    }
    case 'composite': {
      // Circle with a notch / triangle on top
      inner = [
        `<circle cx="50" cy="55" r="20" fill="${config.color}" stroke="#1E293B" stroke-width="2"/>`,
        `<polygon points="42,25 58,25 50,38" fill="${config.color}" stroke="#1E293B" stroke-width="2"/>`,
      ].join('');
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g transform="rotate(${rotation},${cx},${cy})">${inner}</g></svg>`;
}

const ROTATION_ANGLES = [90, 180, 270] as const;
const SHAPE_TYPES: ShapeConfig['type'][] = [
  'asymmetric-polygon',
  'arrow',
  'l-shape',
  'flag',
  'composite',
];

export function generateNVRRotation(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const color = pick(COLORS, rng);
  const shapeType = pick(SHAPE_TYPES, rng);
  const config: ShapeConfig = { type: shapeType, color };

  // Choose the correct rotation angle
  const correctAngle = pick(ROTATION_ANGLES, rng);

  // Base shape at 0 degrees
  const baseSvg = renderBaseShape(config, 0);

  // Correct option: shape at the target rotation
  const correctSvg = renderBaseShape(config, correctAngle);
  const correctId = uniqueId();

  // Generate wrong angles (different from correctAngle)
  const allAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  const wrongAngles: number[] = [];
  const usedAngles = new Set<number>([correctAngle]);

  // Difficulty determines how close the distractors are
  const closeAngles =
    difficulty >= 4
      ? allAngles.filter((a) => Math.abs(a - correctAngle) <= 90 && a !== correctAngle)
      : allAngles.filter((a) => a !== correctAngle && a !== 0);

  while (wrongAngles.length < 3) {
    const pool = wrongAngles.length < 2 && difficulty >= 3 ? closeAngles : allAngles;
    const candidate = pick(pool, rng);
    if (!usedAngles.has(candidate)) {
      usedAngles.add(candidate);
      wrongAngles.push(candidate);
    }
  }

  const options = shuffle(
    [
      { id: correctId, label: 'A', svgData: correctSvg },
      ...wrongAngles.map((angle) => ({
        id: uniqueId(),
        label: 'B',
        svgData: renderBaseShape(config, angle),
      })),
    ],
    rng
  ).map((opt, i) => ({ ...opt, label: String.fromCharCode(65 + i) }));

  return {
    id: uniqueId(),
    subject: Subject.NON_VERBAL_REASONING,
    topic: NonVerbalTopic.ROTATION,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `Which option shows this shape rotated by ${correctAngle} degrees clockwise?`,
    svgData: baseSvg,
    options,
    correctAnswer: correctId,
    explanation: `The shape has been rotated ${correctAngle} degrees clockwise around its centre.`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'nvr-rotation',
    generatorSeed: seed,
    tags: ['non-verbal', 'rotation', `${correctAngle}deg`],
  };
}
