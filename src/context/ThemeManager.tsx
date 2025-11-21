import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "lightTheme" | "darkTheme";

interface ThemeManagerType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeManagerType | undefined>(
  undefined,
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("lightTheme");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    const currentTheme = storedTheme || "lightTheme"; // 기본값 "light"
    setThemeState(currentTheme);
    // applyTheme(currentTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    // applyTheme(newTheme);
  };
  const applyTheme = (theme: Theme) => {
    // document.body.className = theme;
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
