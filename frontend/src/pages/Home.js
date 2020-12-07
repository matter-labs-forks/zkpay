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
  Dialog,
  Popover,
} from '@material-ui/core';
import { TwitterPicker as ColorPicker } from 'react-color';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Loader from 'components/Loader';
import Header from 'components/Header';
import { useTheme } from 'contexts/theme';
import { useWallet } from 'contexts/wallet';
import { useLinks } from 'contexts/links';
import sl, { warn } from 'utils/sl';
import { sleep } from 'utils/misc';

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
    width: 150,
  },
  infoBar: {
    marginBottom: 20,
  },
  createLinkDialog: {
    width: 500,
    padding: 30,
  },
  link: {
    marginBottom: 5,
  },
  colorLabel: {
    width: 20,
    height: 20,
    position: 'relative',
    borderRadius: 4,
    marginRight: 5,
  },
  colorFieldLabel: {
    color: theme.palette.secondary.text,
    marginRight: 10,
  },
  colorField: {
    width: 40,
    height: 25,
    position: 'relative',
    borderRadius: 4,
  },
}));

const ASSET_TYPES = ['ETH', 'ERC20'];

export default function Component() {
  const classes = useStyles();
  const [isCreating, setIsCreating] = React.useState(false);
  const { connect, address: connected } = useWallet();

  const onStartCreate = () => setIsCreating(true);
  const onEndCreating = () => setIsCreating(false);

  return (
    <>
      <Header />

      <div className={clsx('flex flex-col items-center', classes.container)}>
        <Paper className={clsx(classes.paper)}>
          <div
            className={clsx(
              classes.paperHeading,
              'flex',
              'flex-grow',
              'items-center',
              'justify-space'
            )}
          >
            <div>MY PAYMENT LINKS</div>

            {!connected ? null : (
              <Button
                color="secondary"
                variant="outlined"
                onClick={onStartCreate}
              >
                Create
              </Button>
            )}
          </div>
          <div
            className={clsx(classes.paperBody, 'flex', 'flex-col', 'flex-grow')}
          >
            {!connected ? (
              <div
                className={clsx(
                  'flex',
                  'flex-col',
                  'flex-grow',
                  'items-center'
                )}
              >
                <div>Connect wallet to get started...</div>
                <br />
                <div>
                  <Button
                    color="secondary"
                    variant="outlined"
                    onClick={connect}
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ListLinks {...{ onStartCreate, onEndCreating }} />
                <CreateLink open={isCreating} onClose={onEndCreating} />
              </>
            )}
          </div>
        </Paper>
      </div>
    </>
  );
}

function ListLinks({ onStartCreate }) {
  const classes = useStyles();
  const { isLoading, linkIds, loadAll } = useLinks();

  const onLoadLinks = async () => {
    await loadAll();
  };

  React.useEffect(() => {
    onLoadLinks();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={clsx('flex', 'flex-col', 'flex-grow')}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {!linkIds.length ? (
            <div
              className={clsx('flex', 'flex-col', 'flex-grow', 'items-center')}
            >
              <div>You do not have any payment links.</div>
              <br />
              <Button
                color="secondary"
                variant="outlined"
                onClick={onStartCreate}
              >
                Create New Link
              </Button>
            </div>
          ) : (
            <>
              {linkIds.map(id => (
                <div
                  className={clsx('flex', 'items-center', classes.link)}
                  key={id}
                >
                  <LinkListItem {...{ id }} />
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function LinkListItem({ id }) {
  const classes = useStyles();
  const [link, setLink] = React.useState();
  const { remove, getFromIpfs } = useLinks();

  const onRemoveLink = () => {
    warn('Warning', async () => {
      await remove(id);
    });
  };

  const onLoadLink = async () => {
    try {
      setLink(await getFromIpfs(id));
    } catch {}
  };

  React.useEffect(() => {
    onLoadLink();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return !link ? null : (
    <>
      <div
        className={classes.colorLabel}
        style={{ background: link.color }}
      ></div>
      <div className="flex-grow">{link.name}</div> <CopyLinkUrl {...{ id }} />
      &nbsp;
      <Button color="secondary" variant="outlined" onClick={onRemoveLink}>
        Remove
      </Button>
    </>
  );
}

function CreateLink({ open, onClose }) {
  const classes = useStyles();
  const { address } = useWallet();
  const { secondaryColor } = useTheme();
  const { create } = useLinks();
  const [name, setName] = React.useState('');
  const [color, setColor] = React.useState('#fc0');
  const [recipient, setRecipient] = React.useState(address);
  const [assetType, setAssetType] = React.useState('ETH');
  const [erc20AssetAddress, setErc20AssetAddress] = React.useState('');
  const [amount, setAmount] = React.useState(0.1);
  const [colorField, setColorField] = React.useState(null);

  const onCreate = async e => {
    e.preventDefault();
    await create({
      name,
      color,
      assetType,
      erc20AssetAddress,
      amount,
      address,
    });
    sl('info', 'Created link..', 'Success!', onClose);
  };

  return (
    <Dialog {...{ open, onClose }}>
      <form
        className={clsx(
          classes.createLinkDialog,
          'flex',
          'flex-col',
          'flex-grow'
        )}
        onSubmit={onCreate}
      >
        <div style={{ color: secondaryColor }} className={classes.infoBar}>
          Your payment links are stored in IPFS.
        </div>

        <div className={classes.formRow}>
          <TextField
            id="name"
            label={'Name'}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Name of the link.."
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
          />
        </div>
        <div className={classes.formRow}>
          <FormControl fullWidth>
            <InputLabel id="assetTypeLabel">Asset to Receive*</InputLabel>
            <Select
              labelId="assetTypeLabel"
              id="assetTypeSelect"
              value={assetType}
              onChange={event => setAssetType(event.target.value)}
              required
            >
              {ASSET_TYPES.map(name => (
                <MenuItem value={name} key={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        {assetType !== 'ERC20' ? null : (
          <div className={classes.formRow}>
            <TextField
              id="amount"
              label={'ERC20 Token Contract Address'}
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              value={erc20AssetAddress}
              onChange={e => setErc20AssetAddress(e.target.value)}
              fullWidth
              required
            />
          </div>
        )}
        <div className={classes.formRow}>
          <TextField
            id="amount"
            label={`${assetType} Amount (optional)`}
            type="number"
            step="any"
            InputLabelProps={{
              shrink: true,
            }}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            fullWidth
          />
        </div>
        <div className={classes.formRow}>
          <TextField
            id="recipient"
            label={'Recipient'}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Recipient address..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            fullWidth
            required
          />
        </div>
        <div className={clsx(classes.formRow, 'flex')}>
          <div className={classes.colorFieldLabel}>Theme Color*</div>
          <div
            className={classes.colorField}
            style={{ background: color }}
            onClick={e => setColorField(e.target)}
          ></div>
        </div>
        <div className={classes.formRow}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.formButton}
            type="submit"
          >
            Create
          </Button>
          &nbsp;
          <Button
            color="secondary"
            className={classes.formButton}
            onClick={onClose}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </form>

      <Popover
        open={!!colorField}
        anchorEl={colorField}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <ColorPicker
          {...{ color }}
          onChangeComplete={c => {
            setColor(c.hex);
            setColorField(null);
          }}
        />
      </Popover>
    </Dialog>
  );
}

function CopyLinkUrl({ id }) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = async () => {
    setCopied(true);
    await sleep(2000);
    setCopied(false);
  };

  return (
    <CopyToClipboard text={window.location.href + id} {...{ onCopy }}>
      <Button color="secondary" variant="outlined">
        {copied ? 'Copied ✓' : 'Copy Link Url'}
      </Button>
    </CopyToClipboard>
  );
}
