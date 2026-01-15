import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const FeatureCard = ({ title, description, to, colorClass, icon }) => (
  <Link 
    to={to} 
    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorClass} border border-gray-100 dark:border-gray-800`}
  >
    <div className="relative z-10 flex flex-col h-full">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-100 transition-colors">
        {description}
      </p>
    </div>
    <div className="absolute inset-0 z-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 from-blue-600 to-indigo-600" />
  </Link>
);

const ExploreHub = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar /> 
      
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-5xl">
            Explore Campus Life
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Connect, Learn, and Grow. Everything you need in one place.
          </p>
        </header>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
            Social & Connect
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard 
              title="Social Feed" 
              description="See what's happening on campus right now. Posts, updates, and more."
              to="/feed" 
              icon="📱"
              colorClass="bg-white dark:bg-gray-800"
            />
            <FeatureCard 
              title="Stories" 
              description="Share your moments and view daily updates from friends."
              to="/stories" 
              icon="⚡"
              colorClass="bg-white dark:bg-gray-800"
            />
             <FeatureCard 
              title="Reels" 
              description="Watch and share short, entertaining video clips."
              to="/reels" 
              icon="🎬"
              colorClass="bg-white dark:bg-gray-800"
            />
            <FeatureCard 
              title="Messages" 
              description="Chat with peers, study buddies, and groups."
              to="/messages" 
              icon="💬"
              colorClass="bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200 border-b pb-2 border-gray-200 dark:border-gray-700">
            Academic & Growth
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              title="Course Discovery" 
              description="Find resources, syllabus details, and instructor info."
              to="/courses" 
              icon="📚"
              colorClass="bg-white dark:bg-gray-800"
            />
            <FeatureCard 
              title="Study Room" 
              description="Join virtual rooms to focus and collaborate with others."
              to="/study-room" 
              icon="💻"
              colorClass="bg-white dark:bg-gray-800"
            />
            <FeatureCard 
              title="Gamified Assessment" 
              description="Test your skills and earn badges in a fun way."
              to="/assessments" 
              icon="🎮"
              colorClass="bg-white dark:bg-gray-800"
            />
             <FeatureCard 
              title="Alumni Connect" 
              description="Network with seniors and get career guidance."
              to="/alumni" 
              icon="🎓"
              colorClass="bg-white dark:bg-gray-800"
            />
            <FeatureCard 
              title="Resume Builder" 
              description="Create a professional resume with our AI tools."
              to="/resume-builder" 
              icon="📄"
              colorClass="bg-white dark:bg-gray-800"
            />
            <FeatureCard 
              title="Study Buddy" 
              description="Find the perfect partner for your study sessions."
              to="/study-buddy" 
              icon="🤝"
              colorClass="bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExploreHub;