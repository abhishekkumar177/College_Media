import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { studyBuddyProfiles } from "../mock/studyBuddyData";
import RightSidebar from "../components/RightSidebar";

const StudyBuddyMatcher = () => {
  const [profiles] = useState(studyBuddyProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(null);
  const scoreRef = useRef(null);

  useEffect(() => {
    // Entrance Animation using GSAP stagger
    gsap.fromTo(
      ".profile-card-entrance",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    // Animate Compatibility Score
    if (scoreRef.current && profiles[currentIndex]) {
      const score = profiles[currentIndex].compatibilityScore;
      // Reset first
      gsap.set(scoreRef.current, { strokeDashoffset: 283 });
      // Animate to new score
      const offset = 283 - (283 * score) / 100;
      gsap.to(scoreRef.current, {
        strokeDashoffset: offset,
        duration: 1.5,
        ease: "circ.out",
      });
    }
  }, [currentIndex, profiles]);

  const handleSwipe = (dir) => {
    setDirection(dir);
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < profiles.length) {
        setCurrentIndex(nextIndex);
        setDirection(null);
      } else {
        // No more profiles or loop
        alert("You've gone through all suggestions!");
      }
    }, 300); // Wait for exit animation
  };

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold text-gray-500">No more matches found.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Main Content Area */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Study Buddy Matcher
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Find your perfect study partner based on shared interests and courses.
          </p>
        </div>

        <div className="relative w-full max-w-md mx-auto h-[600px] flex flex-col justify-center items-center">
          <AnimatePresence>
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: direction === "left" ? -200 : 200,
                opacity: 0,
                rotate: direction === "left" ? -20 : 20,
              }}
              transition={{ duration: 0.4 }}
              className="absolute w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 profile-card-entrance"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset }) => {
                if (offset.x > 100) {
                  handleSwipe("right");
                } else if (offset.x < -100) {
                  handleSwipe("left");
                }
              }}
            >
              {/* Profile Image Area */}
              <div className="relative h-3/5 w-full">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Active Pulse Effect */}
                {currentProfile.active && (
                  <div className="absolute top-4 right-4">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                    </span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h2 className="text-3xl font-bold">{currentProfile.name}</h2>
                  <p className="text-lg opacity-90">{currentProfile.major}</p>
                </div>
              </div>

              {/* Details Area */}
              <div className="p-6 h-2/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Shared Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProfile.sharedInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Compatibility Score */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-slate-200 dark:text-slate-700"
                                />
                                <circle
                                    ref={scoreRef}
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray="175"
                                    strokeDashoffset="175"
                                    strokeLinecap="round"
                                    className="text-indigo-500"
                                    style={{
                                        // 2 * PI * r = 2 * 3.14159 * 28 ≈ 175.9
                                        strokeDasharray: 175,
                                    }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-slate-800 dark:text-white">
                                    {currentProfile.compatibilityScore}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white">Match Score</p>
                            <p className="text-xs text-slate-500">Based on interests</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleSwipe("left")}
                            className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors shadow-sm"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleSwipe("right")}
                            className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar - Explicitly Included */}
      <div className="hidden lg:block w-80 shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
};

export default StudyBuddyMatcher;
