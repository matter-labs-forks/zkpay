import cache from 'utils/cache';

export function create(props) {
  const links = cache('links') || [];
  links.push(props);
  cache('links', links);
}

export function remove(index) {
  const links = cache('links') || [];
  links.splice(index, 1);
  cache('links', links);
}

export function get(index) {
  return (cache('links') || [])[index];
}

export function all() {
  return cache('links') || [];
}
