import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import Course from './models/CourseSchema.js'
import connectDB from './DB.js'
import passport from 'passport'

const app = express()

app.use(express.json())
app.use(cors())
app.use(passport.initialize())

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/profile')
  }
)

app.get('/', (req, res) => res.send('Express on Previewww'))

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

connectDB()

export default app
