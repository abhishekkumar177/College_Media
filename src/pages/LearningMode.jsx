import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import LeftSidebar from '../components/LeftSidebar';

const CircularProgress = ({ percentage }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12 group cursor-pointer">
      <svg className="transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-gray-700 dark:text-gray-700"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-indigo-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
        {percentage}%
      </span>
    </div>
  );
};

const LessonCompleteCheckmark = () => {
  const pathRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      pathRef.current,
      { strokeDasharray: 20, strokeDashoffset: 20 },
      { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  return (
    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path ref={pathRef} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
};

const LearningMode = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([1, 2]);
  const [currentLessonId, setCurrentLessonId] = useState(3);
  
  const sidebarContainerRef = useRef(null);

  const course = {
    title: "Advanced React Patterns & Performance",
    totalLessons: 12,
    sections: [
      {
        title: "Section 1: Fundamentals",
        lessons: [
          { id: 1, title: "Introduction to Hooks", duration: "10:05" },
          { id: 2, title: "UseEffect Deep Dive", duration: "15:30" },
        ]
      },
      {
        title: "Section 2: Advanced Composition",
        lessons: [
          { id: 3, title: "Compound Components", duration: "12:45" },
          { id: 4, title: "Control Props Pattern", duration: "18:20" },
          { id: 5, title: "Render Props vs Hooks", duration: "14:10" },
        ]
      }
    ]
  };

  const progress = Math.round((completedLessons.length / course.totalLessons) * 100);

  useEffect(() => {
    const sidebar = sidebarContainerRef.current;
    
    if (isPlaying) {
      gsap.to(sidebar, { 
        x: -260,
        duration: 0.6, 
        ease: "power2.inOut" 
      });
    } else {
      gsap.to(sidebar, { 
        x: 0, 
        duration: 0.6, 
        ease: "power2.inOut" 
      });
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const markLessonComplete = (id) => {
    if (!completedLessons.includes(id)) {
      setCompletedLessons(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex h-screen bg-[#05050A] text-white overflow-hidden">
      
      <div 
        ref={sidebarContainerRef} 
        className="w-64 flex-shrink-0 z-30 border-r border-white/10 bg-[#05050A]"
      >
        <LeftSidebar />
      </div>

      <div className="flex-1 flex flex-col relative z-20 min-w-0">
        
        <header className="h-16 border-b border-white/10 bg-[#0B0C17]/90 backdrop-blur-md flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4">
             <h1 className="font-semibold text-lg text-gray-200 truncate">{course.title}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end mr-2">
               <span className="text-xs text-gray-400 uppercase tracking-wider">Progress</span>
               <span className="text-sm font-medium">{completedLessons.length}/{course.totalLessons} Lessons</span>
            </div>
            <CircularProgress percentage={progress} />
            
            <button 
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          <main className="flex-1 relative bg-black flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-5xl aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative group border border-white/5">
              
              <div className="absolute inset-0 flex items-center justify-center">
                 {!isPlaying && (
                    <button 
                      onClick={handlePlayPause}
                      className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center pl-2 hover:bg-indigo-500 hover:scale-110 transition-all duration-300 shadow-lg z-10"
                    >
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                 )}
              </div>
              
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 flex flex-col justify-end p-6 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={handlePlayPause} className="text-white hover:text-indigo-400">
                        {isPlaying ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </button>
                      <div className="h-1 bg-gray-600 w-96 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 w-1/3"></div>
                      </div>
                      <span className="text-sm font-mono text-gray-300">04:20 / 12:45</span>
                    </div>
                 </div>
              </div>

              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                 <span className="text-white/10 text-6xl font-bold">VIDEO PLAYER</span>
              </div>
            </div>

            <div className="mt-6 w-full max-w-5xl flex justify-between items-center text-gray-400">
               <div>
                 <h2 className="text-2xl font-bold text-white mb-1">Compound Components</h2>
                 <p>Section 2 • Lesson 3</p>
               </div>
               <button 
                 onClick={() => markLessonComplete(currentLessonId)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                   completedLessons.includes(currentLessonId) 
                     ? 'bg-green-500/10 text-green-400 border border-green-500/50' 
                     : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                 }`}
               >
                 {completedLessons.includes(currentLessonId) ? 'Completed' : 'Mark as Complete'}
                 {completedLessons.includes(currentLessonId) && <LessonCompleteCheckmark />}
               </button>
            </div>
          </main>

          <aside 
            className={`
              fixed lg:relative right-0 top-0 bottom-0 z-30
              w-80 bg-[#0F1118] border-l border-white/10
              transition-transform duration-300 ease-in-out transform
              ${drawerOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
            `}
          >
             <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">Course Content</h3>
                <button onClick={() => setDrawerOpen(false)} className="lg:hidden text-gray-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             
             <div className="overflow-y-auto h-[calc(100vh-4rem)] p-2 space-y-4 pb-20">
                {course.sections.map((section, idx) => (
                  <div key={idx} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 mt-4">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isActive = currentLessonId === lesson.id;
                        
                        return (
                          <div 
                            key={lesson.id}
                            onClick={() => setCurrentLessonId(lesson.id)}
                            className={`
                              flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                              ${isActive 
                                ? 'bg-indigo-600/20 border border-indigo-500/50' 
                                : 'hover:bg-white/5 border border-transparent'}
                            `}
                          >
                            <div className="flex-shrink-0 w-6 flex justify-center">
                              {isCompleted ? (
                                <LessonCompleteCheckmark />
                              ) : (
                                <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-indigo-400' : 'border-gray-600'}`}></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-300' : 'text-gray-300'}`}>
                                 {lesson.title}
                               </p>
                               <span className="text-xs text-gray-500">{lesson.duration}</span>
                            </div>
                            {isActive && (
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LearningMode;