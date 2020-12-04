const token = require("utils/token")

module.exports = async function (req, res, next) {
  const {authorization} = req.headers
  if (authorization && ~authorization.indexOf("Bearer ")) {
    const t = authorization.split("Bearer ")[1]
    try {
      req.address = await token.verify(t)
    } catch (err) {
      // console.log(err)
    }
  }

  next()
}
