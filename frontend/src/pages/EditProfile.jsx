import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, token, updateUserProfile, uploadProfilePicture } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    website: '',
    email: '',
    phone: '',
    gender: '',
    isPrivate: false,
    showActivityStatus: true,
  });

  const [profileImage, setProfileImage] = useState('https://placehold.co/200x200/4F46E5/FFFFFF?text=U');

  // Populate form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        website: user.website || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        isPrivate: user.isPrivate || false,
        showActivityStatus: user.showActivityStatus !== false,
      });
      
      if (user.profilePicture) {
        setProfileImage(user.profilePicture);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Use AuthContext's uploadProfilePicture if available
      if (uploadProfilePicture) {
        const result = await uploadProfilePicture(imageFile);
        
        if (result.success) {
          setMessage('Profile picture updated successfully!');
          setImageFile(null);
          if (result.data?.profilePicture) {
            setProfileImage(result.data.profilePicture);
          }
        } else {
          setError(result.message || 'Failed to upload image');
        }
      } else {
        // Fallback to direct API call
        const formDataToSend = new FormData();
        formDataToSend.append('profilePicture', imageFile);

        const response = await fetch('http://localhost:5000/api/users/profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token || localStorage.getItem('token')}`
          },
          body: formDataToSend
        });

        const data = await response.json();

        if (data.success) {
          setMessage('Profile picture updated successfully!');
          setImageFile(null);
          if (data.data?.profilePicture) {
            setProfileImage(data.data.profilePicture);
          }
        } else {
          setError(data.message || 'Failed to upload image');
        }
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users/profile-picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfileImage('https://placehold.co/200x200/4F46E5/FFFFFF?text=U');
        setMessage('Profile picture removed successfully!');
      } else {
        setError(data.message || 'Failed to remove image');
      }
    } catch (err) {
      setError('Failed to remove image. Please try again.');
      console.error('Remove error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Use AuthContext's updateUserProfile if available
      if (updateUserProfile) {
        const result = await updateUserProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          isPrivate: formData.isPrivate,
          showActivityStatus: formData.showActivityStatus,
        });
        
        if (result.success) {
          setMessage('Profile updated successfully!');
          setTimeout(() => {
            navigate('/profile');
          }, 1500);
        } else {
          throw new Error(result.message || 'Failed to update profile');
        }
      } else {
        // Fallback to direct API calls
        const authToken = token || localStorage.getItem('token');
        
        // Update basic profile info
        const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            bio: formData.bio
          })
        });

        const profileData = await profileResponse.json();

        if (!profileData.success) {
          throw new Error(profileData.message || 'Failed to update profile');
        }

        // Update settings
        const settingsResponse = await fetch('http://localhost:5000/api/users/profile/settings', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            isPrivate: formData.isPrivate,
            notificationSettings: {
              email: true,
              push: true,
              likes: true,
              comments: true,
              follows: true
            }
          })
        });

        const settingsData = await settingsResponse.json();

        if (settingsData.success) {
          setMessage('Profile updated successfully!');
          setTimeout(() => {
            navigate('/profile');
          }, 1500);
        } else {
          throw new Error(settingsData.message || 'Failed to update settings');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Icon icon="mdi:arrow-left" className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
          </div>
          <Link
            to="/profile"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Icon icon="mdi:close" className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
          <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 dark:text-green-300 text-sm">{message}</p>
        </div>
      )}
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
              />
              {imageFile && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Icon icon="mdi:check" className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Profile Photo</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">JPG, PNG or GIF. Max size 5MB</p>
              <div className="flex flex-wrap gap-3">
                <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 cursor-pointer inline-flex items-center gap-2">
                  <Icon icon="mdi:upload" className="w-5 h-5" />
                  Choose Photo
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon icon="mdi:check" className="w-5 h-5" />
                    {loading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={loading}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="mdi:delete" className="w-5 h-5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Icon icon="mdi:account" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                placeholder="Enter your username"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Icon icon="mdi:information" className="w-3 h-3" />
                Username cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-none transition-all"
                placeholder="Tell us about yourself"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {formData.bio.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <div className="relative">
                <Icon icon="mdi:web" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Icon icon="mdi:email" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Icon icon="mdi:email-outline" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Icon icon="mdi:phone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Icon icon="mdi:shield-lock" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Privacy Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Private Account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Only approved followers can see your posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Activity Status</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Show when you're active</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="showActivityStatus"
                  checked={formData.showActivityStatus}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="mdi:content-save" className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
          <Link
            to="/profile"
            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;