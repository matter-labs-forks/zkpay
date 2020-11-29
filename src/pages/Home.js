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
  Dialog,
} from '@material-ui/core';
import { useTheme } from 'context/theme';
import { useWallet } from 'context/wallet';
import * as links from 'utils/links';
import sl, { warn } from 'utils/sl';

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
}));

const ASSET_TYPES = ['ETH', 'ERC20'];

export default function Component() {
  const classes = useStyles();
  const [isCreating, setIsCreating] = React.useState(false);
  const [linkInfos, setLinkInfos] = React.useState([]);
  const { connect } = useWallet();

  const onStartCreate = async () => {
    await connect();
    setIsCreating(true);
  };
  const onStopCreating = () => setIsCreating(false);
  const onCreate = async props => {
    await links.create(props);
    await onLoad();
    sl('info', 'Created link..', 'Success!', onStopCreating);
  };

  const onRemoveLink = id => {
    warn('Warning', async () => {
      await links.remove(id);
      await onLoad();
    });
  };

  const onLoad = async () => {
    setLinkInfos(await links.all());
  };

  React.useEffect(() => {
    onLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
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

        <Button color="secondary" variant="outlined" onClick={onStartCreate}>
          Create
        </Button>
      </div>
      <div className={clsx(classes.paperBody, 'flex', 'flex-col', 'flex-grow')}>
        {linkInfos.map(({}, id) => (
          <div className={clsx('flex', classes.link)} key={id}>
            <div className="flex-grow">link-{id}</div>{' '}
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => console.log(window.location.href + id)}
            >
              Copy Link
            </Button>
            &nbsp;
            <Button
              color="secondary"
              variant="outlined"
              onClick={() => onRemoveLink(id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <CreateLink
        open={isCreating}
        onClose={onStopCreating}
        {...{ onCreate }}
      />
    </>
  );
}

function CreateLink({ open, onCreate, onClose }) {
  const classes = useStyles();
  const { address } = useWallet();
  const { secondaryColor } = useTheme();
  const [assetType, setAssetType] = React.useState('ETH');
  const [erc20AssetAddress, setErc20AssetAddress] = React.useState('');
  const [amount, setAmount] = React.useState(0);

  return (
    <Dialog {...{ open, onClose }}>
      <div
        className={clsx(
          classes.createLinkDialog,
          'flex',
          'flex-col',
          'flex-grow'
        )}
      >
        <div style={{ color: secondaryColor }} className={classes.infoBar}>
          Payment links are stored in IPFS.
        </div>

        <div className={classes.formRow}>
          <FormControl fullWidth>
            <InputLabel id="assetTypeLabel">Asset Type</InputLabel>
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
              label={'ERC20 Token Address'}
              type="number"
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
            label={'Amount (optional)'}
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            fullWidth
          />
        </div>

        <div className={classes.formRow}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.formButton}
            onClick={() =>
              onCreate({
                assetType,
                erc20AssetAddress,
                amount,
                address,
              })
            }
          >
            Create
          </Button>
          &nbsp;
          <Button
            color="secondary"
            className={classes.formButton}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
