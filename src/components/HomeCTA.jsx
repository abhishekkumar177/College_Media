/**
 * HomeCTA Component
 * 
 * Call-to-action section highlighting UniHub's platform versatility
 * Features testimonials and final conversion section
 * Emphasizes multi-purpose nature: academics, social, events, career
 * 
 * @component
 * @returns {React.ReactElement} CTA section with testimonials
 */
import { Icon } from '@iconify/react';
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
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Loved by students everywhere
        </h2>
        <p className="mt-2 text-slate-500">
          Join the fastest growing centralized platform across 50+ campuses.
        </p>
      </div>

      <div className="flex gap-2 mt-4 md:mt-0">
        <button
          className="p-2 rounded-full border border-slate-200 hover:bg-white transition-colors"
          aria-label="Previous testimonial"
        >
          <Icon icon="lucide:arrow-left" className="w-5 h-5 text-slate-600" />
        </button>

        <button
          className="p-2 rounded-full border border-slate-200 hover:bg-white transition-colors"
          aria-label="Next testimonial"
        >
          <Icon icon="lucide:arrow-right" className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Testimonial Card */}
      {[
        {
          text:
            "UniHub isn't just social media - I found my study group, discovered research opportunities, and stay updated on campus events all in one place!",
          name: "Alex Thompson",
          meta: "Stanford '25",
          gradient: "from-blue-400 to-cyan-300",
        },
        {
          text:
            "Found my internship through UniHub connections! The platform makes networking with alumni and career services so much easier than juggling multiple apps.",
          name: "Jessica Lee",
          meta: "NYU '24",
          gradient: "from-pink-400 to-rose-300",
        },
        {
          text:
            "UniHub transformed how our clubs organize events and track achievements. Everything we need - scheduling, RSVPs, and member recognition - in one seamless platform.",
          name: "David Chen",
          meta: "MIT '26",
          gradient: "from-purple-400 to-indigo-300",
        },
      ].map((item, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div
            className="flex gap-1 text-yellow-400 mb-4"
            aria-label="5 star rating"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon
                key={i}
                icon="lucide:star"
                className="w-4 h-4 fill-current"
              />
            ))}
          </div>

          <p className="text-slate-700 text-sm leading-relaxed mb-6">
            “{item.text}”
          </p>

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-r ${item.gradient}`}
            />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {item.name}
              </div>
              <div className="text-xs text-slate-400">{item.meta}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


    {/* Final CTA - Platform Versatility */}
    <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden text-center py-20 px-6">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            
            <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
                    Your Campus.<br/>
                    Your Community.<br/>
                    Your Centralized Hub.
                </h2>
                <p className="text-purple-100 text-lg mb-10 max-w-xl mx-auto">
                    Join UniHub and experience the all-in-one platform for academics, social connections, events, career opportunities, and achievements. Free for all students with a valid .edu email.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                    <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-purple-600 font-semibold hover:bg-slate-50 transition-all shadow-xl active:scale-95">Login
                        </button>
                    <button 
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-purple-600 font-semibold hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                        aria-label="Get started with UniHub now"
                    >
                        Get Started Now
                    </button>
                    <span className="text-sm font-medium text-white/80">Free • Comprehensive • Student-first</span>
                </div>
            </div>
        </div>
    </section>
    </>
  )
}

export default HomeCTA