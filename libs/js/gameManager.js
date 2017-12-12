class GameManager {

    constructor(document) {
        this.template = $("playerTemplate");
        this.instances = new Set;
        this.playing = false;
    }

    createPlayer() {
        const element = document.
              importNode(this.template.content, true).
              children[0];
        const game = new Game(element);
        game.updateScore();
        game.draw();
        this.instances.add(game);

        document.body.appendChild(game.element);

        return game;
    }

    removePlayer (instance) {
        this.instances.delete(instance);
        document.body.removeChild(instance.element);
    }

    start () {
        $("message").innerText = "Jugando";
        $("restart").disabled = true;
      [...this.instances].forEach(game => {
        game.play();
      });
      this.playing = true;
    }

    checkPlaying () {
        let end = false;
        let instances = [...this.instances];

        if(this.instances.size < 2) {
            end = instances[0].player.end;
        }
        else {
            end = instances.reduce((game1,game2) => {
                if(game1 instanceof Game){
                    game1 = game1.player.end;
                }
                return game1 * game2.player.end;
            });
        }
        
        if(end) {
            this.podium();
            this.playing = false;
        }
    }

    podium () {
        const instances = [...this.instances];

        if(this.instances.size < 2) {
            $("message").innerText = "Has conseguido " + instances[0].player.score + " puntos";
            $("restart").disabled = false;
        }
        else {
            let points =  instances.map( game => {
                return Number(game.element.querySelector('#score').innerText);
            }).map(function(el, i) {
                return { index: i, value: el };
            })

            points.sort(function(a, b) {
                return b.value - a.value;
            });

            let pos = 1;
            let prev = null

            points.forEach( el => {
                if(prev && prev.value == el.value){
                    pos--;
                }

                if (!el.index) {
                    $("message").innerText = "Has quedado " + pos + "º";
                    $("restart").disabled = false;
                }
                pos++;
                prev = el;
            });
        }
    }
}

