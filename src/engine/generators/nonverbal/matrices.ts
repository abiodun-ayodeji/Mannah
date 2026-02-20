import type { Question, Difficulty } from '../../../types/question';
import { Subject, NonVerbalTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const SHAPES = ['circle', 'rect', 'triangle', 'pentagon', 'hexagon'] as const;
type ShapeName = (typeof SHAPES)[number];
const SIZES = [15, 22, 30] as const;

interface CellSpec {
  shape: ShapeName;
  color: string;
  size: number;
  rotation: number;
}

function renderCell(spec: CellSpec): string {
  const cx = 50;
  const cy = 50;
  let inner = '';

  switch (spec.shape) {
    case 'circle':
      inner = `<circle cx="${cx}" cy="${cy}" r="${spec.size}" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    case 'rect':
      inner = `<rect x="${cx - spec.size}" y="${cy - spec.size}" width="${spec.size * 2}" height="${spec.size * 2}" fill="${spec.color}" stroke="#1E293B" stroke-width="2" transform="rotate(${spec.rotation},${cx},${cy})"/>`;
      break;
    case 'triangle': {
      const r = spec.size;
      const pts: string[] = [];
      for (let i = 0; i < 3; i++) {
        const angle = (spec.rotation * Math.PI) / 180 + (2 * Math.PI * i) / 3 - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      inner = `<polygon points="${pts.join(' ')}" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    }
    case 'pentagon': {
      const r = spec.size;
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (spec.rotation * Math.PI) / 180 + (2 * Math.PI * i) / 5 - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      inner = `<polygon points="${pts.join(' ')}" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    }
    case 'hexagon': {
      const r = spec.size;
      const pts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (spec.rotation * Math.PI) / 180 + (2 * Math.PI * i) / 6 - Math.PI / 2;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      inner = `<polygon points="${pts.join(' ')}" fill="${spec.color}" stroke="#1E293B" stroke-width="2"/>`;
      break;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
}

function renderGrid(cells: (CellSpec | null)[]): string {
  // 2x2 grid: cells[0]=top-left, cells[1]=top-right, cells[2]=bottom-left, cells[3]=bottom-right
  const cellSize = 100;
  const gap = 8;
  const totalW = cellSize * 2 + gap;
  const totalH = cellSize * 2 + gap;

  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * (cellSize + gap);
    const y = row * (cellSize + gap);

    // Background
    parts.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2" rx="4"/>`);

    if (cells[i]) {
      const innerSvg = renderCell(cells[i]!).replace(/<\/?svg[^>]*>/g, '');
      parts.push(`<g transform="translate(${x},${y})">${innerSvg}</g>`);
    } else {
      // Question mark for missing cell
      parts.push(`<text x="${x + cellSize / 2}" y="${y + cellSize / 2 + 12}" text-anchor="middle" font-size="36" font-weight="bold" fill="#94A3B8">?</text>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}">${parts.join('')}</svg>`;
}

export function generateNVRMatrices(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  // Determine how many properties change
  const propertyCount = difficulty <= 2 ? 1 : difficulty === 3 ? 2 : 3;

  // Pick base properties
  const baseShape = pick(SHAPES, rng);
  const baseColor = pick(COLORS, rng);
  const baseSize = pick(SIZES, rng);
  const baseRotation = 0;

  // Pick alternate values for changing properties
  let altShape = pick(SHAPES.filter((s) => s !== baseShape), rng);
  let altColor = pick(COLORS.filter((c) => c !== baseColor), rng);
  const altSizeIdx = SIZES.indexOf(baseSize as typeof SIZES[number]);
  const altSize = SIZES[(altSizeIdx + 1) % SIZES.length];
  const altRotation = pick([90, 180, 270], rng);

  // Determine which properties change across rows vs columns
  type Prop = 'shape' | 'color' | 'size' | 'rotation';
  const changeable: Prop[] = ['shape', 'color', 'size', 'rotation'];
  const selectedProps = shuffle([...changeable], rng).slice(0, propertyCount);

  // Build cells: pattern is row determines one set, column determines another
  // Row 1: base values, Row 2: some properties change
  // Col 1: base values, Col 2: some properties change

  function buildCell(rowChange: boolean, colChange: boolean): CellSpec {
    let shape: ShapeName = baseShape;
    let color = baseColor;
    let size = baseSize;
    let rotation = baseRotation;

    for (const prop of selectedProps) {
      // Alternate property based on a simple rule:
      // If prop index is even, it changes with rows; if odd, with columns
      const propIdx = selectedProps.indexOf(prop);
      const shouldChange = propIdx % 2 === 0 ? rowChange : colChange;

      if (shouldChange) {
        switch (prop) {
          case 'shape':
            shape = altShape;
            break;
          case 'color':
            color = altColor;
            break;
          case 'size':
            size = altSize;
            break;
          case 'rotation':
            rotation = altRotation;
            break;
        }
      }
    }

    return { shape, color, size, rotation };
  }

  // 2x2 grid: [top-left, top-right, bottom-left, bottom-right]
  const topLeft = buildCell(false, false);
  const topRight = buildCell(false, true);
  const bottomLeft = buildCell(true, false);
  const correctCell = buildCell(true, true);

  // Build the grid SVG with bottom-right as "?"
  const gridSvg = renderGrid([topLeft, topRight, bottomLeft, null]);

  // Build answer options
  const correctSvg = renderCell(correctCell);
  const correctId = uniqueId();

  // Generate wrong options by tweaking one or more properties of the correct answer
  const wrongCells: CellSpec[] = [];
  const usedKeys = new Set<string>();
  usedKeys.add(JSON.stringify(correctCell));

  const possibleShapes = SHAPES.filter((s) => s !== correctCell.shape);
  const possibleColors = COLORS.filter((c) => c !== correctCell.color);

  while (wrongCells.length < 3) {
    const cell = { ...correctCell };
    const tweakCount = wrongCells.length === 0 ? 1 : randomInt(1, 2, rng);

    for (let t = 0; t < tweakCount; t++) {
      const tweakProp = pick(changeable, rng);
      switch (tweakProp) {
        case 'shape':
          cell.shape = pick(possibleShapes, rng);
          break;
        case 'color':
          cell.color = pick(possibleColors, rng);
          break;
        case 'size':
          cell.size = SIZES[(SIZES.indexOf(cell.size as typeof SIZES[number]) + 1) % SIZES.length];
          break;
        case 'rotation':
          cell.rotation = (cell.rotation + pick([90, 180, 270], rng)) % 360;
          break;
      }
    }

    const key = JSON.stringify(cell);
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      wrongCells.push({ ...cell });
    }
  }

  const options = shuffle(
    [
      { id: correctId, label: 'A', svgData: correctSvg },
      ...wrongCells.map((cell) => ({
        id: uniqueId(),
        label: 'B',
        svgData: renderCell(cell),
      })),
    ],
    rng,
  ).map((opt, i) => ({ ...opt, label: String.fromCharCode(65 + i) }));

  const changedPropsDesc = selectedProps.join(', ');
  const explanation = `Look at how the ${changedPropsDesc} change${selectedProps.length === 1 ? 's' : ''} across each row and column. The pattern shows what the missing shape should be.`;

  return {
    id: uniqueId(),
    subject: Subject.NON_VERBAL_REASONING,
    topic: NonVerbalTopic.MATRICES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: 'Which shape completes the pattern?',
    svgData: gridSvg,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'nvr-matrices',
    generatorSeed: seed,
    tags: ['non-verbal', 'matrices'],
  };
}
