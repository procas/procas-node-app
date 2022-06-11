const express = require('express') // Include ExpressJS
const app = express() // Create an ExpressJS app
const bodyParser = require('body-parser'); // Middleware
const path = require('path')
const config = require('./config.js')
const helper = require('./helper.js')
const sleep = require('system-sleep')
const request = require('request')
const cookieParser = require('cookie-parser');
const { save_note, get_notes } = require('./config.js');
const { title } = require('process');
const port = process.env.PORT || 3000

// Deploy: git push heroku main

app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
const publicDirPath = path.join(__dirname, '../public')

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  //res.sendFile(publicDirPath+'/login.html');
  res.render('login.hbs')
});

// Route to Login Page
app.get('/', (req, res) => {
  res.sendFile(publicDirPath+'/home.html');
});

app.get('/loggedin', (req, res) => {
  res.render('loggedin', {
    'username':'mailtoproma@gmail.com'
  })
})

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
    token = response.body.token
    console.log(resp)
    if(resp === "Logged in")
    {
      //save token in session
      res.cookie('jwt', token)
      //console.log(token)
      res.render('loggedin.hbs', {
        'username': username
      })
    }
    else
      res.render('login', {
        incorrect:'Incorrect Password or Username'
      })
})

});


app.post('/savenote', async function(req, res){
    if(req.cookies.jwt !== '')
    {
      const url = save_note
      const title = req.body.title
      const detail= req.body.details
      token = req.cookies.jwt
      let resp = await request.post({
        url: save_note,
        body: {'title':title, 'detail':detail, 'token':token},
        json:true,
      }, function(error, response, body) {
          //console.log(body)
          res.send({body})
      })
    }
    else
    {
      res.send('No cookies set. Please log in again')
    }
})

app.get('/getnotes', async function(req, res) 
{
if(req.cookies.jwt !== '')
{
  token = req.cookies.jwt
  const url = get_notes+"?token="+token
  let resp = await request.get({url: url, json: true}, (error, response) => {
    notes = response.body
    //console.log(notes)
    res.render('viewnotes', {
      notes: notes
    });
  })
  
}

})


app.post('/postregister', async function (req, res) {
  let username = req.body.username
  let pwd = req.body.password
  let password = req.body.conf_password
  url = config.register_url.toString()
  console.log("Password: "+pwd)
  console.log("Confirm password: "+password)
  if(pwd !== password)
  {
    res.render('register', {
      passnotmatch: 'Passwords are not matching'
    })
  }
  else
  {
      const endpt = "?email="+username+"&pass="+password
      let resp = await request({url:url+endpt, json:true}, (error, response) => {
        resp = response.body.message
        console.log(resp)
        if(resp === "Success")
          res.render('registered.hbs', {
            'username': username
          })
        else
          res.render('register', {
            existinguser: 'It seems like you have already registered!'
          })
    })
  }
 // res.send(username+" "+password)
})


app.listen(port, () => console.log(`This app is listening on port ${port}`));