const { Socket } = require('engine.io');
const express= require('express') ;
const { v4 : uuidV4} = require('uuid') ;  // to create unique id for every room
const dotenv= require('dotenv') ;
//const nodemailer = require("nodemailer");
const path= require('path') ;
const app= express() ;
const server= require('http').Server(app) ;
const io= require('socket.io')(server) ;  // to make socket connections among participants


const {ExpressPeerServer}= require('peer') ;    // webrtc framework for video calling
const peerserver= ExpressPeerServer(server,{
    debug:true ,
    //port: 443 
}) ;
/*
var Transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: "vichill.engage@gmail.com",
        pass: "Vichill1359@"
    }
});

*/
app.set('view engine','ejs') ;   // using ejs template
app.use(express.static('public')) ;
app.use('/peerjs', peerserver) ;


dotenv.config({path:__dirname+'/views/config.env'})

app.get('/', (req,res)=>{
    res.render('index') ;   // home page of website
})

app.get('/meet', (req,res)=>{
    
    res.redirect(`/${uuidV4()}`) ;   // making a room when started a meeting
})

// resolving paths to use directly instead of witing complete path again again whenever required
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/images', express.static(path.resolve(__dirname, "images")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))


// using self created ejs page to host rooms. passing the unique room_id generated by uuid
app.get('/:room', (req,res)=>{
    res.render('room', {roomId:req.params.room})   
})


// making socket connections with peers
io.on('connection', socket=>{
    socket.on('join-room',(roomId , userId, username)=>{
        socket.join(roomId) ;   
        socket.broadcast.to(roomId).emit('user-connected', userId, username) ;  // telling every participant that a new user has connectedso that they can add his stream too
       
 
// when someone sends a message it will be send to everryone in the room with message and name of writer
socket.on('message', (msg,name) => {
    io.to(roomId).emit('createmsg', msg,name)
})

// telling every participant that a user has disconnected so that they can remove his stream.
socket.on('disconnect', (userId, username) => {
    socket.broadcast.to(roomId).emit('user-disconnected', userId, username) ;

  })
  socket.on('joined-video',(roomId ,userId, username) =>{
    
    socket.broadcast.to(roomId).emit('user-connected-video', userId, username) ;  
})

socket.on('user-discon-video',(roomId ,userId, username) =>{
    
    socket.broadcast.to(roomId).emit('user-left-video', userId, username) ;  
})

    })

})

// port given by host where our server will be hosted
server.listen(process.env.PORT || 3030) ;


console.log(`server running on http://localhost:3030`) ;

