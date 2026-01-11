import React, { useState, useRef, useEffect } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import { uploadedFiles, curriculumLessons } from "../mock/instructorData";
import { Link } from "react-router-dom";
import gsap from "gsap";

const InstructorDashboard = () => {
  const [files, setFiles] = useState(uploadedFiles);
  const [lessons, setLessons] = useState(curriculumLessons);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const previewRef = useRef(null);

  // Drag and Drop Uploader Animation
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    // Mock file upload handling
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
        const newFile = {
            id: `new-${Date.now()}`,
            name: droppedFiles[0].name,
            type: droppedFiles[0].type.includes('pdf') ? 'pdf' : 'video',
            size: `${(droppedFiles[0].size / 1024 / 1024).toFixed(2)} MB`,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        setFiles(prev => [...prev, newFile]);
    }
  };

  // Real-time Preview Fade-in Effect
  useEffect(() => {
    if (courseDescription && previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { opacity: 0.5 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [courseDescription]);

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-[calc(100vh-100px)]">
      {/* LEFT COLUMN: Editor */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Instructor Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage your courses.
          </p>
        </div>

        {/* 1. Drag-and-Drop Uploader */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Upload Materials
          </h2>
          <motion.div
            layout
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              borderColor: isDraggingOver ? "#6366f1" : "#e2e8f0",
              backgroundColor: isDraggingOver
                ? "rgba(99, 102, 241, 0.05)"
                : "transparent",
            }}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer dark:border-slate-700`}
          >
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Drag & Drop files here
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              or click to browse (PDF, MP4)
            </p>
          </motion.div>

          {/* File List */}
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      file.type === "pdf"
                        ? "bg-red-50 text-red-500"
                        : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    {file.type === "pdf" ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">{file.size}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-red-500 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Dynamic Curriculum Builder */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Curriculum Timeline
            </h2>
            <p className="text-sm text-slate-500">Drag to reorder lessons</p>

            <Reorder.Group axis="y" values={lessons} onReorder={setLessons} className="space-y-2 relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 ml-4">
                {lessons.map((lesson) => (
                    <LessonItem key={lesson.id} lesson={lesson} />
                ))}
            </Reorder.Group>
        </div>
      </div>

      {/* RIGHT COLUMN: Real-time Preview */}
      <div className="w-full xl:w-96 shrink-0">
        <div className="sticky top-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                <h3 className="font-bold text-slate-800 dark:text-white">Live Preview</h3>
                <span className="animate-pulse flex h-3 w-3 rounded-full bg-green-500"></span>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Course Title</label>
                    <input
                        type="text"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        placeholder="Enter course title..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                    <textarea
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        placeholder="Type course description..."
                        rows={6}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>

                {/* Preview Box */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Student View Preview</p>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                            {courseTitle || "Course Title"}
                        </h4>
                        <div ref={previewRef} className="text-sm text-slate-600 dark:text-slate-300">
                            {courseDescription || "Course description will appear here..."}
                        </div>
                    </div>
                </div>

                <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                    Publish Course
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const LessonItem = ({ lesson }) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={lesson}
            dragListener={false}
            dragControls={controls}
            className="relative"
        >
            {/* Timeline Dot */}
            <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-500 z-10"></div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 group hover:border-indigo-500/50 transition-colors">
                <div
                    className="cursor-grab active:cursor-grabbing p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </div>

                <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">{lesson.title}</h4>
                    <p className="text-xs text-slate-500">{lesson.duration} • {lesson.type}</p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                     <button className="p-1.5 text-slate-400 hover:text-blue-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                     </button>
                </div>
            </div>
        </Reorder.Item>
    );
};

export default InstructorDashboard;
