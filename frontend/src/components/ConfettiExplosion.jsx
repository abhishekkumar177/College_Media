import React, { useEffect } from "react";
import confetti from "canvas-confetti";

const ConfettiExplosion = () => {
  useEffect(() => {
    // Trigger confetti with multiple bursts
    const triggerConfetti = () => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Burst from center
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        });

        // Burst from bottom corners
        confetti({
          ...defaults,
          particleCount: particleCount * 0.5,
          origin: { x: 0, y: 0.5 },
          angle: 60,
          spread: 55,
        });

        confetti({
          ...defaults,
          particleCount: particleCount * 0.5,
          origin: { x: 1, y: 0.5 },
          angle: 120,
          spread: 55,
        });
      }, 250);
    };

    // Delay confetti start slightly for better UX
    const timeout = setTimeout(triggerConfetti, 500);

    return () => clearTimeout(timeout);
  }, []);

  return null;
};

export default ConfettiExplosion;
