const jwt = require('jsonwebtoken')

const generateJwt = (payload) => {
  let token = null

  token = jwt.sign(payload, 'clavesecreta')

  return token
}

module.exports = generateJwt
