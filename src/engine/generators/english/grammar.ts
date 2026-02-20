import type { Question, Difficulty } from '../../../types/question';
import { Subject, EnglishTopic } from '../../../types/subject';
import { createRng, shuffle, pick, uniqueId } from '../../../utils/random';

interface GrammarTemplate {
  sentence: string;         // sentence with ___ for the blank
  correct: string;          // correct word/phrase
  distractors: string[];    // 3 wrong options
  rule: string;             // explanation
  level: 1 | 2 | 3 | 4 | 5;
}

const TEMPLATES: GrammarTemplate[] = [
  // was / were
  { sentence: 'The children ___ playing in the garden.', correct: 'were', distractors: ['was', 'is', 'are being'], rule: '"Were" is used with plural subjects like "the children".', level: 1 },
  { sentence: 'She ___ very happy to see her friend.', correct: 'was', distractors: ['were', 'is', 'been'], rule: '"Was" is used with singular subjects like "she".', level: 1 },
  { sentence: 'I ___ late for school yesterday.', correct: 'was', distractors: ['were', 'am', 'been'], rule: '"Was" is the past tense of "am" used with "I".', level: 1 },
  { sentence: 'They ___ not allowed to go outside.', correct: 'were', distractors: ['was', 'is', 'has'], rule: '"Were" is used with plural subjects like "they".', level: 1 },

  // their / there / they're
  { sentence: 'The students left ___ bags in the classroom.', correct: 'their', distractors: ["there", "they're", "there's"], rule: '"Their" shows possession (belonging to them).', level: 1 },
  { sentence: "___ going to the cinema after school.", correct: "They're", distractors: ['Their', 'There', "There's"], rule: '"They\'re" is short for "they are".', level: 1 },
  { sentence: 'The park is over ___ by the river.', correct: 'there', distractors: ['their', "they're", 'here'], rule: '"There" refers to a place.', level: 1 },
  { sentence: "I think ___ the best team in the league.", correct: "they're", distractors: ['their', 'there', "there's"], rule: '"They\'re" is short for "they are".', level: 2 },

  // its / it's
  { sentence: "___ raining outside so bring an umbrella.", correct: "It's", distractors: ['Its', 'Its been', "It"], rule: '"It\'s" is short for "it is".', level: 1 },
  { sentence: 'The dog wagged ___ tail excitedly.', correct: 'its', distractors: ["it's", "its'", 'the'], rule: '"Its" (no apostrophe) shows possession.', level: 1 },
  { sentence: "___ been a very long day at school.", correct: "It's", distractors: ['Its', 'It', "Its'"], rule: '"It\'s" is short for "it has" in this context.', level: 2 },

  // to / too / two
  { sentence: 'She wanted ___ go to the park.', correct: 'to', distractors: ['too', 'two', 'tow'], rule: '"To" is used before a verb to form the infinitive.', level: 1 },
  { sentence: 'The soup was ___ hot to eat.', correct: 'too', distractors: ['to', 'two', 'tow'], rule: '"Too" means "excessively" or "also".', level: 1 },
  { sentence: 'I have ___ brothers and one sister.', correct: 'two', distractors: ['to', 'too', 'tow'], rule: '"Two" is the number 2.', level: 1 },

  // your / you're
  { sentence: "___ going to love this film!", correct: "You're", distractors: ['Your', "Your're", 'Youre'], rule: '"You\'re" is short for "you are".', level: 1 },
  { sentence: 'Is that ___ pencil on the floor?', correct: 'your', distractors: ["you're", "your'e", 'youre'], rule: '"Your" shows possession.', level: 1 },

  // who / whom / whose / which / that
  { sentence: '___ book is this on the table?', correct: 'Whose', distractors: ["Who's", 'Which', 'Whom'], rule: '"Whose" asks about possession.', level: 2 },
  { sentence: 'The teacher ___ taught us last year has retired.', correct: 'who', distractors: ['whom', 'which', 'what'], rule: '"Who" is used for the subject of a clause referring to people.', level: 2 },
  { sentence: 'The car, ___ was parked outside, belongs to Mr Jones.', correct: 'which', distractors: ['who', 'whom', 'what'], rule: '"Which" is used for things, not people.', level: 2 },

  // affect / effect
  { sentence: 'The weather will ___ our plans for the picnic.', correct: 'affect', distractors: ['effect', 'effected', 'affection'], rule: '"Affect" is usually a verb meaning to influence.', level: 3 },
  { sentence: 'The ___ of the new rule was immediate.', correct: 'effect', distractors: ['affect', 'affective', 'effecting'], rule: '"Effect" is usually a noun meaning the result.', level: 3 },

  // lay / lie
  { sentence: 'Please ___ the books on the table.', correct: 'lay', distractors: ['lie', 'lied', 'laid'], rule: '"Lay" means to put something down and requires an object.', level: 3 },
  { sentence: 'I need to ___ down for a rest.', correct: 'lie', distractors: ['lay', 'laid', 'layed'], rule: '"Lie" means to recline and does not take an object.', level: 3 },

  // subject-verb agreement
  { sentence: 'Each of the students ___ a different answer.', correct: 'has', distractors: ['have', 'are having', 'were having'], rule: '"Each" is singular and takes a singular verb.', level: 2 },
  { sentence: 'Neither the teacher nor the pupils ___ ready.', correct: 'were', distractors: ['was', 'is', 'has been'], rule: 'With "neither...nor", the verb agrees with the nearer subject ("pupils").', level: 3 },
  { sentence: 'The team ___ won every match this season.', correct: 'has', distractors: ['have', 'are', 'were'], rule: '"Team" is a collective noun treated as singular.', level: 2 },
  { sentence: 'Every one of the cakes ___ been eaten.', correct: 'has', distractors: ['have', 'were', 'are'], rule: '"Every one" is singular and takes "has".', level: 3 },

  // tense consistency
  { sentence: 'Yesterday she ___ to the shop and bought some milk.', correct: 'went', distractors: ['goes', 'go', 'going'], rule: 'Past tense is needed to match "yesterday" and "bought".', level: 2 },
  { sentence: 'By the time we arrived, the film ___ already started.', correct: 'had', distractors: ['has', 'have', 'was'], rule: 'Past perfect "had" is used for an action before another past action.', level: 3 },
  { sentence: 'If I ___ taller, I would play basketball.', correct: 'were', distractors: ['was', 'am', 'be'], rule: 'The subjunctive "were" is used in hypothetical "if" clauses.', level: 4 },

  // comparative / superlative
  { sentence: 'She is the ___ runner in the whole school.', correct: 'fastest', distractors: ['faster', 'more fast', 'most fast'], rule: 'Superlative "fastest" is used when comparing more than two.', level: 2 },
  { sentence: 'This book is ___ interesting than the last one.', correct: 'more', distractors: ['most', 'much', 'many'], rule: '"More" is used for comparatives of longer adjectives.', level: 2 },
  { sentence: 'Of all the children, Amina is the ___ talented.', correct: 'most', distractors: ['more', 'much', 'many'], rule: '"Most" is the superlative form when comparing three or more.', level: 2 },

  // apostrophes for possession
  { sentence: "The ___ toys were scattered across the floor.", correct: "children's", distractors: ["childrens'", 'childrens', "children"], rule: 'Irregular plurals add \'s for possession: "children\'s".', level: 3 },
  { sentence: "The ___ coats are hanging by the door.", correct: "girls'", distractors: ["girl's", "girls's", 'girls'], rule: 'Plural nouns ending in "s" add just an apostrophe.', level: 3 },

  // conjunctions
  { sentence: 'I wanted to go outside, ___ it was raining heavily.', correct: 'but', distractors: ['and', 'so', 'because'], rule: '"But" introduces a contrast.', level: 1 },
  { sentence: 'She studied hard ___ she wanted to pass the exam.', correct: 'because', distractors: ['but', 'or', 'yet'], rule: '"Because" gives a reason.', level: 1 },
  { sentence: 'You can have cake ___ ice cream for dessert.', correct: 'or', distractors: ['and', 'but', 'so'], rule: '"Or" presents a choice between alternatives.', level: 1 },

  // prepositions
  { sentence: 'The cat jumped ___ the wall and ran away.', correct: 'over', distractors: ['above', 'on', 'upon'], rule: '"Over" implies movement across the top of something.', level: 2 },
  { sentence: 'We arrived ___ the airport two hours early.', correct: 'at', distractors: ['in', 'on', 'to'], rule: '"At" is used with specific locations like airports.', level: 2 },
  { sentence: 'She has lived in London ___ 2015.', correct: 'since', distractors: ['for', 'from', 'during'], rule: '"Since" is used with a specific point in time.', level: 3 },

  // adverb placement
  { sentence: 'She ___ finishes her homework before dinner.', correct: 'always', distractors: ['never', 'rarely', 'seldom'], rule: 'Frequency adverbs go before the main verb.', level: 2 },

  // pronoun case
  { sentence: 'Between you and ___, I think the test was easy.', correct: 'me', distractors: ['I', 'myself', 'mine'], rule: 'After prepositions like "between", use the object pronoun "me".', level: 3 },
  { sentence: 'My sister and ___ went to the cinema.', correct: 'I', distractors: ['me', 'myself', 'mine'], rule: '"I" is used as a subject (the one doing the action).', level: 2 },
  { sentence: 'The prize was awarded to Sarah and ___.', correct: 'me', distractors: ['I', 'myself', 'mine'], rule: '"Me" is used as an object (receiving the action).', level: 3 },

  // fewer / less
  { sentence: 'There are ___ apples in the basket today.', correct: 'fewer', distractors: ['less', 'lesser', 'least'], rule: '"Fewer" is used with countable nouns.', level: 3 },
  { sentence: 'We have ___ time than we thought.', correct: 'less', distractors: ['fewer', 'lesser', 'least'], rule: '"Less" is used with uncountable nouns like "time".', level: 3 },

  // conditional
  { sentence: 'If it ___ tomorrow, we will cancel the trip.', correct: 'rains', distractors: ['will rain', 'rained', 'raining'], rule: 'In first conditional, use present simple after "if".', level: 3 },
  { sentence: 'If she had studied harder, she ___ passed the test.', correct: 'would have', distractors: ['will have', 'would', 'has'], rule: 'Third conditional uses "would have" + past participle.', level: 4 },

  // passive voice
  { sentence: 'The cake ___ baked by my grandmother.', correct: 'was', distractors: ['were', 'is', 'been'], rule: 'Passive voice uses "was" with a singular subject in the past.', level: 3 },
  { sentence: 'The letters ___ delivered every morning.', correct: 'are', distractors: ['is', 'was', 'been'], rule: 'Present passive with a plural subject uses "are".', level: 3 },

  // advanced subject-verb
  { sentence: 'The number of students ___ increased this year.', correct: 'has', distractors: ['have', 'are', 'were'], rule: '"The number of" is singular and takes "has".', level: 4 },
  { sentence: 'A number of students ___ absent today.', correct: 'are', distractors: ['is', 'has', 'was'], rule: '"A number of" is treated as plural.', level: 4 },

  // relative clauses
  { sentence: 'The house ___ we visited last summer has been sold.', correct: 'that', distractors: ['who', 'whom', 'whose'], rule: '"That" or "which" is used for things.', level: 4 },

  // reported speech
  { sentence: 'She said that she ___ feeling unwell.', correct: 'was', distractors: ['is', 'were', 'been'], rule: 'In reported speech, present tense shifts to past.', level: 4 },
  { sentence: 'He told me he ___ come to the party.', correct: 'would', distractors: ['will', 'shall', 'can'], rule: 'In reported speech, "will" becomes "would".', level: 4 },

  // modal verbs
  { sentence: 'You ___ to finish your homework before playing.', correct: 'ought', distractors: ['should', 'must', 'have'], rule: '"Ought to" expresses moral obligation or expectation.', level: 4 },
  { sentence: 'We ___ leave now or we will miss the bus.', correct: 'must', distractors: ['should', 'could', 'might'], rule: '"Must" expresses strong necessity.', level: 3 },

  // complex sentences
  { sentence: '___ the weather was terrible, they still enjoyed the holiday.', correct: 'Although', distractors: ['Because', 'Since', 'While'], rule: '"Although" introduces a concession (despite the fact that).', level: 4 },
  { sentence: 'She practised every day ___ she could perform confidently.', correct: 'so that', distractors: ['because', 'although', 'unless'], rule: '"So that" expresses purpose.', level: 5 },
  { sentence: '___ you apologise, I will not forgive you.', correct: 'Unless', distractors: ['If', 'Although', 'Because'], rule: '"Unless" means "if not".', level: 5 },
  { sentence: 'Not only ___ she clever, but she was also kind.', correct: 'was', distractors: ['is', 'were', 'had'], rule: '"Not only...but also" requires inverted word order with past tense.', level: 5 },
];

export function generateGrammar(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const eligible = TEMPLATES.filter(
    (t) => t.level >= Math.max(1, difficulty - 1) && t.level <= Math.min(5, difficulty + 1)
  );
  const template = pick(eligible, rng);

  const correctId = uniqueId();
  const options = shuffle(
    [
      { id: correctId, label: template.correct },
      ...template.distractors.map((d) => ({ id: uniqueId(), label: d })),
    ],
    rng
  );

  return {
    id: uniqueId(),
    subject: Subject.ENGLISH,
    topic: EnglishTopic.GRAMMAR,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: `Choose the correct word to complete the sentence:\n\n"${template.sentence}"`,
    options,
    correctAnswer: correctId,
    explanation: template.rule,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'grammar',
    generatorSeed: seed,
    tags: ['english', 'grammar'],
  };
}
