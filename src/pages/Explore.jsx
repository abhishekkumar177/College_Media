import React, { useState } from 'react';
import RisingStudent from '../components/RisingStudent';
import SeniorAndAlumini from '../components/SeniorAndAlumini';
import CrossCollegeDiscoveris from '../components/CrossCollegeDiscoveris';
import CampusTrending from '../components/CampusTrending';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'events', label: 'Events' },
    { id: 'groups', label: 'Groups' },
    { id: 'pages', label: 'Pages' },
  ];

  const exploreItems = [
    {
      id: 1,
      type: 'event',
      title: 'Tech Talk: AI in Education',
      description: 'Join us for an insightful discussion on artificial intelligence',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      date: 'Jan 15, 2026',
      interested: 234,
    },
    {
      id: 2,
      type: 'group',
      title: 'Photography Club',
      description: 'Share your passion for photography with fellow students',
      image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop',
      members: '1.2K',
    },
    {
      id: 3,
      type: 'page',
      title: 'Campus News',
      description: 'Stay updated with the latest campus announcements',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
      followers: '5.4K',
    },
    {
      id: 4,
      type: 'event',
      title: 'Music Fest 2026',
      description: 'Annual college music festival featuring local bands',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
      date: 'Feb 20, 2026',
      interested: 892,
    },
  ];

  const filteredItems = activeTab === 'all' 
    ? exploreItems 
    : exploreItems.filter(item => item.type === activeTab.slice(0, -1));

  return (
    <div className="space-y-6">
      {/* Explore Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Explore</h1>
        <p className="text-gray-600 dark:text-gray-400">Discover events, groups, and pages in your college</p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                activeTab === category.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </div>
   
      {/* Explore Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold uppercase">
                  {item.type}
                </span>
                {item.date && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {item.date}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{item.description}</p>
              <div className="flex items-center justify-between">
                {item.interested && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.interested} interested</span>
                )}
                {item.members && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.members} members</span>
                )}
                {item.followers && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.followers} followers</span>
                )}
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors duration-200">
                  {item.type === 'event' ? 'Interested' : item.type === 'group' ? 'Join' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CampusTrending/>
      <RisingStudent/>
      <SeniorAndAlumini/>
      <CrossCollegeDiscoveris/>
    </div>
  );
};

export default Explore;
