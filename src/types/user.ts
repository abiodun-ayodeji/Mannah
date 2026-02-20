import { Subject } from './subject';
import { Difficulty } from './question';

export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
  settings: UserSettings;
  parentPin?: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  readAloudEnabled: boolean;
  animationsEnabled: boolean;
  timerEnabled: boolean;
  dailyGoalQuestions: number;
  difficulty: 'auto' | Difficulty;
  theme: 'light' | 'dark';
}

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  readAloudEnabled: false,
  animationsEnabled: true,
  timerEnabled: true,
  dailyGoalQuestions: 20,
  difficulty: 'auto',
  theme: 'light',
};
