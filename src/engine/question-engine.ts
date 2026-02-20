import type { Question, Difficulty, QuestionGenerator } from '../types/question';
import type { Topic } from '../types/subject';
import { Subject } from '../types/subject';
import { generateArithmetic } from './generators/maths/arithmetic';
import { generateFractions } from './generators/maths/fractions';
import { generateDecimals } from './generators/maths/decimals';
import { generatePercentages } from './generators/maths/percentages';
import { generateAlgebra } from './generators/maths/algebra';
import { generateMoney } from './generators/maths/money';
import { generateTime } from './generators/maths/time';
import { generateMeasurement } from './generators/maths/measurement';
import { generateWordProblems } from './generators/maths/word-problems';
import { generateGeometry } from './generators/maths/geometry';
import { generateRatios } from './generators/maths/ratios';
import { generateDataHandling } from './generators/maths/data-handling';
import { generateLetterSeries } from './generators/verbal/letter-series';
import { generateNumberSeries } from './generators/verbal/number-series';
import { generateWordLetterCodes } from './generators/verbal/word-letter-codes';
import { generateCompoundWords } from './generators/verbal/compound-words';
import { generateHiddenWords } from './generators/verbal/hidden-words';
import { generateMoveALetter } from './generators/verbal/move-a-letter';
import { generateMissingLetters } from './generators/verbal/missing-letters';
import { generateNVRSeries } from './generators/nonverbal/series';
import { generateNVRRotation } from './generators/nonverbal/rotation';
import { generateNVROddOneOut } from './generators/nonverbal/odd-one-out';
import { generateNVRReflection } from './generators/nonverbal/reflection';
import { generateNVRMatrices } from './generators/nonverbal/matrices';
import { generateSpelling } from './generators/english/spelling';
import { generateGrammar } from './generators/english/grammar';
import { generateVocabulary } from './generators/english/vocabulary';
import { generatePunctuation } from './generators/english/punctuation';
import { generateSynonyms } from './generators/verbal/synonyms';
import { generateAntonyms } from './generators/verbal/antonyms';
import { generateAnalogies } from './generators/verbal/analogies';
import { generateShuffledSentences } from './generators/verbal/shuffled-sentences';
import { generateCloze } from './generators/english/cloze';
import { generateEnglishSentenceCompletion } from './generators/english/sentence-completion';
import {
  generateAntonymPairs,
  generateClosestMeaning,
  generateCreateAWord,
  generateNumberLetterCodes,
  generateRelatedWords,
  generateVROddOneOut,
  generateVRSentenceCompletion,
  generateWordConnections,
} from './generators/verbal/extended-topics';
import {
  generateNVRAnalogies,
  generateNVRFoldingPaper,
  generateNVRGrouping,
} from './generators/nonverbal/extended-topics';
import { MathsTopic, VerbalReasoningTopic, NonVerbalTopic, EnglishTopic } from '../types/subject';

const GENERATORS: Partial<Record<Topic, QuestionGenerator>> = {
  [MathsTopic.ARITHMETIC]: generateArithmetic,
  [MathsTopic.FRACTIONS]: generateFractions,
  [MathsTopic.DECIMALS]: generateDecimals,
  [MathsTopic.PERCENTAGES]: generatePercentages,
  [MathsTopic.ALGEBRA]: generateAlgebra,
  [MathsTopic.MONEY]: generateMoney,
  [MathsTopic.TIME]: generateTime,
  [MathsTopic.MEASUREMENT]: generateMeasurement,
  [MathsTopic.WORD_PROBLEMS]: generateWordProblems,
  [MathsTopic.GEOMETRY]: generateGeometry,
  [MathsTopic.RATIOS]: generateRatios,
  [MathsTopic.DATA_HANDLING]: generateDataHandling,
  [VerbalReasoningTopic.LETTER_SERIES]: generateLetterSeries,
  [VerbalReasoningTopic.NUMBER_SERIES]: generateNumberSeries,
  [VerbalReasoningTopic.WORD_LETTER_CODES]: generateWordLetterCodes,
  [VerbalReasoningTopic.COMPOUND_WORDS]: generateCompoundWords,
  [VerbalReasoningTopic.HIDDEN_WORDS]: generateHiddenWords,
  [VerbalReasoningTopic.MOVE_A_LETTER]: generateMoveALetter,
  [VerbalReasoningTopic.MISSING_LETTERS]: generateMissingLetters,
  [VerbalReasoningTopic.SYNONYMS]: generateSynonyms,
  [VerbalReasoningTopic.ANTONYMS]: generateAntonyms,
  [VerbalReasoningTopic.ANTONYM_PAIRS]: generateAntonymPairs,
  [VerbalReasoningTopic.ANALOGIES]: generateAnalogies,
  [VerbalReasoningTopic.SHUFFLED_SENTENCES]: generateShuffledSentences,
  [VerbalReasoningTopic.NUMBER_LETTER_CODES]: generateNumberLetterCodes,
  [VerbalReasoningTopic.WORD_CONNECTIONS]: generateWordConnections,
  [VerbalReasoningTopic.ODD_ONE_OUT]: generateVROddOneOut,
  [VerbalReasoningTopic.CLOSEST_MEANING]: generateClosestMeaning,
  [VerbalReasoningTopic.SENTENCE_COMPLETION]: generateVRSentenceCompletion,
  [VerbalReasoningTopic.RELATED_WORDS]: generateRelatedWords,
  [VerbalReasoningTopic.CREATE_A_WORD]: generateCreateAWord,
  [NonVerbalTopic.SERIES]: generateNVRSeries,
  [NonVerbalTopic.ANALOGIES]: generateNVRAnalogies,
  [NonVerbalTopic.ROTATION]: generateNVRRotation,
  [NonVerbalTopic.ODD_ONE_OUT]: generateNVROddOneOut,
  [NonVerbalTopic.REFLECTION]: generateNVRReflection,
  [NonVerbalTopic.MATRICES]: generateNVRMatrices,
  [NonVerbalTopic.FOLDING_PAPER]: generateNVRFoldingPaper,
  [NonVerbalTopic.GROUPING]: generateNVRGrouping,
  [EnglishTopic.SPELLING]: generateSpelling,
  [EnglishTopic.GRAMMAR]: generateGrammar,
  [EnglishTopic.VOCABULARY]: generateVocabulary,
  [EnglishTopic.PUNCTUATION]: generatePunctuation,
  [EnglishTopic.CLOZE]: generateCloze,
  [EnglishTopic.SENTENCE_COMPLETION]: generateEnglishSentenceCompletion,
};

function getSubjectForTopic(topic: Topic): Subject {
  if (Object.values(MathsTopic).includes(topic as MathsTopic)) return Subject.MATHS;
  if (Object.values(VerbalReasoningTopic).includes(topic as VerbalReasoningTopic)) return Subject.VERBAL_REASONING;
  if (Object.values(NonVerbalTopic).includes(topic as NonVerbalTopic)) return Subject.NON_VERBAL_REASONING;
  return Subject.ENGLISH;
}

export function generateQuestion(topic: Topic, difficulty: Difficulty): Question | null {
  const generator = GENERATORS[topic];
  if (!generator) return null;
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  return generator(seed, difficulty);
}

export function generateQuizQuestions(
  topics: Topic[],
  count: number,
  difficulty: Difficulty
): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const seed = Date.now() + i * 7919 + Math.floor(Math.random() * 10000);
    const generator = GENERATORS[topic];
    if (generator) {
      questions.push(generator(seed, difficulty));
    }
  }
  return questions;
}

export function getAvailableTopics(subject: Subject): Topic[] {
  const allTopics = Object.keys(GENERATORS) as Topic[];
  return allTopics.filter((t) => getSubjectForTopic(t) === subject);
}

export { GENERATORS };
