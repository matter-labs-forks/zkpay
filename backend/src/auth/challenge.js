const NodeCache = require('node-cache')
const crypto = require('crypto')
const ethers = require('ethers')
const {TypedDataUtils} = require('ethers-eip712')
const sigUtil = require('eth-sig-util')
const {SECRET} = require('config')

const CACHE = new NodeCache({
  stdTTL: 600,
})

exports.create = function (chainId, address) {
  const hash = crypto.createHmac('sha256', SECRET).update(address).digest('hex')
  CACHE.set(address, hash)
  return makeChallengeTypedData(chainId, hash)
}

exports.verify = function (chainId, challenge, sig) {
  const data = makeChallengeTypedData(chainId, challenge)

  const recovered1 = sigUtil.recoverTypedSignature_v4({
    data,
    sig,
  })

  // const recovered2 = ethers.utils.verifyTypedData(
  //   data.domain,
  //   [data.types.Challenge],
  //   data.message,
  //   sig
  // )

  // console.log()
  // console.log(recovered1)
  // console.log(recovered2)
  // console.log()

  const recovered = recovered1

  const storedChallenge = CACHE.get(recovered)

  if (storedChallenge === challenge) {
    CACHE.del(recovered)
    return recovered
  }

  return false
}

function makeChallengeTypedData(chainId, challenge) {
  return TypedDataUtils.buildTypedData(
    {
      name: 'zkpay',
      version: '1',
      chainId,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    {
      Challenge: [{name: 'challenge', type: 'string'}],
    },
    'Challenge',
    {
      challenge,
    }
  )
}
