import { useState } from "react";

const DragDropUploader = () => {
  const [active, setActive] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setActive(false);

    const files = Array.from(e.dataTransfer.files);
    console.log("Uploaded files:", files);
  };

  return (
    <div
      className={`upload-zone ${active ? "active" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
    >
      <p>📤 Drag & Drop Videos or PDFs</p>
      <span>Frontend only – upload handling later</span>
    </div>
  );
};

export default DragDropUploader;
