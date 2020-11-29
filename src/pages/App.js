import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import clsx from 'clsx';
import {
  ThemeProvider as MuiThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import { CssBaseline, Paper } from '@material-ui/core';
import { createHashHistory } from 'history';
import { useTheme, useMuiTheme } from 'context/theme';

import Header from 'components/Header';
import Home from './Home';
import Link from './Link';

const history = createHashHistory();

const useStyles = makeStyles(theme => ({
  container: { paddingTop: 80 },
  paper: {
    width: 960,
  },
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
            <Header />
            <div
              className={clsx('flex flex-col items-center', classes.container)}
            >
              <Paper className={clsx(classes.paper)}>
                <Switch>
                  <Route path={'/:link'} component={Link} />
                  <Route path={'/'} component={Home} />
                </Switch>
              </Paper>
            </div>
          </div>
        </div>
      </Router>
    </MuiThemeProvider>
  );
}
