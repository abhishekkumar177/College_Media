import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import CountdownTimer from './CountdownTimer';
import AnimatedFeedback from './AnimatedFeedback';
import './QuizLayout.css';

const QuizLayout = ({ questions = [], onComplete = () => {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [timePerQuestion] = useState(30);
  const quizContainerRef = useRef(null);

  const totalQuestions = questions.length || 5;
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (isCorrect) => {
    // Show feedback
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    // Animate quiz container
    if (isCorrect) {
      animateBounce();
    } else {
      animateShake();
    }

    // Store answer
    setAnswers([...answers, isCorrect]);

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setFeedback(null);
      } else {
        // Quiz completed
        setTimeout(() => {
          onComplete({
            totalQuestions,
            correctAnswers: answers.filter(a => a).length + (isCorrect ? 1 : 0),
            answers
          });
        }, 1000);
      }
    }, 1500);
  };

  const animateBounce = () => {
    gsap.to(quizContainerRef.current, {
      duration: 0.5,
      y: -20,
      ease: 'back.out(2)',
      onComplete: () => {
        gsap.to(quizContainerRef.current, {
          duration: 0.3,
          y: 0,
          ease: 'back.out(2)'
        });
      }
    });
  };

  const animateShake = () => {
    gsap.to(quizContainerRef.current, {
      duration: 0.1,
      x: -10,
      repeat: 5,
      yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => {
        gsap.to(quizContainerRef.current, {
          duration: 0.1,
          x: 0
        });
      }
    });
  };

  return (
    <div className="quiz-layout-container">
      {/* Step-based Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-text">Question {currentQuestion + 1} of {totalQuestions}</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="timer-section">
        <CountdownTimer duration={timePerQuestion} />
      </div>

      {/* Quiz Content */}
      <div className="quiz-content-wrapper" ref={quizContainerRef}>
        <div className="quiz-question-container">
          <h2 className="question-title">
            {questions[currentQuestion]?.question || `Question ${currentQuestion + 1}`}
          </h2>
          
          <div className="options-container">
            {questions[currentQuestion]?.options ? (
              questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className="option-button"
                  onClick={() => handleAnswerSelect(option.isCorrect)}
                >
                  {option.text}
                </button>
              ))
            ) : (
              <>
                <button className="option-button" onClick={() => handleAnswerSelect(false)}>Option A</button>
                <button className="option-button" onClick={() => handleAnswerSelect(false)}>Option B</button>
                <button className="option-button" onClick={() => handleAnswerSelect(true)}>Option C</button>
                <button className="option-button" onClick={() => handleAnswerSelect(false)}>Option D</button>
              </>
            )}
          </div>
        </div>

        {/* Animated Feedback Overlay */}
        {feedback && <AnimatedFeedback result={feedback} />}
      </div>
    </div>
  );
};

export default QuizLayout;
