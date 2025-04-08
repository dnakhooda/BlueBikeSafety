import { useTheme } from "@/context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

const Navigation = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <header
      className={`${
        isDarkMode ? "bg-gray-800 shadow-md" : "bg-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src="/images/icon.png"
                alt="Blue Bike Safety"
                className="h-10 w-10"
              />
            </div>
            <div className="ml-4">
              <h1
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Blue Bike Safety
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Find safe biking routes in Boston
              </p>
            </div>
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all ${
              isDarkMode
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <FiSun className="h-7 w-7 text-[#FFA41B]" />
            ) : (
              <FiMoon className="h-7 w-7 text-[#7e8bed]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
