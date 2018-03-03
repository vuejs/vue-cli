const { db } = require('./utils/db')
const { processUpload } = require('./utils/upload')

// Context passed to all resolvers (third argument)
// eslint-disable-next-line no-unused-vars
module.exports = req => {
  return {
    db,
    processUpload
  }
}
