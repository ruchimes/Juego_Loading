class Player {
    constructor () {
        this.events = new Events ();

        this.dropCounter = 0;
        this.dropInterval = 30;

        this.score = 0;
        this.life = 30;

        this.number = 0;
        this.long = 0;
        this.opportunity = 1;

        this.color = null;

        this.continue = false;
        this.end = false;
    }

    update (deltaTime) {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
            this.dropCounter = 0;
            return true;
        }
        return false;
    }

    drop () {
        if (this.long < 100) {
            this.long ++;
        }
        else {
            if (this.opportunity < 3) {
                this.long = 0;
                this.opportunity ++;
            }
            else {
                this.stop();
            }
        }
        this.events.emit('long', this.long);
        this.dropCounter = 0;
    }

    stop () {
        this.continue = false;
        let diff = Math.abs(this.number - this.long);

        $("num").innerText = this.number + " -> " + this.long;
        this.long=0

        this.life -= Math.ceil(diff/2);
        
        if (this.life < 0) {
            this.life = 0;
            diff = -1;
            $("num").innerText = "Se acabó"
            this.end = true;
            this.events.emit('end', this.end);
        }
        else{
            this.reset();
        }
        this.puntuate(diff);
        this.events.emit('life', this.life);
        this.events.emit('score', this.score);
    }
    
    reset () {
        this.number = Math.floor((Math.random()*81)+10);

        this.color = (Math.random()*7 | 0) +1;
        this.opportunity = 1;

        setTimeout(function (player) {
            player.continue = true;
            //player.events.emit('long', player.long);
        }, 1500, this);

        this.events.emit('color', this.color);
        this.events.emit('number', this.number);
    }

    play () {
        this.score = 0;
        this.life = 30;

        this.long = 0;
        this.opportunity = 1;

        this.continue = false;
        this.end = false;
    }

    puntuate (diff) {
        switch(diff) {
            case 0:
                this.score +=5;
                break;
            case 1:
                this.score +=4;
                break;
            case 2:
                this.score +=3;
                break;
            case 3:
                this.score +=2;
                break;
            default:
                this.score +=1;
        }
    }
}
