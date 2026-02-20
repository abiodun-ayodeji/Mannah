import type { Question, Difficulty } from '../../../types/question';
import { Subject, EnglishTopic } from '../../../types/subject';
import { createRng, randomInt, shuffle, pick, uniqueId } from '../../../utils/random';

interface PunctuationTemplate {
  sentence: string;
  correct: string;
  distractors: string[];
  explanation: string;
  level: 1 | 2 | 3 | 4 | 5;
}

const TEMPLATES: PunctuationTemplate[] = [
  // Level 1-2: Capitals, full stops, question marks
  { sentence: 'Which sentence is punctuated correctly?', correct: 'The cat sat on the mat.', distractors: ['the cat sat on the mat.', 'The cat sat on the mat', 'the cat sat on the mat'], explanation: 'A sentence must start with a capital letter and end with a full stop.', level: 1 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'My name is Sarah.', distractors: ['my name is Sarah.', 'My name is sarah.', 'my name is sarah'], explanation: 'Sentences start with a capital letter. Names always have a capital letter. Sentences end with a full stop.', level: 1 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'Where is the library?', distractors: ['Where is the library.', 'where is the library?', 'Where is the library'], explanation: 'Questions must end with a question mark, and sentences start with a capital letter.', level: 1 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'I live in London.', distractors: ['I live in london.', 'i live in London.', 'i live in london.'], explanation: 'Place names like London always have a capital letter. Sentences start with a capital letter.', level: 1 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'She went to the park.', distractors: ['she went to the park.', 'She went to the park', 'she went to the Park.'], explanation: 'Sentences start with a capital letter and end with a full stop.', level: 1 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'What time is it?', distractors: ['What time is it.', 'what time is it?', 'What time is it'], explanation: 'Questions end with a question mark, not a full stop.', level: 2 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'Today is Monday.', distractors: ['Today is monday.', 'today is Monday.', 'today is monday.'], explanation: 'Days of the week always start with a capital letter.', level: 2 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'We visited France in July.', distractors: ['We visited france in July.', 'We visited France in july.', 'we visited france in july.'], explanation: 'Country names and months always have capital letters.', level: 2 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'How old are you?', distractors: ['How old are you.', 'how old are you?', 'how old are you.'], explanation: 'Questions need a question mark and sentences start with a capital letter.', level: 2 },
  { sentence: 'Which sentence is punctuated correctly?', correct: 'Stop! Do not touch that!', distractors: ['Stop. Do not touch that.', 'stop! do not touch that!', 'Stop! do not touch that!'], explanation: 'Exclamation marks show strong feeling. Each new sentence starts with a capital letter.', level: 2 },

  // Level 3: Commas in lists, apostrophes for contractions
  { sentence: 'Which sentence uses commas correctly?', correct: 'I bought apples, bananas, grapes and oranges.', distractors: ['I bought apples bananas grapes and oranges.', 'I bought, apples, bananas, grapes and oranges.', 'I bought apples, bananas, grapes, and, oranges.'], explanation: 'In a list, put commas between items. No comma is needed before "and" in British English.', level: 3 },
  { sentence: 'Which word uses the apostrophe correctly?', correct: "don't", distractors: ["do'nt", "dont'", "don't'"], explanation: "Don't is short for \"do not\". The apostrophe replaces the missing letter 'o'.", level: 3 },
  { sentence: 'Which sentence uses the apostrophe correctly?', correct: "It's raining outside.", distractors: ["Its raining outside.", "Its' raining outside.", "It is' raining outside."], explanation: "It's is short for \"it is\". The apostrophe shows a letter is missing.", level: 3 },
  { sentence: 'Which word is the correct contraction of "I am"?', correct: "I'm", distractors: ["Im", "I'am", "Ia'm"], explanation: "I'm is the contraction of \"I am\". The apostrophe replaces the missing letter 'a'.", level: 3 },
  { sentence: 'Which sentence uses commas correctly?', correct: 'She likes reading, swimming, drawing and singing.', distractors: ['She likes reading swimming drawing and singing.', 'She likes, reading, swimming, drawing and singing.', 'She likes reading, swimming drawing, and singing.'], explanation: 'Use commas to separate items in a list.', level: 3 },
  { sentence: 'Which word is the correct contraction of "they are"?', correct: "they're", distractors: ["their", "there", "they'are"], explanation: "They're is the contraction of \"they are\". The apostrophe replaces the letter 'a'.", level: 3 },
  { sentence: 'Which sentence uses the apostrophe correctly?', correct: "We can't go today.", distractors: ["We cant go today.", "We can't' go today.", "We ca'nt go today."], explanation: "Can't is short for \"cannot\". The apostrophe shows letters are missing.", level: 3 },
  { sentence: 'Which word is the correct contraction of "we have"?', correct: "we've", distractors: ["weve", "we'have", "we'hve"], explanation: "We've is the contraction of \"we have\". The apostrophe replaces the letters 'ha'.", level: 3 },

  // Level 4: Possessive apostrophes, colons, semicolons
  { sentence: 'Which sentence uses the possessive apostrophe correctly?', correct: "The dog's bone was buried.", distractors: ["The dogs bone was buried.", "The dogs' bone was buried.", "The dog' bone was buried."], explanation: "The bone belongs to one dog, so the apostrophe goes before the 's': dog's.", level: 4 },
  { sentence: 'Which sentence uses the possessive apostrophe correctly?', correct: "The children's toys were scattered.", distractors: ["The childrens toys were scattered.", "The childrens' toys were scattered.", "The children' toys were scattered."], explanation: "Children is already plural, so we add 's: children's.", level: 4 },
  { sentence: 'Which sentence uses the possessive apostrophe correctly?', correct: "The girls' changing room was upstairs.", distractors: ["The girl's changing room was upstairs.", "The girls changing room was upstairs.", "The girls's changing room was upstairs."], explanation: "The changing room belongs to multiple girls. The apostrophe goes after the 's' for regular plurals: girls'.", level: 4 },
  { sentence: 'Which sentence uses the colon correctly?', correct: 'You will need: scissors, glue and paper.', distractors: ['You will need, scissors, glue and paper.', 'You will need; scissors, glue and paper.', 'You will need scissors: glue and paper.'], explanation: 'A colon introduces a list that follows a complete sentence.', level: 4 },
  { sentence: 'Which sentence uses the semicolon correctly?', correct: 'It was cold outside; she wore a thick coat.', distractors: ['It was cold outside, she wore a thick coat.', 'It was cold outside: she wore a thick coat.', 'It was cold outside she wore a thick coat.'], explanation: 'A semicolon joins two closely related sentences that could each stand alone.', level: 4 },
  { sentence: "Which sentence uses the possessive apostrophe correctly?", correct: "James's book was on the table.", distractors: ["James' book was on the table.", "Jame's book was on the table.", "James book was on the table."], explanation: "For names ending in 's', add 's to show possession: James's.", level: 4 },
  { sentence: 'Which sentence uses the colon correctly?', correct: 'There are three primary colours: red, blue and yellow.', distractors: ['There are three primary colours, red, blue and yellow.', 'There are: three primary colours red, blue and yellow.', 'There are three primary colours; red, blue and yellow.'], explanation: 'A colon is used to introduce a list after a complete sentence.', level: 4 },

  // Level 5: Direct speech, complex commas, hyphens
  { sentence: 'Which sentence punctuates direct speech correctly?', correct: '"Where are you going?" asked Mum.', distractors: ['Where are you going? asked Mum.', '"Where are you going" asked Mum.', '"Where are you going?" Asked Mum.'], explanation: 'Direct speech goes inside quotation marks. The question mark goes inside the marks. "Asked" is not capitalised because it continues the sentence.', level: 5 },
  { sentence: 'Which sentence punctuates direct speech correctly?', correct: '"I love ice cream," said Tom.', distractors: ['"I love ice cream" said Tom.', '"I love ice cream." said Tom.', '"I love ice cream", said Tom.'], explanation: 'In direct speech, a comma goes inside the closing quotation mark before "said".', level: 5 },
  { sentence: 'Which sentence uses the comma correctly?', correct: 'Although it was raining, we went to the park.', distractors: ['Although it was raining we went to the park.', 'Although, it was raining we went to the park.', 'Although it was, raining we went to the park.'], explanation: 'When a subordinate clause comes first, it is followed by a comma.', level: 5 },
  { sentence: 'Which sentence uses the hyphen correctly?', correct: 'She is a well-known author.', distractors: ['She is a well known author.', 'She is a well - known author.', 'She is a wellknown author.'], explanation: 'Compound adjectives before a noun are hyphenated: well-known.', level: 5 },
  { sentence: 'Which sentence punctuates direct speech correctly?', correct: '"Run!" shouted the teacher. "The bus is leaving!"', distractors: ['"Run!" Shouted the teacher. "The bus is leaving!"', '"Run"! shouted the teacher. "The bus is leaving"!', 'Run! shouted the teacher. The bus is leaving!'], explanation: 'Exclamation marks go inside quotation marks. "Shouted" is not capitalised as it continues the sentence.', level: 5 },
  { sentence: 'Which sentence uses commas correctly?', correct: 'My brother, who is ten years old, plays football.', distractors: ['My brother who is ten years old plays football.', 'My brother, who is ten years old plays football.', 'My brother who is ten years old, plays football.'], explanation: 'A relative clause that adds extra information is enclosed by commas on both sides.', level: 5 },
  { sentence: 'Which sentence uses the hyphen correctly?', correct: 'He ate a chocolate-covered biscuit.', distractors: ['He ate a chocolate covered biscuit.', 'He ate a chocolate - covered biscuit.', 'He ate a chocolatecovered biscuit.'], explanation: 'Compound adjectives before a noun are hyphenated: chocolate-covered.', level: 5 },
  { sentence: 'Which sentence punctuates direct speech correctly?', correct: 'Dad said, "Please tidy your room."', distractors: ['Dad said "Please tidy your room."', 'Dad said, "please tidy your room."', 'Dad said "please tidy your room".'], explanation: 'A comma comes before the opening quotation mark. The first word of direct speech has a capital letter. The full stop goes inside the closing quotation mark.', level: 5 },
];

export function generatePunctuation(seed: number, difficulty: Difficulty): Question {
  const rng = createRng(seed);

  const pool = TEMPLATES.filter((t) => {
    if (difficulty <= 2) return t.level <= 2;
    if (difficulty === 3) return t.level === 3;
    if (difficulty === 4) return t.level === 4;
    return t.level === 5;
  });

  const template = pick(pool, rng);

  const correctId = uniqueId();
  const options = shuffle(
    [template.correct, ...template.distractors].map((v, i) => ({
      id: i === 0 ? correctId : uniqueId(),
      label: v,
    })),
    rng,
  );

  return {
    id: uniqueId(),
    subject: Subject.ENGLISH,
    topic: EnglishTopic.PUNCTUATION,
    difficulty,
    answerFormat: 'multiple_choice',
    prompt: template.sentence,
    options,
    correctAnswer: correctId,
    explanation: template.explanation,
    timeLimit: 30,
    xpReward: 10,
    isGenerated: true,
    generatorId: 'punctuation',
    generatorSeed: seed,
    tags: ['punctuation'],
  };
}
