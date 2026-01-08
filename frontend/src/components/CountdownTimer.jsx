import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CountdownTimer.css';

const CountdownTimer = ({ duration = 30, onTimeUp = () => {} }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(true);
  }, [duration]);

  useEffect(() => {
    let interval;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  useEffect(() => {
    if (circleRef.current) {
      const circumference = 2 * Math.PI * 45; // radius of 45
      const offset = circumference - (timeLeft / duration) * circumference;
      
      // Calculate color based on time remaining
      const percentage = (timeLeft / duration) * 100;
      let color = '#22c55e'; // green
      
      if (percentage <= 33) {
        color = '#ef4444'; // red
      } else if (percentage <= 66) {
        color = '#f59e0b'; // amber
      }

      gsap.to(circleRef.current, {
        strokeDashoffset: offset,
        stroke: color,
        duration: 0.5,
        ease: 'linear'
      });
    }
  }, [timeLeft, duration]);

  const getTimeColor = () => {
    const percentage = (timeLeft / duration) * 100;
    if (percentage <= 33) return 'text-red-500';
    if (percentage <= 66) return 'text-amber-500';
    return 'text-green-500';
  };

  return (
    <div className="countdown-timer-container">
      <div className="timer-circle-wrapper">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle
            className="timer-circle-bg"
            cx="50"
            cy="50"
            r="45"
          />
          <circle
            ref={circleRef}
            className="timer-circle"
            cx="50"
            cy="50"
            r="45"
            stroke="#22c55e"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={0}
          />
        </svg>
        <div className={`timer-text ${getTimeColor()}`}>
          {timeLeft}
          <span className="timer-label">s</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
