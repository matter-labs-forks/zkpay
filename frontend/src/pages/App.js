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

const useStyles = makeStyles(theme => ({
  container: { paddingTop: 100 },
  footer: {
    position: 'fixed',
    bottom: 10,
    right: 0,
    left: 0,
  },
  donationLink: {
    textDecoration: 'underline',
  },
}));

export default function App() {
  const classes = useStyles();
  const { isDark, secondaryColor } = useTheme();
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

            <div className={clsx(classes.footer)}>
              <div className="flex flex-col flex-grow items-center flex-grow">
                <div>
                  Made with{' '}
                  <span role="img" aria-label="love">
                    ❤️
                  </span>{' '}
                  on Earth
                </div>
                <div>
                  Donations accepted{' '}
                  <Link
                    href="https://zkpay.link/aNeouH"
                    target="_blank"
                    className={classes.donationLink}
                  >
                    here
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </Router>
    </MuiThemeProvider>
  );
}
