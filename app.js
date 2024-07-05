import express from "express"
import {Server as WebSocketServer} from "socket.io";
import http from "http"
import path from "path";



const app = express();
// Setting the Compile engine for .ejs files
app.set("view engine","ejs")
// Setting the Static Assets Folder (public) for the React Application where the static content will be served.
// If the static resource is requested then this middleware will intercept the request and check of that resource is
// present in the specified folder , if does then it will just send that to the user.
app.use(express.static("public"))
// Creating the instance of Http Server
const server = http.createServer(app)
// Creating the instance of WebSocket Server
// and passing the http server as an argument to the WebSocket server
// to Specify from where the request for webSocket Connection will Come.
// Because First Request for webSocket Connection is an "HTTP Request"
const io = new WebSocketServer(server)

// This will contain only the unique values whether it is primitive or user defined.
const connectedUser = new Set()

// As WebSocket is a consistent connection between the client and the server so everything will happen
// When both client and server are connected.
io.on("connection",(socket) =>
{
    connectedUser.add(socket.id);
    console.log("Latest Number of Connected Users:",connectedUser.size)

    // Listening for new connection
    socket.on("sendLocation",function (data)
    {
        // Emit this event to all the connected user.
        io.emit("receive-location",{id:socket.id,...data})
    })

    // When user disconnects.
    socket.on("disconnect",() =>
    {
        connectedUser.delete(socket.id)
        console.log("Latest Number of Connected Users:",connectedUser.size)
        io.emit("user-disconnected",{id:socket.id})
    })
})

app.get("/",function (req,res)
{
    // We do not send the ".ejs" file to the client
    // We render it means we will be compiling the .ejs file
    // to HTML as well as executing the code present inside it
    // and then send the final result to the client.
    res.render('index')
})

server.listen(3000,()=>
{
    console.log("App is Running on PORT:3000")
})

