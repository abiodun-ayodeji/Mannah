import type { Question, Difficulty } from '../../../types/question';
import { Subject, NonVerbalTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

type PatternType = 'grow' | 'rotate' | 'addSides' | 'fillProgress' | 'addShapes';

interface ShapeSpec {
  type: 'circle' | 'rect' | 'polygon';
  size: number;
  rotation: number;
  sides: number;
  fill: string;
  fillOpacity: number;
  count: number;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

function polygonPoints(cx: number, cy: number, r: number, sides: number, rotDeg: number): string {
  const points: string[] = [];
  const rotRad = (rotDeg * Math.PI) / 180;
  for (let i = 0; i < sides; i++) {
    const angle = rotRad + (2 * Math.PI * i) / sides - Math.PI / 2;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(' ');
}

function renderShape(spec: ShapeSpec): string {
  const cx = 50;
  const cy = 50;
  const shapes: string[] = [];

  for (let i = 0; i < spec.count; i++) {
    const offset = spec.count > 1 ? (i - (spec.count - 1) / 2) * 18 : 0;
    const px = cx + offset;

    if (spec.type === 'circle') {
      shapes.push(
        `<circle cx="${px}" cy="${cy}" r="${spec.size}" fill="${spec.fill}" fill-opacity="${spec.fillOpacity}" stroke="#1E293B" stroke-width="2"/>`
      );
    } else if (spec.type === 'rect') {
      const half = spec.size;
      shapes.push(
        `<rect x="${px - half}" y="${cy - half}" width="${half * 2}" height="${half * 2}" fill="${spec.fill}" fill-opacity="${spec.fillOpacity}" stroke="#1E293B" stroke-width="2" transform="rotate(${spec.rotation},${px},${cy})"/>`
      );
    } else {
      const pts = polygonPoints(px, cy, spec.size, spec.sides, spec.rotation);
      shapes.push(
        `<polygon points="${pts}" fill="${spec.fill}" fill-opacity="${spec.fillOpacity}" stroke="#1E293B" stroke-width="2"/>`
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shapes.join('')}</svg>`;
}

function buildSeriesAndAnswer(
  pattern: PatternType,
  rng: () => number,
  difficulty: Difficulty
): { series: ShapeSpec[]; correct: ShapeSpec; wrongOptions: ShapeSpec[] } {
  const color = pick(COLORS, rng);
  const seriesLength = difficulty <= 2 ? 3 : 4;

  let series: ShapeSpec[];
  let correct: ShapeSpec;
  let wrongOptions: ShapeSpec[];

  switch (pattern) {
    case 'grow': {
      const baseSize = randomInt(10, 15, rng);
      const step = randomInt(4, 7, rng);
      const shapeType = pick(['circle', 'rect', 'polygon'] as const, rng);
      const sides = shapeType === 'polygon' ? pick([3, 5, 6], rng) : 4;

      series = Array.from({ length: seriesLength }, (_, i) => ({
        type: shapeType,
        size: baseSize + step * i,
        rotation: 0,
        sides,
        fill: color,
        fillOpacity: 1,
        count: 1,
      }));

      const correctSize = baseSize + step * seriesLength;
      correct = { ...series[0], size: correctSize };

      wrongOptions = [
        { ...correct, size: correctSize + step },
        { ...correct, size: correctSize - step * 2 },
        { ...correct, size: baseSize },
      ];
      break;
    }

    case 'rotate': {
      const baseRot = 0;
      const rotStep = pick([30, 45, 60, 90], rng);
      const shapeType = pick(['rect', 'polygon'] as const, rng);
      const sides = shapeType === 'polygon' ? pick([3, 5, 6], rng) : 4;
      const size = randomInt(18, 28, rng);

      series = Array.from({ length: seriesLength }, (_, i) => ({
        type: shapeType,
        size,
        rotation: baseRot + rotStep * i,
        sides,
        fill: color,
        fillOpacity: 1,
        count: 1,
      }));

      const correctRot = (baseRot + rotStep * seriesLength) % 360;
      correct = { ...series[0], rotation: correctRot };

      // Build distractors, skipping any that visually match the correct rotation.
      const candidateOffsets = [rotStep, -rotStep * 2, rotStep * 2, -rotStep * 3];
      const distractors: ShapeSpec[] = [];
      for (const offset of candidateOffsets) {
        const rot = ((correctRot + offset) % 360 + 360) % 360;
        if (rot !== correctRot && distractors.every((d) => d.rotation !== rot)) {
          distractors.push({ ...correct, rotation: rot });
          if (distractors.length === 3) break;
        }
      }
      // Fallback: if not enough unique distractors, add a fixed offset
      while (distractors.length < 3) {
        const fallbackRot = (correctRot + 15 * (distractors.length + 1)) % 360;
        if (distractors.every((d) => d.rotation !== fallbackRot)) {
          distractors.push({ ...correct, rotation: fallbackRot });
        }
      }
      wrongOptions = distractors;
      break;
    }

    case 'addSides': {
      const startSides = 3;
      const size = randomInt(20, 30, rng);

      series = Array.from({ length: seriesLength }, (_, i) => ({
        type: 'polygon' as const,
        size,
        rotation: 0,
        sides: startSides + i,
        fill: color,
        fillOpacity: 1,
        count: 1,
      }));

      correct = { ...series[0], sides: startSides + seriesLength };

      wrongOptions = [
        { ...correct, sides: startSides + seriesLength + 1 },
        { ...correct, sides: startSides },
        { ...correct, sides: startSides + seriesLength + 2 },
      ];
      break;
    }

    case 'fillProgress': {
      const shapeType = pick(['circle', 'rect'] as const, rng);
      const size = randomInt(20, 30, rng);
      // Fixed steps ensure clear visual distinction and no duplicate options.
      // seriesLength=3 uses indices 0-2, correct=index 3 (0.75)
      // seriesLength=4 uses indices 0-3, correct=index 4 (1.0)
      const OPACITY_STEPS = [0, 0.25, 0.5, 0.75, 1.0];

      series = Array.from({ length: seriesLength }, (_, i) => ({
        type: shapeType,
        size,
        rotation: 0,
        sides: 4,
        fill: color,
        fillOpacity: OPACITY_STEPS[i],
        count: 1,
      }));

      const correctOpacity = OPACITY_STEPS[seriesLength];
      correct = { ...series[0], fillOpacity: correctOpacity };

      // Distractors: back to start, same as last in series, "too far" or mid-point.
      // All guaranteed distinct from correct and from each other.
      const tooFarOpacity =
        seriesLength < OPACITY_STEPS.length - 1
          ? OPACITY_STEPS[seriesLength + 1]
          : OPACITY_STEPS[seriesLength - 2];
      wrongOptions = [
        { ...correct, fillOpacity: OPACITY_STEPS[0] },
        { ...correct, fillOpacity: OPACITY_STEPS[seriesLength - 1] },
        { ...correct, fillOpacity: tooFarOpacity },
      ];
      break;
    }

    case 'addShapes': {
      const shapeType = pick(['circle', 'rect'] as const, rng);
      const size = randomInt(8, 14, rng);

      series = Array.from({ length: seriesLength }, (_, i) => ({
        type: shapeType,
        size,
        rotation: 0,
        sides: 4,
        fill: color,
        fillOpacity: 1,
        count: i + 1,
      }));

      correct = { ...series[0], count: seriesLength + 1 };

      wrongOptions = [
        { ...correct, count: seriesLength + 2 },
        { ...correct, count: seriesLength },
        { ...correct, count: 1 },
      ];
      break;
    }

    default: {
      series = [];
      correct = { type: 'circle', size: 20, rotation: 0, sides: 4, fill: color, fillOpacity: 1, count: 1 };
      wrongOptions = [correct, correct, correct];
    }
  }

  return { series, correct, wrongOptions };
}

function getPatternExplanation(pattern: PatternType): string {
  switch (pattern) {
    case 'grow': return 'Each shape in the series is larger than the previous one by a fixed amount.';
    case 'rotate': return 'Each shape in the series is rotated by a fixed angle from the previous one.';
    case 'addSides': return 'Each shape in the series has one more side than the previous one.';
    case 'fillProgress': return 'Each shape in the series becomes more opaque (darker) than the previous one.';
    case 'addShapes': return 'Each step in the series adds one more shape than the previous step.';
  }
}

const PATTERNS_BY_DIFFICULTY: Record<number, PatternType[]> = {
  1: ['grow', 'addShapes'],
  2: ['grow', 'addShapes', 'addSides'],
  3: ['grow', 'rotate', 'addSides', 'fillProgress'],
  4: ['rotate', 'addSides', 'fillProgress', 'addShapes'],
  5: ['rotate', 'addSides', 'fillProgress', 'addShapes'],
};

export function generateNVRSeries(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const patterns = PATTERNS_BY_DIFFICULTY[difficulty];
  const pattern = pick(patterns, rng);

  const { series, correct, wrongOptions } = buildSeriesAndAnswer(pattern, rng, difficulty);

  const seriesSvgs = series.map((s) => renderShape(s));
  const seriesCombined = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${series.length * 110} 100">${seriesSvgs
    .map((svg, i) => {
      const inner = svg.replace(/<\/?svg[^>]*>/g, '');
      return `<g transform="translate(${i * 110},0)">${inner}</g>`;
    })
    .join('')}</svg>`;

  const correctId = uniqueId();
  const allOptions = shuffle(
    [
      { id: correctId, label: 'A', svgData: renderShape(correct) },
      ...wrongOptions.map((w) => ({
        id: uniqueId(),
        label: 'B',
        svgData: renderShape(w),
      })),
    ],
    rng
  ).map((opt, i) => ({ ...opt, label: String.fromCharCode(65 + i) }));

  return {
    id: uniqueId(),
    subject: Subject.NON_VERBAL_REASONING,
    topic: NonVerbalTopic.SERIES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: 'Which shape comes next in the series?',
    svgData: seriesCombined,
    options: allOptions,
    correctAnswer: correctId,
    explanation: getPatternExplanation(pattern),
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'nvr-series',
    generatorSeed: seed,
    tags: ['non-verbal', 'series', pattern],
  };
}
