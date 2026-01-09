import { useEffect, useRef } from "react";
import gsap from "gsap";
import CompatibilityRing from "./CompatibilityRing";
import "./studyBuddy.css";

const StudyBuddyCard = ({ user, index }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.from(cardRef.current, {
  y: 30,
  opacity: 1, 
  duration: 0.6,
});

  }, [index]);

  return (
    <div ref={cardRef} className="study-card">
      <div className={`avatar ${user.active ? "active" : ""}`}>
        {user.name.charAt(0)}
      </div>

      <h3>{user.name}</h3>
      <p>{user.course}</p>

      <CompatibilityRing value={user.score} />
    </div>
  );
};

export default StudyBuddyCard;
