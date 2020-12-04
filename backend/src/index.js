const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")

const auth = require("./auth")
const links = require("./links")

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30,
  message:
    "Too many requests created from this IP, please try again in 5 minutes 😜",
})

const app = (module.exports = express())
if (process.env.NODE_ENV !== "test") {
  app.set("trust proxy", 1)
  app.use(morgan("tiny"))
  app.use(cors())
}
app.use(bodyParser.json())
app.use("/auth", apiLimiter, auth)
app.use("/links", apiLimiter, links)

app.use(function (err, req, res, next) {
  if (err.status) {
    res.status(err.status).json(err.message)
  } else {
    console.error(err.stack)
    res.status(500).json("something broke!")
  }
})
