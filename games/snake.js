class SnakeGame {

    constructor(canvas, challenge) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.size = 20;

        this.snake = [
            {x:10,y:10},
            {x:9,y:10},
            {x:8,y:10}
        ];

        this.food = {
            x:15,
            y:10
        };

    }

    start(){

        this.draw();

    }

    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(0,0,400,400);

        // Cuadrícula

        this.ctx.strokeStyle="#1f1f1f";

        for(let i=0;i<=400;i+=this.size){

            this.ctx.beginPath();
            this.ctx.moveTo(i,0);
            this.ctx.lineTo(i,400);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0,i);
            this.ctx.lineTo(400,i);
            this.ctx.stroke();

        }

        // Comida

        this.ctx.fillStyle="red";

        this.ctx.fillRect(

            this.food.x*this.size,
            this.food.y*this.size,
            this.size,
            this.size

        );

        // Serpiente

        this.ctx.fillStyle="#42ff42";

        for(const part of this.snake){

            this.ctx.fillRect(

                part.x*this.size,
                part.y*this.size,
                this.size,
                this.size

            );

        }

    }

}
