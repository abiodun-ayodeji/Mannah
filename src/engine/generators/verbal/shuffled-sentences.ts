import type { Question, Difficulty } from '../../../types/question';
import { Subject, VerbalReasoningTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

interface SentenceEntry {
  words: string[];
  level: 1 | 2 | 3 | 4 | 5;
}

const SENTENCES: SentenceEntry[] = [
  // Level 1-2: 4-5 word simple sentences
  { words: ['The', 'cat', 'is', 'sleeping'], level: 1 },
  { words: ['She', 'likes', 'red', 'flowers'], level: 1 },
  { words: ['We', 'play', 'every', 'day'], level: 1 },
  { words: ['The', 'dog', 'ran', 'fast'], level: 1 },
  { words: ['He', 'ate', 'two', 'apples'], level: 1 },
  { words: ['Birds', 'fly', 'in', 'the', 'sky'], level: 1 },
  { words: ['I', 'love', 'my', 'family'], level: 1 },
  { words: ['The', 'sun', 'is', 'bright'], level: 2 },
  { words: ['They', 'went', 'to', 'school', 'early'], level: 2 },
  { words: ['My', 'brother', 'plays', 'the', 'piano'], level: 2 },
  { words: ['She', 'found', 'a', 'gold', 'ring'], level: 2 },
  { words: ['The', 'baby', 'cried', 'all', 'night'], level: 2 },
  { words: ['Fish', 'live', 'in', 'the', 'water'], level: 2 },
  { words: ['We', 'had', 'a', 'great', 'time'], level: 2 },

  // Level 3: 6-7 word sentences
  { words: ['The', 'old', 'man', 'walked', 'to', 'town'], level: 3 },
  { words: ['She', 'carefully', 'opened', 'the', 'heavy', 'door'], level: 3 },
  { words: ['We', 'visited', 'the', 'museum', 'on', 'Saturday'], level: 3 },
  { words: ['The', 'children', 'played', 'in', 'the', 'garden'], level: 3 },
  { words: ['He', 'quickly', 'finished', 'his', 'breakfast', 'today'], level: 3 },
  { words: ['A', 'small', 'bird', 'sang', 'in', 'the', 'tree'], level: 3 },
  { words: ['My', 'friend', 'gave', 'me', 'a', 'lovely', 'present'], level: 3 },
  { words: ['The', 'train', 'arrived', 'late', 'at', 'the', 'station'], level: 3 },
  { words: ['They', 'always', 'eat', 'lunch', 'at', 'noon'], level: 3 },

  // Level 4-5: 8-10 word sentences
  { words: ['The', 'clever', 'fox', 'jumped', 'over', 'the', 'lazy', 'dog'], level: 4 },
  { words: ['She', 'decided', 'to', 'walk', 'home', 'through', 'the', 'park'], level: 4 },
  { words: ['The', 'teacher', 'asked', 'the', 'children', 'to', 'sit', 'down'], level: 4 },
  { words: ['After', 'dinner', 'they', 'watched', 'a', 'film', 'on', 'television'], level: 4 },
  { words: ['My', 'grandmother', 'baked', 'a', 'delicious', 'cake', 'for', 'everyone'], level: 4 },
  { words: ['He', 'could', 'not', 'believe', 'what', 'he', 'had', 'just', 'seen'], level: 5 },
  { words: ['The', 'enormous', 'elephant', 'drank', 'water', 'from', 'the', 'river', 'slowly'], level: 5 },
  { words: ['Although', 'it', 'was', 'raining', 'they', 'still', 'went', 'to', 'school'], level: 5 },
  { words: ['She', 'carefully', 'placed', 'the', 'fragile', 'vase', 'on', 'the', 'shelf'], level: 5 },
  { words: ['The', 'brave', 'knight', 'rescued', 'the', 'princess', 'from', 'the', 'tower'], level: 5 },
  { words: ['Before', 'breakfast', 'he', 'always', 'goes', 'for', 'a', 'long', 'run'], level: 5 },
  { words: ['We', 'must', 'remember', 'to', 'bring', 'our', 'books', 'to', 'class'], level: 5 },
];

export function generateShuffledSentences(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const pool = SENTENCES.filter((s) => {
    if (difficulty <= 2) return s.level <= 2;
    if (difficulty === 3) return s.level === 3;
    return s.level >= 4;
  });

  const entry = pick(pool, rng);
  const correctOrder = entry.words;

  // Ask for first or last word
  const askFirst = rng() < 0.5;
  const correctWord = askFirst ? correctOrder[0] : correctOrder[correctOrder.length - 1];

  // Shuffle the words for display
  const jumbled = shuffle([...correctOrder], rng);

  const prompt = askFirst
    ? `These words make a sentence: ${jumbled.join('  ')}. Which word comes FIRST?`
    : `These words make a sentence: ${jumbled.join('  ')}. Which word comes LAST?`;

  // Build distractors from other words in the sentence
  const otherWords = correctOrder.filter((w) => w !== correctWord);
  const distractorWords = new Set<string>();
  const shuffledOthers = shuffle([...otherWords], rng);
  for (const w of shuffledOthers) {
    if (distractorWords.size >= 3) break;
    if (w !== correctWord) distractorWords.add(w);
  }
  // If not enough distractors (unlikely), fill from the sentence
  while (distractorWords.size < 3) {
    const w = pick(correctOrder, rng);
    if (w !== correctWord) distractorWords.add(w);
  }

  const explanation = `The correct sentence is: "${correctOrder.join(' ')}." The ${askFirst ? 'first' : 'last'} word is "${correctWord}".`;

  const correctId = uniqueId();
  const options = shuffle(
    [correctWord, ...distractorWords].map((v, i) => ({
      id: i === 0 ? correctId : uniqueId(),
      label: v,
    })),
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.VERBAL_REASONING,
    topic: VerbalReasoningTopic.SHUFFLED_SENTENCES,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt,
    options,
    correctAnswer: correctId,
    explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'shuffled-sentences',
    generatorSeed: seed,
    tags: ['verbal', 'shuffled-sentences'],
  };
}
