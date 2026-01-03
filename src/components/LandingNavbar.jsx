
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingNavbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    
    return (
        <nav className="fixed w-full z-50 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-slate-100/50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:shadow-purple-500/25 transition-all">
                        ⚡
                    </div>
                    <span className="text-lg font-semibold tracking-tighter text-slate-900">CollegeMedia</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium hover:text-purple-600 transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm font-medium hover:text-purple-600 transition-colors">How it Works</a>
                    <a href="#community" className="text-sm font-medium hover:text-purple-600 transition-colors">Community</a>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <button 
                                onClick={() => navigate('/profile')} 
                                className="hidden md:block text-sm font-medium hover:text-purple-600 transition-colors"
                            >
                                Profile
                            </button>
                            <button 
                                onClick={logout}
                                className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="hidden md:block text-sm font-medium hover:text-purple-600 transition-colors">Log in</button>
                            <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95">
                                Join Campus
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default LandingNavbar