const rateLimit = require('express-rate-limit')

module.exports = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message:
    'Too many requests created from this IP, please try again in 5 minutes 😜',
})
