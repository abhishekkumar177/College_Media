

import { useNavigate } from 'react-router-dom';


/**
 * Hero Component
 * 
 * Main hero section for the landing page with UniHub branding
 * Emphasizes UniHub as a centralized platform for everything college
 * Features:
 * - Animated background effects
 * - Compelling headline about centralized platform
 * - Call-to-action buttons
 * - Interactive UI mockup
 * - Proper heading hierarchy for accessibility
 * 
 * @component
 * @returns {React.ReactElement} Hero section with branding and CTA
 */
const Hero = () => {
    const navigate = useNavigate();
    return (
        <section 
            id="main-content"
            className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden"
            aria-label="Hero section"
        >
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" aria-hidden="true"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" aria-hidden="true"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" aria-hidden="true"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 mb-8 hover:border-purple-200 transition-colors cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Now live on 50+ Campuses
                </div>

                {/* Main Heading - H1 for proper hierarchy */}
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
                    Your Centralized Hub for <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Everything College</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
                    Beyond social media - UniHub brings together academics, events, career opportunities, and campus connections all in one powerful platform designed for students.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <button 
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
                        aria-label="Join UniHub and connect with your campus"
                    >
                        Join Your Campus
                        <span aria-hidden="true">→</span>
                    </button>
                    <button 
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-slate-700 border border-slate-200 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                        aria-label="Watch UniHub demo video"
                    >
                        <span aria-hidden="true">▶</span>
                        View Demo
                    </button>
                </div>

                {/* UI Mockup */}
                <div className="relative max-w-5xl mx-auto perspective-1000">
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden transform rotate-x-12 hover:rotate-0 transition-transform duration-700 ease-out p-1">
                        {/* Browser Bar */}
                        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                            <div className="flex gap-1.5" aria-hidden="true">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="mx-auto bg-white border border-slate-200 rounded-md px-3 py-1 text-[10px] text-slate-400 font-medium w-64 text-center">
                                unihub.app
                            </div>
                        </div>

                        {/* App Interface */}
                        <div className="flex h-[500px] bg-slate-50 text-left">
                            {/* Sidebar */}
                            <div className="w-64 bg-white border-r border-slate-100 hidden md:flex flex-col p-4 gap-1">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-600">
                                    <span aria-hidden="true">🏠</span>
                                    <span className="text-sm font-medium">Feed</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-500 hover:bg-slate-50">
                                    <span aria-hidden="true">👥</span>
                                    <span className="text-sm font-medium">Classmates</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg text-slate-500 hover:bg-slate-50">
                                    <span aria-hidden="true">🔔</span>
                                    <span className="text-sm font-medium">Notifications</span>
                                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">3</span>
                                </div>
                                <div className="mt-8 text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Trending</div>
                                <div className="flex items-center gap-3 p-3 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500" aria-hidden="true"></span>
                                    <span className="text-sm">#FinalsWeek</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-pink-500" aria-hidden="true"></span>
                                    <span className="text-sm">#CampusFest</span>
                                </div>
                            </div>

                            {/* Main Feed */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Stories */}
                                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                    <div className="flex flex-col items-center gap-2 min-w-[70px]">
                                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-purple-600">
                                            <div className="w-full h-full rounded-full bg-slate-100 border-2 border-white"></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">Add Story</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 min-w-[70px]">
                                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-purple-600">
                                            <div className="w-full h-full rounded-full bg-slate-200 border-2 border-white"></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">Sarah K.</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 min-w-[70px]">
                                        <div className="w-16 h-16 rounded-full p-[2px] bg-slate-200">
                                            <div className="w-full h-full rounded-full bg-slate-200 border-2 border-white"></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-600">Design Club</span>
                                    </div>
                                </div>

                                {/* <!-- Create Post --> */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
                                    <div className="flex gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                                        <input type="text" placeholder="What's happening on campus?" className="w-full bg-slate-50 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-purple-200" />
                                    </div>
                                    <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                                        <div className="flex gap-4 text-slate-400">
                                            <span className="hover:text-purple-500 cursor-pointer">🖼️</span>
                                            <span className="hover:text-purple-500 cursor-pointer">📍</span>
                                            <span className="hover:text-purple-500 cursor-pointer">😊</span>
                                        </div>
                                        <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium">Post</button>
                                    </div>
                                </div>

                                {/* <!-- Feed Post --> */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">JD</div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">John Doe</div>
                                                <div className="text-xs text-slate-400">Computer Science • 2h ago</div>
                                            </div>
                                        </div>
                                        <span>⋯</span>
                                    </div>
                                    <div className="px-4 pb-3">
                                        <p className="text-sm text-slate-700 leading-relaxed">Just finished the hackathon project! The new campus library setup is amazing for late-night coding sessions. 🚀💻</p>
                                    </div>
                                    <div className="h-48 bg-gradient-to-br from-indigo-50 to-blue-50 w-full flex items-center justify-center">
                                        <span className="text-6xl">🖼️</span>
                                    </div>
                                    <div className="p-4 flex items-center justify-between border-t border-slate-50">
                                        <div className="flex gap-6">
                                            <button className="flex items-center gap-2 text-slate-500 hover:text-pink-500 transition-colors">
                                                <span>❤️</span>
                                                <span className="text-xs font-medium">248</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-slate-500 hover:text-purple-500 transition-colors">
                                                <span>💬</span>
                                                <span className="text-xs font-medium">12</span>
                                            </button>
                                        </div>
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <span>↗️</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* <!-- Right Sidebar (Messages) --> */}
                            <div className="w-64 bg-white border-l border-slate-100 hidden lg:block p-4">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Online ClassNamemates</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-pink-100"></div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="text-sm font-medium text-slate-700">Emily Chen</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="text-sm font-medium text-slate-700">Marcus J.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero