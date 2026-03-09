import { useContext } from "react";
import { UIContext } from "../context/UIContext";
import { Moon, Sun, LayoutGrid, MapPin, Menu } from "lucide-react";
import Logo from "../assets/logo.png";

const Topbar = ({ toggleSidebar }) => {

  const {
    darkMode,
    setDarkMode,
    brightness,
    setBrightness,
    density,
    setDensity
  } = useContext(UIContext);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-50">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu size={20} />
        </button>

        <img src={Logo} alt="logo" className="h-8" />

      </div>

      {/* CENTER LOCATION */}
      <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">

        <MapPin size={16} />

        <span>Location: Detecting...</span>

      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-4">

        {/* BRIGHTNESS */}
        <input
          type="range"
          min="70"
          max="130"
          value={brightness}
          onChange={(e) => setBrightness(e.target.value)}
          className="w-20"
        />

        {/* SCREEN DENSITY */}
        <button
          onClick={() =>
            setDensity(density === "comfortable" ? "compact" : "comfortable")
          }
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LayoutGrid size={18} />
        </button>

        {/* DARK MODE */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

      </div>

    </div>
  );
};

export default Topbar;