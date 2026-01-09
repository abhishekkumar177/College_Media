import { motion } from "framer-motion";

/**
 * LivePreview Component
 * Shows real-time preview of course title, description, and lessons
 */
const LivePreview = ({ title, description, lessons }) => {
  return (
    <div className="preview">
      <h2>Live Preview</h2>

      <motion.div
        key={`${title}-${description}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="preview-card"
      >
        <h3>{title || "Course Title"}</h3>
        <p>{description || "Course description preview..."}</p>

        <ul>
          {lessons.map((l) => (
            <li key={l.id}>{l.title}</li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default LivePreview;
