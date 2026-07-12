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

        this.food = {x:15,y:10};
        this.gameOver = false;

        this.spawnFood();
        this.bindControls();
    }

    bindControls() {

        document.addEventListener("keydown",(e)=>{
            if(this.gameOver && e.code==="Space"){
                this.restart();
                return;
            }

            switch(e.key){
                case "ArrowUp":
                    if(this.direction.y===0) this.direction={x:0,y:-1};
                    break;
                case "ArrowDown":
                    if(this.direction.y===0) this.direction={x:0,y:1};
                    break;
                case "ArrowLeft":
                    if(this.direction.x===0) this.direction={x:-1,y:0};
                    break;
                case "ArrowRight":
                    if(this.direction.x===0) this.direction={x:1,y:0};
                    break;
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

    update(){

        if(this.gameOver) return;

        const head={
            x:this.snake[0].x+this.direction.x,
            y:this.snake[0].y+this.direction.y
        };

        if(head.x>=this.grid) head.x=0;
        if(head.x<0) head.x=this.grid-1;
        if(head.y>=this.grid) head.y=0;
        if(head.y<0) head.y=this.grid-1;

        this.snake.unshift(head);

        // ColisiĂłn con el cuerpo
        for(let i=1;i<this.snake.length;i++){
            if(head.x===this.snake[i].x && head.y===this.snake[i].y){
                this.gameOver=true;
                clearInterval(this.timer);
                this.draw();
                return;
            }
        }

        if(head.x===this.food.x && head.y===this.food.y){

            this.score++;
            const s=document.getElementById("score");
            if(s) s.textContent=this.score.toString().padStart(4,"0");

            if(this.score>=this.goal){
                const box=document.getElementById("coordinates");
                if(box) box.style.display="block";
                clearInterval(this.timer);
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
            if(!this.snake.some(p=>p.x===x && p.y===y)){
                this.food={x,y};
                return;
            }
        }
    }

    restart(){
        location.reload();
    }

    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

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

        this.ctx.fillStyle="#ff3030";
        this.ctx.beginPath();
        this.ctx.arc(this.food.x*this.size+10,this.food.y*this.size+10,7,0,Math.PI*2);
        this.ctx.fill();

        this.ctx.fillStyle="#42ff42";
        this.snake.forEach((p,idx)=>{
            this.ctx.fillRect(p.x*this.size+1,p.y*this.size+1,18,18);
            if(idx===0){
                this.ctx.fillStyle="#9cff9c";
                this.ctx.fillRect(p.x*this.size+5,p.y*this.size+5,3,3);
                this.ctx.fillRect(p.x*this.size+12,p.y*this.size+5,3,3);
                this.ctx.fillStyle="#42ff42";
            }
        });

        if(this.gameOver){
            this.ctx.fillStyle="rgba(0,0,0,.75)";
            this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

            this.ctx.fillStyle="#ff4040";
            this.ctx.font="bold 30px Arial";
            this.ctx.textAlign="center";
            this.ctx.fillText("GAME OVER",200,170);

            this.ctx.fillStyle="#ffffff";
            this.ctx.font="18px Arial";
            this.ctx.fillText("Pulsa ESPACIO para reiniciar",200,210);
        }
    }
}
