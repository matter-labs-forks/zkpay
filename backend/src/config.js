const {v4: uuidv4} = require("uuid")
const NODE_ENV = process.env.NODE_ENV

exports.SECRET = uuidv4()

exports.TEST = NODE_ENV === "test"

exports.PRODUCTION = NODE_ENV === "production"
