import { useState } from "react";
import DragDropUploader from "../components/DragDropUploader";
import CurriculumBuilder from "../components/CurriculumBuilder";
import LivePreview from "../components/LivePreview";

const InstructorDashboard = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lessons, setLessons] = useState([]);

  return (
    <div className="dashboard">
      <h1>Instructor Dashboard</h1>

      <div className="course-form">
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <DragDropUploader />

      <CurriculumBuilder lessons={lessons} setLessons={setLessons} />

      <LivePreview
        title={title}
        description={description}
        lessons={lessons}
      />
    </div>
  );
};

export default InstructorDashboard;
