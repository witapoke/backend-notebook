//imports
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import Course from './models/CourseSchema.js'
import connectDB from './DB.js'
import passport from './passport/index.js'
import session from 'express-session'
import { generateJwt } from './helpers/GenerateToken.js'

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

//rutas
app.get('/', (req, res) => res.send('Express on Previewww'))

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000/login'
  }),
  function (req, res) {
    console.log({ user: req.user })
    const jwt = generateJwt(req.user)
    console.log({ jwt })
    res.redirect(`http://localhost:3000/profile?jwt=${jwt}`)
  }
)

app.get('/courses', async (req, res) => {
  const cursos = await Course.find({})
  res.status(200).json(cursos)
})

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

export default app
