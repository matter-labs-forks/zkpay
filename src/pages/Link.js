import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@material-ui/core';
import { useWallet } from 'context/wallet';
import { useTheme } from 'context/theme';
import sl, { slPrompt } from 'utils/sl';
import { sleep } from 'utils/misc';
import * as links from 'utils/links';

const useStyles = makeStyles(theme => ({
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
}));

const METHODS = [
  { name: 'Main', value: 'main' },
  { name: 'Zk Sync', value: 'zk' },
];
export default function Component({
  match: {
    params: { link },
  },
}) {
  const classes = useStyles();
  const { secondaryColor } = useTheme();
  const [method, setMethod] = React.useState('zk');
  const [asset, setAsset] = React.useState('ETH');
  const [amount, setAmount] = React.useState(0.01);
  const [linkInfo, setLinkInfo] = React.useState({});
  const {
    assets,
    deposit,
    transfer,
    hasRegistered,
    address,
    syncWallet,
    connect,
  } = useWallet();
  const isZk = method === 'zk';

  const onLoad = async () => {
    const info = await links.get(link);
    console.log(info);
    setLinkInfo(info);
    setAmount(info.amount);
  };

  React.useEffect(() => {
    onLoad();
  }, [link]); // eslint-disable-line react-hooks/exhaustive-deps

  const onConnectAndSend = async () => {
    await connect();
    await onSend();
  };

  const onSend = async () => {
    if (isZk) {
      // if (!hasRegistered) {
      //   await slPrompt(
      //     'To start using your account you need to register your public key once. This operation costs 15000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge proofs. Please bear with us!',
      //     'Register',
      //     register
      //   );
      // }
      console.log(await transfer(linkInfo.address, amount.toString()));
    } else {
      console.log(await deposit(linkInfo.address, amount.toString()));
    }
    sl('info', 'Waiting for transaction to be mined..', 'Submitted!');
  };

  return (
    <>
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
      <div className={clsx(classes.paperBody, 'flex', 'flex-col', 'flex-grow')}>
        <div
          style={{ color: secondaryColor }}
          className={classes.infoBar}
        ></div>
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
              onClick={onConnectAndSend}
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
    </>
  );
}
