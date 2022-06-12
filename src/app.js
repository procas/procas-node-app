const express = require('express') // Include ExpressJS
const app = express() // Create an ExpressJS app
const bodyParser = require('body-parser'); // Middleware
const path = require('path')
const config = require('./config.js')
const helper = require('./helper.js')
const sleep = require('system-sleep')
const request = require('request')
const cookieParser = require('cookie-parser');
const { save_note, get_notes, delete_note, modify_notes } = require('./config.js');
const { title } = require('process');
const { url } = require('inspector');
//const popup = require('node-popup')
//const alert = require('alert-node')
//let alert = require('alert')
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


app.get('/savenote', async function(req, res){
    if(req.cookies.jwt !== '')
    {
      const url = save_note
      const title = req.query.title
      const detail= req.query.details
      token = req.cookies.jwt
      let resp = await request.post({
        url: save_note,
        body: {'title':title, 'detail':detail, 'token':token},
        json:true,
      }, function(error, response, body) {
          //console.log(req.query.title+": "+req.query.details)
          if(response.body.message === "Saved")
          {
            console.log("Note saved")
            res.send("SAVED")
          }
          else
          {
            console.log(response.body)
            console.log("Error while saving")
          }
      })
    }
    else
    {
      res.send('No cookies set. Please log in again')
    }
})


app.get('/editnote', async function(req, res)
{
  const id = req.query.id
  const title = req.query.title
  const detail = req.query.detail
  res.render('editnote', {
   // 'username': username,
    'note_id': id,
    'edited_title': title,
    'edited_content': detail
  })
})

app.get('/postedit', async function(req, res)
{
  const id = req.query.note_id
  const edited_title = req.query.title
  const edited_body = req.query.content
  const token = req.cookies.jwt
  if(token !== '')
  {
    let resp = await request.post({
      url: modify_notes,
      body: {'id': id, 'title':edited_title, 'detail':edited_body, 'token':token},
      json:true,
    }, function(error, response, body) {
        //console.log(req.query.title+": "+req.query.details)
        if(response.body.message === "Note Updated")
        {
         // console.log("Note saved")
          res.send("SAVED")
        }
        else
        {
          console.log(response.body)
          console.log("Error while saving")
        }
    })
  }
  else
  res.send("Token is expired, please login again")
  // console.log(req.query)
  // res.send("UPDATED NOTE "+id+": "+edited_title+": "+edited_body)
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

app.get('/deletenote', async function(req, res){
  id = req.query.id
  token = req.cookies.jwt
  //console.log(token)
  if(token !== '')
  {
    const url = delete_note+"?token="+token+"&id="+id
    let resp = await request.get({url:url, json:true}, (error, response) => {
      //console.log(url)
      resp = response.body.message
      if(resp === "Note Deleted")
        res.send("Deleted note# "+id)
      else
        res.send("Error while deleting")
    })
  }
  else
  res.send("Unauthorized, please log in again")
})


app.post('/postregister', async function (req, res) {
  let username = req.body.username
  let pwd = req.body.password
  let password = req.body.conf_password
  const url = config.register_url.toString()
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