import { useState, useEffect } from 'react';
import { Search, Briefcase, MapPin, GraduationCap, MessageCircle, Star, Users, TrendingUp, Award, Loader2, Plus } from 'lucide-react';
import { searchAlumni, sendConnectionRequest, getAlumniStats, getAlumniProfile } from '../services/alumniService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import CreateAlumniProfileModal from '../components/CreateAlumniProfileModal';
import AlumniProfileViewModal from '../components/AlumniProfileViewModal';

const AlumniConnect = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [alumni, setAlumni] = useState([]);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    mentorsAvailable: 0,
    hiringAlumni: 0
  });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userHasProfile, setUserHasProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  // Fetch alumni data on component mount
  useEffect(() => {
    loadAlumniData();
    loadStats();
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      setCheckingProfile(true);
      const response = await getAlumniProfile();
      if (response.success && response.data) {
        setUserHasProfile(true);
        setMyProfile(response.data);
      }
    } catch (error) {
      // 404 means no profile exists, which is fine
      if (error.response?.status === 404) {
        setUserHasProfile(false);
        setMyProfile(null);
      }
    } finally {
      setCheckingProfile(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedFilter !== 'all') {
        loadAlumniData();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilter]);

  const loadAlumniData = async () => {
    try {
      setLoading(true);
      const filters = {
        page: 1,
        limit: 20
      };

      if (selectedFilter === 'available') {
        filters.mentorshipAvailable = true;
      }

      if (searchQuery) {
        // Use company search as primary search
        filters.company = searchQuery;
      }

      const response = await searchAlumni(filters);
      
      // Filter out the current user's own profile from results
      const filteredAlumni = (response.data || []).filter(
        alumni => alumni.user?._id !== user?.id
      );
      
      setAlumni(filteredAlumni);
    } catch (error) {
      console.error('Error loading alumni:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Please login to view alumni profiles');
        // Don't show data but don't redirect
      } else {
        toast.error('Failed to load alumni profiles');
      }
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getAlumniStats();
      if (response.success) {
        setStats({
          totalAlumni: response.data.totalAlumni,
          mentorsAvailable: response.data.mentorsAvailable,
          hiringAlumni: response.data.hiringAlumni
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleConnect = async (alumniId, alumniName) => {
    try {
      setConnecting(prev => ({ ...prev, [alumniId]: true }));
      
      const recipientUserId = alumni.find(a => a._id === alumniId)?.user?._id;
      
      if (!recipientUserId) {
        toast.error('Unable to find user information');
        return;
      }

      await sendConnectionRequest(recipientUserId, `Hi ${alumniName}! I'd love to connect and learn from your experience.`);
      
      toast.success(`Connection request sent to ${alumniName}!`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      
      // Handle specific error codes
      if (error.response?.data?.code === 'NO_REQUESTER_PROFILE') {
        toast.error('Please create your alumni profile first before connecting with others', { duration: 4000 });
        setShowCreateModal(true); // Open create modal
      } else if (error.response?.data?.code === 'NO_RECIPIENT_PROFILE') {
        toast.error('This user has not created their alumni profile yet');
      } else if (error.response?.data?.message === 'Cannot connect with yourself') {
        toast.error('This is your own profile');
      } else if (error.response?.data?.message?.includes('already exists')) {
        toast.error('You are already connected or have a pending request');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to send connection request';
        toast.error(errorMessage);
      }
    } finally {
      setConnecting(prev => ({ ...prev, [alumniId]: false }));
    }
  };

  const handleViewProfile = (alumni) => {
    setSelectedAlumni(alumni);
    setShowProfileModal(true);
  };

  const handleViewMyProfile = () => {
    if (myProfile) {
      setSelectedAlumni(myProfile);
      setShowProfileModal(true);
    } else {
      toast.error('Please create your alumni profile first');
    }
  };

  const handleOpenCreateModal = () => {
    if (userHasProfile) {
      toast.error('You already have an alumni profile. You can edit it from your profile settings.');
      return;
    }
    setShowCreateModal(true);
  };

  const statsDisplay = [
    { 
      icon: Users, 
      label: 'Total Alumni', 
      value: stats.totalAlumni > 0 ? `${stats.totalAlumni.toLocaleString()}` : 'Loading...', 
      color: 'text-blue-600 dark:text-blue-400' 
    },
    { 
      icon: TrendingUp, 
      label: 'Active Mentors', 
      value: stats.mentorsAvailable > 0 ? `${stats.mentorsAvailable}` : 'Loading...', 
      color: 'text-green-600 dark:text-green-400' 
    },
    { 
      icon: Award, 
      label: 'Willing to Hire', 
      value: stats.hiringAlumni > 0 ? `${stats.hiringAlumni}` : 'Loading...', 
      color: 'text-purple-600 dark:text-purple-400' 
    }
  ];

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  const getProfilePicture = (alumni) => {
    if (alumni.user?.profilePicture) {
      return alumni.user.profilePicture;
    }
    const name = alumni.user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=4F46E5&color=fff&bold=true`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-sm border border-blue-200 dark:border-gray-600 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">Alumni Connect</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Connect with successful alumni, get mentorship, and accelerate your career</p>
          </div>
          {user && userHasProfile && !checkingProfile && (
            <button
              onClick={handleViewMyProfile}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              View My Profile
            </button>
          )}
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsDisplay.map((stat, index) => {
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading alumni...</span>
        </div>
      )}

      {/* Alumni Grid */}
      {!loading && alumni.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person) => (
            <div
              key={person._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
            >
            {/* Header with Image and Status */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={getProfilePicture(person)}
                  alt={person.user?.name || 'Alumni'}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{person.user?.name || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    Class of {person.graduationYear}
                  </p>
                </div>
              </div>
              {person.mentorshipAvailable && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Mentor
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{person.currentPosition || 'Position not specified'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{person.currentCompany || 'Company not specified'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{formatLocation(person.location)}</p>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-900 dark:text-white font-medium">{person.major} • {person.degree}</p>
              </div>
            </div>

            {/* Expertise Tags */}
            {person.skills && person.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {person.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {skill}
                  </span>
                ))}
                {person.skills.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    +{person.skills.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleConnect(person._id, person.user?.name)}
                disabled={connecting[person._id]}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connecting[person._id] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                Connect
              </button>
              <button 
                onClick={() => handleViewProfile(person)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Profile
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* No Results */}
      {!loading && alumni.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedFilter !== 'all' ? 'No alumni found' : 'No Alumni Profiles Yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to create your alumni profile and connect with fellow graduates!'}
          </p>
          {user && (
            <button 
              onClick={handleOpenCreateModal}
              disabled={checkingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              {checkingProfile ? 'Loading...' : userHasProfile ? 'View My Profile' : 'Create Alumni Profile'}
            </button>
          )}
        </div>
      )}

      {/* Create Alumni Profile Modal */}
      <CreateAlumniProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadAlumniData();
          loadStats();
          checkUserProfile();
          setShowCreateModal(false);
        }}
      />

      {/* View Alumni Profile Modal */}
      <AlumniProfileViewModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedAlumni(null);
        }}
        alumni={selectedAlumni}
      />
    </div>
  );
};

export default AlumniConnect;