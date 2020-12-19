const express = require('express')
const {isValidAddress} = require('ethereumjs-util')
const token = require('utils/token')
const error = require('utils/error')
const challenge = require('./challenge')

const app = (module.exports = express.Router())

app.get('/:chainId/:address', (req, res, next) => {
  try {
    const {chainId, address} = req.params
    if (isValidAddress(address)) {
      return res.json(challenge.create(chainId, address))
    }
    throw error(403)
  } catch (e) {
    next(e)
  }
})

app.get('/:chainId/:message/:signature', (req, res, next) => {
  try {
    const {chainId, message, signature} = req.params
    const address = challenge.verify(chainId, message, signature)
    if (address) {
      return res.json(token.sign(address))
    }
    throw error(403)
  } catch (e) {
    next(e)
  }
})
