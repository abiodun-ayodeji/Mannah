import type { Question, Difficulty } from '../../../types/question';
import { Subject, EnglishTopic } from '../../../types/subject';
import { createRng, shuffle, pick, uniqueId } from '../../../utils/random';

interface VocabEntry {
  word: string;
  definition: string;
  distractors: string[];
  level: 1 | 2 | 3 | 4 | 5;
}

const VOCAB_BANK: VocabEntry[] = [
  // Level 1 - common words a 10-year-old should know
  { word: 'enormous', definition: 'Extremely large in size', distractors: ['Extremely small', 'Quite ordinary', 'Very quick'], level: 1 },
  { word: 'famished', definition: 'Extremely hungry', distractors: ['Very tired', 'Extremely cold', 'Quite angry'], level: 1 },
  { word: 'timid', definition: 'Shy and lacking in courage', distractors: ['Brave and bold', 'Loud and noisy', 'Tall and strong'], level: 1 },
  { word: 'ancient', definition: 'Very old, from a long time ago', distractors: ['Brand new', 'Slightly damaged', 'Very expensive'], level: 1 },
  { word: 'delighted', definition: 'Very pleased and happy', distractors: ['Extremely angry', 'Very confused', 'Quite frightened'], level: 1 },
  { word: 'weary', definition: 'Very tired or exhausted', distractors: ['Full of energy', 'Extremely hungry', 'Very excited'], level: 1 },
  { word: 'furious', definition: 'Extremely angry', distractors: ['Very happy', 'Slightly sad', 'Quite calm'], level: 1 },
  { word: 'peculiar', definition: 'Strange or unusual', distractors: ['Very normal', 'Extremely beautiful', 'Quite simple'], level: 1 },
  { word: 'courageous', definition: 'Brave and not afraid of danger', distractors: ['Frightened and timid', 'Lazy and slow', 'Angry and loud'], level: 1 },
  { word: 'dreadful', definition: 'Extremely bad or unpleasant', distractors: ['Wonderful and perfect', 'Average and normal', 'Slightly disappointing'], level: 1 },
  { word: 'feeble', definition: 'Weak and without strength', distractors: ['Strong and powerful', 'Fast and nimble', 'Loud and bold'], level: 1 },
  { word: 'plead', definition: 'To beg or ask someone earnestly', distractors: ['To shout loudly', 'To run quickly', 'To sing softly'], level: 1 },
  { word: 'cunning', definition: 'Clever at achieving things by deceit', distractors: ['Honest and open', 'Slow and foolish', 'Kind and generous'], level: 1 },
  { word: 'vast', definition: 'Extremely large in area or amount', distractors: ['Very tiny', 'Quite narrow', 'Slightly tall'], level: 1 },
  { word: 'swift', definition: 'Moving very quickly', distractors: ['Extremely slow', 'Very heavy', 'Quite gentle'], level: 1 },
  { word: 'astonished', definition: 'Greatly surprised or amazed', distractors: ['Completely bored', 'Very tired', 'Slightly annoyed'], level: 1 },

  // Level 2
  { word: 'reluctant', definition: 'Unwilling to do something', distractors: ['Eager to begin', 'Able to complete', 'Happy to help'], level: 2 },
  { word: 'abundant', definition: 'Existing in very large quantities', distractors: ['Extremely rare', 'Slightly less', 'Barely enough'], level: 2 },
  { word: 'conceal', definition: 'To hide something from view', distractors: ['To reveal openly', 'To break apart', 'To move quickly'], level: 2 },
  { word: 'desolate', definition: 'Empty, bare, and without life', distractors: ['Crowded and busy', 'Warm and comfortable', 'Green and lush'], level: 2 },
  { word: 'fragile', definition: 'Easily broken or damaged', distractors: ['Strong and tough', 'Heavy and solid', 'Flexible and soft'], level: 2 },
  { word: 'humble', definition: 'Having a modest view of one\'s importance', distractors: ['Proud and boastful', 'Angry and bitter', 'Rich and famous'], level: 2 },
  { word: 'nimble', definition: 'Quick and light in movement', distractors: ['Slow and clumsy', 'Heavy and stiff', 'Tall and wide'], level: 2 },
  { word: 'peril', definition: 'Serious and immediate danger', distractors: ['Complete safety', 'Great comfort', 'Mild annoyance'], level: 2 },
  { word: 'triumph', definition: 'A great victory or achievement', distractors: ['A terrible defeat', 'A small mistake', 'A minor setback'], level: 2 },
  { word: 'vanish', definition: 'To disappear suddenly', distractors: ['To appear suddenly', 'To grow larger', 'To become louder'], level: 2 },
  { word: 'gloomy', definition: 'Dark and depressing', distractors: ['Bright and cheerful', 'Warm and cosy', 'Clear and calm'], level: 2 },
  { word: 'stubborn', definition: 'Refusing to change one\'s mind', distractors: ['Easy to persuade', 'Quick to agree', 'Willing to listen'], level: 2 },
  { word: 'flourish', definition: 'To grow or develop well', distractors: ['To wither and die', 'To stay the same', 'To become smaller'], level: 2 },
  { word: 'scarce', definition: 'Not enough; in short supply', distractors: ['Available in plenty', 'Very common', 'Easy to find'], level: 2 },
  { word: 'absurd', definition: 'Completely ridiculous or unreasonable', distractors: ['Perfectly sensible', 'Slightly unusual', 'Very serious'], level: 2 },
  { word: 'cautious', definition: 'Careful to avoid danger or mistakes', distractors: ['Reckless and careless', 'Loud and excited', 'Fast and hurried'], level: 2 },

  // Level 3
  { word: 'ambiguous', definition: 'Having more than one possible meaning', distractors: ['Very clear and obvious', 'Completely wrong', 'Extremely boring'], level: 3 },
  { word: 'benevolent', definition: 'Kind, generous, and well-meaning', distractors: ['Cruel and unkind', 'Selfish and mean', 'Lazy and careless'], level: 3 },
  { word: 'compel', definition: 'To force someone to do something', distractors: ['To gently suggest', 'To kindly request', 'To freely offer'], level: 3 },
  { word: 'diligent', definition: 'Hardworking and showing careful effort', distractors: ['Lazy and careless', 'Quick but sloppy', 'Bored and distracted'], level: 3 },
  { word: 'eloquent', definition: 'Fluent and persuasive in speaking', distractors: ['Unable to speak clearly', 'Very quiet and shy', 'Confused and rambling'], level: 3 },
  { word: 'futile', definition: 'Pointless and having no chance of success', distractors: ['Very useful and effective', 'Full of hope', 'Certain to succeed'], level: 3 },
  { word: 'hinder', definition: 'To make it difficult for something to happen', distractors: ['To help something along', 'To speed up greatly', 'To make much easier'], level: 3 },
  { word: 'impartial', definition: 'Treating all sides equally; unbiased', distractors: ['Favouring one side', 'Completely unfair', 'Very opinionated'], level: 3 },
  { word: 'jubilant', definition: 'Feeling or showing great happiness', distractors: ['Extremely miserable', 'Very frightened', 'Quite anxious'], level: 3 },
  { word: 'lament', definition: 'To express sadness or grief', distractors: ['To celebrate joyfully', 'To shout in anger', 'To laugh loudly'], level: 3 },
  { word: 'meticulous', definition: 'Showing great attention to detail', distractors: ['Careless and sloppy', 'Quick and impatient', 'Lazy and forgetful'], level: 3 },
  { word: 'notorious', definition: 'Famous for something bad', distractors: ['Famous for something good', 'Unknown to everyone', 'Slightly well-known'], level: 3 },
  { word: 'ominous', definition: 'Giving the impression that something bad will happen', distractors: ['Cheerful and bright', 'Peaceful and calm', 'Hopeful and promising'], level: 3 },
  { word: 'persevere', definition: 'To continue trying despite difficulties', distractors: ['To give up easily', 'To start something new', 'To ask for help'], level: 3 },
  { word: 'remorse', definition: 'Deep regret or guilt', distractors: ['Great pride and joy', 'Complete indifference', 'Strong anger'], level: 3 },
  { word: 'serene', definition: 'Calm, peaceful, and untroubled', distractors: ['Wild and chaotic', 'Loud and busy', 'Angry and upset'], level: 3 },

  // Level 4
  { word: 'adversity', definition: 'A difficult or unpleasant situation', distractors: ['Good fortune and luck', 'A simple task', 'A joyful celebration'], level: 4 },
  { word: 'brevity', definition: 'The quality of being brief or concise', distractors: ['Being very long-winded', 'Being extremely detailed', 'Speaking in circles'], level: 4 },
  { word: 'contemplate', definition: 'To think about something deeply', distractors: ['To ignore completely', 'To act without thinking', 'To speak quickly'], level: 4 },
  { word: 'diminish', definition: 'To make or become less or smaller', distractors: ['To increase greatly', 'To stay the same', 'To multiply rapidly'], level: 4 },
  { word: 'elaborate', definition: 'Detailed and carefully arranged', distractors: ['Simple and plain', 'Small and compact', 'Rough and unfinished'], level: 4 },
  { word: 'formidable', definition: 'Inspiring fear or respect through being powerful', distractors: ['Weak and unimpressive', 'Tiny and harmless', 'Simple and easy'], level: 4 },
  { word: 'gregarious', definition: 'Fond of company; sociable', distractors: ['Preferring to be alone', 'Shy and withdrawn', 'Quiet and reserved'], level: 4 },
  { word: 'hypothesis', definition: 'A proposed explanation to be tested', distractors: ['A proven scientific law', 'A well-known fact', 'A final conclusion'], level: 4 },
  { word: 'inevitable', definition: 'Certain to happen; unavoidable', distractors: ['Very unlikely to occur', 'Easy to prevent', 'Completely impossible'], level: 4 },
  { word: 'jurisdiction', definition: 'The official power to make legal decisions', distractors: ['A lack of authority', 'A type of punishment', 'A legal document'], level: 4 },
  { word: 'kindle', definition: 'To light a fire or arouse a feeling', distractors: ['To put out a flame', 'To cool something down', 'To destroy completely'], level: 4 },
  { word: 'lucid', definition: 'Clear and easy to understand', distractors: ['Confusing and unclear', 'Dark and mysterious', 'Dull and boring'], level: 4 },
  { word: 'mundane', definition: 'Lacking interest or excitement; dull', distractors: ['Extremely exciting', 'Very unusual', 'Deeply mysterious'], level: 4 },
  { word: 'nostalgia', definition: 'A feeling of longing for the past', distractors: ['Excitement about the future', 'Fear of the unknown', 'Anger at the present'], level: 4 },
  { word: 'oblivious', definition: 'Unaware of what is happening around you', distractors: ['Very alert and aware', 'Extremely observant', 'Deeply focused'], level: 4 },
  { word: 'plausible', definition: 'Seeming reasonable or probable', distractors: ['Completely impossible', 'Obviously wrong', 'Clearly made up'], level: 4 },

  // Level 5
  { word: 'altruistic', definition: 'Showing unselfish concern for others', distractors: ['Completely selfish', 'Seeking personal gain', 'Caring only for oneself'], level: 5 },
  { word: 'cacophony', definition: 'A harsh mixture of unpleasant sounds', distractors: ['A beautiful melody', 'Complete silence', 'A gentle whisper'], level: 5 },
  { word: 'debilitate', definition: 'To make someone very weak', distractors: ['To make much stronger', 'To encourage greatly', 'To heal completely'], level: 5 },
  { word: 'ephemeral', definition: 'Lasting for only a very short time', distractors: ['Lasting forever', 'Extremely strong', 'Very important'], level: 5 },
  { word: 'facetious', definition: 'Treating serious issues with humour', distractors: ['Very serious and solemn', 'Extremely angry', 'Deeply respectful'], level: 5 },
  { word: 'gratuitous', definition: 'Done without good reason; unnecessary', distractors: ['Absolutely essential', 'Very well deserved', 'Carefully planned'], level: 5 },
  { word: 'idiosyncratic', definition: 'Having unusual habits or behaviour', distractors: ['Perfectly normal', 'Extremely common', 'Very predictable'], level: 5 },
  { word: 'juxtapose', definition: 'To place close together for comparison', distractors: ['To separate widely', 'To hide from view', 'To destroy completely'], level: 5 },
  { word: 'magnanimous', definition: 'Very generous or forgiving', distractors: ['Petty and mean', 'Selfish and greedy', 'Angry and bitter'], level: 5 },
  { word: 'nonchalant', definition: 'Calm and relaxed; not showing anxiety', distractors: ['Extremely worried', 'Very nervous', 'Highly agitated'], level: 5 },
  { word: 'ostentatious', definition: 'Designed to impress; showy', distractors: ['Simple and modest', 'Hidden and private', 'Quiet and understated'], level: 5 },
  { word: 'pragmatic', definition: 'Dealing with things in a practical way', distractors: ['Completely unrealistic', 'Very emotional', 'Purely theoretical'], level: 5 },
  { word: 'quintessential', definition: 'Representing the most perfect example', distractors: ['The worst example of', 'An unusual version of', 'A poor imitation of'], level: 5 },
  { word: 'reticent', definition: 'Not revealing one\'s thoughts readily', distractors: ['Very talkative', 'Loud and outgoing', 'Open and expressive'], level: 5 },
  { word: 'sycophant', definition: 'A person who flatters to gain advantage', distractors: ['An honest critic', 'A brave leader', 'A true friend'], level: 5 },
  { word: 'ubiquitous', definition: 'Found everywhere; very common', distractors: ['Extremely rare', 'Hard to find', 'Seen only once'], level: 5 },
];

export function generateVocabulary(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const eligible = VOCAB_BANK.filter(
    (v) => v.level >= Math.max(1, difficulty - 1) && v.level <= Math.min(5, difficulty + 1)
  );
  const entry = pick(eligible, rng);

  const correctId = uniqueId();
  const options = shuffle(
    [
      { id: correctId, label: entry.definition },
      ...entry.distractors.map((d) => ({ id: uniqueId(), label: d })),
    ],
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.ENGLISH,
    topic: EnglishTopic.VOCABULARY,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `What does the word "${entry.word}" mean?`,
    options,
    correctAnswer: correctId,
    explanation: `"${entry.word}" means: ${entry.definition.toLowerCase()}.`,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'vocabulary',
    generatorSeed: seed,
    tags: ['english', 'vocabulary'],
  };
}
