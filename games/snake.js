class SnakeGame {

    constructor(canvas, challenge) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.challenge = challenge;

        this.size = 20;
        this.grid = 20;

        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];

        this.food = {
            x: 15,
            y: 10
        };

        this.direction = {
            x: 1,
            y: 0
        };

    }

    start() {

        this.draw();

        this.loop = setInterval(() => {

            this.update();
            this.draw();

        }, 200);

    }

    update() {

        const head = {

            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y

        };

        // Sale por un lado y entra por el otro
        if (head.x >= this.grid) head.x = 0;
        if (head.x < 0) head.x = this.grid - 1;

        if (head.y >= this.grid) head.y = 0;
        if (head.y < 0) head.y = this.grid - 1;

        this.snake.unshift(head);

        this.snake.pop();

    }

    draw() {

        // Fondo
        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Cuadrícula
        this.ctx.strokeStyle = "#1f1f1f";

        for (let i = 0; i <= this.canvas.width; i += this.size) {

            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();

        }

        // Comida
        this.ctx.fillStyle = "#ff3030";

        this.ctx.fillRect(
            this.food.x * this.size,
            this.food.y * this.size,
            this.size,
            this.size
        );

        // Serpiente
        this.ctx.fillStyle = "#42ff42";

        for (const part of this.snake) {

            this.ctx.fillRect(
                part.x * this.size,
                part.y * this.size,
                this.size,
                this.size
            );

        }

    }

}
