function $(id) {
  return document.getElementById(id);
}

class ConnectionManager {

    constructor () {
        this.address = `ws://${window.location.hostname}:9000`;
        this.conn = null;
        this.session = window.location.hash.split('#')[1];
        this.peers = new Map;
        this.gameManager = null;
        this.localGame = null;
        this.connect();
    }

    connect(){
        this.conn = new WebSocket(this.address);

        this.conn.addEventListener('message', event => {
            this.receive(event.data);
        });
    }

    init () {
      this.conn.addEventListener('open', () => {
          this.initSession();
          this.watchEvents();
      });
    }

    addGameManager (gameManager) {
        this.gameManager = gameManager;
        this.localGame = [...gameManager.instances][0];
    }

    initSession () {
        if (this.session) {
            this.send({
                type: 'joinSession',
                sessionId: this.session
            });
        }
        else {
          this.errorRedirect("No existe esta sesión");
        }
    }

    watchEvents () {
      const player = this.localGame.player;

      ['long', 'number', 'life',
       'score', 'color', 'end'].forEach(prop => {
        player.events.listen (prop, value => {
          this.send({
            type: 'stateUpdate',
            sessionId: this.session,
            fragment: 'player',
            state: [prop, value]
          });
        });
      });
    }

    updateManager (peers) {
        const me = peers.you;
        const clients = peers.clients.filter(id => me !== id);
        clients.forEach(id => {
          if (!this.peers.has(id)) {
            const player = this.gameManager.createPlayer();
            this.peers.set(id, player);
          }
        });

        [...this.peers.entries()].forEach(([id, player]) => {
          if(clients.indexOf(id) === -1) {
            this.gameManager.removePlayer(player);
            this.peers.delete(id);
          }
        });
    }

    updatePeer (id, fragment, [prop, value]) {
        if (!this.peers.has(id)){
          return;
        }

        const game = this.peers.get(id);
        game[fragment][prop] = value;

        if (prop === 'long') {
          game.draw();
        }
        else {
          game.updateScore(value);
        }
    }

    receive (msg) {
        const data = JSON.parse(msg);
        console.log(data);
        if (data.type === 'sessionCreated') {
            window.location.href = '/game#' + data.id;
        }
        else if (data.type === 'sessionBroadcast') {
          this.updateManager(data.peers);
        }
        else if (data.type === 'stateUpdate') {
          this.updatePeer (data.clientId, data.fragment, data.state);
        }
        else if (data.type === 'start') {
          this.gameManager.start();
        }
        else if (data.type === 'sessions') {
          this.showSessions(data.sessions);
        }
        else if (data.type === 'error') {
            this.errorRedirect(data.msg)
        }
    }

    errorRedirect (msg) {
        localStorage.setItem("error", msg);    
        window.location.href = '/sessions';
    }

    send (data) {
      console.log(data);
        const msg = JSON.stringify(data);
        this.conn.send(msg);
    }

    restart () {
      $("message").innerText = "Esperando mas jugadores";
      this.send({
          type: 'restart',
          sessionId: this.session,
      });
    }

    getSessions () {
        this.send({
            type: 'getSessions',
        });
    }

    newSession (name, players) {
      this.send({
        type: 'createSession',
        name: name,
        players: players
      });

    }

    showSessions (sessions) {
        const template = $("sessionTemplate");
        const container = $("sessions");

        container.innerHTML = "";

        sessions.forEach(session => {
          session = session[1];
          const element = document.
                importNode(template.content, true).
                children[0];
          element.querySelector('#name').innerText = session.id;
          element.querySelector('#players').innerText = session.numClients + "/" + session.maxClients;
          element.querySelector('#session').setAttribute('href', "./game#" + session.id);
          
          if (session.playing) {
              element.querySelector('#session').className += "  disabled";
          }

          container.appendChild(element);
        });
    }
}
