import React, { useState } from "react";
import { GoChevronRight } from "react-icons/go";
import Sidebar from "../components/Sidebar";
import ThemeChange from "../components/settings/ThemeChange";
import LanguageSettings from "../components/settings/LanguageSettings";
import AppInformation from "../components/settings/AppInformation";
import Aboutus from "../components/settings/Aboutus";
import EmagencyContacts from "../components/settings/EmagencyContacts";

const Settings = () => {
  const [activeSection, setActiveSection] = useState('theme');

  const renderActiveComponent = () => {
    switch (activeSection) {
      case 'theme':
        return <ThemeChange />;
      case 'emergency-contacts':
        return <EmagencyContacts />;
      case 'language':
        return <LanguageSettings />;
      case 'app-info':
        return <AppInformation />;
      case 'about-us':
        return <Aboutus />;
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        
          <h2 className="text-xl font-semibold text-gray-800">
            Settings
          </h2>
          <div className="mt-6 grid grid-cols-3 gap-2 flex-1 h-full">
            {/* Left Column: Settings Panel (1/3) */}
            <div className="col-span-1 ">
              <div className="p-4 bg-white rounded-lg shadow">
                <nav className="flex min-w-[240px] flex-col gap-1 p-1.5 mt-3">
                  {[
                    {
                      id: "theme",
                      label: "Theme",
                    },
                    {
                      id: "language",
                      label: "Language",
                    },
                    {
                      id: "app-info",
                      label: "App Information",
                    },
                    {
                      id: "emergency-contacts",
                      label: "Emergency Contact",
                    },
                    {
                      id: "about-us",
                      label: "About Us",
                    }
                  ].map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`text-slate-800 hover:bg-slate-200 flex w-full items-center rounded-md p-3 transition-all focus:bg-slate-200 active:bg-slate-200 justify-between ${
                        activeSection === item.id
                          ? "bg-blue-200"
                          : ""
                      }`}
                    >
                      {item.label}
                      <GoChevronRight className="text-gray-500" />
                    </div>
                  ))}
                </nav>
              </div>
            </div>
            {/* Right Column: Active Section (2/3) */}
            <div className="col-span-2 h-full">
              <div className="p-4 bg-white rounded-lg shadow h-full overflow-auto">
                {renderActiveComponent()}
              </div>
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default Settings;
