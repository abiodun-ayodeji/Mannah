import { describe, it, expect } from 'vitest';
import { GENERATORS, generateQuestion, generateQuizQuestions, getAvailableTopics } from './question-engine';
import { Subject, MathsTopic, VerbalReasoningTopic, NonVerbalTopic, EnglishTopic } from '../types/subject';
import type { Topic } from '../types/subject';
import type { Difficulty } from '../types/question';

describe('GENERATORS registry', () => {
  const allTopics: Topic[] = [
    ...Object.values(MathsTopic),
    ...Object.values(VerbalReasoningTopic),
    ...Object.values(NonVerbalTopic),
    ...Object.values(EnglishTopic),
  ];

  it('has a generator for every topic', () => {
    for (const topic of allTopics) {
      expect(GENERATORS[topic], `Missing generator for topic: ${topic}`).toBeDefined();
      expect(typeof GENERATORS[topic]).toBe('function');
    }
  });

  it('total generator count matches total topic count', () => {
    expect(Object.keys(GENERATORS)).toHaveLength(allTopics.length);
  });
});

describe('generateQuestion', () => {
  it('returns a valid Question for arithmetic', () => {
    const q = generateQuestion(MathsTopic.ARITHMETIC, 3);
    expect(q.subject).toBe(Subject.MATHS);
    expect(q.topic).toBe(MathsTopic.ARITHMETIC);
    expect(q.difficulty).toBe(3);
    expect(q.prompt).toBeTruthy();
    expect(q.correctAnswer).toBeTruthy();
    expect(q.options).toBeDefined();
    expect(q.options!.length).toBeGreaterThanOrEqual(2);
  });

  it('returns a valid Question for synonyms', () => {
    const q = generateQuestion(VerbalReasoningTopic.SYNONYMS, 2);
    expect(q.subject).toBe(Subject.VERBAL_REASONING);
    expect(q.topic).toBe(VerbalReasoningTopic.SYNONYMS);
  });
});

describe('generateQuizQuestions', () => {
  it('returns the requested number of questions', () => {
    const questions = generateQuizQuestions([MathsTopic.ARITHMETIC, MathsTopic.FRACTIONS], 6, 2);
    expect(questions).toHaveLength(6);
  });

  it('round-robins through topics', () => {
    const topics = [MathsTopic.ARITHMETIC, MathsTopic.FRACTIONS, MathsTopic.DECIMALS];
    const questions = generateQuizQuestions(topics, 6, 2);
    // Questions at index 0, 3 should be arithmetic
    expect(questions[0].topic).toBe(MathsTopic.ARITHMETIC);
    expect(questions[3].topic).toBe(MathsTopic.ARITHMETIC);
    // Questions at index 1, 4 should be fractions
    expect(questions[1].topic).toBe(MathsTopic.FRACTIONS);
    expect(questions[4].topic).toBe(MathsTopic.FRACTIONS);
  });

  it('sets the correct difficulty on all questions', () => {
    const questions = generateQuizQuestions([MathsTopic.ALGEBRA], 5, 4);
    for (const q of questions) {
      expect(q.difficulty).toBe(4);
    }
  });
});

describe('getAvailableTopics', () => {
  it('returns 12 maths topics', () => {
    expect(getAvailableTopics(Subject.MATHS)).toHaveLength(Object.values(MathsTopic).length);
  });

  it('returns 19 verbal reasoning topics', () => {
    expect(getAvailableTopics(Subject.VERBAL_REASONING)).toHaveLength(Object.values(VerbalReasoningTopic).length);
  });

  it('returns 8 non-verbal reasoning topics', () => {
    expect(getAvailableTopics(Subject.NON_VERBAL_REASONING)).toHaveLength(Object.values(NonVerbalTopic).length);
  });

  it('returns 6 english topics', () => {
    expect(getAvailableTopics(Subject.ENGLISH)).toHaveLength(Object.values(EnglishTopic).length);
  });
});

describe('every generator produces valid questions at all difficulties', () => {
  const allTopics: Topic[] = [
    ...Object.values(MathsTopic),
    ...Object.values(VerbalReasoningTopic),
    ...Object.values(NonVerbalTopic),
    ...Object.values(EnglishTopic),
  ];

  for (const topic of allTopics) {
    for (const difficulty of [1, 3, 5] as Difficulty[]) {
      it(`${topic} at difficulty ${difficulty} produces a valid question`, () => {
        const seed = 12345;
        const q = GENERATORS[topic](seed, difficulty);
        expect(q).toBeDefined();
        expect(q.id).toBeTruthy();
        expect(q.prompt).toBeTruthy();
        expect(q.correctAnswer).toBeTruthy();
        expect(q.difficulty).toBe(difficulty);
        expect(q.explanation).toBeDefined();
      });
    }
  }
});

describe('generator determinism (same seed → same question)', () => {
  const sampleTopics: Topic[] = [
    MathsTopic.ARITHMETIC,
    MathsTopic.FRACTIONS,
    MathsTopic.GEOMETRY,
    VerbalReasoningTopic.LETTER_SERIES,
    VerbalReasoningTopic.SYNONYMS,
    NonVerbalTopic.SERIES,
    EnglishTopic.SPELLING,
  ];

  for (const topic of sampleTopics) {
    it(`${topic} is deterministic`, () => {
      const seed = 99999;
      const q1 = GENERATORS[topic](seed, 3);
      const q2 = GENERATORS[topic](seed, 3);
      expect(q1.prompt).toBe(q2.prompt);
      expect(q1.explanation).toBe(q2.explanation);
      // Options labels should match (IDs use uniqueId which is non-deterministic)
      const labels1 = q1.options?.map((o) => o.label).sort();
      const labels2 = q2.options?.map((o) => o.label).sort();
      expect(labels1).toEqual(labels2);
    });
  }
});
