class ArkanoidGame {

    constructor(canvas, challenge){

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.challenge = challenge || {};
        this.gameOver = false;
        this.score = 0;
        this.goal = this.challenge.goal || 20;
        this.bricks=[];
        
        this.leftPressed = false;
        this.rightPressed = false;

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

            alive:true,
            hit:false,
            hitTime:0

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

    const touchArea = document.getElementById("touchArea");

    document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowLeft")
        this.leftPressed = true;

    if(e.key==="ArrowRight")
        this.rightPressed = true;

});

document.addEventListener("keyup",(e)=>{

    if(e.key==="ArrowLeft")
        this.leftPressed = false;

    if(e.key==="ArrowRight")
        this.rightPressed = false;

});

    let startX=0;
    let paddleStart=0;

    const touchStart = (e)=>{

        e.preventDefault();

        startX = e.touches[0].clientX;
        paddleStart = this.paddle.x;

    };

    const touchMove = (e)=>{

        e.preventDefault();

        const dx = e.touches[0].clientX - startX;

        this.paddle.x = paddleStart + dx;

        this.limitPaddle();

    };

    this.canvas.addEventListener("touchstart",touchStart,{passive:false});
    this.canvas.addEventListener("touchmove",touchMove,{passive:false});

    touchArea.addEventListener("touchstart",touchStart,{passive:false});
    touchArea.addEventListener("touchmove",touchMove,{passive:false});

}

limitPaddle(){

    if(this.paddle.x<0)
        this.paddle.x=0;

    if(this.paddle.x+this.paddle.w>this.canvas.width)
        this.paddle.x=this.canvas.width-this.paddle.w;

}

update(){

    const speed = 10;

    if(this.leftPressed)
        this.paddle.x -= speed;
    
    if(this.rightPressed)
        this.paddle.x += speed;
    
    this.limitPaddle();

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

        if(!brick.alive || brick.hit) return;

        if(

            this.ball.x + this.ball.r >= brick.x &&
            this.ball.x - this.ball.r <= brick.x + brick.w &&
            this.ball.y + this.ball.r >= brick.y &&
            this.ball.y - this.ball.r <= brick.y + brick.h

        ){

            brick.hit = true;
            brick.hitTime = performance.now();
            
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
        brick.hit = false;
        brick.hitTime = 0;

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

    if(brick.hit){
    
        if(performance.now()-brick.hitTime>60){
    
            brick.alive=false;
            return;
    
        }
    
        this.ctx.fillStyle="#ffffff";
    
        this.ctx.fillRect(
            brick.x,
            brick.y,
            brick.w,
            brick.h
        );
    
        return;
    
}

    let color="#1e90ff";
    let light="#8fc7ff";
    let dark="#0b4f99";

    if(brick.y < 66){

        color="#e53935";      // rojo
        light="#ff8a80";
        dark="#8e0000";

    }else if(brick.y < 92){

        color="#fb8c00";      // naranja
        light="#ffd180";
        dark="#c25e00";

    }else if(brick.y < 118){

        color="#43a047";      // verde
        light="#a5d6a7";
        dark="#1b5e20";

    }else{

        color="#1e88e5";      // azul
        light="#90caf9";
        dark="#0d47a1";

    }

    this.ctx.fillStyle=color;

    this.ctx.fillRect(
        brick.x,
        brick.y,
        brick.w,
        brick.h
    );

    this.ctx.fillStyle=light;

    this.ctx.fillRect(
        brick.x,
        brick.y,
        brick.w,
        2
    );

    this.ctx.fillStyle=dark;

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
