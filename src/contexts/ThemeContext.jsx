import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const previousThemeRef = useRef(localStorage.getItem('previousTheme') || null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      previousThemeRef.current = prev;
      localStorage.setItem('previousTheme', prev);
      return next;
    });
  };

  const revertTheme = () => {
    const prev = previousThemeRef.current;
    if (prev && prev !== theme) {
      previousThemeRef.current = theme;
      localStorage.setItem('previousTheme', theme);
      setTheme(prev);
    }
  };

  const hasPreviousTheme = previousThemeRef.current !== null && previousThemeRef.current !== theme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, revertTheme, hasPreviousTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
