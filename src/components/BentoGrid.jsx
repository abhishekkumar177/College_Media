import React from 'react'

const BentoGrid = () => {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-60"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-12 text-center">Engineered for connection</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                
                {/* <!-- Feature 1: Large --> */}
                <div className="md:col-span-2 row-span-1 md:row-span-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-100 flex flex-col justify-between overflow-hidden group hover:border-slate-300 transition-colors relative">
                    <div className="z-10">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                            <span className="iconify text-slate-900" data-icon="lucide:layout-dashboard" data-width="20"></span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Rich Interactive Feed</h3>
                        <p className="text-sm text-slate-500 max-w-sm">Share photos, videos, polls, and events. Our feed algorithm prioritizes your close friends and important campus updates.</p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-white rounded-tl-2xl shadow-lg translate-y-4 translate-x-4 border border-slate-100 p-4 transition-transform group-hover:translate-x-2 group-hover:translate-y-2">
                         {/* <!-- Visual abstraction of feed --> */}
                         <div className="flex gap-3 mb-4">
                             <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                             <div className="flex-1 space-y-2">
                                 <div className="w-24 h-2 bg-slate-100 rounded"></div>
                                 <div className="w-full h-24 bg-slate-50 rounded border border-slate-100"></div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* <!-- Feature 2: Small --> */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col hover:border-purple-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                        <span className="iconify text-purple-600" data-icon="lucide:user-circle" data-width="20"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Student Profiles</h3>
                    <p className="text-xs text-slate-500 mt-auto">Custom bios, majors, and portfolio links to showcase your student identity.</p>
                </div>

                {/* <!-- Feature 3: Small --> */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col hover:border-pink-200 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                        <span className="iconify text-pink-600" data-icon="lucide:bell" data-width="20"></span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Real-time Alerts</h3>
                    <p className="text-xs text-slate-500 mt-auto">Instant notifications for likes, comments, and campus emergency alerts.</p>
                </div>

                {/* <!-- Feature 4: Wide Low --> */}
                <div className="md:col-span-3 bg-slate-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                    <div className="relative z-10 max-w-lg">
                        <h3 className="text-xl font-semibold text-white mb-2">Dark Mode Included</h3>
                        <p className="text-sm text-slate-400">Late night study session? Switch to our carefully crafted dark theme that's easy on the eyes and saves battery.</p>
                    </div>
                    <div className="flex gap-4 mt-6 md:mt-0 relative z-10">
                        <button className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white hover:bg-slate-700 transition-colors">
                            <span className="iconify" data-icon="lucide:moon" data-width="20"></span>
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <span className="iconify" data-icon="lucide:sun" data-width="20"></span>
                        </button>
                    </div>
                    {/* <!-- Decorative gradient --> */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full"></div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default BentoGrid