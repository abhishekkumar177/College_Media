/**
 * KeyHighlight Component
 * 
 * Showcase UniHub's key features and platform versatility
 * Highlights: Academic Resources, Social Connections, Event Management,
 * Career Opportunities, and Achievements & Recognition
 * 
 * @component
 * @returns {React.ReactElement} Feature highlight section
 */
import React from 'react'

const KeyHiglight = () => {
  return (
    <section id="features" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                    Everything You Need in One Place
                </h2>
                <p className="mt-4 text-lg text-slate-500">
                    UniHub is more than social media - it's your centralized platform for college success
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Academic Resources */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                        <span className="text-2xl" aria-hidden="true">📚</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Academic Resources</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Access study groups, course materials, tutoring services, and academic calendars. Connect with peers in your classes and collaborate on projects.
                    </p>
                </div>

                {/* Social Connections */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
                        <span className="text-2xl" aria-hidden="true">👥</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Social Connections</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Build meaningful relationships with classmates, join clubs and organizations, and expand your campus network in a verified, student-only environment.
                    </p>
                </div>

                {/* Event Management */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <span className="text-2xl" aria-hidden="true">📅</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Event Management</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Discover campus events, manage RSVPs, organize club activities, and never miss important dates. All your campus happenings in one calendar.
                    </p>
                </div>

                {/* Career Opportunities */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <span className="text-2xl" aria-hidden="true">💼</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Career Opportunities</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Connect with alumni, explore internships, access career services, and network with professionals. Your path to success starts here.
                    </p>
                </div>

                {/* Achievements & Recognition */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                        <span className="text-2xl" aria-hidden="true">🏆</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Achievements & Recognition</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Showcase your accomplishments, earn badges, track milestones, and get recognized for your contributions to the campus community.
                    </p>
                </div>

                {/* Lightning Fast Performance */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                        <span className="iconify text-green-600" data-icon="lucide:zap" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Lightning Fast</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Built with modern technology for instant page loads and smooth interactions. Experience the speed of next-generation web apps.
                    </p>
                </div>
            </div>
        </div>
    </section>
  )
}

export default KeyHiglight