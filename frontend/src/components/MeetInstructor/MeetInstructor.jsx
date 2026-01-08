import { useEffect, useRef } from "react";
import "./meetInstructor.css";
import InstructorCard from "./InstructorCard";
import StatsCounter from "./StatsCounter";
import { initParallax } from "../../animations/meetInstructorAnimations";

const MeetInstructor = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    initParallax(imageRef.current);
  }, []);

  return (
    <section className="meet-instructor">
      <div className="background-text">INSTRUCTOR</div>

      <div className="content">
        <div className="image-wrapper">
          <img
            ref={imageRef}
            src="/vite.svg"
            alt="Instructor"
            className="instructor-image"
          />
        </div>

        <div className="info">
          <h2>Meet Your Instructor</h2>
          <p>
            Learn from an industry expert with years of teaching and real-world
            experience.
          </p>

          <StatsCounter />
          <InstructorCard />
        </div>
      </div>
    </section>
  );
};

export default MeetInstructor;
