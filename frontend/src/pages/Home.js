import React from 'react';
import _capitalize from 'lodash/capitalize';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import {
  Paper,
  TextField,
  Button,
  RadioGroup,
  Radio,
  FormControlLabel,
  Dialog,
  Popover,
} from '@material-ui/core';
import * as ethers from 'ethers';
import { TwitterPicker as ColorPicker } from 'react-color';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Loader from 'components/Loader';
import Header from 'components/Header';
import { useTheme } from 'contexts/theme';
import { wallet, useWallet } from 'contexts/wallet';
import { useLinks } from 'contexts/links';
import sl, { warn } from 'utils/sl';
import { sleep } from 'utils/misc';
import { pickImage } from 'utils/file-picker';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 600,
    marginTop: 100,
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
    width: 600,
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
  error: {
    color: theme.palette.error.main,
  },
  usdAmountTypeOptions: {
    marginLeft: 30,
    '& .MuiFormControlLabel-label': {
      fontSize: 11,
    },
  },
}));

export default function Component() {
  const classes = useStyles();
  const [isCreating, setIsCreating] = React.useState(false);
  const { connect, address: connected } = useWallet();

  const onStartCreate = () => setIsCreating(true);
  const onEndCreating = () => setIsCreating(false);

  // React.useEffect(() => {
  //   onStartCreate();
  // }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  const { isCreating, create } = useLinks();

  const [name, setName] = React.useState('');

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [image, setImage] = React.useState(null);
  const [color, setColor] = React.useState('#fc0');

  const [to, setTo] = React.useState(address);
  const [toError, setToError] = React.useState(null);

  const [usdAmount, setUSDAmount] = React.useState(100);
  const [usdAmountType, setUSDAmountType] = React.useState('default');
  const [colorField, setColorField] = React.useState(null);

  const onCreate = async e => {
    e.preventDefault();
    if (isCreating) return;

    await create({
      name,
      title,
      description,
      image,
      color,
      usdAmount,
      usdAmountType,
      to,
      network: wallet.getNetworkName(),
    });
    sl('info', 'Created link..', 'Success!', onClose);
    setName('');
    setTitle('');
    setDescription('');
    setImage(null);
    setColor('#fc0');
    setUSDAmount(100);
    setTo(address);
  };

  const onPickImage = async () => {
    setImage(await pickImage());
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
          <TextField
            id="title"
            label={'Page title'}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder=""
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
          />
        </div>
        <div className={classes.formRow}>
          <TextField
            id="description"
            label={'Page description'}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder=""
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            rows={3}
            rowsMax={5}
            fullWidth
          />
        </div>
        <div className={classes.formRow}>
          <TextField
            id="usd"
            label={`${_capitalize(usdAmountType)} amount to receive (USD)`}
            type="number"
            step="any"
            InputLabelProps={{
              shrink: true,
            }}
            value={usdAmount}
            onChange={e => setUSDAmount(e.target.value)}
            fullWidth
            required
          />

          <div className={clsx(classes.usdAmountTypeOptions)}>
            <RadioGroup
              row
              name="usdAmountType"
              value={usdAmountType}
              onChange={e => setUSDAmountType(e.target.value)}
            >
              <FormControlLabel
                value="default"
                control={<Radio />}
                label="Default"
              />
              <FormControlLabel
                value="exact"
                control={<Radio />}
                label="Exact"
              />
              <FormControlLabel
                value="minimum"
                control={<Radio />}
                label="Minimum"
              />
            </RadioGroup>
          </div>
        </div>
        <div className={classes.formRow}>
          <TextField
            id="to"
            label={'To'}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
            placeholder="Set alternate recipient..."
            value={to}
            onChange={e => {
              const addr = e.target.value;
              setTo(addr);
              if (!ethers.utils.isAddress(addr)) {
                setToError('Invalid address...');
              } else {
                setToError(null);
              }
            }}
            fullWidth
            required
          />
          {!toError ? null : <div className={classes.error}>{toError}</div>}
        </div>
        <div className={clsx(classes.formRow, 'flex')}>
          <div className={classes.colorFieldLabel}>Theme Color *</div>
          <div
            className={classes.colorField}
            style={{ background: color }}
            onClick={e => setColorField(e.target)}
          ></div>
        </div>
        <div className={clsx(classes.formRow, 'flex')}>
          <div className={classes.colorFieldLabel}>Network *</div>
          <div className={classes.colorField}>
            {_capitalize(wallet.getNetworkName())}
          </div>
        </div>
        <div className={clsx(classes.formRow, 'flex flex-col')}>
          {image ? (
            <>
              <img src={image} alt={'link'} width={150} onClick={onPickImage} />
              <Button
                color="secondary"
                className={classes.formButton}
                type="button"
                onClick={onPickImage}
              >
                Change
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="secondary"
              type="button"
              onClick={onPickImage}
              style={{ textTransform: 'none' }}
            >
              Upload Image (e.g. Product Showcase)
            </Button>
          )}
        </div>

        <div className={clsx(classes.formRow, 'flex', 'items-center')}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.formButton}
            type="submit"
            disabled={isCreating}
          >
            {!isCreating ? 'Create' : 'Creating...'}
            {!isCreating ? null : <Loader size={15} />}
          </Button>
          &nbsp;
          <Button
            variant="outlined"
            color="secondary"
            className={classes.formButton}
            onClick={onClose}
            type="button"
            disabled={isCreating}
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
