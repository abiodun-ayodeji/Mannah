import { Subject, Topic } from './subject';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type AnswerFormat =
  | 'multiple_choice'
  | 'text_input'
  | 'drag_order'
  | 'fill_blank'
  | 'visual_select';

export interface QuestionOption {
  id: string;
  label: string;
  svgData?: string;
}

export interface Question {
  id: string;
  subject: Subject;
  topic: Topic;
  difficulty: Difficulty;
  answerFormat: AnswerFormat;
  prompt: string;
  passage?: string;
  svgData?: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  timeLimit: number | null;
  xpReward: number;
  isGenerated: boolean;
  generatorId?: string;
  generatorSeed?: number;
  tags: string[];
}

export interface GeneratedQuestion extends Question {
  isGenerated: true;
  generatorId: string;
  generatorSeed: number;
}

export type QuestionGenerator = (seed: number, difficulty: Difficulty) => Question;
