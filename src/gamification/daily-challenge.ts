import { format } from 'date-fns';
import { createRng, pick } from '../utils/random';
import { Subject, MathsTopic, VerbalReasoningTopic, EnglishTopic, NonVerbalTopic } from '../types/subject';
import type { Topic } from '../types/subject';
import type { Difficulty } from '../types/question';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  topic: Topic;
  questionCount: number;
  difficulty: Difficulty;
  xpBonus: number;
  emoji: string;
}

const CHALLENGE_TEMPLATES = [
  { title: 'Speed Bolt', description: 'Answer quickly for bonus XP!', emoji: '⚡', count: 5 },
  { title: 'Brain Buster', description: 'Tackle harder questions!', emoji: '🧠', count: 8 },
  { title: 'Perfect Run', description: 'Try to get them all right!', emoji: '🎯', count: 5 },
  { title: 'Marathon', description: 'A longer challenge awaits!', emoji: '🏃', count: 15 },
  { title: 'Mixed Bag', description: 'Questions from different topics!', emoji: '🎲', count: 10 },
  { title: 'Quick Fire', description: 'Short and sharp!', emoji: '🔥', count: 5 },
];

const ALL_TOPICS: { subject: Subject; topic: Topic }[] = [
  { subject: Subject.MATHS, topic: MathsTopic.ARITHMETIC },
  { subject: Subject.MATHS, topic: MathsTopic.FRACTIONS },
  { subject: Subject.MATHS, topic: MathsTopic.DECIMALS },
  { subject: Subject.MATHS, topic: MathsTopic.PERCENTAGES },
  { subject: Subject.MATHS, topic: MathsTopic.ALGEBRA },
  { subject: Subject.MATHS, topic: MathsTopic.MONEY },
  { subject: Subject.MATHS, topic: MathsTopic.TIME },
  { subject: Subject.MATHS, topic: MathsTopic.MEASUREMENT },
  { subject: Subject.MATHS, topic: MathsTopic.WORD_PROBLEMS },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.LETTER_SERIES },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.NUMBER_SERIES },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.SYNONYMS },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.ANTONYMS },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.ANALOGIES },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.WORD_LETTER_CODES },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.COMPOUND_WORDS },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.HIDDEN_WORDS },
  { subject: Subject.VERBAL_REASONING, topic: VerbalReasoningTopic.MISSING_LETTERS },
  { subject: Subject.ENGLISH, topic: EnglishTopic.SPELLING },
  { subject: Subject.ENGLISH, topic: EnglishTopic.GRAMMAR },
  { subject: Subject.ENGLISH, topic: EnglishTopic.VOCABULARY },
  { subject: Subject.NON_VERBAL_REASONING, topic: NonVerbalTopic.SERIES },
  { subject: Subject.NON_VERBAL_REASONING, topic: NonVerbalTopic.ROTATION },
  { subject: Subject.NON_VERBAL_REASONING, topic: NonVerbalTopic.ODD_ONE_OUT },
];

export function getDailyChallenges(dateStr?: string): DailyChallenge[] {
  const date = dateStr ?? format(new Date(), 'yyyy-MM-dd');
  // Create deterministic seed from date
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed = seed * 31 + date.charCodeAt(i);
  }
  const rng = createRng(seed);

  const challenges: DailyChallenge[] = [];
  const usedTopics = new Set<string>();

  for (let i = 0; i < 3; i++) {
    const template = CHALLENGE_TEMPLATES[Math.floor(rng() * CHALLENGE_TEMPLATES.length)];

    let topicInfo: typeof ALL_TOPICS[number];
    do {
      topicInfo = ALL_TOPICS[Math.floor(rng() * ALL_TOPICS.length)];
    } while (usedTopics.has(topicInfo.topic) && usedTopics.size < ALL_TOPICS.length);
    usedTopics.add(topicInfo.topic);

    const difficulty = (Math.floor(rng() * 3) + 1) as Difficulty;

    challenges.push({
      id: `daily-${date}-${i}`,
      title: template.title,
      description: template.description,
      subject: topicInfo.subject,
      topic: topicInfo.topic,
      questionCount: template.count,
      difficulty,
      xpBonus: 50 + difficulty * 10,
      emoji: template.emoji,
    });
  }

  return challenges;
}
