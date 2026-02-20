import { Subject, Topic } from './subject';
import { Difficulty } from './question';

export interface AttemptRecord {
  id: string;
  questionId: string;
  subject: Subject;
  topic: Topic;
  difficulty: Difficulty;
  isCorrect: boolean;
  userAnswer: string | string[];
  timeTaken: number;
  xpEarned: number;
  timestamp: number;
  sessionId: string;
}

export type MasteryLevel = 'beginner' | 'developing' | 'proficient' | 'mastered';

export interface TopicMastery {
  subject: Subject;
  topic: Topic;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTime: number;
  currentStreak: number;
  lastAttempted: number;
  masteryLevel: MasteryLevel;
  rating: number;
}

export interface DailyStats {
  date: string;
  questionsAttempted: number;
  questionsCorrect: number;
  xpEarned: number;
  subjectsStudied: Subject[];
}

export interface SessionRecord {
  id: string;
  userId: string;
  type: 'practice' | 'daily_challenge' | 'boss_battle' | 'mock_exam';
  subject: Subject | 'mixed';
  topics: Topic[];
  startTime: number;
  endTime: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  difficulty: Difficulty;
}
