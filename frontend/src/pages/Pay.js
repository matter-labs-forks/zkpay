import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Link,
} from '@material-ui/core';
import { useWallet } from 'contexts/wallet';
import { useTheme } from 'contexts/theme';
import { useLinks } from 'contexts/links';
import sl, { slPrompt } from 'utils/sl';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 600,
  },
  paperHeading: {
    padding: 20,
    background: theme.palette.isDark ? '#303030' : '#eee',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  paperBody: {
    padding: 30,
  },
  formRow: {
    margin: '10px 0',
  },
  formControl: {
    margin: '10px 0',
  },
  formButton: {
    width: 200,
  },
  infoBar: {
    marginBottom: 20,
  },
  learnMore: {
    color: theme.palette.secondary.main,
    textDecoration: 'underline',
  },
}));

const METHODS = [
  { name: 'Zk Sync (Layer 2 - Recommended)', value: 'zk' },
  { name: 'Regular (Layer 1)', value: 'main' },
];
export default function Component({
  match: {
    params: { link: linkId },
  },
}) {
  const classes = useStyles();
  const { secondaryColor } = useTheme();
  const [method, setMethod] = React.useState('zk');
  const [asset, setAsset] = React.useState('ETH');
  const [amount, setAmount] = React.useState(0.01);
  const { getFromIpfs } = useLinks();
  const [link, setLink] = React.useState(null);
  const {
    address,
    assets,

    deposit,
    transfer,
    connect,
    ensureIsRegistered,
  } = useWallet();
  const isZk = method === 'zk';

  const onLoad = async () => {
    try {
      const info = await getFromIpfs(linkId);
      setLink(info);
      setAmount(info.amount);
    } catch {
      return slPrompt(
        'Unknown payment link. You will be redirected back to the homepage..',
        'Error',
        () => window.location.assign('/')
      );
    }
  };

  React.useEffect(() => {
    onLoad();
  }, [linkId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSend = async () => {
    await connect();

    if (isZk) {
      await ensureIsRegistered();
      console.log(await transfer(link.address, amount.toString()));
    } else {
      console.log(await deposit(link.address, amount.toString()));
    }
    sl(
      'info',
      `Waiting for transaction to be ${isZk ? 'verified' : 'mined'}..`,
      'Success!'
    );
  };

  return !link ? null : (
    <div className={clsx('flex flex-col items-center', classes.container)}>
      <Paper className={clsx(classes.paper)}>
        <div
          className={clsx(
            classes.paperHeading,
            'flex',
            'flex-grow',
            'items-center',
            'justify-center'
          )}
        >
          Pay
        </div>
        <div
          className={clsx(classes.paperBody, 'flex', 'flex-col', 'flex-grow')}
        >
          <div style={{ color: secondaryColor }} className={classes.infoBar}>
            You have the option to send from your Zk Sync account (fast & cheap)
            or <br />
            the regular network.{' '}
            <Link
              href="https://www.youtube.com/watch?v=el-9YYGN1nw"
              variant="inherit"
              target="_blank"
              className={classes.learnMore}
            >
              Learn more.
            </Link>
          </div>
          <div className={classes.formRow}>
            <FormControl fullWidth>
              <InputLabel id="methodLabel">Network</InputLabel>
              <Select
                labelId="methodLabel"
                id="methodSelect"
                value={method}
                onChange={event => setMethod(event.target.value)}
              >
                {METHODS.map(({ name, value }) => (
                  <MenuItem value={value} key={value}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={classes.formRow}>
            <FormControl fullWidth>
              <InputLabel id="assetLabel">Asset</InputLabel>
              <Select
                labelId="assetLabel"
                id="assetSelect"
                value={asset}
                onChange={event => setAsset(event.target.value)}
              >
                {assets[method].map(({ name, value }) => (
                  <MenuItem value={name} key={name}>
                    {name} ({value})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className={classes.formRow}>
            <TextField
              id="amount"
              label={`Amount (${asset})`}
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              fullWidth
              required
            />
          </div>
          <div className={classes.formRow}>
            {!address ? (
              <Button
                variant="contained"
                color="secondary"
                className={classes.formButton}
                onClick={onSend}
              >
                Connect Wallet
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                className={classes.formButton}
                onClick={onSend}
              >
                Send
              </Button>
            )}
          </div>
        </div>
      </Paper>
    </div>
  );
}
