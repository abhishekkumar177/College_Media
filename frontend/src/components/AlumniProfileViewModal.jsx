import { X, GraduationCap, Briefcase, MapPin, Award, Calendar, Linkedin, Twitter, Github, Globe, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { sendConnectionRequest } from '../services/alumniService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AlumniProfileViewModal = ({ isOpen, onClose, alumni }) => {
  const { user } = useAuth();
  const [connecting, setConnecting] = useState(false);

  if (!isOpen || !alumni) return null;

  // Check if viewing own profile
  const isOwnProfile = alumni.user?._id === user?.id;

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  };

  const getProfilePicture = () => {
    if (alumni.user?.profilePicture) {
      return alumni.user.profilePicture;
    }
    const name = alumni.user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=4F46E5&color=fff&bold=true`;
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      
      const recipientUserId = alumni.user?._id;
      
      if (!recipientUserId) {
        toast.error('Unable to find user information');
        return;
      }

      await sendConnectionRequest(recipientUserId, `Hi ${alumni.user?.name}! I'd love to connect and learn from your experience.`);
      
      toast.success(`Connection request sent to ${alumni.user?.name}!`);
      onClose();
    } catch (error) {
      console.error('Error sending connection request:', error);
      
      if (error.response?.data?.code === 'NO_REQUESTER_PROFILE') {
        toast.error('Please create your alumni profile first before connecting with others', { duration: 4000 });
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
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Cover and Profile Picture */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl"></div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Profile Picture and Name */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16">
              <img
                src={getProfilePicture()}
                alt={alumni.user?.name || 'Alumni'}
                className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 object-cover shadow-lg"
              />
              
              <div className="flex-1 md:mb-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {alumni.user?.name || 'Anonymous'}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      {alumni.currentPosition || 'Position not specified'} 
                      {alumni.currentCompany && ` at ${alumni.currentCompany}`}
                    </p>
                  </div>
                  
                  {isOwnProfile ? (
                    <button
                      onClick={() => toast.info('Edit profile functionality coming soon!')}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      <Award className="w-5 h-5" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      disabled={connecting}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      
                      
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {alumni.mentorshipAvailable && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Available for Mentorship
                </span>
              )}
              {alumni.willingToHire && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                  <Briefcase className="w-4 h-4" />
                  Willing to Hire
                </span>
              )}
              {alumni.lookingForOpportunities && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                  Looking for Opportunities
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Graduation Year</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{alumni.graduationYear}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Degree</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{alumni.degree}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatLocation(alumni.location)}</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          {alumni.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{alumni.bio}</p>
            </div>
          )}

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="font-semibold text-gray-900 dark:text-white">{alumni.degree} in {alumni.major}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Class of {alumni.graduationYear}</p>
            </div>
          </div>

          {/* Current Work */}
          {(alumni.currentCompany || alumni.currentPosition) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Current Position
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="font-semibold text-gray-900 dark:text-white">{alumni.currentPosition}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{alumni.currentCompany}</p>
                {alumni.industry && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Industry: {alumni.industry}</p>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {alumni.skills && alumni.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {alumni.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mentorship Areas */}
          {alumni.mentorshipAvailable && alumni.mentorshipAreas && alumni.mentorshipAreas.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Mentorship Areas</h3>
              <div className="flex flex-wrap gap-2">
                {alumni.mentorshipAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {alumni.achievements && alumni.achievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </h3>
              <ul className="space-y-2">
                {alumni.achievements.map((achievement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {(alumni.socialMedia?.linkedin || alumni.socialMedia?.twitter || alumni.socialMedia?.github || alumni.socialMedia?.website) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connect Online</h3>
              <div className="flex flex-wrap gap-3">
                {alumni.socialMedia?.linkedin && (
                  <a
                    href={alumni.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                )}
                {alumni.socialMedia?.twitter && (
                  <a
                    href={alumni.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    Twitter
                  </a>
                )}
                {alumni.socialMedia?.github && (
                  <a
                    href={alumni.socialMedia.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                )}
                {alumni.socialMedia?.website && (
                  <a
                    href={alumni.socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileViewModal;
