import React, { useState } from 'react';
import QuizLayout from '../components/QuizLayout';
import './GamifiedAssessment.css';

const GamifiedAssessmentPage = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Sample questions data
  const sampleQuestions = [
    {
      question: 'What is the capital of France?',
      options: [
        { text: 'London', isCorrect: false },
        { text: 'Paris', isCorrect: true },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false }
      ]
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: [
        { text: 'Venus', isCorrect: false },
        { text: 'Mars', isCorrect: true },
        { text: 'Jupiter', isCorrect: false },
        { text: 'Saturn', isCorrect: false }
      ]
    },
    {
      question: 'What is the largest ocean on Earth?',
      options: [
        { text: 'Atlantic Ocean', isCorrect: false },
        { text: 'Indian Ocean', isCorrect: false },
        { text: 'Arctic Ocean', isCorrect: false },
        { text: 'Pacific Ocean', isCorrect: true }
      ]
    },
    {
      question: 'Who wrote "Romeo and Juliet"?',
      options: [
        { text: 'William Shakespeare', isCorrect: true },
        { text: 'Jane Austen', isCorrect: false },
        { text: 'Charles Dickens', isCorrect: false },
        { text: 'Mark Twain', isCorrect: false }
      ]
    },
    {
      question: 'What is the chemical symbol for Gold?',
      options: [
        { text: 'Go', isCorrect: false },
        { text: 'Gd', isCorrect: false },
        { text: 'Au', isCorrect: true },
        { text: 'Ag', isCorrect: false }
      ]
    }
  ];

  const handleQuizComplete = (results) => {
    setQuizResults(results);
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setQuizResults(null);
  };

  if (!quizStarted) {
    if (!quizResults) {
      return (
        <div className="gamified-assessment-wrapper">
          <div className="gamified-landing">
            <div className="gamified-header">
              <h1>🎮 Gamified Assessment</h1>
              <p>Test your knowledge in an interactive and fun way!</p>
            </div>

            <div className="gamified-features">
              <div className="feature-card">
                <span className="feature-icon">📊</span>
                <h3>Progress Tracking</h3>
                <p>See your progress with a visual progress bar</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">⏱️</span>
                <h3>Countdown Timer</h3>
                <p>Race against time with a circular timer</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">✨</span>
                <h3>Animated Feedback</h3>
                <p>Get instant visual feedback on your answers</p>
              </div>
              <div className="feature-card">
                <span className="feature-icon">💫</span>
                <h3>Smooth Animations</h3>
                <p>Experience beautiful shake and bounce effects</p>
              </div>
            </div>

            <button 
              className="gamified-start-button"
              onClick={() => setQuizStarted(true)}
            >
              Start Assessment
            </button>
          </div>
        </div>
      );
    }
  }

  if (quizResults) {
    const percentage = (quizResults.correctAnswers / quizResults.totalQuestions) * 100;
    
    return (
      <div className="gamified-assessment-wrapper">
        <div className="results-container">
          <div className="results-header">
            <h1>Quiz Completed! 🎉</h1>
          </div>

          <div className="results-card">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-percentage">{Math.round(percentage)}%</span>
                <span className="score-label">Score</span>
              </div>
            </div>

            <div className="results-details">
              <p className="results-summary">
                You answered <strong>{quizResults.correctAnswers} out of {quizResults.totalQuestions}</strong> questions correctly!
              </p>

              <div className="results-message">
                {percentage === 100 && <p>🏆 Perfect Score! Outstanding performance!</p>}
                {percentage >= 80 && percentage < 100 && <p>🌟 Excellent work! Keep it up!</p>}
                {percentage >= 60 && percentage < 80 && <p>👍 Good job! You're doing great!</p>}
                {percentage >= 40 && percentage < 60 && <p>💪 Not bad! Try again to improve!</p>}
                {percentage < 40 && <p>📚 Keep studying! You'll do better next time!</p>}
              </div>
            </div>

            <button 
              className="gamified-restart-button"
              onClick={handleRestartQuiz}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gamified-quiz-wrapper">
      <QuizLayout 
        questions={sampleQuestions}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};

export default GamifiedAssessmentPage;
