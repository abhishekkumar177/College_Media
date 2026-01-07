import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🔹 HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 HANDLE LOGIN SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // 🔴 NEW: Handle close button click
  const handleClose = () => {
    navigate(-1); // Go back to previous page
    // या navigate('/'); // Home page पर जाने के लिए
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-xl relative">
        
        {/* 🔴 NEW: Close Button (X) - WITHOUT EXTERNAL LIBRARY */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 group"
          aria-label="Close login form"
          title="Close"
        >
          {/* Using HTML entity for X icon */}
          <span className="text-xl text-gray-500 group-hover:text-gray-700 font-semibold transition-colors">
            ×
          </span>
          
          {/* Alternative: Using SVG for better control */}
          {/* <svg 
            className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg> */}
        </button>

        {/* HEADER */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* EMAIL FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            {/* 🔴 UPDATED: Password input with toggle */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />

              {/* 🔴 NEW: Toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-600 font-medium hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
          >
            {loading ? 'Signing In...' : 'Log In'}
          </button>
        </form>

        {/* SIGNUP LINK */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-purple-600 hover:text-purple-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1 transition-colors"
          >
            Sign up
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;