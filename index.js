require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()

app.get('/', (req, res) => res.send('Express on Previewww'))

mongoose
  .connect(
    'mongodb+srv://ignaciomanganaro22:Reformednacho90@mernstack.vxtmp.mongodb.net/?retryWrites=true&w=majority&appName=MERNstack'
  )
  .then(() =>
    app.listen('5000', () =>
      console.log('App listening to port 5000. DB CONNECTED SUCCESFULLY')
    )
  )

module.exports = app
