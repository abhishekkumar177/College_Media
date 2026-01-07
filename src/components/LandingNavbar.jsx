

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LandingNavbar Component
 * 
 * Navigation bar for the landing page with UniHub branding
 * Features:
 * - UniHub logo and branding
 * - Navigation links with aria-labels for accessibility
 * - Authentication buttons (Log in / Join)
 * - Responsive design with mobile support
 * 
 * @component
 * @returns {React.ReactElement} Landing page navigation bar
 */
const LandingNavbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    return (
        <nav 
            className="fixed w-full z-50 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-slate-100/50"
            aria-label="Main navigation"
            role="navigation"
        >
            {/* Skip to main content link for keyboard navigation */}
            <a 
                href="#main-content" 
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
            >
                Skip to main content
            </a>

            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo and Brand */}
                <a 
                    href="/" 
                    className="flex items-center gap-2 cursor-pointer group"
                    aria-label="UniHub - Home"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-500/25 transition-all">
                        🎓
                    </div>
                    <span className="text-lg font-semibold tracking-tighter text-slate-900">UniHub</span>
                </a>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8" role="menubar">
                    <a 
                        href="#features" 
                        className="text-sm font-medium hover:text-purple-600 transition-colors"
                        aria-label="View features"
                        role="menuitem"
                    >
                        Features
                    </a>
                    <a 
                        href="#how-it-works" 
                        className="text-sm font-medium hover:text-purple-600 transition-colors"
                        aria-label="Learn how it works"
                        role="menuitem"
                    >
                        How it Works
                    </a>
                    <a 
                        href="#community" 
                        className="text-sm font-medium hover:text-purple-600 transition-colors"
                        aria-label="Join our community"
                        role="menuitem"
                    >
                        Community
                    </a>
                    <button 
                        onClick={() => navigate('/messages')} 
                        className="text-sm font-medium hover:text-purple-600 transition-colors"
                        aria-label="View messages"
                        role="menuitem"
                    >
                        Messages
                    </button>
                </div>

                {/* Authentication Buttons */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button 
                                onClick={() => navigate('/home')} 
                                className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors"
                            >
                                Dashboard
                            </button>
                            <button 
                                onClick={logout}
                                className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95"
                                aria-label="Logout from UniHub"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => navigate('/login')} 
                                className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-purple-600 transition-colors"
                                aria-label="Log in to UniHub"
                            >
                                Log in
                            </button>
                            <button 
                                onClick={() => navigate('/signup')} 
                                className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95"
                                aria-label="Join UniHub now"
                            >
                                Join UniHub
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default LandingNavbar