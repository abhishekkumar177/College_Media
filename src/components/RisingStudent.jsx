import { Icon } from '@iconify/react';

const RisingStudent = () => {
  return (
    <section className="py-8 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Icon 
            icon="lucide:rocket" 
            width="20" 
            className="text-purple-500" 
            style={{ strokeWidth: 1.5 }}
          />
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Rising Students</h2>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
          
          <div className="min-w-[240px] md:min-w-[220px] lg:min-w-0 lg:flex-1 snap-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 p-0.5 mb-3">
              <div className="w-full h-full rounded-full bg-white border-2 border-transparent"></div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Alex Chen</h3>
            <p className="text-xs text-slate-500 mb-2">CS • Year 3</p>
            <p className="text-xs text-slate-600 mb-4 line-clamp-1">Building open source tools for...</p>
            <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-full transition-colors w-full">Follow</button>
          </div>

          {/* */}
          <div className="min-w-[240px] md:min-w-[220px] lg:min-w-0 lg:flex-1 snap-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-300 via-cyan-300 to-emerald-400 p-0.5 mb-3">
              <div className="w-full h-full rounded-full bg-white border-2 border-transparent"></div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Sarah Miller</h3>
            <p className="text-xs text-slate-500 mb-2">Design • Year 4</p>
            <p className="text-xs text-slate-600 mb-4 line-clamp-1">UI/UX Designer @ Startup</p>
            <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-full transition-colors w-full">Follow</button>
          </div>

          {/* */}
          <div className="min-w-[240px] md:min-w-[220px] lg:min-w-0 lg:flex-1 snap-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-400 p-0.5 mb-3">
              <div className="w-full h-full rounded-full bg-white border-2 border-transparent"></div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">David Kim</h3>
            <p className="text-xs text-slate-500 mb-2">MBA • Year 1</p>
            <p className="text-xs text-slate-600 mb-4 line-clamp-1">Finance enthusiast &amp; writer</p>
            <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-full transition-colors w-full">Follow</button>
          </div>
       <div className="min-w-[240px] md:min-w-[220px] lg:min-w-0 lg:flex-1 snap-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-300 via-gray-300 to-zinc-400 p-0.5 mb-3">
              <div className="w-full h-full rounded-full bg-white border-2 border-transparent"></div>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Priya Patel</h3>
            <p className="text-xs text-slate-500 mb-2">EE • Year 2</p>
            <p className="text-xs text-slate-600 mb-4 line-clamp-1">Robotics Club Lead</p>
            <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-1.5 rounded-full transition-colors w-full">Follow</button>
          </div>

        </div>
      </div>
    </section>
  )
}

export default RisingStudent;