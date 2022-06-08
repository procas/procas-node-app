const { response } = require('express')
const request = require('request')

const get_no_auth  = async function(url)
{
    let res = ""
    let resp = await request({url:url, json:true}, (error, response) => {
        res = response.body.message
    })
    console.log(res)
    return resp
}

module.exports = {
    get_no_auth: get_no_auth
}