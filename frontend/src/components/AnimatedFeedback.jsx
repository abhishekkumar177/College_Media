import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AnimatedFeedback.css';

const AnimatedFeedback = ({ result }) => {
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (feedbackRef.current) {
      // Animate in
      gsap.from(feedbackRef.current, {
        duration: 0.3,
        opacity: 0,
        scale: 0.5,
        ease: 'back.out(2)'
      });

      // Animate out
      gsap.to(feedbackRef.current, {
        duration: 0.3,
        opacity: 0,
        scale: 0.5,
        delay: 1.2,
        ease: 'power2.in'
      });
    }
  }, [result]);

  const isCorrect = result === 'correct';

  return (
    <div 
      ref={feedbackRef}
      className={`animated-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
    >
      <div className="feedback-icon">
        {isCorrect ? '✓' : '✕'}
      </div>
      <div className="feedback-text">
        {isCorrect ? 'Correct!' : 'Incorrect!'}
      </div>
      <div className="feedback-subtext">
        {isCorrect ? 'Great job!' : 'Try again next time'}
      </div>
    </div>
  );
};

export default AnimatedFeedback;
