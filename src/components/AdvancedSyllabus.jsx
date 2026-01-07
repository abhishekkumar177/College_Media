import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AdvancedSyllabus.css';

gsap.registerPlugin(ScrollTrigger);

const AdvancedSyllabus = ({ courseMaterial = [] }) => {
  const containerRef = useRef(null);
  const progressLineRef = useRef(null);
  const sectionHeadersRef = useRef([]);
  const lessonItemsRef = useRef([]);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    // Create SVG path for progress line animation
    const svg = progressLineRef.current?.querySelector('svg');
    if (svg) {
      const path = svg.querySelector('path');
      if (path) {
        const pathLength = path.getTotalLength();
        path.style.strokeDasharray = pathLength;
        path.style.strokeDashoffset = pathLength;

        // Animate path drawing on scroll
        gsap.to(path, {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: scrollContainer,
            scroller: window,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
              updateActiveModule(self.progress);
            }
          }
        });
      }
    }

    // Sticky header animation
    sectionHeadersRef.current.forEach((header, index) => {
      if (!header) return;

      gsap.fromTo(
        header,
        {
          y: 0,
          opacity: 1
        },
        {
          y: -100,
          opacity: 0.8,
          duration: 0.3,
          scrollTrigger: {
            trigger: header,
            scroller: window,
            start: 'top 60px',
            end: 'top -100px',
            markers: false,
            onEnter: () => {
              setActiveModule(index);
            },
            onEnterBack: () => {
              setActiveModule(index);
            }
          }
        }
      );
    });

    // Lesson item reveal animations
    lessonItemsRef.current.forEach((item) => {
      if (!item) return;

      const chars = item.querySelectorAll('.lesson-char');
      if (chars.length === 0) return;

      gsap.fromTo(
        chars,
        {
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 50%'
        },
        {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: item,
            scroller: window,
            start: 'center bottom+=50%',
            end: 'bottom bottom-=40%',
            scrub: true
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [courseMaterial]);

  const updateActiveModule = (progress) => {
    const moduleCount = courseMaterial.length;
    const activeIndex = Math.floor(progress * moduleCount);
    if (activeIndex < moduleCount) {
      setActiveModule(activeIndex);
    }
  };

  const renderLessonDescription = (text) => {
    if (!text) return null;
    return text.split('').map((char, index) => (
      <span key={index} className="lesson-char">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  const totalLessons = courseMaterial.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  const svgHeight = 200 + totalLessons * 80;

  return (
    <div className="advanced-syllabus-wrapper" ref={containerRef}>
      <div className="syllabus-container">
        {/* Progress Line with SVG */}
        <div ref={progressLineRef} className="progress-line-container">
          <svg width="4" height={svgHeight} viewBox={`0 0 4 ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d={`M 2 0 L 2 ${svgHeight}`}
              stroke="url(#progressGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Syllabus Content */}
        <div className="syllabus-content">
          {courseMaterial.map((module, moduleIndex) => (
            <div key={moduleIndex} className="module-section">
              {/* Sticky Module Header */}
              <div
                ref={(el) => (sectionHeadersRef.current[moduleIndex] = el)}
                className={`module-header ${activeModule === moduleIndex ? 'active' : ''}`}
              >
                <h2 className="module-title">{module.title}</h2>
                <p className="module-subtitle">{module.subtitle}</p>
              </div>

              {/* Lessons */}
              <div className="lessons-container">
                {module.lessons &&
                  module.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lessonIndex}
                      ref={(el) => (lessonItemsRef.current.push(el))}
                      className="lesson-item"
                    >
                      <div className="lesson-header">
                        <span className="lesson-number">{lessonIndex + 1}</span>
                        <h3 className="lesson-title">{lesson.title}</h3>
                      </div>
                      <div className="lesson-description">
                        {renderLessonDescription(lesson.description)}
                      </div>
                      {lesson.topics && lesson.topics.length > 0 && (
                        <div className="lesson-topics">
                          {lesson.topics.map((topic, topicIndex) => (
                            <span key={topicIndex} className="topic-badge">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSyllabus;
