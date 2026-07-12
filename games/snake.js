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
        this.spawnFood();

        this.bindControls();
    }

    bindControls(){

        document.addEventListener("keydown",(e)=>{
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

        let sx=0, sy=0;

        this.canvas.addEventListener("touchstart",(e)=>{
            e.preventDefault();
            sx=e.touches[0].clientX;
            sy=e.touches[0].clientY;
        },{passive:false});

        this.canvas.addEventListener("touchmove",(e)=>{
            e.preventDefault();

            const dx=e.touches[0].clientX-sx;
            const dy=e.touches[0].clientY-sy;

            if(Math.abs(dx)<25 && Math.abs(dy)<25) return;

            if(Math.abs(dx)>Math.abs(dy)){
                if(dx>0 && this.direction.x===0) this.direction={x:1,y:0};
                if(dx<0 && this.direction.x===0) this.direction={x:-1,y:0};
            }else{
                if(dy>0 && this.direction.y===0) this.direction={x:0,y:1};
                if(dy<0 && this.direction.y===0) this.direction={x:0,y:-1};
            }

            sx=e.touches[0].clientX;
            sy=e.touches[0].clientY;

        },{passive:false});
    }

    start(){
        this.timer=setInterval(()=>{
            this.update();
            this.draw();
        },200);

        this.draw();
    }

    update(){

        const head={
            x:this.snake[0].x+this.direction.x,
            y:this.snake[0].y+this.direction.y
        };

        if(head.x>=this.grid) head.x=0;
        if(head.x<0) head.x=this.grid-1;
        if(head.y>=this.grid) head.y=0;
        if(head.y<0) head.y=this.grid-1;

        this.snake.unshift(head);

        if(head.x===this.food.x && head.y===this.food.y){

            this.score++;

            const score=document.getElementById("score");
            if(score) score.textContent=this.score.toString().padStart(4,"0");

            if(this.score>=this.goal){
                clearInterval(this.timer);

                const box=document.getElementById("coordinates");
                if(box) box.style.display="block";

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
        this.ctx.arc(
            this.food.x*this.size+this.size/2,
            this.food.y*this.size+this.size/2,
            this.size/2.8,
            0,Math.PI*2
        );
        this.ctx.fill();

        this.ctx.fillStyle="#42ff42";

        this.snake.forEach(part=>{
            this.ctx.fillRect(
                part.x*this.size+1,
                part.y*this.size+1,
                this.size-2,
                this.size-2
            );
        });

    }

                }
