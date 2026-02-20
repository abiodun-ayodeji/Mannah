import type { Difficulty, Question } from '../../../types/question';
import { EnglishTopic, Subject } from '../../../types/subject';
import { createRng, pick, shuffle, uniqueId } from '../../../utils/random';

interface ClozeTemplate {
  passage: string;
  answer: string;
  distractors: string[];
  explanation: string;
  level: 1 | 2 | 3 | 4 | 5;
}

const CLOZE_TEMPLATES: ClozeTemplate[] = [
  {
    passage:
      'The rain stopped, and the children rushed outside to play. They laughed as they splashed in the puddles, and soon everyone was completely ___.',
    answer: 'soaked',
    distractors: ['silent', 'angry', 'careful'],
    explanation: 'If children are splashing in puddles, they become soaked (very wet).',
    level: 1,
  },
  {
    passage:
      'Mina packed her bag the night before the trip. In the morning, she checked her list again to make sure she had not forgotten ___.',
    answer: 'anything',
    distractors: ['someone', 'everywhere', 'already'],
    explanation: '"Had not forgotten anything" is the natural and correct completion.',
    level: 1,
  },
  {
    passage:
      'Although the puzzle looked simple at first, it became more difficult with each piece. By the end, solving it required patience and careful ___.',
    answer: 'thinking',
    distractors: ['jumping', 'painting', 'guessing'],
    explanation: 'Puzzles are solved with thinking, especially when they become difficult.',
    level: 2,
  },
  {
    passage:
      'The classroom was noisy before the teacher arrived. As soon as she entered, the room grew quiet, and everyone sat down ___.',
    answer: 'immediately',
    distractors: ['quietly', 'outside', 'yesterday'],
    explanation: '"Sat down immediately" best matches the timing in the sentence.',
    level: 2,
  },
  {
    passage:
      'The explorer followed the map through the forest, but thick mist made it hard to see. He paused often to check his direction and avoid getting ___.',
    answer: 'lost',
    distractors: ['famous', 'hungry', 'warm'],
    explanation: 'If visibility is poor, you check direction to avoid getting lost.',
    level: 3,
  },
  {
    passage:
      'Sara revised for her test every evening. Her consistent effort meant she felt calm, prepared, and surprisingly ___.',
    answer: 'confident',
    distractors: ['confused', 'careless', 'lonely'],
    explanation: 'Regular revision usually makes students feel confident.',
    level: 3,
  },
  {
    passage:
      'The council considered several proposals for the park renovation. After comparing cost, safety, and long-term impact, they reached a final ___.',
    answer: 'decision',
    distractors: ['question', 'argument', 'complaint'],
    explanation: 'After evaluating proposals, councils reach a decision.',
    level: 4,
  },
  {
    passage:
      'Even though the experiment failed on the first attempt, the team carefully recorded every result. Their notes helped them refine their method and improve ___.',
    answer: 'accuracy',
    distractors: ['volume', 'distance', 'colour'],
    explanation: 'Recording and refining methods improves accuracy in experiments.',
    level: 4,
  },
  {
    passage:
      'The author deliberately used short, sharp sentences in the opening chapter. This stylistic choice created urgency and heightened the reader\'s ___.',
    answer: 'tension',
    distractors: ['silence', 'balance', 'comfort'],
    explanation: 'Short, sharp sentences often increase narrative tension.',
    level: 5,
  },
  {
    passage:
      'When historians analyse primary sources, they examine not only what is written but also who wrote it and why. This helps them evaluate the source\'s ___.',
    answer: 'reliability',
    distractors: ['length', 'temperature', 'price'],
    explanation: 'Source analysis focuses on reliability and potential bias.',
    level: 5,
  },
];

export function generateCloze(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const eligible = CLOZE_TEMPLATES.filter(
    (template) =>
      template.level >= Math.max(1, difficulty - 1) &&
      template.level <= Math.min(5, difficulty + 1),
  );
  const template = pick(eligible, rng);

  const correctId = uniqueId();
  const options = shuffle(
    [
      { id: correctId, label: template.answer },
      ...template.distractors.map((option) => ({ id: uniqueId(), label: option })),
    ],
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.ENGLISH,
    topic: EnglishTopic.CLOZE,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: 'Choose the best word to complete the passage.',
    passage: template.passage,
    options,
    correctAnswer: correctId,
    explanation: template.explanation,
    timeLimit: 35,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'cloze',
    generatorSeed: seed,
    tags: ['english', 'cloze', 'reading'],
  };
}
