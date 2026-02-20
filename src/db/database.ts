import Dexie, { type Table } from 'dexie';
import type { Question } from '../types/question';
import type { AttemptRecord, TopicMastery, DailyStats, SessionRecord } from '../types/progress';
import type { Achievement, StreakState } from '../types/gamification';
import type { AppNotification } from '../types/notification';
import type { UserProfile } from '../types/user';

export class MannahDB extends Dexie {
  questions!: Table<Question>;
  attempts!: Table<AttemptRecord>;
  topicMastery!: Table<TopicMastery>;
  dailyStats!: Table<DailyStats>;
  sessions!: Table<SessionRecord>;
  achievements!: Table<Achievement>;
  userProfile!: Table<UserProfile>;
  streakState!: Table<StreakState>;
  notifications!: Table<AppNotification>;

  constructor() {
    super('MannahDB');
    this.version(1).stores({
      questions: 'id, subject, topic, difficulty, [subject+topic], [subject+difficulty]',
      attempts: 'id, questionId, subject, topic, timestamp, sessionId, [subject+topic]',
      topicMastery: '[subject+topic], subject, masteryLevel, rating',
      dailyStats: 'date',
      sessions: 'id, type, startTime',
      achievements: 'id, category, unlockedAt',
      userProfile: 'id',
      streakState: 'id',
    });

    this.version(2).stores({
      questions: 'id, subject, topic, difficulty, [subject+topic], [subject+difficulty]',
      attempts: 'id, questionId, subject, topic, timestamp, sessionId, [subject+topic]',
      topicMastery: '[subject+topic], subject, masteryLevel, rating',
      dailyStats: 'date',
      sessions: 'id, type, startTime',
      achievements: 'id, category, unlockedAt',
      userProfile: 'id',
      streakState: 'id',
      notifications: 'id, type, createdAt, readAt',
    });
  }
}

export const db = new MannahDB();
