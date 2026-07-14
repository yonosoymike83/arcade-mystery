class ArkanoidGame {

    constructor(canvas, challenge){

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.challenge = challenge || {};

        this.paddle = {

            x:160,
            y:370,
            w:80,
            h:12

        };

        this.ball = {

            x:200,
            y:340,
            r:8

        };

        this.bindControls();

    }

    bindControls(){

        document.addEventListener("keydown",(e)=>{

            if(e.key==="ArrowLeft")
                this.paddle.x-=20;

            if(e.key==="ArrowRight")
                this.paddle.x+=20;

            this.limitPaddle();

        });

        let startX=0;
        let paddleStart=0;

        this.canvas.addEventListener("touchstart",(e)=>{

            e.preventDefault();

            startX=e.touches[0].clientX;

            paddleStart=this.paddle.x;

        },{passive:false});

        this.canvas.addEventListener("touchmove",(e)=>{

            e.preventDefault();

            const dx=e.touches[0].clientX-startX;

            this.paddle.x=paddleStart+dx;

            this.limitPaddle();

        },{passive:false});

    }

    limitPaddle(){

        if(this.paddle.x<0)
            this.paddle.x=0;

        if(this.paddle.x+this.paddle.w>this.canvas.width)
            this.paddle.x=this.canvas.width-this.paddle.w;

    }

    start(){

        this.timer=setInterval(()=>{

            this.draw();

        },16);

    }

    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        // Barra

        this.ctx.fillStyle="#2dbb2d";

        this.ctx.fillRect(

            this.paddle.x,
            this.paddle.y,
            this.paddle.w,
            this.paddle.h

        );

        // Pelota

        this.ctx.fillStyle="#ffffff";

        this.ctx.beginPath();

        this.ctx.arc(

            this.ball.x,
            this.ball.y,
            this.ball.r,
            0,
    Math.PI*2
);

this.ctx.fill();

}

}
