//imports
require('dotenv').config()
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const Course = require('./models/CourseSchema.js')
const connectDB = require('./DB.js')
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
    failureRedirect: 'http://localhost:5173/login',
    session: false
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
    const login_info = JSON.stringify({
      jwt: jwt,
      user: userData
    })

    res.redirect(`http://localhost:5173/profile?login_info=${login_info}`)
  }
)

//get cursos

app.get(
  '/courses',
  // passport.authenticate('jwt', {
  //   session: false,
  //   failureRedirect: 'http://localhost:5173/login'
  // }),
  async (req, res) => {
    const cursos = await Course.find({})
    res.status(200).json(cursos)
  }
)

app.get(
  '/courses/:id',
  passport.authenticate('jwt', {
    session: false,
    failureRedirect: 'http://localhost:5173/login'
  }),
  async (req, res) => {
    const id = req.params.id

    try {
      const foundCourse = await Course.findById(id)

      if (!foundCourse) {
        return res.status(404).json({ message: 'Course not found' })
      }

      return res
        .status(200)
        .json({ message: 'Course found', data: foundCourse })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Something went terribly wrong' })
    }
  }
)

//create cursos

// app.post('/courses', async (req, res) => {
//   //esto se puede mejorar con el proyecto de products && cart manager (en el products router esta la solucion)
//   const { body } = req
//   const { title, price, description } = body
//   const cursoExiste = await Course.findOne({ title })

//   try {
//     if (cursoExiste || title === '' || price === '' || description === '')
//       return res.status(500).json({ message: 'All fields must be completed' })
//     const nuevoCurso = new Course({ title, price, description })
//     const savedCurso = await nuevoCurso.save()
//     res.status(201).json({ ok: true, data: savedCurso })
//   } catch (error) {
//     console.log(error)
//     res.status(500).json({ ok: false, error })
//   }
// })

app.post('/courses', async (req, res) => {
  const productData = req.body

  const schema = {
    title: { type: 'string', required: true },
    price: { type: 'number', required: true },
    description: { type: 'string', required: true }
  }

  try {
    for (const field in schema) {
      const { type, required } = schema[field]
      const value = productData[field]

      if (required && value === undefined) {
        throw new Error(`El campo '${field}' es obligatorio.`)
      }

      let isValidField = true

      if (typeof value !== type) {
        isValidField = false
      }

      if (isValidField === false) {
        throw new Error(`El campo '${field}' debe ser de tipo ${type}.`)
      }
    }

    const newCourse = new Course(productData)
    const savedCourse = await newCourse.save()

    res
      .status(201)
      .json({ message: 'Course created succesfully', data: newCourse })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

//conexion a la db
connectDB()
app.listen(5000, () => console.log('App listening to port 5000'))

module.exports = app
