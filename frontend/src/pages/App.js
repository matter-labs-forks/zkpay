import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import {
  ThemeProvider as MuiThemeProvider,
  makeStyles,
} from '@material-ui/core/styles';
import clsx from 'clsx';
import { CssBaseline, Link } from '@material-ui/core';
import { createBrowserHistory } from 'history';
import { useTheme, useMuiTheme } from 'contexts/theme';

import Home from './Home';
import Pay from './Pay';

const history = createBrowserHistory();

const useStyles = makeStyles(() => ({
  content: { minHeight: 'calc(100vh - 60px)' },
  footer: {
    padding: '20px 0 20px',
    fontSize: 10,
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
            <div className={classes.content}>
              <Switch>
                <Route path={'/:link'} component={Pay} />
                <Route path={'/'} component={Home} />
              </Switch>
            </div>
            <div className={clsx(classes.footer)}>
              <div className="flex flex-col flex-grow items-center flex-grow">
                {/*
                <div>
                  Made with{' '}
                  <span role="img" aria-label="love">
                    ❤️
                  </span>
                  on Earth
                </div>
                <div>
                  If you find this site useful, consider buying me a{' '}
                  <span role="img" aria-label="beer">
                    🍺
                  </span>{' '}
                  over{' '}
                  <Link
                    href="https://zkpay.link/aNeouH"
                    target="_blank"
                    className="underline"
                  >
                    here
                  </Link>
                  .
                </div>
                */}
                <Link
                  href="https://zkpay.link/PPxd4V"
                  target="_blank"
                  className="flex items-center"
                >
                  Donate &nbsp;
                  <span role="img" aria-label="heart">
                    ❤️
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Router>
    </MuiThemeProvider>
  );
}
