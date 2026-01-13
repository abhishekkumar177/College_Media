import React from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const OAuthButtons = ({ isRegister = false }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleGithubLogin = () => {
        window.location.href = `${API_URL}/auth/github`;
    };

    return (
        <div className="flex flex-col gap-3 w-full mt-4">
            <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">Or continue with</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
            >
                <FaGoogle className="text-red-500" />
                <span>{isRegister ? 'Sign up' : 'Sign in'} with Google</span>
            </button>

            <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#24292F] hover:bg-[#24292F]/90 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
            >
                <FaGithub />
                <span>{isRegister ? 'Sign up' : 'Sign in'} with GitHub</span>
            </button>
        </div>
    );
};

export default OAuthButtons;
