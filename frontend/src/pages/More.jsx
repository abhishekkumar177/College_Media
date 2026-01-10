import React from 'react';
import { menuSections } from '../data/menuSection.jsx';

const More = () => {

  return (
    <div className="space-y-6">
      {/* More Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">More</h1>
        <p className="text-gray-600 dark:text-gray-400">Explore additional features and settings</p>
      </div>

      {/* Menu Sections */}
      {menuSections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
              >
                <div className="text-indigo-600 dark:text-indigo-400">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{item.label}</p>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* App Info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">CollegeMedia Version 1.0.0</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs">© 2026 CollegeMedia. All rights reserved.</p>
      </div>
    </div>
  );
};

export default More;
