import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import { createBrowserHistory } from 'history';
import { useTheme, useMuiTheme } from 'contexts/theme';

import Home from './Home';
import Pay from './Pay';

const history = createBrowserHistory();

const useStyles = makeStyles(theme => ({
  container: { paddingTop: 100 },
}));

export default function App() {
  const classes = useStyles();
  const { isDark } = useTheme();
  const muiTheme = useMuiTheme();

  React.useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains(isDark ? 'light' : 'dark')) {
      root.classList.remove(isDark ? 'light' : 'dark');
      root.classList.add(isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router {...{ history }}>
        <div className={classes.container}>
          <div className="flex-grow">
            <Switch>
              <Route path={'/:link'} component={Pay} />
              <Route path={'/'} component={Home} />
            </Switch>
          </div>
        </div>
      </Router>
    </MuiThemeProvider>
  );
}
