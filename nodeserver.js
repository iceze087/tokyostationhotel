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
const pool = mysql.createPool({
    connectionLimit : 10,
    connectiontimeout : 20,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'tokyostationhotel' 
})

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
    res.render('index')
})

/*--------------------------------------Search Room--------------------------------------*/
app.post('/search_rooms',(req,res) => {
    pool.getConnection((err, connection)=>{
        if(err) throw err
        const params = req.body
        
        pool.getConnection((err , connection1) => {
            connection1.query('insert into tempcheck_room SET ? ',params ,(err) => {
                connection.release()
                pool.getConnection((err , connection3) => { 
                connection3.query('INSERT INTO tempcheck_room(room_id , reserve_checkindate , reserve_checkoutdate) SELECT room_id , reserve_checkindate , reserve_checkoutdate FROM room_reserve WHERE `reserve_checkindate` = ? and `reserve_checkoutdate` = ? ',[req.body.reserve_checkindate , req.body.reserve_checkoutdate] , (err) => {
                    connection.release()
                    pool.getConnection((err , connection2) => {
                connection2.query('SELECT * FROM room INNER JOIN tempcheck_room ON room.room_id <> tempcheck_room.room_id WHERE  tempcheck_room.tempcheck_id = ( SELECT MAX(tempcheck_id) FROM tempcheck_room ) and room.`class_id` = ? ' ,[req.body.class_id],(err,rows) => {
                    connection.release()
                    pool.getConnection((err , connection2) => {
                        connection2.query('SELECT *, DATE_FORMAT(reserve_checkindate,"%Y/%m/%d") AS checkin FROM tempcheck_room WHERE tempcheck_id = (SELECT MAX(tempcheck_id) FROM tempcheck_room) ORDER BY reserve_checkindate DESC LIMIT 0,14;',(err,rows2) => {
                            connection.release()
                            pool.getConnection((err , connection2) => {
                                connection2.query('SELECT *, DATE_FORMAT(reserve_checkoutdate,"%Y/%m/%d") AS checkout FROM tempcheck_room WHERE tempcheck_id = (SELECT MAX(tempcheck_id) FROM tempcheck_room) ORDER BY reserve_checkoutdate DESC LIMIT 0,14;',(err,rows3) => {
                    connection.release()
                    if (!err){
                    checkroom = {reserve : rows,datein : rows2 ,dateout : rows3 , error : err}
                    //res.send(rows2)
                    res.render('search_room',checkroom )   
                }
               
                else{
                    console.log(err)
                }
            })
            })
        })
    })
        })
        })
        })
         })
        })
        })
    })
})

/*--------------------------------------Payment--------------------------------------*/
app.post('/inputinfo',(req,res) => {
    pool.getConnection((err,connection) =>{
        if(err) throw err
            pool.getConnection((err,connection1)=>{
                connection1.query('select name_th from provinces',(err,provinces)=>{
                    connection.release()
                    pool.getConnection((err,connection2)=>{
                        connection2.query('select name_th from amphures',(err,amphures)=>{
                            connection.release()
                            pool.getConnection((err,connection3)=>{
                                connection3.query('select name_th from districts',(err,districts)=>{
                                    connection.release()
                                    pool.getConnection((err,connection4)=>{
                                        connection4.query('select zip_code from districts',(err,zip_code)=>{
                                            connection.release()
                                            pool.getConnection((err , connection2) => {
                                                connection2.query('SELECT * FROM room INNER JOIN tempcheck_room WHERE room.`room_id` = ? and tempcheck_room.`reserve_checkindate` = ? and tempcheck_room.`reserve_checkoutdate` = ? LIMIT 1;', [req.body.room_number,req.body.reserve_checkindate, req.body.reserve_checkoutdate],(err,rows) => {
                                                    connection.release()
                                                    pool.getConnection((err , connection2) => {
                                                        connection2.query('SELECT *, DATE_FORMAT(reserve_checkindate,"%Y/%m/%d") AS checkin FROM tempcheck_room WHERE tempcheck_id = (SELECT MAX(tempcheck_id) FROM tempcheck_room) ORDER BY reserve_checkindate DESC LIMIT 0,14;', [req.body.reserve_checkindate],(err,rows2) => {
                                                            connection.release()
                                                            pool.getConnection((err , connection2) => {
                                                                connection2.query('SELECT *, DATE_FORMAT(reserve_checkoutdate,"%Y/%m/%d") AS checkout FROM tempcheck_room WHERE tempcheck_id = (SELECT MAX(tempcheck_id) FROM tempcheck_room) ORDER BY reserve_checkoutdate DESC LIMIT 0,14;', [req.body.reserve_checkoutdate],(err,rows3) => {
                                                    connection.release()
                                                    if (!err){
                                                    showdatainfo = {provinces : provinces,amphures : amphures ,districts : districts, showdata : rows, datein : rows2 , dateout : rows3 ,  error : err}
                                                    //res.send(showdatainfo)
                                                    res.render('payment',showdatainfo )   
                                                }
                                               
                                                else{
                                                    console.log(err)
                                                }
                                                })
                                            })  
                                        })
                                    })  
                                        })
                                    })    
                                        })
                                    })
                                })
                            })
                                   
                        })
                    })
                })
            })
    })
   
})

app.post('/reserveroom',(req,res)=>{
    pool.getConnection((err,connection) =>{
        if(err) throw err
        const params = req.body

        pool.getConnection((err,connection)=>{
            connection.query('insert into room_reserve SET ?', params,(err) =>{
                connection.release()
                pool.getConnection((err,connection)=>{
                    connection.query('update room_reserve set reserve_status = "1" where `customer_name` = ?', [req.body.customer_name],(err) =>{
                        connection.release()
                pool.getConnection((err,connection) =>{
                    connection.query('select * from room_reserve where `customer_name` = ?' ,[req.body.customer_name], (err,reserve_data)=>{
                        connection.release()
                        pool.getConnection((err , connection2) => {
                            connection2.query('SELECT reserve_checkindate, DATE_FORMAT(reserve_checkindate,"%Y/%m/%d") AS checkin FROM room_reserve WHERE `customer_name` = ?', [req.body.customer_name],(err,datein) => {
                                connection.release()
                                pool.getConnection((err , connection2) => {
                                    connection2.query('SELECT reserve_checkoutdate, DATE_FORMAT(reserve_checkoutdate,"%Y/%m/%d") AS checkout FROM room_reserve WHERE `customer_name` = ?', [req.body.customer_name],(err,dateout) => {
                                                connection.release()
                                                reserve_data = {reserve_data : reserve_data , datein : datein , dateout : dateout}
                                                if(!err){
                                                    //res.send(reserve_data)
                                                    res.render('reserve_success',reserve_data)
                                                }
                                                else{
                                                    console.log(err)
                                                }
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

app.get('/check_reserve',(req,res) => {
    res.render('check_reserve')
})

app.post('/show_reserve',(req,res) =>{
    pool.getConnection((err,connection) =>{
        if(err) throw err

        pool.getConnection((err,connection) =>{
            connection.query('select *  from room_reserve where `reserve_id` = ? and  `customer_name` = ? and  `customer_lastmane` = ?' , [req.body.reserve_id , req.body.customer_name , req.body.customer_lastmane] , (err , customer_data) =>{
                connection.release()
                    pool.getConnection((err,connection) =>{
                        connection.query('SELECT reserve_checkindate, DATE_FORMAT(reserve_checkindate,"%Y/%m/%d") AS checkin FROM room_reserve WHERE `reserve_id` = ?' , [req.body.reserve_id],(err,checkin) =>{
                            connection.release()
                            pool.getConnection((err,connection) =>{
                                connection.query('SELECT reserve_checkoutdate, DATE_FORMAT(reserve_checkoutdate,"%Y/%m/%d") AS checkout FROM room_reserve WHERE `reserve_id` = ?' , [req.body.reserve_id],(err,checkout) =>{
                                    connection.release()
                                        if(customer_data[0]){
                                            show_reservedata = {customer_data : customer_data , checkin : checkin , checkout : checkout }
                                            res.render('show_reserve',show_reservedata)
                                        }
                                        else{
                                            res.render('show_Not_Found')
                                        }
                                })
                            })
                        })
                    })
            })
        })
    })
})

app.get('/gallery',(req,res)=>{
    pool.getConnection((err,connection)=>{
        connection.query('SELECT * FROM hotel_image ORDER by img_path',(err,allpic)=>{
            connection.release()
                allpic = {allpic : allpic}
                res.render('gallery',allpic)
        })
    })
})

app.get('/room',(req,res)=>{
    pool.getConnection((err,connection)=>{
        connection.query('SELECT * FROM hotel_image where img_type = "1"',(err,room)=>{
            connection.release()
                img = {room : room}
                res.render('galleryroom',img)
        })
    })
})

app.get('/food',(req,res)=>{
    pool.getConnection((err,connection)=>{
        connection.query('SELECT * FROM hotel_image where img_type = "2"',(err,food)=>{
            connection.release()
                food = {food : food}
                res.render('galleryfood',food)
        })
    })
})

app.get('/spa',(req,res)=>{
    pool.getConnection((err,connection)=>{
        connection.query('SELECT * FROM hotel_image where img_type = "3"',(err,spa)=>{
            connection.release()
                spa = {spa : spa}
                res.render('galleryspa',spa)
        })
    })
})

app.get('/travel',(req,res) => {
    res.render('travel')
})

app.get('/contact',(req,res) => {
    res.render('contact')
})



/*---------------Test Recive Data---------------*/

app.get ( "/TtShowdata", function ( req, res ) 
	{
                res.render ('TestShowdata');
	}
)
app.post ( "/search_roomsss", function ( req, res ) 
	{
	        /*var data = "";
	        data += "Data of Firstname is " + req.body.firstname;
	        data += "<br/>";
	        data += "Data of Lastname is " + req.body.lastname;*/
	        //res.send ( req.body );
            res.send(checkroom.reserve)
	}
)
app.post ( "/inputinfok", function ( req, res ) 
	{
	        /*var data = "";
	        data += "Data of Firstname is " + req.body.firstname;
	        data += "<br/>";
	        data += "Data of Lastname is " + req.body.lastname;*/
	        res.send ("i love bai tui");
	}
)

/*app.post ( "/search_rooms", function ( req, res ) 
	{
	        res.send ( req.body );
	}
)*/
