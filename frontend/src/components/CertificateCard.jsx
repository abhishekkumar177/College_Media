import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'

const CertificateCard = ({ studentName, courseName, completionDate, grade }) => {
  const cardRef = useRef(null)
  const glowRef = useRef(null)
  const [rotationX, setRotationX] = useState(0)
  const [rotationY, setRotationY] = useState(0)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseX = e.clientX - centerX
      const mouseY = e.clientY - centerY

      // Calculate rotation values (subtle effect)
      const rotX = (mouseY / rect.height) * 15
      const rotY = (-mouseX / rect.width) * 15

      setRotationX(rotX)
      setRotationY(rotY)

      // Move glow to follow cursor
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: mouseX * 0.2,
          y: mouseY * 0.2,
          duration: 0.5,
          overwrite: 'auto',
        })
      }
    }

    const handleMouseLeave = () => {
      setRotationX(0)
      setRotationY(0)
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: 0,
          y: 0,
          duration: 0.5,
          overwrite: 'auto',
        })
      }
    }

    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="perspective flex items-center justify-center min-h-screen px-6">
      <div
        ref={cardRef}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative w-full max-w-2xl h-96 group"
      >
        {/* Gradient Border Glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 bg-gradient-to-r from-coral-500 via-purple-500 to-coral-500 rounded-2xl p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"
          style={{
            animation: 'rotate 3s linear infinite',
          }}
        ></div>

        {/* Main Certificate Card */}
        <div
          className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Shimmering Border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-coral-500 via-purple-500 to-coral-500 opacity-0 group-hover:opacity-40 blur-md transition-opacity duration-500 animate-pulse"></div>

          {/* Certificate Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-8 py-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-coral-500 to-purple-600 bg-clip-text text-transparent mb-2">
                Certificate of Achievement
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-coral-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Student Info */}
            <div className="text-center mb-8 flex-1 flex flex-col justify-center">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">This certifies that</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {studentName || 'Student Name'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-1">has successfully completed</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                {courseName || 'Course Name'}
              </p>

              {/* Grade and Date */}
              <div className="flex justify-center gap-8 mt-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Grade</p>
                  <p className="text-lg font-bold text-coral-600 dark:text-coral-400">
                    {grade || 'A+'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Completed On</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {completionDate || new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between w-full text-xs text-slate-500 dark:text-slate-500 mt-6">
              <span>College Media Platform</span>
              <span>🎓 Verified Certificate</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  )
}

export default CertificateCard
