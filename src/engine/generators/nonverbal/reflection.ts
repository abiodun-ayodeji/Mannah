import type { Question, Difficulty } from '../../../types/question';
import { Subject, NonVerbalTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

type ShapeType = 'arrow' | 'l-shape' | 'flag' | 'asymmetric-polygon' | 'p-shape';

interface ShapeSpec {
  type: ShapeType;
  color: string;
}

function renderShape(spec: ShapeSpec, scaleX: number, scaleY: number): string {
  const cx = 50;
  const cy = 50;
  let inner = '';

  switch (spec.type) {
    case 'arrow':
      inner = `<polygon points="25,40 55,40 55,30 75,50 55,70 55,60 25,60" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    case 'l-shape':
      inner = [
        `<rect x="30" y="20" width="15" height="55" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`,
        `<rect x="30" y="60" width="35" height="15" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`,
      ].join('');
      break;
    case 'flag':
      inner = [
        `<rect x="35" y="20" width="4" height="60" fill="#1E293B"/>`,
        `<polygon points="39,20 70,30 39,42" fill="${spec.color}" stroke="#1E293B" stroke-width="1.5"/>`,
      ].join('');
      break;
    case 'asymmetric-polygon':
      inner = `<polygon points="30,25 60,25 60,45 50,45 50,70 30,70" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    case 'p-shape':
      inner = [
        `<rect x="30" y="20" width="12" height="55" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`,
        `<circle cx="52" cy="34" r="14" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`,
      ].join('');
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g transform="translate(${cx},${cy}) scale(${scaleX},${scaleY}) translate(${-cx},${-cy})">${inner}</g></svg>`;
}

function renderRotated(spec: ShapeSpec, angle: number): string {
  const innerContent = renderShape(spec, 1, 1).replace(/<\/?svg[^>]*>/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g transform="rotate(${angle},50,50)">${innerContent}</g></svg>`;
}

/** Normalise SVG string for visual comparison (collapse whitespace) */
function normaliseSvg(svg: string): string {
  return svg.replace(/\s+/g, ' ').trim();
}

const SHAPE_TYPES: ShapeType[] = ['arrow', 'l-shape', 'flag', 'asymmetric-polygon', 'p-shape'];

export function generateNVRReflection(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const color = pick(COLORS, rng);
  const shapeType = pick(SHAPE_TYPES, rng);
  const spec: ShapeSpec = { type: shapeType, color };

  // Determine reflection axis
  const horizontal = difficulty <= 2 || (difficulty === 3 && rng() < 0.3);
  const axisLabel = horizontal ? 'horizontal' : 'vertical';

  // Base shape (no reflection)
  const baseSvg = renderShape(spec, 1, 1);

  // Correct reflection
  const correctScaleX = horizontal ? -1 : 1;
  const correctScaleY = horizontal ? 1 : -1;
  const correctSvg = renderShape(spec, correctScaleX, correctScaleY);
  const correctId = uniqueId();

  // ── Generate candidate wrong SVGs ──
  // Try all scale-based transforms first, then rotation-based fallbacks.
  // Crucially: deduplicate by RENDERED SVG, not by transform key.

  type Transform = [number, number];
  const allTransforms: Transform[] = [
    [-1, 1],  // horizontal reflection
    [1, -1],  // vertical reflection
    [-1, -1], // both (180° rotation equivalent)
    [1, 1],   // no change (original)
  ];

  const correctNorm = normaliseSvg(correctSvg);
  const baseNorm = normaliseSvg(baseSvg);
  const usedNorms = new Set<string>([correctNorm]);

  // Collect all visually-unique scale-based candidates
  const candidateSvgs: string[] = [];
  for (const t of allTransforms) {
    const svg = renderShape(spec, t[0], t[1]);
    const norm = normaliseSvg(svg);
    if (!usedNorms.has(norm)) {
      usedNorms.add(norm);
      candidateSvgs.push(svg);
    }
  }

  // At higher difficulty, ensure the original (unreflected) is included if unique
  if (difficulty >= 3 && !usedNorms.has(baseNorm)) {
    usedNorms.add(baseNorm);
    candidateSvgs.unshift(baseSvg);
  }

  // If we don't have 3 unique wrong options from scale transforms,
  // fill with rotation-based distractors (always visually distinct)
  const fallbackAngles = [90, 270, 45, 135, 30, 150];
  let fallbackIdx = 0;
  while (candidateSvgs.length < 3 && fallbackIdx < fallbackAngles.length) {
    const angle = fallbackAngles[fallbackIdx++];
    const svg = renderRotated(spec, angle);
    const norm = normaliseSvg(svg);
    if (!usedNorms.has(norm)) {
      usedNorms.add(norm);
      candidateSvgs.push(svg);
    }
  }

  // Take exactly 3 wrong options
  const wrongSvgs = candidateSvgs.slice(0, 3);

  const options = shuffle(
    [
      { id: correctId, label: 'A', svgData: correctSvg },
      ...wrongSvgs.map((svg) => ({
        id: uniqueId(),
        label: 'B',
        svgData: svg,
      })),
    ],
    rng,
  ).map((opt, i) => ({ ...opt, label: String.fromCharCode(65 + i) }));

  return {
    id: uniqueId(),
    subject: Subject.NON_VERBAL_REASONING,
    topic: NonVerbalTopic.REFLECTION,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `Which option shows the ${axisLabel} reflection of this shape?`,
    svgData: baseSvg,
    options,
    correctAnswer: correctId,
    explanation: `The shape has been reflected along the ${axisLabel} axis, creating a mirror image.`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'nvr-reflection',
    generatorSeed: seed,
    tags: ['non-verbal', 'reflection', axisLabel],
  };
}
