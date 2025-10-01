//imports
require('dotenv').config()
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const Course = require('./models/CourseSchema.js')
const connectDB = require('./DB.js').connectDB
const passport = require('passport')
require('./passport/index.js')(passport)
const session = require('express-session')
const generateJwt = require('./helpers/GenerateToken.js')

//inicializacion de la app
const app = express()

//middlewares
app.use(express.json())
app.use(cors())
app.use(
  session({
    secret: 'clavesecreta',
    resave: true,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/login'
  }),
  function (req, res) {
    const { _id, firstname, lastname, pictureUrl, email } = req.user
    const userData = {
      sub: _id,
      firstname,
      lastname,
      email,
      pictureUrl
    }
    const jwt = generateJwt(userData)
    console.log(jwt)
    const login_info = JSON.stringify({ jwt, user: userData })
    console.log(login_info)
    res.redirect(`http://localhost:5173/profile?login_info=${login_info}`)
  }
)

//get cursos

app.get(
  '/courses',
  // passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const cursos = await Course.find({})
    res.status(200).json(cursos)
  }
)

//create cursos

app.post('/courses', async (req, res) => {
  const { body } = req
  const { title, price, description } = body
  const cursoExiste = await Course.findOne({ title })

  try {
    if (cursoExiste || title === '' || price === '' || description === '')
      return res.status(500).json({ message: 'All fields must be completed' })
    const nuevoCurso = new Course({ title, price, description })
    const savedCurso = await nuevoCurso.save()
    res.status(201).json({ ok: true, data: savedCurso })
  } catch (error) {
    console.log(error)
    res.status(500).json({ ok: false, error })
  }
})

//conexion a la db
connectDB()
app.listen(5000, () => console.log('App listening to port 5000'))

module.exports = app
