const express = require("express")
const ethUtil = require("ethereumjs-util")
const token = require("utils/token")
const challenge = require("./challenge")

const app = (module.exports = express.Router())

app.get("/:chainId/:address", (req, res) => {
  const {chainId, address} = req.params
  if (ethUtil.isValidAddress(address)) {
    return res.json(challenge.create(chainId, address))
  }
  res.status(403).json({})
})

app.get("/:chainId/:message/:signature", (req, res) => {
  const {chainId, message, signature} = req.params
  const address = challenge.verify(chainId, message, signature)
  if (address) {
    return res.json(token.sign(address))
  }
  res.status(403).json({})
})
