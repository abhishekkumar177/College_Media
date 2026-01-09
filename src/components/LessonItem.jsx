import { Reorder } from "framer-motion";

const LessonItem = ({ lesson }) => {
  return (
    <Reorder.Item
      value={lesson}
      className="lesson-item"
      whileDrag={{ scale: 1.03 }}
    >
      <div className="lesson-dot" />
      <span>{lesson.title}</span>
    </Reorder.Item>
  );
};

export default LessonItem;
