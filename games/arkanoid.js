class ArkanoidGame {

    constructor(canvas, challenge){

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.challenge = challenge || {};
        this.gameOver = false;
        this.score = 0;
        this.goal = this.challenge.goal || 20;
        this.bricks=[];

const rows=4;
const cols=5;

const brickWidth=70;
const brickHeight=20;

const gap=6;

const offsetX=12;
const offsetY=40;

for(let r=0;r<rows;r++){

    for(let c=0;c<cols;c++){

        this.bricks.push({

            x:offsetX+c*(brickWidth+gap),
            y:offsetY+r*(brickHeight+gap),

            w:brickWidth,
            h:brickHeight,

            alive:true

        });

    }

}

        this.paddle = {

            x:160,
            y:370,
            w:80,
            h:12

        };

        this.ball = {

            x:200,
            y:340,
            r:8,
            dx:3,
            dy:-3

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

update(){

    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // =====================
    // Pared izquierda
    // =====================

    if(this.ball.x <= this.ball.r){

        this.ball.x = this.ball.r;
        this.ball.dx *= -1;

    }

    // =====================
    // Pared derecha
    // =====================

    if(this.ball.x >= this.canvas.width - this.ball.r){

        this.ball.x = this.canvas.width - this.ball.r;
        this.ball.dx *= -1;

    }

    // =====================
    // Techo
    // =====================

    if(this.ball.y <= this.ball.r){

        this.ball.y = this.ball.r;
        this.ball.dy *= -1;

    }

    // =====================
    // Rebote con la barra
    // =====================

    if(

        this.ball.dy > 0 &&

        this.ball.y + this.ball.r >= this.paddle.y &&

        this.ball.y - this.ball.r <= this.paddle.y + this.paddle.h &&

        this.ball.x >= this.paddle.x &&

        this.ball.x <= this.paddle.x + this.paddle.w

    ){

        const impact =

            (this.ball.x - this.paddle.x) / this.paddle.w;

        if(impact < 0.2){

            this.ball.dx = -4;
            this.ball.dy = -2;

        }else if(impact < 0.4){

            this.ball.dx = -2;
            this.ball.dy = -3;

        }else if(impact < 0.6){

            this.ball.dx = 0;
            this.ball.dy = -4;

        }else if(impact < 0.8){

            this.ball.dx = 2;
            this.ball.dy = -3;

        }else{

            this.ball.dx = 4;
            this.ball.dy = -2;

        }

        this.ball.y = this.paddle.y - this.ball.r;

    }

    // =====================
    // Colisión con ladrillos
    // =====================

    this.bricks.forEach(brick=>{

        if(!brick.alive) return;

        if(

            this.ball.x + this.ball.r >= brick.x &&
            this.ball.x - this.ball.r <= brick.x + brick.w &&
            this.ball.y + this.ball.r >= brick.y &&
            this.ball.y - this.ball.r <= brick.y + brick.h

        ){

            brick.alive = false;

            this.score++;

            document.getElementById("score").textContent =
            this.score.toString().padStart(4,"0");

            this.ball.dy *= -1;
            if(this.score >= this.goal){

              clearInterval(this.timer);

            document.getElementById("coordinates").style.display="block";

            }
        }

    });
    
    // =====================
    // GAME OVER
    // =====================

    if(this.ball.y - this.ball.r > this.canvas.height){

        clearInterval(this.timer);

        this.gameOver = true;

        document.getElementById("gameOverButtons").style.display = "block";

    }

}

    start(){

    clearInterval(this.timer);

    this.timer=setInterval(()=>{

        if(!this.gameOver){

            this.update();

        }

        this.draw();

    },16);

}

    restart(){

    clearInterval(this.timer);

    this.score = 0;

    document.getElementById("score").textContent = "0000";

    document.getElementById("coordinates").style.display = "none";
    document.getElementById("gameOverButtons").style.display = "none";

    this.gameOver = false;

    // Reiniciar barra

    this.paddle.x = 160;

    // Reiniciar pelota

    this.ball.x = 200;
    this.ball.y = 340;
    this.ball.dx = 3;
    this.ball.dy = -3;

    // Reiniciar ladrillos

    this.bricks.forEach(brick=>{

        brick.alive = true;

    });

    this.start();

        }
    
    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        
        // =====================
        // Ladrillos
        // =====================
        
        this.bricks.forEach(brick=>{
        
            if(!brick.alive) return;
        
            this.ctx.fillStyle="#1e90ff";
        
            this.ctx.fillRect(
                brick.x,
                brick.y,
                brick.w,
                brick.h
            );
        
            // Brillo
        
            this.ctx.fillStyle="#8fc7ff";
        
            this.ctx.fillRect(
                brick.x,
                brick.y,
                brick.w,
                2
            );
        
            // Sombra
        
            this.ctx.fillStyle="#0b4f99";
        
            this.ctx.fillRect(
                brick.x,
                brick.y+brick.h-2,
                brick.w,
                2
            );
        
        });
        
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

    if(this.gameOver){

    this.ctx.fillStyle="rgba(0,0,0,.65)";
    this.ctx.fillRect(
        0,
        0,
        this.canvas.width,
        this.canvas.height
    );

    this.ctx.fillStyle="#ff4040";
    this.ctx.font="bold 34px Arial";
    this.ctx.textAlign="center";

    this.ctx.fillText(
        t("gameOver"),
        this.canvas.width/2,
        this.canvas.height/2-25
    );

    this.ctx.fillStyle="#ffffff";
    this.ctx.font="18px Arial";

    this.ctx.fillText(
        "Score: " + this.score,
        this.canvas.width/2,
        this.canvas.height/2+15
    );

        }

    }   // ← cierra draw()

}       // ← cierra la clase
