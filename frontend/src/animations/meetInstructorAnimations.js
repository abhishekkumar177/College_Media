import gsap from "gsap";
import { ScrollTrigger, Flip } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, Flip);

/* Parallax image */
export const initParallax = (imageRef) => {
  if (!imageRef) return;

  gsap.to(imageRef, {
    yPercent: -20,
    ease: "none",
    scrollTrigger: {
      trigger: imageRef,
      start: "top bottom",
      scrub: true,
    },
  });
};

/* Stat counter */
export const animateCounter = (el, endValue) => {
  gsap.fromTo(
    el,
    { innerText: 0 },
    {
      innerText: endValue,
      duration: 2,
      snap: { innerText: 1 },
      ease: "power1.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
      },
    }
  );
};

/* Flip animation */
export const flipToFullscreen = (cardEl) => {
  const state = Flip.getState(cardEl);
  cardEl.classList.toggle("fullscreen");

  Flip.from(state, {
    duration: 0.8,
    ease: "power2.inOut",
    absolute: true,
  });
};
