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

        // =====================
        // Barra estilo Arkanoid
        // =====================

        const x=this.paddle.x;
        const y=this.paddle.y;
        const w=this.paddle.w;
        const h=this.paddle.h;

        // Puntas rojas
        this.ctx.fillStyle="#d63b2f";
        this.ctx.fillRect(x,y,8,h);
        this.ctx.fillRect(x+w-8,y,8,h);

        // Cuerpo gris
        this.ctx.fillStyle="#bdbdbd";
        this.ctx.fillRect(x+8,y,w-16,h);

        // Brillo
        this.ctx.fillStyle="#f5f5f5";
        this.ctx.fillRect(x+8,y,w-16,2);

        // Sombra
        this.ctx.fillStyle="#7a7a7a";
        this.ctx.fillRect(x+8,y+h-2,w-16,2);

        // =====================
        // Pelota
        // =====================

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
