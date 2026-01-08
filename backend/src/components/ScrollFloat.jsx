import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
  children,

  /* Existing props (safe) */
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "top 85%",
  scrollEnd = "bottom 40%",
  stagger = 0.03,

  /* 🔥 NEW PROPS (for Courses landing) */
  sectionMode = false,       // full-section transition
  fromY = 120,
  fromOpacity = 0,
  fromScale = 0.9
}) => {
  const containerRef = useRef(null);

  /* Split text into characters */
  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split("").map((char, index) => (
      <span className="char" key={index}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef?.current ? scrollContainerRef.current : window;

    const chars = el.querySelectorAll(".char");

    /* Kill old triggers (important for route changes) */
    ScrollTrigger.getAll().forEach((st) => {
      if (st.trigger === el) st.kill();
    });

    /* Character-based animation (default behaviour) */
    if (!sectionMode) {
      gsap.fromTo(
        chars,
        {
          willChange: "opacity, transform",
          opacity: fromOpacity,
          yPercent: fromY,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: "50% 50%"
        },
        {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          duration: animationDuration,
          ease,
          stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true
          }
        }
      );
    }

    /* 🔥 Section-wide animation (Courses landing use-case) */
    if (sectionMode) {
      gsap.fromTo(
        el,
        {
          opacity: fromOpacity,
          y: 80,
          scale: fromScale
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: animationDuration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            scroller,
            start: scrollStart,
            end: scrollEnd,
            scrub: true
          }
        }
      );
    }
  }, [
    scrollContainerRef,
    animationDuration,
    ease,
    scrollStart,
    scrollEnd,
    stagger,
    sectionMode,
    fromY,
    fromOpacity,
    fromScale
  ]);

  return (
    <h2
      ref={containerRef}
      className={`scroll-float ${containerClassName}`}
    >
      <span className={`scroll-float-text ${textClassName}`}>
        {splitText}
      </span>
    </h2>
  );
};

export default ScrollFloat;
