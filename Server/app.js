// External Libraries, literally copy pasted
const express = require('express');
const path = require('path');
const app = express();
const serv = require('http').Server(app);
const io = require('socket.io')(serv, {
    serveClient: false,

    // sometimes we get double connections for some reason so
    // this is a way to deal with it ( sometimes it doesn't work though )
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});

// Heroku does not allow hardcoded ports but we want
// our development env to be at 1337 because we're edgy
const port = process.env.PORT || 1337;

// assets
const handler = require('./Handler');
const Player = require ('./Player');
const util = require('./Utility');
const config = require('../config');

/*
const populate = require('./Populate');
const upg = require('./Upgrades');
const timer = require('./Countdown');
*/

class Server {
    // useless object
    constructor(){
        app.set('trust proxy', true);
        app.use(express.static(path.join(__dirname, '../Client')));
        this.dir = path.join(__dirname, '../Client/');
    }
}

server = new Server();

app.get('/', (req, res) => {
    console.log(`Received connection from ${req.ip}`);
res.sendFile(server.dir + 'index.html', (err) => {
    if (err) console.log(err);
    });
});

app.get('/js/:module', (req, res)=>{
    res.sendFile(server.dir + req.params.module, (err)=>{
    if (err) console.log(err);
    })
});

app.get('/css/:module', (req, res)=>{
    res.sendFile(server.dir + req.params.module, (err)=>{
    if (err) console.log(err);
    });
});

app.get('/Media/:img', (req,res)=>{
    res.sendFile(server.dir + req.params.img, (err)=>{
    if (err) console.log(err);
})
});

app.get('SharedVariables', (req,res)=>{
    res.sendFile(server.dir + 'SharedVariables.js')
});


serv.listen(port, () => {
    console.log(`Server now listening on port ${port}`)
});


global.players = {};
global.SOCKET_LIST = {};

global.foods = [];

io.sockets.on('connection', function(socket){
    SOCKET_LIST[socket.id] = socket;

    players[socket.id] = new Player(1920/2, 949/2, 100, config.classes.randChoice());
    players[socket.id]['id'] = socket.id;

    socket.on('ready', ()=>{
        console.log("someone connected");

        handler.emitAll('playerConnect', players[socket.id]);
    });


    socket.on('mouseMove', pack => {
        players[socket.id].move(pack);
    });

    socket.on('disconnect', ()=>{
        delete SOCKET_LIST[socket.id];
        delete players[socket.id];
    });
});



setInterval(function(){
    for (let i in players){
        players[i].update();
    }

    handler.emitAll('playerUpdate', players);
    handler.emitAll('foodsUpdate', foods);
    //console.log(players);
}, 1000/60);