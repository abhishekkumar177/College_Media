import React, { useState } from 'react'
import CertificateCard from '../components/CertificateCard'
import AchievementTimeline from '../components/AchievementTimeline'
import ConfettiExplosion from '../components/ConfettiExplosion'

const CertificatePage = () => {
  // Example data - in a real app, this would come from props/context/API
  const [certificateData] = useState({
    studentName: 'John Doe',
    courseName: 'Advanced Web Development',
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    grade: 'A+',
  })

  const [milestones] = useState([
    {
      id: 1,
      title: 'Course Started',
      description: 'Began learning Advanced Web Development',
      date: 'Jan 1, 2024',
      icon: '🚀',
      completed: true,
    },
    {
      id: 2,
      title: 'Module 1 Completed',
      description: 'Frontend Architecture & Components',
      date: 'Feb 15, 2024',
      icon: '📚',
      completed: true,
    },
    {
      id: 3,
      title: 'First Assessment',
      description: 'Scored 92% on Module 1',
      date: 'Mar 20, 2024',
      icon: '🏆',
      completed: true,
    },
    {
      id: 4,
      title: 'Capstone Project',
      description: 'Completed full-stack application',
      date: 'Apr 30, 2024',
      icon: '💡',
      completed: true,
    },
    {
      id: 5,
      title: 'Course Mastery',
      description: 'Earned final certification',
      date: 'May 15, 2024',
      icon: '🎓',
      completed: true,
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Confetti Animation */}
      <ConfettiExplosion />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-coral-500 to-coral-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2s"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4s"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section with Certificate */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-20">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-coral-600 to-purple-600 bg-clip-text text-transparent">
              🎉 Congratulations! 🎉
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-4">
              You've successfully completed your course!
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Your dedication and hard work have paid off. Here's your certificate of achievement.
            </p>
          </div>

          {/* Certificate Card */}
          <div className="w-full mb-16">
            <CertificateCard {...certificateData} />
          </div>

          {/* Download & Share Section */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <button className="px-8 py-4 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              📥 Download Certificate
            </button>
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              📤 Share on Social
            </button>
            <button className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              🏠 Back to Home
            </button>
          </div>
        </section>

        {/* Achievement Timeline Section */}
        <section className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <AchievementTimeline milestones={milestones} />
        </section>

        {/* Additional Info Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Certificate Details */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📜</span> Certificate Details
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>
                  <strong>Status:</strong> <span className="text-green-600 dark:text-green-400">Verified ✓</span>
                </li>
                <li>
                  <strong>Issued Date:</strong> {new Date().toLocaleDateString()}
                </li>
                <li>
                  <strong>Valid Until:</strong> Lifetime
                </li>
                <li>
                  <strong>ID:</strong> CERT-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🚀</span> Next Steps
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>✓ Add to your profile</li>
                <li>✓ Share with employers</li>
                <li>✓ Explore advanced courses</li>
                <li>✓ Join community discussions</li>
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🏆</span> Benefits
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                <li>✨ Verified credential</li>
                <li>✨ LinkedIn shareable</li>
                <li>✨ Resume enhancement</li>
                <li>✨ Career advancement</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2s {
          animation-delay: 2s;
        }

        .animation-delay-4s {
          animation-delay: 4s;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default CertificatePage
