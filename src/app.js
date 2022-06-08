const express = require('express') // Include ExpressJS
const app = express() // Create an ExpressJS app
const bodyParser = require('body-parser'); // Middleware
const path = require('path')
const config = require('./config.js')
const helper = require('./helper.js')
const sleep = require('system-sleep')
const request = require('request')
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }));
const publicDirPath = path.join(__dirname, '../public')

app.get('/register', (req, res) => {
  res.sendFile(publicDirPath+'/register.html');
});

// Route to Login Page
app.get('/', (req, res) => {
  res.sendFile(publicDirPath+'/login.html');
});

app.post('/postlogin', async function(req, res) {
  // Insert Login Code Here
  let username = req.body.username;
  let password = req.body.password;
  const url = config.login_url.toString()
 // let resp = "Default"
  const endpt = "?email="+username+"&password="+password
  let resp = await request({url:url+endpt, json:true}, (error, response) => {
    //sleep(2000);
    resp = response.body.message
    console.log(resp)
    res.send(resp)
})

});

app.post('/postregister', async function (req, res) {
  let username = req.body.username
  let password = req.body.conf_password
  url = config.register_url.toString()
  const endpt = "?email="+username+"&pass="+password
  let resp = await request({url:url+endpt, json:true}, (error, response) => {
    resp = response.body.message
    console.log(resp)
    res.send(resp)
})
 // res.send(username+" "+password)
})


app.listen(port, () => console.log(`This app is listening on port ${port}`));