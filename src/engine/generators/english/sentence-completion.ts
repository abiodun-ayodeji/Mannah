import type { Difficulty, Question } from '../../../types/question';
import { EnglishTopic, Subject } from '../../../types/subject';
import { createRng, pick, shuffle, uniqueId } from '../../../utils/random';

interface SentenceTemplate {
  sentence: string;
  answer: string;
  distractors: string[];
  explanation: string;
  level: 1 | 2 | 3 | 4 | 5;
}

const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  {
    sentence: 'Liam forgot his umbrella, ___ he borrowed one from his friend.',
    answer: 'so',
    distractors: ['because', 'although', 'unless'],
    explanation: '"So" correctly shows the result of forgetting the umbrella.',
    level: 1,
  },
  {
    sentence: 'Nora read the instructions twice ___ she wanted to avoid mistakes.',
    answer: 'because',
    distractors: ['but', 'or', 'yet'],
    explanation: '"Because" introduces the reason for reading instructions carefully.',
    level: 1,
  },
  {
    sentence: 'The cake looked delicious, ___ I waited until everyone was served.',
    answer: 'but',
    distractors: ['so', 'because', 'unless'],
    explanation: '"But" shows contrast between desire and patient behaviour.',
    level: 2,
  },
  {
    sentence: 'If we leave now, we ___ arrive before the film starts.',
    answer: 'will',
    distractors: ['would', 'have', 'had'],
    explanation: 'First conditional uses "if + present" with "will + verb".',
    level: 2,
  },
  {
    sentence: 'Neither the principal nor the teachers ___ aware of the schedule change.',
    answer: 'were',
    distractors: ['was', 'is', 'has'],
    explanation: 'The verb agrees with the nearer plural subject "teachers".',
    level: 3,
  },
  {
    sentence: 'By the time the train arrived, we ___ waiting for over an hour.',
    answer: 'had been',
    distractors: ['are', 'have', 'were'],
    explanation: '"Had been" is correct for an action continuing before another past action.',
    level: 3,
  },
  {
    sentence: 'The report was clear and concise, making it easy ___ the main findings.',
    answer: 'to understand',
    distractors: ['understanding', 'understood', 'understands'],
    explanation: 'After "easy", the infinitive form "to understand" is needed.',
    level: 4,
  },
  {
    sentence: 'Hardly ___ the bell rung when the students rushed into the hall.',
    answer: 'had',
    distractors: ['has', 'was', 'did'],
    explanation: '"Hardly had ... when ..." requires inversion with "had".',
    level: 4,
  },
  {
    sentence: 'Not only ___ she complete the project early, but she also improved its design.',
    answer: 'did',
    distractors: ['was', 'has', 'had'],
    explanation: 'With "Not only", auxiliary inversion ("did she") is required.',
    level: 5,
  },
  {
    sentence: 'Were the weather to worsen, the organisers ___ postpone the event.',
    answer: 'might',
    distractors: ['must have', 'had', 'is'],
    explanation: '"Might" fits this formal conditional structure.',
    level: 5,
  },
];

export function generateEnglishSentenceCompletion(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);
  const eligible = SENTENCE_TEMPLATES.filter(
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
    topic: EnglishTopic.SENTENCE_COMPLETION,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `Choose the best option to complete the sentence:\n\n"${template.sentence}"`,
    options,
    correctAnswer: correctId,
    explanation: template.explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'english-sentence-completion',
    generatorSeed: seed,
    tags: ['english', 'sentence-completion'],
  };
}
