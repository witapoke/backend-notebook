import mongoose from 'mongoose'
import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  firstname: String,
  lastname: String,
  pictureUrl: String,
  email: String,
  googleId:String
})

const User = model('User', userSchema)

export default User
