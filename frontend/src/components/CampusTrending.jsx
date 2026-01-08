import React from 'react';
import { Icon } from '@iconify/react';

const CampusTrending = () => {
  return (
    <section className="py-6 border-b border-slate-100">
      <div className="px-4 md:px-6 mb-4 flex items-center gap-2">
        {/* Replaced span with Icon component */}
        <Icon 
          icon="lucide:flame" 
          className="text-orange-500" 
          width="18" 
          style={{ strokeWidth: 1.5 }} 
        />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Campus Trending</h2>
      </div>
      
      <div className="flex overflow-x-auto gap-3 px-4 md:px-6 no-scrollbar snap-x">
        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white hover:bg-indigo-50/50 border border-slate-200/60 hover:border-indigo-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-white transition-colors">
              <Icon icon="lucide:hash" width="16" />
            </div>
            <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <Icon icon="lucide:trending-up" className="mr-0.5" width="12" /> 12%
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700">Internships</h3>
          <p className="text-xs text-slate-500 mt-1">45 new posts</p>
        </button>

        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white hover:bg-purple-50/50 border border-slate-200/60 hover:border-purple-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-white transition-colors">
              <Icon icon="lucide:code-2" width="16" />
            </div>
            <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <Icon icon="lucide:trending-up" className="mr-0.5" width="12" /> 24%
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-purple-700">Hackathon</h3>
          <p className="text-xs text-slate-500 mt-1">Upcoming events</p>
        </button>

        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white hover:bg-blue-50/50 border border-slate-200/60 hover:border-blue-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-white transition-colors">
              <Icon icon="lucide:book-open" width="16" />
            </div>
            <span className="text-xs font-medium text-slate-500 flex items-center bg-slate-100 px-1.5 py-0.5 rounded-full">
              Stable
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700">Exam Prep</h3>
          <p className="text-xs text-slate-500 mt-1">Notes &amp; Tips</p>
        </button>

        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white hover:bg-pink-50/50 border border-slate-200/60 hover:border-pink-200 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 group-hover:bg-white transition-colors">
              <Icon icon="lucide:music" width="16" />
            </div>
            <span className="text-xs font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-full">
              <Icon icon="lucide:trending-up" className="mr-0.5" width="12" /> 8%
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-pink-700">Cultural Fest</h3>
          <p className="text-xs text-slate-500 mt-1">Buzzing now</p>
        </button>
      </div>
    </section>
  );
};

export default CampusTrending;