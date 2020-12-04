const redis = require("utils/redis")
const error = require("utils/error")

exports.all = async function (address) {
  const addressKey = getAddressSetKey(address)
  return await redis("smembers", addressKey)
}

exports.one = async function (id) {
  const linkKey = getLinkKey(id)
  if (!(await redis("exists", linkKey))) {
    throw error(404, "unknown link")
  }
  return redis("get", linkKey)
}

exports.put = async function (address, id, ipfsId) {
  const addressKey = getAddressSetKey(address)
  const linkKey = getLinkKey(id)
  if (await redis("exists", linkKey)) {
    // ensure `id` belongs to `address`
    if (!(await redis("sismember", addressKey, id))) {
      throw error(403)
    }
  } else if (ipfsId) {
    await redis("sadd", addressKey, id)
  }
  if (ipfsId) {
    await redis("set", linkKey, ipfsId)
  } else {
    await redis("srem", addressKey, id)
    await redis("del", linkKey)
  }
}

function getLinkKey(id) {
  return `link:${id}`
}

function getAddressSetKey(address) {
  return `address:${address}`
}
