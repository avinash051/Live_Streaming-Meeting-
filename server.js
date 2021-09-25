const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
// Peer
//var mongo = require('mongodb'); 
// const MongoClient = require('mongodb').MongoClient
// var url = "mongodb://localhost:27017/";

// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("dev_db");
//   dbo.collection("users").findOne({id:'2'}, function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// }); 
//mongodb+srv://ilp:<password>@ilpinfotech.4seqn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// http://localhost:3030/9room24?authUser=vishwam&email=vishwam@test.com&user_id=12

const MessageTable = require('./model');

const mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost:27017/dev_db');
mongoose.connect('mongodb+srv://vishwam:Yav8Ryso437gRNWA@cp0.5lbqr.mongodb.net/dev_db');

mongoose.connection.once('open',function(){
    console.log('connection has been made...');
}).on('error', function(error){
    console.log('error is:', error);
});
app.use(express.json());
app.post('/message', async (req,res)=>{
  console.log(req.body);
  const {msgId,msg,username,email,userId} = req.body; 
  try{

    const newData = new MessageTable({msgId,msg,username,email,userId})
    await newData.save();
    return res.json(await MessageTable.find())
   }catch(err){
      console.log(err.message);  
   }
})

// ================ clear
const { ExpressPeerServer } = require("peer");
const { nextTick } = require("process");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, rsp) => {
  rsp.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  const roomId2= req.params.room
  if(roomId2 === "thankyou"){
    //res.render("thankyou");
    res.render('thankyou');
  }else{
    res.render("room", { roomId: req.params.room });
  }
 
});
// app.get("/thankyou", (req, res) => {
//  res.render("thankyou");
// });
//  var url = new URL(window.location.href);
//  var username = url.searchParams.get("authUser");
//  console.log(username)
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.emit('test event','here is some data');
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage",  message);
    });
   
     // disconnected
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected',userId)
    });
    socket.on("participants", (count) => {
      io.to(roomId).emit("participantsCount",  count);
    });
  });
 
});

server.listen(process.env.PORT || 3030,()=>console.log('Server running...'));

