
import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  MapPin,
  Camera,
  Brain,
  RefreshCw,
  Sun,
  ZoomIn,
  X,
} from "lucide-react";

import Logo from "../assets/logo.png";
import AIChatbot from "./AIChatbot";
import { useNavigate } from "react-router-dom";

const AshaNavbar = () => {
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [showTools, setShowTools] = useState(false);
  const [ashaName, setAshaName] = useState("");
  const [showBot, setShowBot] = useState(false);
  const [locationName, setLocationName] = useState("Fetching...");


  const navigate = useNavigate();

  // Apply brightness and UI zoom
  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
    document.documentElement.style.zoom = `${zoom}%`;
  }, [brightness, zoom]);

  // ASHA profile
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.name) {
      setAshaName(user.name);
    }
  }, []);

  // Live location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );

            const data = await res.json();

            if (data && data.address) {
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state ||
                "Unknown";

              const country =
                data.address.country_code?.toUpperCase() || "";

              setLocationName(`${city}, ${country}`);
            } else {
              setLocationName("Unknown location");
            }
          } catch (err) {
            console.error("Reverse geocode failed:", err);
            setLocationName("Location error");
          }
        },
        (err) => {
          console.warn("GPS error:", err);
          setLocationName("Location unavailable");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 2000,
        }
      );
    } else {
      setLocationName("Geolocation not supported");
    }
  }, []);

  const openSkinAI = () => {
    window.open(
      "https://skin-disease-ai-f-git-main-chirag6.vercel.app/",
      "_blank"
    );
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-gradient-to-r from-[#063c78] via-[#07519a] to-[#064a8f] shadow-lg shadow-slate-950/10">
        <div className="relative mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">

          {/* Brand and ASHA profile */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-md sm:h-11 sm:w-11">
                <img
                  src={Logo}
                  alt="ASHA healthcare logo"
                  className="h-full w-full object-contain"
                  onClick={() => navigate("/asha-dashboard")}
                />
              </div>

              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#07519a] bg-emerald-400" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-base">
                {ashaName || "ASHA Worker"}
              </h1>

              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-blue-100 sm:text-xs">
                <MapPin
                  size={12}
                  className="shrink-0 text-emerald-300"
                />

                <span className="truncate" title={locationName}>
                  {locationName}
                </span>
              </div>
            </div>
          </div>

           <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 sm:hidden">
          <h1 className="whitespace-nowrap text-lg font-extrabold tracking-wide text-white sm:text-xl">
            Jeevan<span className="text-blue-200">Vriksha</span>
          </h1>
        </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">

            {/* AI Chatbot */}
            <button
              type="button"
              onClick={() => setShowBot(true)}
              aria-label="Open AI assistant"
              title="AI Assistant"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-sm transition-all duration-200 hover:border-violet-300/40 hover:bg-violet-400/20 hover:shadow-lg hover:shadow-violet-950/10 active:scale-95 sm:h-11 sm:w-11"
            >
              <Brain
                size={20}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </button>

            {/* Skin disease AI */}
            <button
              type="button"
              onClick={openSkinAI}
              aria-label="Open skin disease AI"
              title="Skin Disease AI"
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-sm transition-all duration-200 hover:border-cyan-300/40 hover:bg-cyan-400/20 hover:shadow-lg hover:shadow-cyan-950/10 active:scale-95 sm:h-11 sm:w-11"
            >
              <Camera
                size={19}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            </button>

            {/* Accessibility and display settings */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTools(!showTools)}
                aria-label="Display settings"
                aria-expanded={showTools}
                title="Display settings"
                className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition-all duration-200 active:scale-95 sm:h-11 sm:w-11 ${
                  showTools
                    ? "border-white/30 bg-white text-[#064a8f]"
                    : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <SlidersHorizontal
                  size={19}
                  className={`transition-transform duration-300 ${
                    showTools ? "rotate-90" : ""
                  }`}
                />
              </button>

              {showTools && (
                <>
                  {/* Close settings on outside-area click */}
                  <button
                    type="button"
                    aria-label="Close display settings"
                    className="fixed inset-0 z-[101] cursor-default"
                    onClick={() => setShowTools(false)}
                  />

                  <div className="absolute right-0 top-[calc(100%+12px)] z-[102] w-[min(19rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-slate-800 shadow-2xl shadow-slate-950/20 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Panel heading */}
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          <SlidersHorizontal size={18} />
                        </div>

                        <div>
                          <h2 className="text-sm font-bold text-slate-800">
                            Display settings
                          </h2>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Customize your workspace
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTools(false)}
                        aria-label="Close settings"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="space-y-5 p-4">

                      {/* Brightness */}
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                              <Sun size={18} />
                            </div>

                            <div>
                              <label
                                htmlFor="asha-brightness"
                                className="block text-xs font-bold text-slate-700"
                              >
                                Brightness
                              </label>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Screen visibility
                              </p>
                            </div>
                          </div>

                          <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold tabular-nums text-amber-700">
                            {brightness}%
                          </span>
                        </div>

                        <input
                          id="asha-brightness"
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) =>
                            setBrightness(Number(e.target.value))
                          }
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                        />

                        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                          <span>Dim</span>
                          <span>Bright</span>
                        </div>
                      </div>

                      {/* UI Scale */}
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <ZoomIn size={18} />
                            </div>

                            <div>
                              <label
                                htmlFor="asha-zoom"
                                className="block text-xs font-bold text-slate-700"
                              >
                                UI Scale
                              </label>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Interface size
                              </p>
                            </div>
                          </div>

                          <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold tabular-nums text-blue-700">
                            {zoom}%
                          </span>
                        </div>

                        <input
                          id="asha-zoom"
                          type="range"
                          min="70"
                          max="130"
                          step="5"
                          value={zoom}
                          onChange={(e) =>
                            setZoom(Number(e.target.value))
                          }
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                        />

                        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                          <span>Smaller</span>
                          <span>Larger</span>
                        </div>
                      </div>

                      {/* Reset settings */}
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(100);
                          setZoom(100);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <RefreshCw size={14} />
                        Reset display settings
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </nav>

      {/* AI Chatbot */}
      {showBot && <AIChatbot close={() => setShowBot(false)} />}
    </>
  );
};

export default AshaNavbar;
