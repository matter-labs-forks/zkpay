const express = require('express')
const auth = require('./auth')
const db = require('./db')
const error = require('utils/error')
const apiLimiter = require('utils/limiter')

const app = (module.exports = express.Router())

app.use(auth)

app.get('/:id', async (req, res, next) => {
  try {
    res.json(await db.one(req.params.id))
  } catch (e) {
    next(e)
  }
})

app.get('/', async (req, res, next) => {
  try {
    if (req.address) {
      return res.json(await db.all(req.address))
    }
    throw error(403)
  } catch (e) {
    next(e)
  }
})

app.put('/', apiLimiter, async (req, res, next) => {
  try {
    if (req.address) {
      await db.put(req.address, req.body.id, req.body.ipfsId)
      return res.json({})
    }
    throw error(403)
  } catch (e) {
    next(e)
  }
})
