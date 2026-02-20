import { db } from '../db/database';
import type { Achievement } from '../types/gamification';
import { Subject } from '../types/subject';
import { format } from 'date-fns';
import { getDailyChallenges } from './daily-challenge';
import { notifyAchievementUnlocked } from '../notifications/notification-system';

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt'>[] = [
  // Volume achievements
  { id: 'first_steps', name: 'First Steps', description: 'Answer 10 questions', icon: '👣', category: 'volume', conditionType: 'total_attempts', conditionThreshold: 10, xpReward: 50 },
  { id: 'half_century', name: 'Half Century', description: 'Answer 50 questions', icon: '5️⃣', category: 'volume', conditionType: 'total_attempts', conditionThreshold: 50, xpReward: 100 },
  { id: 'century_club', name: 'Century Club', description: 'Answer 100 questions', icon: '💯', category: 'volume', conditionType: 'total_attempts', conditionThreshold: 100, xpReward: 200 },
  { id: 'five_hundred', name: 'Five Hundred', description: 'Answer 500 questions', icon: '🏆', category: 'volume', conditionType: 'total_attempts', conditionThreshold: 500, xpReward: 500 },
  { id: 'thousand', name: 'The Thousand', description: 'Answer 1000 questions', icon: '👑', category: 'volume', conditionType: 'total_attempts', conditionThreshold: 1000, xpReward: 1000 },

  // Accuracy achievements
  { id: 'sharp_mind', name: 'Sharp Mind', description: 'Get 10 correct in a row', icon: '🎯', category: 'mastery', conditionType: 'correct_streak', conditionThreshold: 10, xpReward: 100 },
  { id: 'perfect_ten', name: 'Perfect Ten', description: 'Score 10/10 on a quiz', icon: '⭐', category: 'mastery', conditionType: 'perfect_quiz', conditionThreshold: 10, xpReward: 150 },
  { id: 'flawless', name: 'Flawless', description: 'Score 20/20 on a quiz', icon: '💎', category: 'mastery', conditionType: 'perfect_quiz', conditionThreshold: 20, xpReward: 300 },
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Get 50 correct in a row', icon: '🔫', category: 'mastery', conditionType: 'correct_streak', conditionThreshold: 50, xpReward: 500 },

  // Streak achievements
  { id: 'on_fire', name: 'On Fire', description: '3-day practice streak', icon: '🔥', category: 'streak', conditionType: 'day_streak', conditionThreshold: 3, xpReward: 50 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day practice streak', icon: '⚔️', category: 'streak', conditionType: 'day_streak', conditionThreshold: 7, xpReward: 150 },
  { id: 'fortnight_fighter', name: 'Fortnight Fighter', description: '14-day practice streak', icon: '🛡️', category: 'streak', conditionType: 'day_streak', conditionThreshold: 14, xpReward: 300 },
  { id: 'monthly_master', name: 'Monthly Master', description: '30-day practice streak', icon: '📅', category: 'streak', conditionType: 'day_streak', conditionThreshold: 30, xpReward: 500 },
  { id: 'unstoppable', name: 'Unstoppable', description: '60-day practice streak', icon: '🚀', category: 'streak', conditionType: 'day_streak', conditionThreshold: 60, xpReward: 1000 },

  // Speed achievements
  { id: 'quick_thinker', name: 'Quick Thinker', description: 'Answer correctly in under 5 seconds', icon: '⚡', category: 'speed', conditionType: 'fast_answer', conditionThreshold: 5, xpReward: 50 },
  { id: 'lightning_round', name: 'Lightning Round', description: 'Get 5 correct in under 30 seconds total', icon: '🌩️', category: 'speed', conditionType: 'speed_batch', conditionThreshold: 5, xpReward: 200 },

  // Exploration achievements
  { id: 'explorer', name: 'Explorer', description: 'Try all 4 subjects', icon: '🗺️', category: 'exploration', conditionType: 'subjects_tried', conditionThreshold: 4, xpReward: 100 },
  { id: 'maths_fan', name: 'Maths Fan', description: 'Answer 50 Maths questions', icon: '🔢', category: 'exploration', conditionType: 'subject_attempts', conditionThreshold: 50, conditionSubject: Subject.MATHS, xpReward: 100 },
  { id: 'word_warrior_badge', name: 'Word Warrior', description: 'Answer 50 Verbal Reasoning questions — wise as Solomon!', icon: '📝', category: 'exploration', conditionType: 'subject_attempts', conditionThreshold: 50, conditionSubject: Subject.VERBAL_REASONING, xpReward: 100 },
  { id: 'pattern_pro', name: 'Pattern Pro', description: 'Answer 50 NVR questions', icon: '🔷', category: 'exploration', conditionType: 'subject_attempts', conditionThreshold: 50, conditionSubject: Subject.NON_VERBAL_REASONING, xpReward: 100 },
  { id: 'bookworm', name: 'Bookworm', description: 'Answer 50 English questions', icon: '📖', category: 'exploration', conditionType: 'subject_attempts', conditionThreshold: 50, conditionSubject: Subject.ENGLISH, xpReward: 100 },

  // Special achievements
  { id: 'night_owl', name: 'Night Owl', description: 'Practice after 8pm', icon: '🦉', category: 'special', conditionType: 'time_of_day', conditionThreshold: 20, xpReward: 30 },
  { id: 'early_bird', name: 'Early Bird', description: 'Practice before 8am', icon: '🐦', category: 'special', conditionType: 'time_of_day', conditionThreshold: 8, xpReward: 30 },
  { id: 'daily_triple', name: 'Daily Triple', description: 'Complete all 3 daily challenges', icon: '🎖️', category: 'special', conditionType: 'daily_challenges', conditionThreshold: 3, xpReward: 100 },
  { id: 'boss_slayer', name: 'Goliath Slayer', description: 'Topple your first boss like David conquered Goliath', icon: '🪨', category: 'special', conditionType: 'bosses_defeated', conditionThreshold: 1, xpReward: 200 },
];

export async function initializeAchievements() {
  const existing = await db.achievements.count();
  if (existing > 0) return;

  await db.achievements.bulkPut(
    ACHIEVEMENT_DEFINITIONS.map((a) => ({ ...a, unlockedAt: undefined }))
  );
}

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  const newlyUnlocked: Achievement[] = [];
  const allAchievements = await db.achievements.toArray();
  const locked = allAchievements.filter((a) => !a.unlockedAt);

  if (locked.length === 0) return [];

  const attempts = await db.attempts.toArray();
  const totalAttempts = attempts.length;
  const streakState = await db.streakState.get('main');
  const currentHour = new Date().getHours();

  // Calculate subject-specific counts
  const subjectCounts: Record<string, number> = {};
  const subjectsSeen = new Set<string>();
  for (const a of attempts) {
    subjectCounts[a.subject] = (subjectCounts[a.subject] || 0) + 1;
    subjectsSeen.add(a.subject);
  }

  // Calculate max correct streak across all attempts
  let maxCorrectStreak = 0;
  let currentStreak = 0;
  for (const a of attempts) {
    if (a.isCorrect) {
      currentStreak++;
      maxCorrectStreak = Math.max(maxCorrectStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Check fastest answer
  const fastestCorrect = attempts
    .filter((a) => a.isCorrect)
    .reduce((min, a) => Math.min(min, a.timeTaken), Infinity);

  // Check perfect quizzes: group attempts by sessionId and find perfect sessions
  const sessionMap = new Map<string, { total: number; correct: number }>();
  for (const a of attempts) {
    if (!a.sessionId) continue;
    const entry = sessionMap.get(a.sessionId) ?? { total: 0, correct: 0 };
    entry.total++;
    if (a.isCorrect) entry.correct++;
    sessionMap.set(a.sessionId, entry);
  }
  // Find the largest perfect quiz (all correct in a session)
  let maxPerfectQuizSize = 0;
  for (const [, session] of sessionMap) {
    if (session.correct === session.total && session.total > 0) {
      maxPerfectQuizSize = Math.max(maxPerfectQuizSize, session.total);
    }
  }

  // Check speed batch: find N consecutive correct answers within 30 seconds total
  let maxSpeedBatch = 0;
  const correctAttempts = attempts.filter((a) => a.isCorrect);
  if (correctAttempts.length > 0) {
    // Sliding window of consecutive correct answers by time
    let windowStart = 0;
    let totalTime = 0;
    for (let i = 0; i < correctAttempts.length; i++) {
      totalTime += correctAttempts[i].timeTaken;
      // Shrink window if total time exceeds 30 seconds
      while (totalTime > 30 && windowStart < i) {
        totalTime -= correctAttempts[windowStart].timeTaken;
        windowStart++;
      }
      if (totalTime <= 30) {
        maxSpeedBatch = Math.max(maxSpeedBatch, i - windowStart + 1);
      }
    }
  }

  // Check daily challenges completion
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayStart = new Date(today).getTime();
  const todayAttempts = attempts.filter((a) => a.timestamp >= todayStart);
  const todayTopicCounts: Record<string, number> = {};
  for (const a of todayAttempts) {
    todayTopicCounts[a.topic] = (todayTopicCounts[a.topic] || 0) + 1;
  }
  const dailyChallenges = getDailyChallenges(today);
  const completedDailyChallenges = dailyChallenges.filter(
    (c) => (todayTopicCounts[c.topic] ?? 0) >= c.questionCount
  ).length;

  // Check bosses defeated (sessions that ended with boss HP at 0)
  // We detect boss battles by sessionId starting with a pattern, or simply
  // count sessions with specific characteristics. For simplicity, check
  // if there are any sessions with the boss battle page in history.
  // Actually, we can check the DB for a stored boss defeat flag.
  // For now, count sessions where all questions were answered correctly in boss subjects
  // A simpler approach: check if any attempt has sessionId that indicates boss battle
  const bossSessionIds = new Set<string>();
  for (const a of attempts) {
    if (a.sessionId?.startsWith('boss-')) {
      bossSessionIds.add(a.sessionId);
    }
  }
  // Check each boss session: if the session has enough correct answers, boss was defeated
  let bossesDefeated = 0;
  for (const sid of bossSessionIds) {
    const sessionAttempts = attempts.filter((a) => a.sessionId === sid);
    const correctCount = sessionAttempts.filter((a) => a.isCorrect).length;
    // A boss is defeated if enough correct answers were given (boss HP was depleted)
    if (correctCount >= 3) bossesDefeated++; // rough heuristic
  }

  for (const achievement of locked) {
    let unlocked = false;

    switch (achievement.conditionType) {
      case 'total_attempts':
        unlocked = totalAttempts >= achievement.conditionThreshold;
        break;
      case 'correct_streak':
        unlocked = maxCorrectStreak >= achievement.conditionThreshold;
        break;
      case 'day_streak':
        unlocked = (streakState?.currentStreak ?? 0) >= achievement.conditionThreshold;
        break;
      case 'fast_answer':
        unlocked = fastestCorrect <= achievement.conditionThreshold;
        break;
      case 'subjects_tried':
        unlocked = subjectsSeen.size >= achievement.conditionThreshold;
        break;
      case 'subject_attempts':
        if (achievement.conditionSubject) {
          unlocked = (subjectCounts[achievement.conditionSubject] ?? 0) >= achievement.conditionThreshold;
        }
        break;
      case 'time_of_day':
        if (achievement.id === 'night_owl') {
          unlocked = currentHour >= 20;
        } else if (achievement.id === 'early_bird') {
          unlocked = currentHour < 8;
        }
        break;
      case 'perfect_quiz':
        unlocked = maxPerfectQuizSize >= achievement.conditionThreshold;
        break;
      case 'speed_batch':
        unlocked = maxSpeedBatch >= achievement.conditionThreshold;
        break;
      case 'daily_challenges':
        unlocked = completedDailyChallenges >= achievement.conditionThreshold;
        break;
      case 'bosses_defeated':
        unlocked = bossesDefeated >= achievement.conditionThreshold;
        break;
    }

    if (unlocked) {
      const updated = { ...achievement, unlockedAt: Date.now() };
      await db.achievements.put(updated);
      await notifyAchievementUnlocked(updated);
      newlyUnlocked.push(updated);
    }
  }

  return newlyUnlocked;
}
