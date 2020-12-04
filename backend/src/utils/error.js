module.exports = (status, msg) => {
  if (status === 403 && !msg) {
    msg = "not authorized"
  }
  const err = new Error(msg || status)
  err.status = status
  return err
}
