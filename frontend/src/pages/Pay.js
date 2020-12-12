import React from 'react';
import clsx from 'clsx';
import * as ethers from 'ethers';
import { makeStyles } from '@material-ui/core/styles';
import { CheckoutManager } from 'zksync-checkout';
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
import { useLinks } from 'contexts/links';
import sl, { slPrompt } from 'utils/sl';
import xhr from 'utils/xhr';
import ipfs from 'utils/ipfs';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 600,
    marginTop: 50,
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
    width: '100%',
  },
  infoBar: {
    marginBottom: 20,
  },
  learnMore: {
    color: theme.palette.secondary.main,
    textDecoration: 'underline',
  },
}));

const TOKENS = new Map([
  ['ETH', { coinGeckoTokenId: 'ethereum' }],
  ['DAI', { coinGeckoTokenId: 'dai' }],
]);

export default function Component({
  match: {
    params: { link: linkId },
  },
}) {
  const classes = useStyles();
  const [tokenSymbol, setTokenSymbol] = React.useState('ETH');
  const [
    tokenDecimals,
    // setTokenDecimals
  ] = React.useState(18);
  const [tokenUSDPrice, setTokenUSDPrice] = React.useState(null);
  const { getFromIpfs } = useLinks();
  const [link, setLink] = React.useState(null);
  const [usdAmount, setUSDAmount] = React.useState(100);
  const imageElRef = React.useRef();
  const tokenAmount = !(usdAmount && tokenUSDPrice)
    ? 0
    : (usdAmount / tokenUSDPrice).toFixed(4);

  const onLoad = async () => {
    try {
      const info = await getFromIpfs(linkId);
      setLink(info);
      setUSDAmount(info.usdAmount);
      if (info.image) {
        const el = imageElRef.current;
        el.src = await ipfs.cat(info.image);
        el.classList.remove('hidden');
      }
    } catch {
      return slPrompt(
        'Unknown payment link. You will be redirected back to the homepage..',
        'Error',
        () => window.location.assign('/')
      );
    }
  };

  // const updateTokenDecimals = async () => {
  //   const { contractAddress } = TOKENS[tokenSymbol];
  //   const { default: erc20Abi } = await import('abis/erc20.json');
  //   const erc20Contract = new ethers.Contract(
  //     contractAddress,
  //     erc20Abi
  //     // wallet.defaultProvider
  //   );
  //   setTokenDecimals(await erc20Contract.decimals());
  // };

  const updateTokenPrice = async () => {
    const { coinGeckoTokenId } = TOKENS.get(tokenSymbol);
    const {
      [coinGeckoTokenId]: { usd },
    } = await xhr('get', 'https://api.coingecko.com/api/v3/simple/price', {
      ids: coinGeckoTokenId,
      vs_currencies: 'usd',
    });
    setTokenUSDPrice(usd);
  };

  const onPay = async e => {
    e.preventDefault();

    if (!tokenAmount) return;
    if (link.usdAmountType === 'minimum' && usdAmount < link.usdAmount) {
      return sl('error', `A minimium of ${link.usdAmount} USD is required.`);
    }

    const manager = new CheckoutManager(link.network || 'mainnet');
    const transactions = {
      to: link.to,
      token: tokenSymbol,
      amount: ethers.utils.parseUnits(tokenAmount, tokenDecimals).toString(),
    };
    const hashes = await manager.zkSyncBatchCheckout(
      [transactions],
      tokenSymbol
    );
    await manager.wait(hashes);

    sl('info', `Waiting for transaction to be verified...`, 'Success!');
  };

  React.useEffect(() => {
    onLoad();
  }, [linkId]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    updateTokenPrice();
  }, [tokenSymbol]); // eslint-disable-line react-hooks/exhaustive-deps

  return !link ? null : (
    <form
      className={clsx('flex flex-col items-center', classes.container)}
      onSubmit={onPay}
    >
      <Paper className={clsx(classes.paper)}>
        <div
          className={clsx(
            classes.paperHeading,
            'flex',
            'flex-grow',
            'items-center',
            'justify-center'
          )}
          style={{ color: link.color }}
        >
          {link.title}
        </div>
        <div
          className={clsx(classes.paperBody, 'flex', 'flex-col', 'flex-grow')}
        >
          {!link.description ? null : (
            <div style={{ color: link.color }} className={classes.infoBar}>
              {link.description}
            </div>
          )}
          <div className={'flex justify-center'}>
            <img
              alt={'link'}
              style={{ maxWidth: 500, borderRadius: 8 }}
              ref={imageElRef}
              className="hidden"
            />
          </div>
          <div className={classes.formRow}>
            <TextField
              id="amount"
              label="Amount (USD)"
              type="number"
              step="any"
              InputLabelProps={{
                shrink: true,
              }}
              value={usdAmount}
              onChange={e => setUSDAmount(e.target.value)}
              disabled={link.usdAmountType === 'exact'}
              {...(link.usdAmountType === 'minimum'
                ? { min: link.usdAmount }
                : {})}
              fullWidth
              required
            />
          </div>
          <div className={classes.formRow}>
            <FormControl fullWidth>
              <InputLabel id="tokenLabel">Asset *</InputLabel>
              <Select
                labelId="tokenLabel"
                id="tokenSelect"
                value={tokenSymbol}
                onChange={event => setTokenSymbol(event.target.value)}
              >
                {Array.from(TOKENS.keys()).map(symbol => (
                  <MenuItem value={symbol} key={symbol}>
                    {symbol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {!tokenUSDPrice ? null : (
            <div className={classes.formRow}>
              Rate: 1 {tokenSymbol} = ${tokenUSDPrice.toFixed(4)}
            </div>
          )}
          <div className={classes.formRow}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.formButton}
              style={{ backgroundColor: link.color }}
              type="submit"
            >
              Send ({tokenAmount} {tokenSymbol})
            </Button>
          </div>
        </div>
      </Paper>

      <div style={{ marginTop: 20 }}>
        Create your own link{' '}
        <Link href="/" target="_blank" className="underline">
          here
        </Link>
        .
      </div>
    </form>
  );
}
