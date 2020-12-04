require("dotenv").config()
const app = require("../src")
const port = process.env.PORT
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
