/**
 * BentoGrid Component
 * 
 * Feature showcase grid for UniHub's centralized platform
 * Displays key features in an engaging bento box layout
 * Updated to emphasize platform versatility beyond social media
 * 
 * @component
 * @returns {React.ReactElement} Bento grid feature section
 */
import React from 'react'
import { Icon } from '@iconify/react';

const BentoGrid = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" aria-hidden="true"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-60" aria-hidden="true"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
                    More Than Just Social Media
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    UniHub brings all your college needs together in one powerful, intuitive platform
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                
                {/* Feature 1: Academic Hub - Large */}
                <div className="md:col-span-2 row-span-1 md:row-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 flex flex-col justify-between overflow-hidden group hover:border-indigo-300 transition-colors relative">
                    <div className="z-10">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                            <span className="text-2xl" aria-hidden="true">📚</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-900 mb-3">Academic Excellence Hub</h3>
                        <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                            Access study groups, course materials, tutoring services, and academic calendars. Collaborate with classmates, share notes, and discover research opportunities - all in one centralized space.
                        </p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-white rounded-tl-2xl shadow-xl translate-y-4 translate-x-4 border border-slate-100 p-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2">
                         {/* Visual abstraction of academic interface */}
                         <div className="flex gap-3 mb-3">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs">📖</div>
                             <div className="flex-1 space-y-2">
                                 <div className="w-32 h-2.5 bg-slate-100 rounded"></div>
                                 <div className="w-24 h-2 bg-slate-50 rounded"></div>
                             </div>
                         </div>
                         <div className="space-y-2 mt-4">
                             <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded">
                                 <div className="w-6 h-6 rounded bg-indigo-100"></div>
                                 <div className="flex-1 h-2 bg-indigo-200/50 rounded"></div>
                             </div>
                             <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                                 <div className="w-6 h-6 rounded bg-purple-100"></div>
                                 <div className="flex-1 h-2 bg-purple-200/50 rounded"></div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Feature 2: Events & Calendar - Small */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col hover:border-purple-200 transition-colors relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-2xl" aria-hidden="true">📅</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Event Manager</h3>
                    <p className="text-xs text-slate-500 mt-auto leading-relaxed">
                        Discover campus events, manage RSVPs, and never miss club meetings. Your complete social calendar.
                    </p>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-purple-50 rounded-tl-3xl opacity-50"></div>
                </div>

                {/* Feature 3: Career Network - Small */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col hover:border-blue-200 transition-colors relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-2xl" aria-hidden="true">💼</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Career Network</h3>
                    <p className="text-xs text-slate-500 mt-auto leading-relaxed">
                        Connect with alumni, explore internships, and access career services for your future success.
                    </p>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-blue-50 rounded-tl-3xl opacity-50"></div>
                </div>

                {/* Feature 4: Student Profiles - Medium */}
                <div className="md:col-span-2 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-100 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group hover:border-pink-300 transition-colors">
                    <div className="relative z-10 max-w-md">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                            <span className="text-2xl" aria-hidden="true">👥</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Verified Student Profiles</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Showcase your identity with custom bios, majors, achievements, and portfolio links. Build your personal brand in a safe, verified community.
                        </p>
                    </div>
                    <div className="flex gap-3 mt-6 md:mt-0 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 shadow-lg"></div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 shadow-lg -ml-4"></div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg -ml-4"></div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/30 blur-3xl rounded-full" aria-hidden="true"></div>
                </div>

                {/* Feature 5: Achievements - Small */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col hover:border-amber-200 transition-colors relative overflow-hidden group">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-2xl" aria-hidden="true">🏆</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Track Achievements</h3>
                    <p className="text-xs text-slate-500 mt-auto leading-relaxed">
                        Earn badges, track milestones, and get recognized for your campus contributions.
                    </p>
                    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-amber-50 rounded-tl-3xl opacity-50"></div>
                </div>

                {/* Feature 6: Real-time Updates - Wide */}
              <div className="md:col-span-3 bg-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
  <div className="relative z-10 max-w-lg">
    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
      <Icon
        icon="lucide:zap"
        className="w-6 h-6 text-white"
      />
    </div>

    <h3 className="text-xl font-semibold text-white mb-2">
      Lightning Fast & Secure
    </h3>

    <p className="text-sm text-slate-300 leading-relaxed">
      Real-time notifications for everything that matters – from study group updates to campus emergency alerts.
      Built with modern technology for instant, secure communication.
    </p>
  </div>

  <div className="flex gap-4 mt-6 md:mt-0 relative z-10">
    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
        <Icon
          icon="lucide:shield-check"
          className="w-7 h-7 text-green-400"
        />
      </div>
      <span className="text-xs text-slate-400">Secure</span>
    </div>

    <div className="flex flex-col items-center gap-2">
      <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
        <Icon
          icon="lucide:rocket"
          className="w-7 h-7 text-blue-400"
        />
      </div>
      <span className="text-xs text-slate-400">Fast</span>
    </div>
  </div>

  {/* Decorative gradient */}
  <div
    className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-3xl rounded-full"
    aria-hidden="true"
  />
</div>

            </div>
        </div>
    </section>
  )
}

export default BentoGrid