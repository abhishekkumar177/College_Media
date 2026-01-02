import React from 'react'

const KeyHiglight = () => {
  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Why Students Choose College Media</h2>
                <p className="mt-4 text-slate-500">Everything you need to stay connected, built with the latest tech.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* <!-- Card 1 --> */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                        <span className="iconify text-indigo-600" data-icon="lucide:zap" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Lightning Fast</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Powered by Vite and React 19 for instant page loads and buttery smooth interactions.</p>
                </div>

                {/* <!-- Card 2 --> */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors">
                        <span className="iconify text-pink-600" data-icon="lucide:heart-handshake" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Community First</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Exclusive to your college email. Verified students only. No bots, no noise.</p>
                </div>

                {/* <!-- Card 3 --> */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <span className="iconify text-purple-600" data-icon="lucide:palette" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Modern Gradient UI</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">A visual treat designed for Gen-Z aesthetics with dark mode support built-in.</p>
                </div>

                {/* <!-- Card 4 --> */}
                <div className="group p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <span className="iconify text-blue-600" data-icon="lucide:smartphone" data-width="24" data-stroke-width="1.5"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Mobile Optimized</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Responsive design that feels like a native app on any device you use.</p>
                </div>
            </div>
        </div>
    </section>
  )
}

export default KeyHiglight