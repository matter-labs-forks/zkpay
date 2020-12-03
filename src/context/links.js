import React, { useContext } from 'react';
import cache from 'utils/cache';
import { sleep } from 'utils/misc';

const LinksContext = React.createContext(null);

export function LinksProvider({ children }) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [links, setLinks] = React.useState([]);

  async function loadAll() {
    setIsLoading(true);
    await sleep(2000);
    setIsLoading(false);
    setLinks(cache('links') || []);
  }

  async function getById(id) {
    return (cache('links') || []).find(link => link.id === id);
  }

  async function create(props) {
    setIsCreating(true);
    await sleep(2000);
    setIsCreating(false);
    const links = cache('links') || [];
    links.push({ ...props, id: (links.length + 1).toString() });
    cache('links', links);
    setLinks(links);
  }

  async function update() {}

  async function remove(id) {
    const links = (cache('links') || []).filter(link => link.id !== id);
    cache('links', links);
    setLinks(links);
  }

  return (
    <LinksContext.Provider
      value={{
        isCreating,
        isLoading,
        links,

        loadAll,
        getById,
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
  const context = useContext(LinksContext);
  if (!context) {
    throw new Error('Missing links context');
  }
  const {
    isCreating,
    isLoading,
    links,

    loadAll,
    getById,
    create,
    update,
    remove,
  } = context;
  return {
    isCreating,
    isLoading,
    links,

    loadAll,
    getById,
    create,
    update,
    remove,
  };
}
