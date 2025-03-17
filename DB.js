import mongoose from 'mongoose'
import app from './index.js'
export default async function connectDB() {
  await mongoose
    .connect(
      'mongodb+srv://ignaciomanganaro22:Reformednacho90@mernstack.vxtmp.mongodb.net/?retryWrites=true&w=majority&appName=MERNstack'
    )
    .then(() =>
      app.listen('5000', () =>
        console.log('App listening to port 5000. DB CONNECTED SUCCESFULLY')
      )
    )
}
