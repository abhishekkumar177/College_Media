import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa"; // Cross icon के लिए import

const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔴 NEW: state for password toggle
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await register(formData);

    if (result.success) {
      navigate("/home");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  // Cross button click handler
  const handleClose = () => {
    navigate("/"); // Home page पर navigate करेगा
    // या navigate(-1) से previous page पर जा सकते हैं
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900 p-4 relative transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl relative transition-colors duration-300">
        {/* 🔴 NEW: Cross Button - Top Right Corner */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200"
          aria-label="Close"
          type="button"
        >
          <FaTimes className="text-lg" />
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Join College Media
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Create your account to get started
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="Choose a username"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="your@email.com"
            />
          </div>

          {/* FIRST NAME */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="First name"
            />
          </div>

          {/* LAST NAME */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="Last name"
            />
          </div>

          {/* 🔴 UPDATED: PASSWORD FIELD WITH TOGGLE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} // 🔴 UPDATED
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                placeholder="Create a password"
              />

              {/* 🔴 NEW: Show / Hide button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-600 font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
