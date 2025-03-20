import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as JwtStrategy } from 'passport-jwt'
import passport from 'passport'
import User from '../models/UserSchema.js'

//Jwt Auth/Strategy

const jwtExtractor = (req) => {
  let token = null
  if (req && req.headers['authorization']) {
    token = req.headers['authorization'].split(' ')[1]
  }
  return token
}

passport.use(
  new JwtStrategy(
    { jwtFromRequest: jwtExtractor, secretOrKey: 'clavesecreta' },
    async function (jwt_payload, done) {
      try {
        const foundUser = await User.findOne({ id: jwt_payload.sub })
        done(null, foundUser)
      } catch (error) {
        done(error, null)
      }
    }
  )
)

//Google Auth/ Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
      passReqToCallback: true
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const foundUser = await User.findOne({ googleId: profile.id })
        if (!!foundUser) {
          return done(null, foundUser)
        } else {
          const createdUser = await User.create({
            googleId: profile.id,
            firstname: profile._json.given_name,
            lastname: profile._json.family_name,
            pictureUrl: profile._json.picture,
            email: profile._json.email
          })
          return done(null, createdUser)
        }
      } catch (error) {
        console.log(error)
        done(error, null)
      }
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user._id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, async function (err, user) {
    done(err, user)
  })
})

export default passport
