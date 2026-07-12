class SnakeGame {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

    }

    start() {

        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        this.ctx.fillStyle = "#42ff42";
        this.ctx.font = "24px Arial";
        this.ctx.textAlign = "center";

        this.ctx.fillText(
            "Snake próximamente...",
            this.canvas.width/2,
            this.canvas.height/2
        );

    }

}
