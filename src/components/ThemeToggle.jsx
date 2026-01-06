import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-full transition-all duration-300 ease-in-out
        hover:bg-coral-50 dark:hover:bg-slate-800
        focus:outline-none focus:ring-2 focus:ring-coral-500/50
        ${className}
      `}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon (Show when Light) */}
        <div
          className={`absolute inset-0 transform transition-all duration-500 ${
            isDarkMode 
              ? 'rotate-90 opacity-0 scale-50' 
              : 'rotate-0 opacity-100 scale-100'
          }`}
        >
          <FiSun className="w-5 h-5 text-gray-700 hover:text-coral-500 transition-colors" />
        </div>

        {/* Moon Icon (Show when Dark) */}
        <div
          className={`absolute inset-0 transform transition-all duration-500 ${
            isDarkMode 
              ? 'rotate-0 opacity-100 scale-100' 
              : '-rotate-90 opacity-0 scale-50'
          }`}
        >
          <FiMoon className="w-5 h-5 text-gray-200 hover:text-coral-300 transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;