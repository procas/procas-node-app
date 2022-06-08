const { response } = require('express')
const config = require('./config.js')
const http = require('./httpClientProvider')

const login_response = function(user, pass)
{
    const url = config.login_url.toString()
    const endpt = "?email="+user+"&password="+pass
    //make the http call
    console.log(url+endpt)
    const resp = http.get_no_auth(url+endpt)
    return resp
}

module.exports = {
    login_response: login_response
}