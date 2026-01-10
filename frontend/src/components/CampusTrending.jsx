import React from 'react';
import { Icon } from '@iconify/react';

const CampusTrending = () => {
  return (
    <section className="py-6 border-b border-slate-100 dark:border-slate-700">
      <div className="px-4 md:px-6 mb-4 flex items-center gap-2">
        {/* Replaced span with Icon component */}
        <Icon 
          icon="lucide:flame" 
          className="text-orange-500" 
          width="18" 
          style={{ strokeWidth: 1.5 }} 
        />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Campus Trending</h2>
      </div>
      
      <div className="flex overflow-x-auto gap-3 px-4 md:px-6 no-scrollbar snap-x">
        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white dark:bg-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 border border-slate-200/60 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-white dark:group-hover:bg-indigo-900/50 transition-colors">
              <Icon icon="lucide:hash" width="16" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
              <Icon icon="lucide:trending-up" className="mr-0.5" width="12" /> 12%
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-400">Internships</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">45 new posts</p>
        </button>

        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white dark:bg-slate-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 border border-slate-200/60 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-700 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-white dark:group-hover:bg-purple-900/50 transition-colors">
              <Icon icon="lucide:code-2" width="16" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
              <Icon icon="lucide:trending-up" className="mr-0.5" width="12" /> 24%
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-purple-700 dark:group-hover:text-purple-400">Hackathon</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upcoming events</p>
        </button>

        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 border border-slate-200/60 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-white dark:group-hover:bg-blue-900/50 transition-colors">
              <Icon icon="lucide:book-open" width="16" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
              Stable
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400">Exam Prep</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notes &amp; Tips</p>
        </button>

        {/* */}
        <button className="snap-start min-w-[160px] text-left group bg-white dark:bg-slate-800 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 border border-slate-200/60 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-700 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start mb-2">
            <div className="h-8 w-8 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 group-hover:bg-white dark:group-hover:bg-pink-900/50 transition-colors">
              <Icon icon="lucide:music" width="16" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
              <Icon icon="lucide:trending-up" className="mr-0.5" width="12" /> 8%
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-pink-700 dark:group-hover:text-pink-400">Cultural Fest</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Buzzing now</p>
        </button>
      </div>
    </section>
  );
};

export default CampusTrending;