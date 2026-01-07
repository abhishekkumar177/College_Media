import { Icon } from '@iconify/react'
import React from 'react'

const CrossCollegeDiscoveris = () => {
  return (
     <section className="mt-12 mx-4 md:mx-6 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-white to-indigo-50/50 border border-slate-200 relative overflow-hidden">
            {/* <!-- Decorative BG element --> */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="relative z-10">
                <div className="mb-6 max-w-lg">
                    <div className="flex items-center gap-2 mb-2">
                         <span className="iconify text-indigo-500" data-icon="lucide:globe-2" width="20"></span>
                         <h2 className="text-lg font-semibold tracking-tight text-slate-900">Cross-College Discoveries</h2>
                    </div>
                    <p className="text-sm text-slate-500">See what students are building at other top universities.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* <!-- Discovery Card 1 --> */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Project</span>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">MIT</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">EcoSense IoT</h3>
                        <p className="text-xs text-slate-500 mb-3">Smart waste management system using LoRaWAN.</p>
                        <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                             </div>
                             <span className="text-[10px] text-slate-400">+2 others</span>
                        </div>
                    </div>

                    {/* <!-- Discovery Card 2 --> */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">Competition</span>
                             <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Stanford</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">HealthAI Challenge</h3>
                        <p className="text-xs text-slate-500 mb-3">Looking for remote teammates for global finals.</p>
                        <button className="text-xs font-medium text-indigo-600 border border-indigo-100 bg-indigo-50 px-3 py-1 rounded-lg">View Team</button>
                    </div>

                     {/* <!-- Discovery Card 3 --> */}
                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-center items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                            <Icon
                            className='w-20'
                            icon='arrow-right'
                            />
                        </div>
                        <p className="text-xs font-medium text-slate-600">Browse Global Projects</p>
                    </div>
                </div>
            </div>
        </section>
  )
}

export default CrossCollegeDiscoveris