const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const {PRODUCTION, TEST} = require('config')
const auth = require('./auth')
const links = require('./links')

const app = (module.exports = express())
if (!TEST) {
  app.set('trust proxy', 1)
  app.use(morgan('tiny'))
  app.use(cors())
}
app.use(bodyParser.json())
app.use('/auth', auth)
app.use('/links', links)
app.use(function (err, req, res, next) {
  err.status = err.status || 500
  if (!TEST) {
    console.error(err.stack)
  }
  res.status(err.status).json(PRODUCTION ? 'something broke!' : err.message)
})
