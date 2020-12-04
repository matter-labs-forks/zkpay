import xhr from 'utils/xhr';

export async function all() {
  return xhr('get', `/links`);
}

export function get(id) {
  return xhr('get', `/links/${id}`);
}

export function put(id, ipfsId) {
  return xhr('put', `/links`, { id, ipfsId });
}
