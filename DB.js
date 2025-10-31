const mongoose = require('mongoose')
const app = require('./index.js')

async function connectDB() {
  try {
    const connection = await mongoose
      .connect(
        'mongodb+srv://ignaciomanganaro22:Reformednacho90@mernstack.vxtmp.mongodb.net/?retryWrites=true&w=majority&appName=MERNstack'
      )
      .then(() => console.log('Database connected succesfully'))
    return connection
  } catch (error) {
    console.error(error)
  }
}

module.exports = connectDB
