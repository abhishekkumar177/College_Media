import { Icon } from '@iconify/react'


const SeniorAndAlumini = () => {
  return (
      <div className="grid md:grid-cols-2 gap-8 px-4 md:px-6">
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Icon 
  icon="lucide:graduation-cap" 
  width="20" 
  className="text-slate-400" 
/>
                     <h2 className="text-lg font-semibold tracking-tight text-slate-900">From Seniors &amp; Alumni</h2>
                </div>
                
                <div className="space-y-3">
                    {/* <!-- Post Card 1 --> */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-indigo-100 transition">
                        <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                             <div>
                                 <p className="text-xs font-semibold text-slate-900">James L. <span className="text-slate-400 font-normal">• Alumni '22</span></p>
                                 <p className="text-[10px] text-slate-500">Software Engineer @ Google</p>
                             </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-800 mb-2">How I cracked the off-campus placement interviews</h3>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">Here is a comprehensive guide on the resources I used for DSA and System Design...</p>
                        <button className="text-xs font-medium text-indigo-600 hover:underline">Read Article</button>
                    </div>

                    {/* <!-- Post Card 2 --> */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:border-indigo-100 transition">
                        <div className="flex items-center gap-3 mb-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                             <div>
                                 <p className="text-xs font-semibold text-slate-900">Maria G. <span className="text-slate-400 font-normal">• Final Year</span></p>
                                 <p className="text-[10px] text-slate-500">Mech Eng.</p>
                             </div>
                        </div>
                        <h3 className="text-sm font-medium text-slate-800 mb-2">Mistakes to avoid in your first year of engineering</h3>
                        <button className="text-xs font-medium text-indigo-600 hover:underline">Read Article</button>
                    </div>
                </div>
            </section>
              <section>
                <div class="flex items-center gap-2 mb-4">
                    <span class="iconify text-slate-400" data-icon="lucide:calendar" width="20"></span>
                    <h2 class="text-lg font-semibold tracking-tight text-slate-900">Campus Life</h2>
               </div>
               
               <div class="space-y-3">
                    {/* <!-- Event Card 1 --> */}
                    <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex gap-4 items-center">
                        <div class="flex-shrink-0 w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 border border-indigo-100">
                            <span class="text-[10px] uppercase font-bold tracking-wide">Oct</span>
                            <span class="text-lg font-bold leading-none">24</span>
                        </div>
                        <div class="flex-grow">
                            <div class="flex justify-between items-start">
                                <h3 class="text-sm font-semibold text-slate-900">Debate Club Orientations</h3>
                                <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">5:00 PM</span>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">Main Auditorium • Open to all</p>
                        </div>
                        <button class="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition">
                            <span class="iconify" data-icon="lucide:chevron-right" width="16"></span>
                        </button>
                    </div>

                    {/* <!-- Event Card 2 --> */}
                    <div class="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex gap-4 items-center">
                        <div class="flex-shrink-0 w-14 h-14 bg-pink-50 rounded-xl flex flex-col items-center justify-center text-pink-600 border border-pink-100">
                            <span class="text-[10px] uppercase font-bold tracking-wide">Oct</span>
                            <span class="text-lg font-bold leading-none">28</span>
                        </div>
                        <div class="flex-grow">
                            <div class="flex justify-between items-start">
                                <h3 class="text-sm font-semibold text-slate-900">Music Society Jam</h3>
                                <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">7:00 PM</span>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">Student Center • Entry Free</p>
                        </div>
                        <button class="h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition">
                            <span class="iconify" data-icon="lucide:chevron-right" width="16"></span>
                        </button>
                    </div>
               </div>
            </section>
            </div>

  )
}

export default SeniorAndAlumini