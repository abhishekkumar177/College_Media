import React from 'react'
import { useNavigate } from 'react-router-dom';

const HomeCTA = () => {
  const navigate = useNavigate();
  return (
    <>
    <section id="community" className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Loved by students</h2>
                    <p className="mt-2 text-slate-500">Join the fastest growing network across 50+ campuses.</p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button className="p-2 rounded-full border border-slate-200 hover:bg-white transition-colors">
                        <span className="iconify" data-icon="lucide:arrow-left" data-width="20"></span>
                    </button>
                    <button className="p-2 rounded-full border border-slate-200 hover:bg-white transition-colors">
                        <span className="iconify" data-icon="lucide:arrow-right" data-width="20"></span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* <!-- Testimonial 1 --> */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex gap-1 text-yellow-400 mb-4">
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-6">"Finally a social app that doesn't feel cluttered. I found my study group here in the first week of classNamees!"</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"></div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Alex Thompson</div>
                            <div className="text-xs text-slate-400">Stanford '25</div>
                        </div>
                    </div>
                </div>

                {/* <!-- Testimonial 2 --> */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <div className="flex gap-1 text-yellow-400 mb-4">
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-6">"The UI is gorgeous and it's so fast. I love that it's just for our campus, makes it feel much safer."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-rose-300"></div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">Jessica Lee</div>
                            <div className="text-xs text-slate-400">NYU '24</div>
                        </div>
                    </div>
                </div>

                {/* <!-- Testimonial 3 --> */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                     <div className="flex gap-1 text-yellow-400 mb-4">
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                        <span className="iconify" data-icon="lucide:star" data-width="16" data-fill="currentColor"></span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-6">"College Media changed how our clubs organize events. The notifications are super reliable."</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-300"></div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">David Chen</div>
                            <div className="text-xs text-slate-400">MIT '26</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- Final CTA --> */}
    <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden text-center py-20 px-6">
            {/* <!-- Gradient Background --> */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">Your Campus. Your Community.<br/>Your Media.</h2>
                <p className="text-purple-100 text-lg mb-10 max-w-xl mx-auto">Join the exclusive network for your college today. Free for all students with a valid .edu email.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => navigate('/home')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-purple-600 font-semibold hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                        Get Started Now
                    </button>
                    <span className="text-sm font-medium text-white/80">Free • Fast • Student-first</span>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default HomeCTA