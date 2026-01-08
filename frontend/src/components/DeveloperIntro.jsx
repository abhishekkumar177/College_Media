const DeveloperIntro = () => {
  return (
    <section className="relative pt-20 pb-8 lg:pt-32 lg:pb-16 bg-slate-900 dark:bg-slate-950 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        {/* Greeting Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 mb-8 hover:border-purple-500/50 transition-colors">
          <span className="text-slate-300 dark:text-slate-400">Hello! I Am</span>
          <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-bold text-sm">Abhishek !!</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-100 mb-6 max-w-4xl mx-auto leading-[1.1]">
          Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Amazing Digital</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Experiences</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-300 dark:text-slate-400 max-w-2xl mx-auto mb-4 font-medium">
          A passionate developer who <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-semibold">Judges a project by its user experience</span>...
        </p>

        {/* Quote */}
        <p className="text-base md:text-lg text-slate-400 dark:text-slate-500 max-w-2xl mx-auto mb-12 italic font-light">
          Because if the experience doesn't impress you, what else can?
        </p>

        {/* Role Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 active:scale-95">
            Full Stack Developer
          </button>
          <button className="px-8 py-3 rounded-full bg-transparent text-slate-300 border-2 border-slate-600 font-semibold hover:border-slate-400 hover:text-slate-200 transition-all active:scale-95 dark:border-slate-700 dark:hover:border-slate-500">
            UI/UX Enthusiast
          </button>
          <button className="px-8 py-3 rounded-full bg-transparent text-yellow-400 border-2 border-yellow-400 font-semibold hover:bg-yellow-400/10 transition-all active:scale-95">
            Open Source
          </button>
        </div>
      </div>
    </section>
  )
}

export default DeveloperIntro
