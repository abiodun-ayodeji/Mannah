import { db } from '../db/database';
import type { Topic } from '../types/subject';
import type { Subject } from '../types/subject';
import type { Difficulty } from '../types/question';

export interface TopicStat {
  topic: Topic;
  subject: Subject;
  total: number;
  correct: number;
  accuracy: number;
}

/**
 * Compute per-topic accuracy stats from all attempts.
 * Returns entries sorted weakest-first, filtered to topics with >= minAttempts.
 */
export async function getTopicStats(minAttempts = 3): Promise<TopicStat[]> {
  const all = await db.attempts.toArray();
  const map: Record<string, TopicStat> = {};

  for (const a of all) {
    const key = `${a.subject}:${a.topic}`;
    if (!map[key]) {
      map[key] = { topic: a.topic as Topic, subject: a.subject as Subject, total: 0, correct: 0, accuracy: 0 };
    }
    map[key].total++;
    if (a.isCorrect) map[key].correct++;
  }

  return Object.values(map)
    .filter((e) => e.total >= minAttempts)
    .map((e) => ({ ...e, accuracy: e.correct / e.total }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Given an accuracy ratio (0-1), return an appropriate difficulty level.
 *   < 0.50  → D1 or D2
 *   0.50-0.80 → D2 or D3
 *   > 0.80 → D3 or D4
 */
export function getDifficultyForAccuracy(accuracy: number): Difficulty {
  if (accuracy < 0.5) {
    return (Math.random() < 0.5 ? 1 : 2) as Difficulty;
  } else if (accuracy <= 0.8) {
    return (Math.random() < 0.5 ? 2 : 3) as Difficulty;
  } else {
    return (Math.random() < 0.5 ? 3 : 4) as Difficulty;
  }
}

/**
 * Returns the minimum difficulty a child should be allowed on a topic,
 * based on their all-time accuracy. Used to prevent farming easy levels.
 * Deterministic (no randomness) so it can be used in useMemo.
 *   < 50%  → D1 (struggling, keep easy)
 *   50-70% → D2
 *   70-85% → D3 (comfortable, push harder)
 *   ≥ 85%  → D4
 */
export function getMinDifficultyForAccuracy(accuracy: number): Difficulty {
  if (accuracy < 0.5) return 1 as Difficulty;
  if (accuracy < 0.7) return 2 as Difficulty;
  if (accuracy < 0.85) return 3 as Difficulty;
  return 4 as Difficulty;
}
