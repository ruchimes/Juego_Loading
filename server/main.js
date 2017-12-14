// Parte del servidor express
let express = require('express');
let app = express();
let path = require('path');


app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname + '/../libs/html/index.html'));
});

app.get('/howto', function (req, res) {
   res.sendFile(path.join(__dirname + '/../libs/html/howto.html'));
});

app.get('/sessions', function (req, res) {
   res.sendFile(path.join(__dirname + '/../libs/html/session.html'));
});

app.get('/game', function (req, res) {
   res.sendFile(path.join(__dirname + '/../libs/html/game.html'));
});

app.get('/new', function (req, res) {
   res.sendFile(path.join(__dirname + '/../libs/html/new.html'));
});

app.listen(5000, function () {
  console.log('Listening at localhost:5000');
});

// Para servir los archivos js y css
app.use(express.static('./../libs'));




// Parte del servidor de websocket
const WebSocketServer = require('ws').Server;
const Session = require('./session');
const Client = require('./client');


const server = new WebSocketServer({port: 9000});

const sessions = new Map;


function createId (len = 6, chars = 'abcde12345') {
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function createClient (conn, id = createId()) {
    return new Client(conn, id);
}

function createSession (id, players = 4) {
    if(!sessions.has(id)) {
      if(id == "")
        id = createId();
      const session = new Session(id, players);
      sessions.set(id, session);
      return session;
    }
}

function getSession (id) {
    return  sessions.get(id);
}

server.on('connection', conn => {
    const client = createClient(conn);
    let session = null;

    conn.on('message', msg => {
        const data = JSON.parse(msg);
        session = getSession(data.sessionId);

        if(data.type === 'createSession') {

            session = createSession(data.name, data.players);

            if (session) {
              client.send({
                type: 'sessionCreated',
                id: session.id
              });
            }
            else {
              client.send({
                type: 'error',
                msg: 'Error, ya existe una sesión con el nombre "' + data.name + '"'
              });
            }            
        }
        else if (data.type === 'joinSession') {

            if (session) {
              // Compruebo si no esta la sesion llena para que no entre nadie mas
              if(!session.join(client)) {
                client.send({
                  type: 'error',
                  msg: 'Error, la sesión "' + data.sessionId + '" está empezada.'
                });
              }
              else {
                session.broadcastClients();
              }
            }
            else {
              client.send({
                type: 'error',
                msg: 'Error, la sesión "' + data.sessionId + '" no existe.'
              });
            }
        }
        else if(data.type === 'stateUpdate') {
          data.clientId = client.id;
          session.broadcastUpdate (data);
        }
        else if(data.type === 'restart') {
          sessions.delete(session.id);
          session.playing = false;
          sessions.set(session.id, session);
          session.broadcastClients();
        }
        else if(data.type === 'getSessions') {
          client.send({
            type: 'sessions',
            sessions: [...sessions],
          });
        }
    });

    conn.on('close', () => {
        const session = client.session;
        if (session) {
            session.leave(client);
            if (session.clients.size === 0) {
                sessions.delete(session.id);
            }
          session.broadcastClients();
        }
    });
});
