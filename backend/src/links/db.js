const redis = require("utils/redis")
const error = require("utils/error")

exports.all = async function (address) {
  return await redis("smembers", getAddressSetKey(address))
}

exports.one = async function (id) {
  return redis("get", getLinkKey(id))
}

exports.put = async function (address, id, ipfsId) {
  if (await redis("exists", getLinkKey(id))) {
    // ensure `id` belongs to `address`
    if (!(await redis("sismember", getAddressSetKey(address), id))) {
      throw error(403)
    }
  } else if (ipfsId) {
    await redis("sadd", getAddressSetKey(address), id)
  }
  if (ipfsId) {
    await redis("set", getLinkKey(id), ipfsId)
  } else {
    await redis("srem", getAddressSetKey(address), id)
    await redis("del", getLinkKey(id))
  }
}

function getLinkKey(id) {
  return `link:${id}`
}

function getAddressSetKey(address) {
  return `address:${address}`
}
