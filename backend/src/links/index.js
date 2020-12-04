const express = require("express")
const auth = require("./auth")
const db = require("./db")
const error = require("utils/error")

const app = (module.exports = express.Router())

app.use(auth)

app.get("/:id", async (req, res) => {
  res.json(await db.one(req.params.id))
})

app.get("/", async (req, res, next) => {
  try {
    if (req.address) {
      return res.json(await db.all(req.address))
    }
    throw error(403)
  } catch (e) {
    next(e)
  }
})

app.put("/", async (req, res, next) => {
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
