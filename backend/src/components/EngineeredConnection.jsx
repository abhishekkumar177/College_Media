const EngineeredConnection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-slate-50 py-24 selection:bg-purple-100 selection:text-purple-900">
      <style>{`
        :root {
          --loop-duration: 12s;
        }

        .anim-intro {
          animation: introFade var(--loop-duration) linear infinite;
        }
        @keyframes introFade {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          6%, 90% { opacity: 1; transform: translateY(0) scale(1); }
          95%, 100% { opacity: 0; transform: translateY(0) scale(1); }
        }

        .anim-card-left {
          animation: cardLeftEnter var(--loop-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
        @keyframes cardLeftEnter {
          0%, 6% { opacity: 0; transform: translateX(-50px); }
          15%, 90% { opacity: 1; transform: translateX(0); }
          95%, 100% { opacity: 0; transform: translateX(0); }
        }

        .anim-post-1 {
          animation: postReveal var(--loop-duration) ease-out infinite;
          animation-delay: 0s; /* Built into keyframe percentages for sync */
        }
        .anim-post-2 {
          animation: postReveal var(--loop-duration) ease-out infinite;
        }
        
        @keyframes postReveal {
          0%, 15% { opacity: 0; transform: translateY(20px); }
          20%, 90% { opacity: 1; transform: translateY(0); }
          95%, 100% { opacity: 0; }
        }

        .anim-like-burst {
          animation: likeBurst var(--loop-duration) ease-out infinite;
        }
        @keyframes likeBurst {
          0%, 25% { transform: scale(1); color: #94a3b8; } /* slate-400 */
          28% { transform: scale(1.3); color: #ef4444; } /* red-500 */
          31%, 90% { transform: scale(1); color: #ef4444; }
          100% { transform: scale(1); color: #94a3b8; }
        }

        .anim-card-top-right {
          animation: cardPulse var(--loop-duration) ease-in-out infinite;
        }
        @keyframes cardPulse {
          0%, 30% { transform: scale(1); }
          35% { transform: scale(1.02); }
          40%, 100% { transform: scale(1); }
        }

        .anim-toast {
          animation: toastSlide var(--loop-duration) cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        @keyframes toastSlide {
          0%, 33% { opacity: 0; transform: translateY(10px); }
          38% { opacity: 1; transform: translateY(0); }
          48%, 100% { opacity: 0; transform: translateY(-10px); }
        }

        .anim-cursor {
          animation: cursorMove var(--loop-duration) ease-in-out infinite;
        }
        @keyframes cursorMove {
          0%, 40% { opacity: 0; transform: translate(20px, 40px); }
          42% { opacity: 1; transform: translate(20px, 40px); }
          50% { transform: translate(-10px, -10px); } /* Tap position */
          52% { transform: translate(-10px, -10px) scale(0.9); } /* Press */
          54% { transform: translate(-10px, -10px) scale(1); } /* Release */
          65% { opacity: 1; }
          70%, 100% { opacity: 0; transform: translate(-10px, -10px); }
        }

        .anim-comment-box {
          animation: commentType var(--loop-duration) steps(20, end) infinite;
        }
        @keyframes commentType {
          0%, 55% { width: 0; opacity: 1; }
          65%, 90% { width: 100%; opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <div className="anim-intro mb-16 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">connection</span>
          </h2>
          <div className="sr-only">Live feed updates and real-time alerts</div>
          
          <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-100/50 to-purple-100/50 blur-3xl" aria-hidden="true" />
        </div>

        <div className="anim-intro mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          
          <div className="anim-card-left lg:col-span-7 relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 ring-1 ring-slate-200/50">
            <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Campus Feed</h3>
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
              </div>
            </div>

            <div className="anim-post-1 mb-4 space-y-4 rounded-xl bg-slate-50/50 p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-sm" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-24 rounded bg-slate-200" />
                  <div className="h-2 w-16 rounded bg-slate-100" />
                </div>
              </div>
              <div className="space-y-2">
                 <div className="h-2 w-full rounded bg-slate-200/60" />
                 <div className="h-2 w-3/4 rounded bg-slate-200/60" />
              </div>
              <div className="h-32 w-full rounded-lg bg-slate-200/50 animate-pulse" />
              
              <div className="flex items-center gap-4 pt-2">
                <div className="anim-like-burst flex items-center gap-1.5 transition-colors duration-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <span className="text-xs font-medium">24</span>
                </div>
              </div>
            </div>

            <div className="anim-post-2 rounded-xl bg-slate-50/50 p-4 border border-slate-100" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                <div className="h-2.5 w-20 rounded bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                  <span>Library Study Group</span>
                  <div className="h-3 w-3 rounded-full border-2 border-indigo-500 bg-indigo-500" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-xs text-slate-400">
                  <span>Coffee Shop Meetup</span>
                  <div className="h-3 w-3 rounded-full border-2 border-slate-300" />
                </div>
              </div>
            </div>

            <div className="anim-cursor pointer-events-none absolute bottom-1/3 right-1/4 z-20">
              <div className="h-6 w-6 rounded-full bg-slate-900/20 backdrop-blur-sm ring-1 ring-white/50" />
              <svg className="absolute -top-1 -left-1 h-8 w-8 text-slate-900 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M9 21.5L17.5 13 13 21.5 9 21.5z M9 21.5l2-8.5L9 21.5z" stroke="white" strokeWidth="2" /></svg>
              <div className="absolute left-6 top-0 w-32 overflow-hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg">
                <div className="anim-comment-box overflow-hidden">See you at 5pm! 🚀</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="anim-card-top-right relative flex-1 overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Student Profiles</h3>
                <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">View All</span>
              </div>
              <div className="flex -space-x-3 overflow-hidden py-2 pl-1">
                <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-gradient-to-br from-purple-400 to-pink-400" />
                <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-gradient-to-br from-yellow-400 to-orange-400" />
                <div className="inline-block h-12 w-12 rounded-full ring-2 ring-white bg-gradient-to-br from-cyan-400 to-blue-400" />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 ring-2 ring-white text-xs font-medium text-slate-500">
                  +42
                </div>
              </div>
            </div>

            <div className="relative flex-1 overflow-visible rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-6 shadow-xl shadow-indigo-500/10 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Real-time Alerts</h3>
                  <p className="text-xs text-slate-400 mt-1">Instant campus notifications</p>
                </div>
                <div className="relative h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </div>
              </div>
              
              <div className="anim-toast absolute -right-4 -bottom-4 w-64 rounded-lg bg-white p-3 shadow-2xl border border-slate-100 text-slate-900 flex items-center gap-3 z-30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Campus Alert</p>
                  <p className="text-[10px] text-slate-500">West Hall maintenance update</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeredConnection;