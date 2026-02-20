import { Subject, MathsTopic, VerbalReasoningTopic, EnglishTopic, NonVerbalTopic } from '../types/subject';
import type { Topic } from '../types/subject';
import type { Difficulty } from '../types/question';

export interface BossConfig {
  id: string;
  name: string;
  emoji: string;
  subject: Subject;
  topics: Topic[];
  difficulty: Difficulty;
  questionCount: number;
  totalHP: number;
  damagePerCorrect: number;
  xpReward: number;
  description: string;
}

export const BOSSES: BossConfig[] = [
  // Maths bosses
  {
    id: 'number_nibbler',
    name: 'The Number Nibbler',
    emoji: '🐛',
    subject: Subject.MATHS,
    topics: [MathsTopic.ARITHMETIC],
    difficulty: 2,
    questionCount: 8,
    totalHP: 100,
    damagePerCorrect: 15,
    xpReward: 150,
    description: 'A pesky bug that feeds on wrong answers! Quick arithmetic will squash it.',
  },
  {
    id: 'fraction_fortress',
    name: 'The Fraction Fortress',
    emoji: '🏰',
    subject: Subject.MATHS,
    topics: [MathsTopic.FRACTIONS, MathsTopic.DECIMALS],
    difficulty: 3,
    questionCount: 10,
    totalHP: 150,
    damagePerCorrect: 18,
    xpReward: 250,
    description: 'A mighty fortress built on fractions! Like the walls of Jericho, bring it down with your knowledge!',
  },
  {
    id: 'algebra_archer',
    name: 'The Algebra Archer',
    emoji: '🏹',
    subject: Subject.MATHS,
    topics: [MathsTopic.ALGEBRA, MathsTopic.PERCENTAGES],
    difficulty: 3,
    questionCount: 12,
    totalHP: 200,
    damagePerCorrect: 20,
    xpReward: 350,
    description: 'Fires arrows of unknowns at you! Like Joseph interpreting dreams, solve for x to disarm this archer.',
  },
  {
    id: 'geometry_giant',
    name: 'The Geometry Giant',
    emoji: '🗿',
    subject: Subject.MATHS,
    topics: [MathsTopic.MEASUREMENT, MathsTopic.MONEY, MathsTopic.TIME],
    difficulty: 4,
    questionCount: 12,
    totalHP: 250,
    damagePerCorrect: 25,
    xpReward: 500,
    description: 'A towering stone creature that speaks only in shapes and measures!',
  },
  {
    id: 'maths_monarch',
    name: 'The Maths Monarch',
    emoji: '🤴',
    subject: Subject.MATHS,
    topics: Object.values(MathsTopic).filter(t => [MathsTopic.ARITHMETIC, MathsTopic.FRACTIONS, MathsTopic.ALGEBRA, MathsTopic.PERCENTAGES, MathsTopic.WORD_PROBLEMS].includes(t)),
    difficulty: 5,
    questionCount: 15,
    totalHP: 300,
    damagePerCorrect: 25,
    xpReward: 750,
    description: 'The ruler of all numbers! Like Joshua conquering Jericho, only the bravest mathematicians can topple this boss.',
  },

  // Verbal Reasoning bosses
  {
    id: 'riddle_raven',
    name: 'The Riddle Raven',
    emoji: '🐦‍⬛',
    subject: Subject.VERBAL_REASONING,
    topics: [VerbalReasoningTopic.SYNONYMS, VerbalReasoningTopic.ANTONYMS],
    difficulty: 2,
    questionCount: 8,
    totalHP: 100,
    damagePerCorrect: 15,
    xpReward: 150,
    description: 'This clever bird speaks in riddles! Know your words to silence it.',
  },
  {
    id: 'code_cobra',
    name: 'The Code Cobra',
    emoji: '🐍',
    subject: Subject.VERBAL_REASONING,
    topics: [VerbalReasoningTopic.WORD_LETTER_CODES, VerbalReasoningTopic.LETTER_SERIES, VerbalReasoningTopic.NUMBER_SERIES],
    difficulty: 3,
    questionCount: 10,
    totalHP: 150,
    damagePerCorrect: 18,
    xpReward: 250,
    description: 'Slithering through coded messages! Like Daniel reading the writing on the wall, crack the codes to overcome it.',
  },
  {
    id: 'word_warrior',
    name: 'The Word Warrior',
    emoji: '⚔️',
    subject: Subject.VERBAL_REASONING,
    topics: [VerbalReasoningTopic.ANALOGIES, VerbalReasoningTopic.COMPOUND_WORDS, VerbalReasoningTopic.HIDDEN_WORDS],
    difficulty: 4,
    questionCount: 12,
    totalHP: 200,
    damagePerCorrect: 20,
    xpReward: 400,
    description: 'A mighty warrior armed with words! Like David facing Goliath, use your wisdom to prevail.',
  },

  // English bosses
  {
    id: 'grammar_guardian',
    name: 'The Grammar Guardian',
    emoji: '🛡️',
    subject: Subject.ENGLISH,
    topics: [EnglishTopic.GRAMMAR, EnglishTopic.SPELLING],
    difficulty: 2,
    questionCount: 8,
    totalHP: 100,
    damagePerCorrect: 15,
    xpReward: 150,
    description: 'This mighty guardian protects the grammar gates! Like Nehemiah rebuilding the walls, set the rules right.',
  },
  {
    id: 'vocab_victor',
    name: 'The Vocab Victor',
    emoji: '🏅',
    subject: Subject.ENGLISH,
    topics: [EnglishTopic.VOCABULARY, EnglishTopic.SPELLING, EnglishTopic.GRAMMAR],
    difficulty: 3,
    questionCount: 10,
    totalHP: 150,
    damagePerCorrect: 18,
    xpReward: 250,
    description: 'A champion of confusing words! Like Solomon seeking wisdom, master your vocabulary to triumph.',
  },

  // NVR bosses
  {
    id: 'pattern_prowler',
    name: 'The Pattern Prowler',
    emoji: '🐆',
    subject: Subject.NON_VERBAL_REASONING,
    topics: [NonVerbalTopic.SERIES, NonVerbalTopic.ODD_ONE_OUT],
    difficulty: 2,
    questionCount: 8,
    totalHP: 100,
    damagePerCorrect: 15,
    xpReward: 150,
    description: 'A cunning creature that hides in patterns! Like Elijah seeking the still small voice, spot the differences to catch it.',
  },
  {
    id: 'shape_sentinel',
    name: 'The Shape Sentinel',
    emoji: '🗼',
    subject: Subject.NON_VERBAL_REASONING,
    topics: [NonVerbalTopic.ROTATION, NonVerbalTopic.SERIES, NonVerbalTopic.ODD_ONE_OUT],
    difficulty: 4,
    questionCount: 12,
    totalHP: 200,
    damagePerCorrect: 20,
    xpReward: 400,
    description: 'A towering sentinel that guards the realm of shapes! Like Samson bringing down the pillars, use your strength of mind.',
  },
];

export function getBossesForSubject(subject: Subject): BossConfig[] {
  return BOSSES.filter((b) => b.subject === subject);
}

export function getAllBosses(): BossConfig[] {
  return BOSSES;
}

export function getBossById(id: string): BossConfig | undefined {
  return BOSSES.find((b) => b.id === id);
}
