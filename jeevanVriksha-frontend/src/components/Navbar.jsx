import React from "react";
import { ArrowBigDown, Menu } from "lucide-react";

const Navbar = ({ toggleSidebar }) => {

  return (
    <div className="lg:hidden fixed top-0 left-0 w-full bg-white border-b z-50 px-4 py-3 flex justify-between items-center shadow-sm">

      {/* App Name */}
      <h1 className="font-bold text-emerald-700 text-xl tracking-tight">
        JeevanVriksha
      </h1>

      
      {/* Menu Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
      >
        <Menu size={20} />
      </button>

    </div>
  );
};

export default Navbar;