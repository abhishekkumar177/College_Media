import { Reorder } from "framer-motion";
import LessonItem from "./LessonItem";

const CurriculumBuilder = ({ lessons, setLessons }) => {
  const addLesson = () => {
    setLessons([
      ...lessons,
      {
        id: Date.now(),
        title: `Lesson ${lessons.length + 1}`
      }
    ]);
  };

  return (
    <div className="curriculum">
      <h2>Curriculum Builder</h2>

      <Reorder.Group
        axis="y"
        values={lessons}
        onReorder={setLessons}
        className="timeline"
      >
        {lessons.map((lesson) => (
          <LessonItem key={lesson.id} lesson={lesson} />
        ))}
      </Reorder.Group>

      <button onClick={addLesson}>➕ Add Lesson</button>
    </div>
  );
};

export default CurriculumBuilder;
