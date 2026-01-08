import { useRef } from "react";
import { flipToFullscreen } from "../../animations/meetInstructorAnimations";

const InstructorCard = () => {
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      className="instructor-card"
      onClick={() => flipToFullscreen(cardRef.current)}
    >
      <h3>Abhishek Kumar</h3>
      <p>Senior Frontend Engineer & Mentor</p>

      <div className="card-details">
        <p>
          Abhishek has mentored thousands of students and specializes in modern
          frontend technologies, animations, and scalable UI systems.
        </p>
      </div>
    </div>
  );
};

export default InstructorCard;
