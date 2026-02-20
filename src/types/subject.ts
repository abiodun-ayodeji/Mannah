export enum Subject {
  MATHS = 'maths',
  ENGLISH = 'english',
  VERBAL_REASONING = 'verbal_reasoning',
  NON_VERBAL_REASONING = 'non_verbal_reasoning',
}

export enum MathsTopic {
  ARITHMETIC = 'arithmetic',
  FRACTIONS = 'fractions',
  DECIMALS = 'decimals',
  PERCENTAGES = 'percentages',
  ALGEBRA = 'algebra',
  RATIOS = 'ratios',
  GEOMETRY = 'geometry',
  MEASUREMENT = 'measurement',
  DATA_HANDLING = 'data_handling',
  WORD_PROBLEMS = 'word_problems',
  TIME = 'time',
  MONEY = 'money',
}

export enum VerbalReasoningTopic {
  SYNONYMS = 'synonyms',
  ANTONYMS = 'antonyms',
  ANTONYM_PAIRS = 'antonym_pairs',
  ANALOGIES = 'analogies',
  WORD_LETTER_CODES = 'word_letter_codes',
  NUMBER_LETTER_CODES = 'number_letter_codes',
  LETTER_SERIES = 'letter_series',
  NUMBER_SERIES = 'number_series',
  COMPOUND_WORDS = 'compound_words',
  HIDDEN_WORDS = 'hidden_words',
  MOVE_A_LETTER = 'move_a_letter',
  WORD_CONNECTIONS = 'word_connections',
  ODD_ONE_OUT = 'odd_one_out',
  CLOSEST_MEANING = 'closest_meaning',
  SENTENCE_COMPLETION = 'sentence_completion',
  SHUFFLED_SENTENCES = 'shuffled_sentences',
  MISSING_LETTERS = 'missing_letters',
  RELATED_WORDS = 'related_words',
  CREATE_A_WORD = 'create_a_word',
}

export enum NonVerbalTopic {
  ODD_ONE_OUT = 'nvr_odd_one_out',
  ANALOGIES = 'nvr_analogies',
  SERIES = 'nvr_series',
  MATRICES = 'nvr_matrices',
  ROTATION = 'rotation',
  REFLECTION = 'reflection',
  FOLDING_PAPER = 'folding_paper',
  GROUPING = 'grouping',
}

export enum EnglishTopic {
  VOCABULARY = 'vocabulary',
  SPELLING = 'spelling',
  PUNCTUATION = 'punctuation',
  GRAMMAR = 'grammar',
  CLOZE = 'cloze',
  SENTENCE_COMPLETION = 'eng_sentence_completion',
}

export type Topic = MathsTopic | VerbalReasoningTopic | NonVerbalTopic | EnglishTopic;

export const SUBJECT_CONFIG: Record<Subject, { label: string; color: string; icon: string; topics: readonly Topic[] }> = {
  [Subject.MATHS]: {
    label: 'Maths',
    color: 'var(--color-maths)',
    icon: '🔢',
    topics: Object.values(MathsTopic),
  },
  [Subject.ENGLISH]: {
    label: 'English',
    color: 'var(--color-english)',
    icon: '📚',
    topics: Object.values(EnglishTopic),
  },
  [Subject.VERBAL_REASONING]: {
    label: 'Verbal Reasoning',
    color: 'var(--color-verbal)',
    icon: '🧩',
    topics: Object.values(VerbalReasoningTopic),
  },
  [Subject.NON_VERBAL_REASONING]: {
    label: 'Non-Verbal Reasoning',
    color: 'var(--color-nonverbal)',
    icon: '🔷',
    topics: Object.values(NonVerbalTopic),
  },
};

export const TOPIC_LABELS: Record<Topic, string> = {
  // Maths
  [MathsTopic.ARITHMETIC]: 'Arithmetic',
  [MathsTopic.FRACTIONS]: 'Fractions',
  [MathsTopic.DECIMALS]: 'Decimals',
  [MathsTopic.PERCENTAGES]: 'Percentages',
  [MathsTopic.ALGEBRA]: 'Algebra',
  [MathsTopic.RATIOS]: 'Ratios',
  [MathsTopic.GEOMETRY]: 'Geometry',
  [MathsTopic.MEASUREMENT]: 'Measurement',
  [MathsTopic.DATA_HANDLING]: 'Data Handling',
  [MathsTopic.WORD_PROBLEMS]: 'Word Problems',
  [MathsTopic.TIME]: 'Time',
  [MathsTopic.MONEY]: 'Money',
  // Verbal Reasoning
  [VerbalReasoningTopic.SYNONYMS]: 'Synonyms',
  [VerbalReasoningTopic.ANTONYMS]: 'Antonyms',
  [VerbalReasoningTopic.ANTONYM_PAIRS]: 'Antonym Pairs',
  [VerbalReasoningTopic.ANALOGIES]: 'Analogies',
  [VerbalReasoningTopic.WORD_LETTER_CODES]: 'Word-Letter Codes',
  [VerbalReasoningTopic.NUMBER_LETTER_CODES]: 'Number-Letter Codes',
  [VerbalReasoningTopic.LETTER_SERIES]: 'Letter Series',
  [VerbalReasoningTopic.NUMBER_SERIES]: 'Number Series',
  [VerbalReasoningTopic.COMPOUND_WORDS]: 'Compound Words',
  [VerbalReasoningTopic.HIDDEN_WORDS]: 'Hidden Words',
  [VerbalReasoningTopic.MOVE_A_LETTER]: 'Move a Letter',
  [VerbalReasoningTopic.WORD_CONNECTIONS]: 'Word Connections',
  [VerbalReasoningTopic.ODD_ONE_OUT]: 'Odd One Out',
  [VerbalReasoningTopic.CLOSEST_MEANING]: 'Closest Meaning',
  [VerbalReasoningTopic.SENTENCE_COMPLETION]: 'Sentence Completion',
  [VerbalReasoningTopic.SHUFFLED_SENTENCES]: 'Shuffled Sentences',
  [VerbalReasoningTopic.MISSING_LETTERS]: 'Missing Letters',
  [VerbalReasoningTopic.RELATED_WORDS]: 'Related Words',
  [VerbalReasoningTopic.CREATE_A_WORD]: 'Create a Word',
  // Non-Verbal
  [NonVerbalTopic.ODD_ONE_OUT]: 'Odd One Out',
  [NonVerbalTopic.ANALOGIES]: 'Analogies',
  [NonVerbalTopic.SERIES]: 'Series',
  [NonVerbalTopic.MATRICES]: 'Matrices',
  [NonVerbalTopic.ROTATION]: 'Rotation',
  [NonVerbalTopic.REFLECTION]: 'Reflection',
  [NonVerbalTopic.FOLDING_PAPER]: 'Folding Paper',
  [NonVerbalTopic.GROUPING]: 'Grouping',
  // English
  [EnglishTopic.VOCABULARY]: 'Vocabulary',
  [EnglishTopic.SPELLING]: 'Spelling',
  [EnglishTopic.PUNCTUATION]: 'Punctuation',
  [EnglishTopic.GRAMMAR]: 'Grammar',
  [EnglishTopic.CLOZE]: 'Cloze',
  [EnglishTopic.SENTENCE_COMPLETION]: 'Sentence Completion',
};
