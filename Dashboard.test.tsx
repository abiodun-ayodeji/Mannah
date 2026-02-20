import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';

jest.mock('./src/engine/generators/english/grammar', () => ({
  generateGrammar: () => ({
    id: 'test-question-1',
    prompt: 'Choose the correct word to complete the sentence:\n\nTest Sentence.',
    options: [
      { id: 'opt-1', label: 'Option A' },
      { id: 'opt-2', label: 'Option B' },
    ],
    correctAnswer: 'opt-1',
    explanation: 'Explanation for Option A.',
    difficulty: 1,
  }),
}));

jest.mock('./src/hooks/useSound', () => ({
  useSound: () => ({
    play: jest.fn(),
  }),
}));

describe('Dashboard Integration', () => {
  test('renders the redesigned layout correctly', () => {
    render(<Dashboard />);

    expect(screen.getByText(/Hero/i)).toBeInTheDocument();
    expect(screen.getByText(/Knowledge Realm/i)).toBeInTheDocument();
    expect(screen.getByText(/Ignite 10 Questions/i)).toBeInTheDocument();
  });

  test('launches quiz modal on Quick Play click', () => {
    render(<Dashboard />);

    fireEvent.click(screen.getByText(/Ignite 10 Questions/i));

    expect(screen.getByText('Test Sentence.')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  test('handles answer selection and feedback', () => {
    render(<Dashboard />);

    fireEvent.click(screen.getByText(/Ignite 10 Questions/i));
    fireEvent.click(screen.getByText('Option A'));

    expect(screen.getByText(/Correct! Explanation for Option A./i)).toBeInTheDocument();
    expect(screen.getByText(/Next Question/i)).toBeInTheDocument();
  });

  test('launches quiz from Hero CTA button', () => {
    render(<Dashboard />);

    fireEvent.click(screen.getByText(/Continue Daily Quest/i));

    expect(screen.getByText('Test Sentence.')).toBeInTheDocument();
  });
});
