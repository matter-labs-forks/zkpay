import React from 'react';
import _memoize from 'lodash/memoize';
import ipfs from 'utils/ipfs';
import { nanoid } from 'utils/misc';
import * as registry from 'utils/registry';

const LinksContext = React.createContext(null);

export function LinksProvider({ children }) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [linkIds, setLinkIds] = React.useState([]);

  async function loadAll() {
    setIsLoading(true);

    setLinkIds(await registry.all());

    setIsLoading(false);
  }

  async function getFromIpfs(id) {
    console.log('get ipfs', id);
    const ipfsId = await registry.get(id);
    const link = JSON.parse(await ipfs.cat(ipfsId));
    link.id = id;
    link.ipfsId = ipfsId;
    return link;
  }

  async function create(props) {
    setIsCreating(true);

    if (props.image) {
      props.image = await ipfs.add(props.image);
    }
    const ipfsId = await ipfs.add(JSON.stringify(props));
    const id = nanoid();
    console.log('create id(%s) ipfs(%s)', id, ipfsId);
    await registry.put(id, ipfsId);
    setLinkIds([id, ...linkIds]);

    setIsCreating(false);
  }

  async function update(id, props) {
    setIsUpdating(true);

    const ipfsId = await ipfs.add(props);
    await registry.put(id, ipfsId);
    setLinkIds(linkIds.slice());

    setIsUpdating(false);
  }

  async function remove(id) {
    setIsRemoving(true);

    await registry.put(id, null);
    const ids = linkIds.slice();
    ids.splice(ids.indexOf(id), 1);
    setLinkIds(ids);

    setIsRemoving(false);
  }

  return (
    <LinksContext.Provider
      value={{
        isCreating,
        isUpdating,
        isRemoving,
        isLoading,
        linkIds,

        loadAll,
        getFromIpfs: _memoize(getFromIpfs),
        create,
        update,
        remove,
      }}
    >
      {children}
    </LinksContext.Provider>
  );
}

export function useLinks() {
  const context = React.useContext(LinksContext);
  if (!context) {
    throw new Error('Missing links context');
  }
  const {
    isCreating,
    isUpdating,
    isRemoving,
    isLoading,
    linkIds,

    loadAll,
    getFromIpfs,
    create,
    update,
    remove,
  } = context;
  return {
    isCreating,
    isUpdating,
    isRemoving,
    isLoading,
    linkIds,

    loadAll,
    getFromIpfs,
    create,
    update,
    remove,
  };
}
