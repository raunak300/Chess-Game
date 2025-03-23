const express=require('express');
const socket=require('socket.io');
const http=require('http'); 
const {Chess}=require('chess.js');

const port=3000;
const app=express();
const server=http.createServer(app);
const io=socket(server);
const chess=new Chess();  
const path=require('path');

const players={};
const currentPlayer="w";

app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,"public")));

app.get('/',(req,res)=>{
    res.render("index",{title:"chess game"});
})


io.on("connection",function(uniqueSocket){
    console.log("connected via socket io");
    //this will decide where message will go
    if(!players.white){
        players.white=uniqueSocket.id;
        uniqueSocket.emit("playerRole","w")
    }
    else if(!players.black){
        players.black=uniqueSocket.id;
        uniqueSocket.emit("playerRole","b")
    }else{
        uniqueSocket.emit("spectatorRole")
    }
    uniqueSocket.on("disconnect",function(){
        if(uniqueSocket.id==players.white){
            delete players.white;
        }
        else if(uniqueSocket.id==players.black){
            delete players.black; 
        }
    })
    uniqueSocket.on("move",(move)=>{  //this comes from frontend
        try{
            if(chess.turn()==="w" && uniqueSocket.id!=players.white)return 
            if(chess.turn()==="b" && uniqueSocket.id!=players.black)return 
            const result=chess.move(move);
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move)
                io.emit("boardstate",chess.fen())
            }
        }catch(err){
            console.log(err)
        }
    })




    // uniqueSocket.on("abc",function(){
    //     console.log("abc received");  
    // })
    // io.emit("abc-send");
    // uniqueSocket.on("disconnect",function(){
    //     console.log("disconnected on backend");
    // })
})

server.listen(port,()=>{
    console.log("listening on port 3000 ")
});
