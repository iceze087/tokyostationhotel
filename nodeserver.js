//open call express
const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const ejs = require('ejs');
const { request } = require('express');
const e = require('express');

const app = express()
const port = process.env.PORT || 5050;


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//mysql Connect phpmyadmin


var checkroom ={} //Global variable
var dateinout ={}
var allroomcheck ={}
//----------view----------//
app.set('view engine','ejs')
app.engine('ejs', require('ejs').__express);
//--------- Connect Public---------//
//Connect public folder
app.use(express.static('public'))
//--Run server--//
app.listen(port,() =>
    console.log("listen on port : ?",port)
)
app.get('/',(req,res) => {
    res.send ("test");
})
