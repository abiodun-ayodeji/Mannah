import type { Difficulty, Question } from '../../../types/question';
import { NonVerbalTopic } from '../../../types/subject';
import { uniqueId } from '../../../utils/random';
import { generateNVRSeries } from './series';
import { generateNVRReflection } from './reflection';
import { generateNVROddOneOut } from './odd-one-out';

function withTopicOverrides(
  base: Question,
  topic: NonVerbalTopic,
  generatorId: string,
  prompt: string,
  explanation: string,
  tags: string[],
): Question {
  return {
    ...base,
    id: uniqueId(),
    topic,
    prompt,
    explanation,
    generatorId,
    tags: [...new Set([...base.tags, ...tags])],
  };
}

export function generateNVRAnalogies(seed: number, difficulty: Difficulty): Question {
  const base = generateNVRSeries(seed, difficulty);
  return withTopicOverrides(
    base,
    NonVerbalTopic.ANALOGIES,
    'nvr-analogies',
    'A changes to B. C changes in the same way. Which option shows the answer?',
    'Find the visual rule in the pattern, then apply the same rule to complete the analogy.',
    ['analogies'],
  );
}

export function generateNVRFoldingPaper(seed: number, difficulty: Difficulty): Question {
  const base = generateNVRReflection(seed, difficulty);
  return withTopicOverrides(
    base,
    NonVerbalTopic.FOLDING_PAPER,
    'nvr-folding-paper',
    'Imagine the shape has been folded and opened. Which option matches the result?',
    'Folding and unfolding creates a mirrored outcome. Pick the true mirrored shape.',
    ['folding-paper'],
  );
}

export function generateNVRGrouping(seed: number, difficulty: Difficulty): Question {
  const base = generateNVROddOneOut(seed, difficulty);
  return withTopicOverrides(
    base,
    NonVerbalTopic.GROUPING,
    'nvr-grouping',
    'Which shape does not belong in the same group as the others?',
    'Group the shapes by shared features, then pick the one that breaks the rule.',
    ['grouping'],
  );
}
