import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AchievementTimeline = ({ milestones }) => {
  const timelineRef = useRef(null)

  const defaultMilestones = [
    {
      id: 1,
      title: 'Course Started',
      description: 'Began learning journey',
      date: 'Jan 1, 2024',
      icon: '🚀',
      completed: true,
    },
    {
      id: 2,
      title: 'First Module Completed',
      description: 'Mastered core concepts',
      date: 'Feb 15, 2024',
      icon: '📚',
      completed: true,
    },
    {
      id: 3,
      title: 'Midterm Passed',
      description: 'Scored 85%',
      date: 'Mar 20, 2024',
      icon: '🏆',
      completed: true,
    },
    {
      id: 4,
      title: 'Project Submission',
      description: 'Completed capstone project',
      date: 'Apr 30, 2024',
      icon: '💡',
      completed: true,
    },
    {
      id: 5,
      title: 'Course Completed',
      description: 'Earned final certification',
      date: 'May 15, 2024',
      icon: '🎓',
      completed: true,
    },
  ]

  const timeline = milestones || defaultMilestones

  useEffect(() => {
    if (!timelineRef.current) return

    const items = timelineRef.current.querySelectorAll('.timeline-item')

    items.forEach((item) => {
      gsap.fromTo(
        item,
        {
          opacity: 0,
          x: -50,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div className="w-full py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-coral-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Learning Journey
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Track your progress through each milestone
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-coral-500 via-purple-500 to-coral-500 transform -translate-x-1/2"></div>

          {/* Timeline Items */}
          <div className="space-y-8">
            {timeline.map((milestone, index) => (
              <div
                key={milestone.id}
                className="timeline-item flex items-center gap-8"
              >
                {/* Left Content (for even items on desktop) */}
                <div className={`flex-1 ${index % 2 === 0 ? '' : 'hidden md:block'}`}>
                  {index % 2 === 0 && (
                    <div className="text-right pr-8">
                      <div className="inline-block bg-gradient-to-r from-coral-500/10 to-purple-500/10 border border-coral-200 dark:border-coral-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-coral-600 dark:text-coral-400 font-semibold">
                          {milestone.date}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Circle/Icon */}
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Pulse animation for completed items */}
                    {milestone.completed && (
                      <div className="absolute inset-0 bg-gradient-to-r from-coral-400 to-purple-400 rounded-full animate-pulse opacity-50"></div>
                    )}

                    {/* Main Circle */}
                    <div className="absolute inset-0 bg-gradient-to-br from-coral-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-125">
                      <span className="text-2xl">{milestone.icon}</span>
                    </div>
                  </div>
                </div>

                {/* Right Content (for odd items on desktop) */}
                <div className={`flex-1 ${index % 2 === 1 ? '' : 'hidden md:block'}`}>
                  {index % 2 === 1 && (
                    <div className="pl-8">
                      <div className="inline-block bg-gradient-to-r from-coral-500/10 to-purple-500/10 border border-coral-200 dark:border-coral-800 rounded-lg p-4">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-coral-600 dark:text-coral-400 font-semibold">
                          {milestone.date}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Layout - Both sides hidden on mobile */}
                <div className="md:hidden flex-1">
                  <div className="bg-gradient-to-r from-coral-500/10 to-purple-500/10 border border-coral-200 dark:border-coral-800 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                      {milestone.description}
                    </p>
                    <p className="text-xs text-coral-600 dark:text-coral-400 font-semibold">
                      {milestone.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="flex justify-center mt-16">
          <div className="inline-block bg-gradient-to-r from-coral-500/20 to-purple-500/20 border border-coral-300 dark:border-coral-700 rounded-full px-8 py-4">
            <p className="text-center text-slate-900 dark:text-white font-semibold">
              🎉 Journey Complete! You've achieved your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementTimeline
