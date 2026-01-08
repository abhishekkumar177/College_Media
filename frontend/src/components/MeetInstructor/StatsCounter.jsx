import { useEffect, useRef } from "react";
import { animateCounter } from "../../animations/meetInstructorAnimations";

const StatsCounter = () => {
  const studentsRef = useRef(null);
  const coursesRef = useRef(null);
  const experienceRef = useRef(null);

  useEffect(() => {
    animateCounter(studentsRef.current, 50000);
    animateCounter(coursesRef.current, 120);
    animateCounter(experienceRef.current, 8);
  }, []);

  return (
    <div className="stats">
      <div>
        <span ref={studentsRef}>0</span>+ Students
      </div>
      <div>
        <span ref={coursesRef}>0</span>+ Courses
      </div>
      <div>
        <span ref={experienceRef}>0</span>+ Years
      </div>
    </div>
  );
};

export default StatsCounter;
