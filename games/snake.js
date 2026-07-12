class SnakeGame {

    constructor(canvas, challenge) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.challenge = challenge || {};

        this.size = 20;
        this.grid = 20;

        this.score = 0;
        this.goal = this.challenge.goal || 15;

        this.snake = [
            {x:10,y:10},
            {x:9,y:10},
            {x:8,y:10}
        ];

        this.direction = {x:1,y:0};

        this.gameOver = false;

        this.food = {x:15,y:10};

        this.spawnFood();

        this.bindControls();
    }

    bindControls(){

        document.addEventListener("keydown",(e)=>{

            if(this.gameOver && e.code==="Space"){
                this.restart();
                return;
            }

            switch(e.key){

                case "ArrowUp":
                    if(this.direction.y===0)
                        this.direction={x:0,y:-1};
                    break;

                case "ArrowDown":
                    if(this.direction.y===0)
                        this.direction={x:0,y:1};
                    break;

                case "ArrowLeft":
                    if(this.direction.x===0)
                        this.direction={x:-1,y:0};
                    break;

                case "ArrowRight":
                    if(this.direction.x===0)
                        this.direction={x:1,y:0};
                    break;

            }

        });

        let sx=0;
        let sy=0;

        this.canvas.addEventListener("touchstart",(e)=>{

            if(this.gameOver){

                if(this.button){

                    const r=this.canvas.getBoundingClientRect();

                    const x=e.touches[0].clientX-r.left;
                    const y=e.touches[0].clientY-r.top;

                    if(
                        x>=this.button.x &&
                        x<=this.button.x+this.button.w &&
                        y>=this.button.y &&
                        y<=this.button.y+this.button.h
                    ){

                        e.preventDefault();

                        this.restart();

                    }

                }

                return;

            }

            e.preventDefault();

            sx=e.touches[0].clientX;
            sy=e.touches[0].clientY;

        },{passive:false});

        this.canvas.addEventListener("touchmove",(e)=>{

            if(this.gameOver) return;

            e.preventDefault();

            const dx=e.touches[0].clientX-sx;
            const dy=e.touches[0].clientY-sy;

            if(Math.abs(dx)<25 && Math.abs(dy)<25)
                return;

            if(Math.abs(dx)>Math.abs(dy)){

                if(dx>0 && this.direction.x===0)
                    this.direction={x:1,y:0};

                if(dx<0 && this.direction.x===0)
                    this.direction={x:-1,y:0};

            }else{

                if(dy>0 && this.direction.y===0)
                    this.direction={x:0,y:1};

                if(dy<0 && this.direction.y===0)
                    this.direction={x:0,y:-1};

            }

            sx=e.touches[0].clientX;
            sy=e.touches[0].clientY;

        },{passive:false});

        this.canvas.addEventListener("click",(e)=>{

            if(!this.gameOver || !this.button)
                return;

            const r=this.canvas.getBoundingClientRect();

            const x=e.clientX-r.left;
            const y=e.clientY-r.top;

            if(
                x>=this.button.x &&
                x<=this.button.x+this.button.w &&
                y>=this.button.y &&
                y<=this.button.y+this.button.h
            ){

                this.restart();

            }

        });

    }

    start(){

        this.timer=setInterval(()=>{

            this.update();
            this.draw();

        },200);

        this.draw();

    }

    restart(){

        clearInterval(this.timer);

        this.score=0;

        const score=document.getElementById("score");
        if(score)
            score.textContent="0000";

        this.gameOver=false;

        this.direction={x:1,y:0};

        this.snake=[
            {x:10,y:10},
            {x:9,y:10},
            {x:8,y:10}
        ];

        this.spawnFood();

        this.start();

    }

    update(){

        if(this.gameOver)
            return;

        const head={

            x:this.snake[0].x+this.direction.x,
            y:this.snake[0].y+this.direction.y

        };

        if(head.x>=this.grid) head.x=0;
        if(head.x<0) head.x=this.grid-1;

        if(head.y>=this.grid) head.y=0;
        if(head.y<0) head.y=this.grid-1;

        this.snake.unshift(head);

        for(let i=1;i<this.snake.length;i++){

            if(
                head.x===this.snake[i].x &&
                head.y===this.snake[i].y
            ){

                this.gameOver=true;

                clearInterval(this.timer);

                this.draw();

                return;

            }

        }

        if(head.x===this.food.x && head.y===this.food.y){

            this.score++;

            const score=document.getElementById("score");

            if(score)
                score.textContent=this.score.toString().padStart(4,"0");

            if(this.score>=this.goal){

                clearInterval(this.timer);

                const box=document.getElementById("coordinates");

                if(box)
                    box.style.display="block";

                return;

            }

            this.spawnFood();

        }else{

            this.snake.pop();

        }

    }
        spawnFood(){

        while(true){

            const x=Math.floor(Math.random()*this.grid);
            const y=Math.floor(Math.random()*this.grid);

            const hit=this.snake.some(p=>p.x===x && p.y===y);

            if(!hit){

                this.food={x,y};

                return;

            }

        }

    }

    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        // Cuadrícula
        this.ctx.strokeStyle="#1f1f1f";

        for(let i=0;i<=this.canvas.width;i+=this.size){

            this.ctx.beginPath();
            this.ctx.moveTo(i,0);
            this.ctx.lineTo(i,this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0,i);
            this.ctx.lineTo(this.canvas.width,i);
            this.ctx.stroke();

        }

        // Fruta

        this.ctx.fillStyle="#ff3030";

        this.ctx.beginPath();

        this.ctx.arc(
            this.food.x*this.size+this.size/2,
            this.food.y*this.size+this.size/2,
            this.size/2.8,
            0,
            Math.PI*2
        );

        this.ctx.fill();

        // Serpiente

        this.ctx.fillStyle="#42ff42";

        this.snake.forEach((part,index)=>{

            this.ctx.fillRect(
                part.x*this.size+1,
                part.y*this.size+1,
                this.size-2,
                this.size-2
            );

            // Ojos en la cabeza
            if(index===0){

                this.ctx.fillStyle="#000";

                this.ctx.beginPath();
                this.ctx.arc(
                    part.x*this.size+7,
                    part.y*this.size+7,
                    2,
                    0,
                    Math.PI*2
                );
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.arc(
                    part.x*this.size+13,
                    part.y*this.size+7,
                    2,
                    0,
                    Math.PI*2
                );
                this.ctx.fill();

                this.ctx.fillStyle="#42ff42";

            }

        });

        // =====================
        // GAME OVER
        // =====================

        if(this.gameOver){

            this.ctx.fillStyle="rgba(0,0,0,.75)";
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
                "GAME OVER",
                this.canvas.width/2,
                135
            );

            this.ctx.fillStyle="#ffffff";
            this.ctx.font="18px Arial";

            this.ctx.fillText(
                "Score: "+this.score,
                this.canvas.width/2,
                170
            );

            // Botón PLAY AGAIN

            this.button={

                x:this.canvas.width/2-75,
                y:200,
                w:150,
                h:45

            };

            this.ctx.fillStyle="#2ecc71";
            this.ctx.fillRect(
                this.button.x,
                this.button.y,
                this.button.w,
                this.button.h
            );

            this.ctx.strokeStyle="#ffffff";
            this.ctx.lineWidth=2;

            this.ctx.strokeRect(
                this.button.x,
                this.button.y,
                this.button.w,
                this.button.h
            );

            this.ctx.fillStyle="#ffffff";
            this.ctx.font="bold 20px Arial";

            this.ctx.fillText(
                "PLAY AGAIN",
                this.canvas.width/2,
                229
            );

        }

    }

}
