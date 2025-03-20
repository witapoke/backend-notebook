import jwt from 'jsonwebtoken'

export const generateJwt = (user) => {
  let token = null

  let token_payload = {
    sub: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    pictureUrl: user.pictureUrl
  }

  token = jwt.sign(token_payload, process.env.JWT_SECRET_KEY)

  return token
}
