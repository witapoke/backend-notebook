const GoogleStrategy = require('passport-google-oauth20').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const passport = require('passport')
const User = require('../models/UserSchema.js')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'clavesecreta'
}

const strategyJwt = new JwtStrategy(options, async (jwt_payload, done) => {
  try {
    const foundUser = await User.findById(jwt_payload.sub)
    if (foundUser) {
      done(null, foundUser)
    } else {
      done(null, false)
    }
  } catch (error) {
    done(error, null)
  }
})

//Google Auth/ Strategy

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/auth/google/callback',
  scope: ['email', 'profile'],
  passReqToCallback: true
}

const strategyGoogle = new GoogleStrategy(googleOptions, async function (
  request,
  accessToken,
  refreshToken,
  profile,
  done
) {
  try {
    const foundUser = await User.findOne({ googleId: profile.id })
    if (foundUser) {
      console.log(foundUser)
      return done(null, foundUser)
    } else {
      const createdUser = await User.create({
        googleId: profile.id || '',
        firstname: profile._json?.given_name || '',
        lastname: profile._json?.family_name || '',
        pictureUrl: profile._json?.picture || '',
        email: profile._json?.email || ''
      })
      console.log('creando usuario')
      return done(null, createdUser)
    }
  } catch (error) {
    console.log(error)
    done(error, null)
  }
})

// passport.serializeUser(function (user, done) {
//   console.log('SERIALIZE')
//   done(null, user._id)
// })

// passport.deserializeUser(async function (id, done) {
//   console.log('DESERIALIZE')
//   try {
//     const foundUser = await User.findById(id)
//     done(null, foundUser)
//   } catch (error) {
//     done(error, null)
//   }
// })

module.exports = (passport) => {
  passport.use(strategyJwt)
  passport.use(strategyGoogle)
}
