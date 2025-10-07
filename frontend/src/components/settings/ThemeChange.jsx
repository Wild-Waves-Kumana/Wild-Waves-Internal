import React, { useState } from "react";

const ThemeChange = () => {
  const [theme, setTheme] = useState("light");

  const handleSelectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  return (
    <div className="m-2">
      <h3 className="text-lg font-medium text-slate-800 mb-4">
        Theme Settings
      </h3>
      <div className="flex flex-col space-y-3">
        {/* Light Theme */}
        <button
          className={`flex items-center p-3 rounded-md cursor-pointer transition ${
            theme === "light"
              ? "bg-blue-300 text-white shadow-lg"
              : "bg-slate-200 text-gray-800"
          }`}
          onClick={() => handleSelectTheme("light")}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
              theme === "light" ? "bg-white border-blue-500" : "border-gray-500"
            }`}
          >
            {theme === "light" && (
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            )}
          </div>
          Light
        </button>

        {/* Dark Theme */}
        <button
          className={`flex items-center p-3 rounded-md cursor-pointer transition ${
            theme === "dark"
              ? "bg-slate-800 text-white shadow-lg"
              : "bg-slate-300 text-gray-800"
          }`}
          onClick={() => handleSelectTheme("dark")}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
              theme === "dark" ? "bg-white border-blue-500" : "border-gray-500"
            }`}
          >
            {theme === "dark" && (
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            )}
          </div>
          Dark
        </button>
      </div>
      <div className="mt-6 text-center text-gray-600">
        {theme === "dark"
          ? "Dark theme is selected."
          : "Light theme is selected."}
      </div>
    </div>
  );
};

export default ThemeChange;