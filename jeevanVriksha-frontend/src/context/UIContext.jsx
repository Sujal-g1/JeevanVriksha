import { createContext, useState, useEffect } from "react";

export const UIContext = createContext();

export const UIProvider = ({ children }) => {

  const [darkMode, setDarkMode] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [density, setDensity] = useState("comfortable");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  useEffect(() => {
    document.body.dataset.density = density;
  }, [density]);

  return (
    <UIContext.Provider
      value={{
        darkMode,
        setDarkMode,
        brightness,
        setBrightness,
        density,
        setDensity
      }}
    >
      {children}
    </UIContext.Provider>
  );
};