const express = require('express')
const mongoose = require('mongoose')
const user = require('./routes/user')
const profile = require('./routes/profile')
const post = require('./routes/post')
const bodyParser = require('body-parser')
const passport = require('passport')
const app = express();

const db = require('./config/keys.js').mongoURI;

mongoose.connect(db, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => console.log("MongoDB connected")).catch(err => console.log(err))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(passport.initialize())

require('./config/passport')(passport)

app.use('/api/user', user)
app.use('/api/profile', profile)
app.use('/api/post', post)

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log('Server running on port ' + port);
})