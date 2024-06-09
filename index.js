const express= require("express")
const chats=require("./data")
const dotenv=require("dotenv")
const cors=require('cors')
const app=express();
dotenv.config();
const connectDB=require('./config/db')
const userRoutes=require('./Routes/UserRoutes')
const ChatRoutes=require('./Routes/ChatRoutes');
const {notFound}=require("./middleware/errorMiddleware")
const {errorHandler}=require("./middleware/errorMiddleware")
const bodyParser = require("body-parser");
const {Server}=require('socket.io')
const {createServer}=require('http')


app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(notFound)
// app.use(errorHandler)

app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://socket-io-sooty-iota.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))


const server=createServer(app);
const io=new Server(server,{
    cors:{
        origin: [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://socket-io-sooty-iota.vercel.app"
          ],
        methods:["GET","POST"],
        credentials:true,
    }
});


const connectedSockets = [];
const rooms = new Set(); 

io.on("connection",(socket)=>{
    console.log("User connected", socket.id);
    connectedSockets.push(socket.id);
    io.emit("update-user-list", connectedSockets);

    socket.on("message",({message,room})=>{
        console.log(message,room);
        // io.emit("receive-message",data);
        // socket.broadcast.emit("receive-message",data);
        io.to(room).emit("receive-message",message)
    })
    socket.on("join-room",(room)=>{
        socket.join(room);
        rooms.add(room);
        io.emit("update-room-list", Array.from(rooms));
        console.log(`user Joined the room ${room}`);
    })
    socket.on("disconnect",()=>{
        console.log("user disconnected", socket.id);
        const index = connectedSockets.indexOf(socket.id);
        if (index !== -1) {
            connectedSockets.splice(index, 1);
        }
        io.emit("update-user-list", connectedSockets);
      })
    // socket.emit("welcome",`Welcome message ${socket.id}`);
    // socket.broadcast.emit("welcome",`${socket.id} Joined the server`);
})

// app.use("/api/user",userRoutes);
// app.use("/api/chat",ChatRoutes);
// app.get("/",(req,res)=>{
//     res.send("I am alive");
// })
// app.get("/api/chat",(req,res)=>{
//     res.send(chats)
// })
// app.get("/api/chat/:id",(req,res)=>{
//     const singlechat=chats.find((c)=>c._id===req.params.id);
//     res.send(singlechat);
// })

// connectDB();
app.get("/",(req,res)=>{
    res.send("working server");
})
server.listen(process.env.PORT,console.log(`listening in port ${process.env.PORT}`))