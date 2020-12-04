const jwt = require("jsonwebtoken")
const {SECRET} = require("config")

exports.sign = function (address) {
  return jwt.sign({address}, SECRET)
}

exports.verify = function (token) {
  return new Promise((resolve) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) return resolve(err)
      resolve(decoded.address)
    })
  })
}
