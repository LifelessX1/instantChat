var express=require("express")
var app = require('express')();
var http = require('http').createServer(app);
const session = require('express-session');
var sess=session({secret: 'ssshhhhh'})
var io = require('socket.io')(http);
const user=require("./models/user.model")
const ejs=require("ejs")
const mongoose=require("mongoose")
io.use(function(socket, next) {
    sess(socket.request, socket.request.res || {}, next);
});
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json({extended : true}));
app.use(sess);
app.set("view engine",ejs)

const uri = "mongodb+srv://dbroot:dbpass@cluster0-pg1so.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(uri, {
  useNewUrlParser: true
});
var name=""
app.get('/', (req, res) => {
  res.render("login.ejs",{msg:undefined});
});
var Active={}
app.post("/signup",(req,res)=>{

  var username=req.body.username
  var password=req.body.password
var user1=new user({username:username,password:password})
user1.save((err)=>{
if(err.code==11000){
res.render("signup.ejs",{msg:"This username already exists"})

}



})})
app.get("/create",(req,res)=>{
res.render("create.ejs")
})
app.post("/create",(req,res)=>{
  var room=req.body.room
  res.redirect("/chat/"+room)
})
app.get("/dashboard",(req,res)=>{
res.render("dashboard.ejs")

})
app.get("/register",(req,res)=>{

res.render("signup.ejs",{msg:undefined})


})
app.post("/login",(req,res)=>{
  var username=req.body.username
  var password=req.body.password
var user1=new user({username:username,password:password})



  
});

app.get("/logout",(req,res)=>{

req.session.destroy();
res.redirect("/")


})
app.get("/chat/:number",(req,res)=>{

  res.render("chat.ejs")})

io.on('connection', (socket) => {
  socket.on('room',(number)=>{
  socket.request.session.number=number
	socket.join(number);
  if(typeof Active[number] === "undefined") {
  Active[number]=1}else{Active[number]+=1}
  

	io.to(number).emit('chat message',socket.request.session.username+" has connected.")})
  socket.on('chat message', (msg) => {
  	
    io.to(socket.request.session.number).emit('chat message',socket.request.session.username+": "+msg);
    
  });
  socket.on('disconnect',(dis)=>{Active[socket.request.session.number]-=1
    io.to(socket.request.session.number).emit('chat message',socket.request.session.username+" has disconnected.")
    if(Active[socket.request.session.number]==0){


    delete Active[socket.request.session.number]}

  })
});

app.get("/Browse",(req,res)=>{
  res.send(Active)


})



const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});