import React from 'react'

const KeyHiglight = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Why Students Choose College Media</h2>
                <p className="mt-4 text-slate-500 dark:text-slate-300">Everything you need to stay connected, built with the latest tech.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* <!-- Card 1 --> */}
                <div className="group p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800 transition-colors">
                        <span className="iconify text-indigo-600 dark:text-indigo-100" data-icon="lucide:zap" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Lightning Fast</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">Powered by Vite and React 19 for instant page loads and buttery smooth interactions.</p>
                </div>

                {/* <!-- Card 2 --> */}
                <div className="group p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-pink-50 dark:bg-pink-900/40 flex items-center justify-center mb-4 group-hover:bg-pink-100 dark:group-hover:bg-pink-800 transition-colors">
                        <span className="iconify text-pink-600 dark:text-pink-200" data-icon="lucide:heart-handshake" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Community First</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">Exclusive to your college email. Verified students only. No bots, no noise.</p>
                </div>

                {/* <!-- Card 3 --> */}
                <div className="group p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-800 transition-colors">
                        <span className="iconify text-purple-600 dark:text-purple-200" data-icon="lucide:palette" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Modern Gradient UI</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">A visual treat designed for Gen-Z aesthetics with dark mode support built-in.</p>
                </div>

                {/* <!-- Card 4 --> */}
                <div className="group p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                        <span className="iconify text-blue-600 dark:text-blue-200" data-icon="lucide:smartphone" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Mobile Optimized</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">Responsive design that feels like a native app on any device you use.</p>
                </div>
            </div>
        </div>
    </section>
  )
}

export default KeyHiglight