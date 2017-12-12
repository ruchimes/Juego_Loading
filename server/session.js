class Session {
    constructor (id, clients) {
        this.id = id;
        this.clients = new Set;
        this.numClients = 0;
        this.maxClients = clients;
        this.playing = false;
    }

    join (client) {
        if (client.session) {
            throw new Error('client already in session');
        }
        else if (this.numClients < this.maxClients && !this.playing) {
          this.clients.add(client);
          this.numClients++;
          client.session = this;
          return true;
        }
        else {
          return false;
        }
    }

    leave (client) {
        if (client.session !== this) {
            throw new Error('client not in this session');
        }
        this.clients.delete(client);
        this.numClients--;
        client.session = null;
    }

    broadcastClients () {
        const clients = [...this.clients];
        clients.forEach(client => {
          client.send({
            type: 'sessionBroadcast',
            peers: {
              you: client.id,
              clients: clients.map(client => client.id)
            }
          });

          if(this.numClients == this.maxClients) {
            this.playing = true;
            client.send({
              type: 'start',
            });
          }
        });
    }

    broadcastUpdate (data) {
        this.clients.forEach(client => {
          if (this === client) {
            return;
          }
          client.send(data);
        });
    }
}

module.exports = Session;
