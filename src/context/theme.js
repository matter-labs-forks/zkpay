import React, { useContext, useState } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import cache from 'utils/cache';

const ThemeContext = React.createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(cache('theme') || 'dark');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Missing theme context');
  }
  const { theme, setTheme } = context;
  return {
    theme,
    setTheme,
    ...getProps(theme),
  };
}

export function useMuiTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('Missing theme context');
  }

  const { theme } = context;
  const { isDark, secondaryColor } = getProps(theme);

  return createMuiTheme({
    typography: {
      fontFamily: ['Work Sans', 'sans-serif'].join(','),
    },
    palette: {
      isDark,
      type: isDark ? 'dark' : 'light',
      primary: {
        main: isDark ? '#ffffff' : '#373836',
      },
      secondary: {
        main: secondaryColor,
      },
    },
    overrides: {
      MuiButton: {
        root: {
          borderRadius: 2,
        },
      },
    },
  });
}

function getProps(theme) {
  const isDark = theme === 'dark';
  const secondaryColor = isDark ? '#7aceff' : '#007cc3';
  return { isDark, secondaryColor };
}
