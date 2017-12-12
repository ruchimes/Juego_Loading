class Game {
    constructor (element) {
        this.element = element;
        this.canvas = element.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
        this.context.scale(4, 16);

        this.player = new Player();

        this.colors = [
            '#7f7f7f',
            '#FF0D72',
            '#0DC2FF',
            '#0DFF72',
            '#F538FF',
            '#FF8E0D',
            '#FFE138',
            '#3877FF',
        ];

        let lastTime = 0;
        this._update = (time = 0) => {

            const deltaTime = time - lastTime;
            lastTime = time;

            if (this.player.continue) {
                if(this.player.update(deltaTime)){
                    this.draw();
                }
            }
            this.updateScore();
            requestAnimationFrame(this._update);
        };
    }

    run () {
      this._update();
    }

    play () {
        this.player.play();
        this.draw();
        this.player.reset();
    }

    draw () {
        var long = this.player.long;
        
        this.context.fillStyle = '#001';

        for(let y = 5; y > 0; y--){
            for (let x = 100; x > 0; x--) {
                if(x>long){
                    this.context.fillStyle = this.colors[0];
                }
                else{
                    this.context.fillStyle = this.colors[this.player.color];
                }

                this.context.fillRect(x, y, 1, 1);
            }
        }
    }

    stop () {
        if (this.player.continue) {
            this.player.stop();
        }
    }

    updateScore () {
        this.element.querySelector('#score').innerText = this.player.score;
        this.element.querySelector('#life').innerText = this.player.life;
        this.element.querySelector('#number').innerText = this.player.number;
    }
}
