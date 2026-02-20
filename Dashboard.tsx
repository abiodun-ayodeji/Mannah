import React, { useState } from 'react';
import './Dashboard.css';
import { generateGrammar } from './src/engine/generators/english/grammar';
import { useSound } from './src/hooks/useSound';
import type { Difficulty, Question, QuestionOption } from './src/types/question';

interface GrammarQuestion extends Question {
  options: QuestionOption[];
  correctAnswer: string;
}

const PROMPT_PREFIX = 'Choose the correct word to complete the sentence:\n\n';

function toGrammarQuestion(question: Question): GrammarQuestion | null {
  if (!question.options || typeof question.correctAnswer !== 'string') {
    return null;
  }
  return question as GrammarQuestion;
}

export const Dashboard: React.FC = () => {
  const [activeQuestion, setActiveQuestion] = useState<GrammarQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { play } = useSound();

  const handleIgnite = () => {
    const seed = Date.now();
    const generated = toGrammarQuestion(generateGrammar(seed, 1 as Difficulty));
    if (!generated) return;

    setActiveQuestion(generated);
    setSelectedOption(null);
    setFeedback(null);
  };

  const handleOptionClick = (optionId: string) => {
    if (!activeQuestion || feedback) return;

    setSelectedOption(optionId);
    const isCorrect = optionId === activeQuestion.correctAnswer;

    play(isCorrect ? 'correct' : 'wrong');
    setFeedback(
      isCorrect
        ? `Correct! ${activeQuestion.explanation}`
        : `Not quite. ${activeQuestion.explanation}`,
    );
  };

  const promptText = activeQuestion
    ? activeQuestion.prompt
        .replace(PROMPT_PREFIX, '')
        .replace(/^"|"$/g, '')
    : '';

  return (
    <div className="aurora-stage">
      <main className="phone-shell">
        <div className="dashboard-screen">
          <header className="top-chrome glass-panel">
            <div className="profile-pill">
              <div className="avatar" aria-hidden="true">A</div>
              <div className="stat-pill">🔥 12 Day</div>
              <div className="stat-pill">🪙 142 XP</div>
            </div>
          </header>

          <section className="hero-card glass-panel">
            <div className="hero-copy">
              <h1>Hero</h1>
              <p>
                Welcome back, Apprentice.
                <br />
                Your journey continues.
              </p>
              <button className="primary-cta" onClick={handleIgnite}>
                Continue Daily Quest
              </button>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <span className="spark spark-a" />
              <span className="spark spark-b" />
              <span className="spark spark-c" />
              <span className="book-glow" />
            </div>
          </section>

          <div className="action-row">
            <button className="action-pill">⚔ Boss Battles</button>
            <button className="action-pill">🏆 Achievements</button>
          </div>

          <button className="quick-play" onClick={handleIgnite}>
            Quick Play · Ignite 10 Questions
          </button>

          <section className="realms-section">
            <h2>Knowledge Realm</h2>
            <div className="realms-grid">
              <article className="realm-card realm-maths glass-panel">
                <h3>Maths</h3>
                <div className="orb-field" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <p>4/12 Topics</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '34%' }} />
                </div>
              </article>

              <article className="realm-card realm-english glass-panel">
                <h3>English</h3>
                <div className="tree-glow" aria-hidden="true" />
                <p>Mastery 82%</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '82%' }} />
                </div>
              </article>
            </div>
          </section>

          <button className="insight-card glass-panel">
            <span>AI Insight</span>
            <span aria-hidden="true">›</span>
          </button>

          <nav className="bottom-dock glass-panel" aria-label="Primary">
            <button className="dock-item active">⌂</button>
            <button className="dock-item">👥</button>
            <button className="dock-item">💬</button>
            <button className="dock-item">🗓</button>
            <button className="dock-item">🔔</button>
            <button className="dock-item">⚙</button>
          </nav>
        </div>
      </main>

      {activeQuestion && (
        <div className="modal-backdrop" onClick={() => !feedback && setActiveQuestion(null)}>
          <div className="question-modal" onClick={(event) => event.stopPropagation()}>
            <div className="question-title">Spark Question</div>
            <p className="question-text">{promptText}</p>

            <div className="options-grid">
              {activeQuestion.options.map((option) => {
                let className = 'option-button';
                if (selectedOption === option.id) {
                  className += option.id === activeQuestion.correctAnswer ? ' correct' : ' incorrect';
                } else if (feedback && option.id === activeQuestion.correctAnswer) {
                  className += ' correct';
                }

                return (
                  <button
                    key={option.id}
                    className={className}
                    onClick={() => handleOptionClick(option.id)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className="feedback-area">
                {feedback}
                <div className="feedback-actions">
                  <button className="primary-cta" onClick={handleIgnite}>Next Question</button>
                  <button className="ghost-cta" onClick={() => setActiveQuestion(null)}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
