import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import {
  IconButton,
  Tooltip,
  AppBar,
  Typography,
  Toolbar,
  Button,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import LightIcon from '@material-ui/icons/Brightness7';
import DarkIcon from '@material-ui/icons/Brightness4';
import { APP_TITLE } from 'config';
import { useWallet } from 'context/wallet';
import { useTheme } from 'context/theme';

const useStyles = makeStyles(theme => ({
  account: {
    marginRight: 10,
  },
}));

export default function Component() {
  const classes = useStyles();
  const { address, connect, disconnect } = useWallet();
  const { isDark, setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppBar position="fixed" color="inherit">
      <Toolbar color="inherit">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          to={'/'}
          component={Link}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={'flex flex-grow'}>
          <div className={'flex flex-col'}>
            <div>{APP_TITLE}</div>
            <div style={{ fontSize: 9 }}>Fast, Cheap Payments on Ethereum</div>
          </div>
        </Typography>

        {address ? (
          <>
            <div className={classes.account}>{address}</div>
            <Button color="secondary" onClick={disconnect}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button color="secondary" onClick={connect}>
            Connect Wallet
          </Button>
        )}

        <Tooltip title="Toggle light/dark theme">
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            aria-label="Toggle light/dark theme"
          >
            {isDark ? <LightIcon /> : <DarkIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
