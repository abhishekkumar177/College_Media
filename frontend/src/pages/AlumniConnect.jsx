import { useState } from 'react';
import { Search, Briefcase, MapPin, GraduationCap, MessageCircle, Star, Users, TrendingUp, Award } from 'lucide-react';

const AlumniConnect = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock alumni data
  const alumni = [
    {
      id: 1,
      name: 'Priya Sharma',
      graduationYear: '2020',
      degree: 'Computer Science',
      company: 'Google',
      position: 'Senior Software Engineer',
      location: 'Mountain View, CA',
      profilePicture: 'https://ui-avatars.com/api/?name=Priya+Sharma&size=200&background=4F46E5&color=fff&bold=true',
      expertise: ['Web Development', 'Cloud Computing', 'AI/ML'],
      isAvailable: true,
      rating: 4.8,
      mentees: 12
    },
    {
      id: 2,
      name: 'Arjun Patel',
      graduationYear: '2019',
      degree: 'Business Administration',
      company: 'McKinsey & Company',
      position: 'Management Consultant',
      location: 'New York, NY',
      profilePicture: 'https://ui-avatars.com/api/?name=Arjun+Patel&size=200&background=7C3AED&color=fff&bold=true',
      expertise: ['Strategy', 'Business Analysis', 'Leadership'],
      isAvailable: true,
      rating: 4.9,
      mentees: 18
    },
    {
      id: 3,
      name: 'Ananya Reddy',
      graduationYear: '2018',
      degree: 'Data Science',
      company: 'Amazon',
      position: 'Data Science Manager',
      location: 'Seattle, WA',
      profilePicture: 'https://ui-avatars.com/api/?name=Ananya+Reddy&size=200&background=EC4899&color=fff&bold=true',
      expertise: ['Data Analysis', 'Machine Learning', 'Python'],
      isAvailable: false,
      rating: 4.7,
      mentees: 15
    },
    {
      id: 4,
      name: 'Rohan Kumar',
      graduationYear: '2021',
      degree: 'Mechanical Engineering',
      company: 'Tesla',
      position: 'Product Engineer',
      location: 'Austin, TX',
      profilePicture: 'https://ui-avatars.com/api/?name=Rohan+Kumar&size=200&background=F59E0B&color=fff&bold=true',
      expertise: ['Product Design', 'Manufacturing', 'Innovation'],
      isAvailable: true,
      rating: 4.6,
      mentees: 8
    },
    {
      id: 5,
      name: 'Neha Gupta',
      graduationYear: '2017',
      degree: 'Marketing',
      company: 'Apple',
      position: 'Product Marketing Lead',
      location: 'Cupertino, CA',
      profilePicture: 'https://ui-avatars.com/api/?name=Neha+Gupta&size=200&background=10B981&color=fff&bold=true',
      expertise: ['Digital Marketing', 'Brand Strategy', 'Growth'],
      isAvailable: true,
      rating: 4.9,
      mentees: 22
    },
    {
      id: 6,
      name: 'Vikram Singh',
      graduationYear: '2016',
      degree: 'Finance',
      company: 'Goldman Sachs',
      position: 'Investment Banker',
      location: 'London, UK',
      profilePicture: 'https://ui-avatars.com/api/?name=Vikram+Singh&size=200&background=EF4444&color=fff&bold=true',
      expertise: ['Investment Banking', 'Financial Analysis', 'M&A'],
      isAvailable: false,
      rating: 4.8,
      mentees: 10
    }
  ];

  const stats = [
    { icon: Users, label: 'Total Alumni', value: '2,500+', color: 'text-blue-600 dark:text-blue-400' },
    { icon: TrendingUp, label: 'Active Mentors', value: '420', color: 'text-green-600 dark:text-green-400' },
    { icon: Award, label: 'Success Stories', value: '1,200+', color: 'text-purple-600 dark:text-purple-400' }
  ];

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                          (selectedFilter === 'available' && person.isAvailable);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-sm border border-blue-200 dark:border-gray-600 p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">Alumni Connect</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Connect with successful alumni, get mentorship, and accelerate your career</p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, company, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Alumni
            </button>
            <button
              onClick={() => setSelectedFilter('available')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedFilter === 'available'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Available Now
            </button>
          </div>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlumni.map((person) => (
          <div
            key={person.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
          >
            {/* Header with Image and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={person.profilePicture}
                  alt={person.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{person.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Class of {person.graduationYear}
                  </p>
                </div>
              </div>
              {person.isAvailable && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Available
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{person.position}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{person.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{person.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <p className="text-sm text-gray-900 dark:text-white font-medium">{person.rating} • {person.mentees} mentees</p>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {person.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Connect
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredAlumni.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No alumni found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AlumniConnect;