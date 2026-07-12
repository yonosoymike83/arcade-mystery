// Snake v0.5.1
// Solo sustituye el método bindControls() de tu snake.js por este.
// El resto del archivo v0.5 permanece igual.

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

    let startX=0;
    let startY=0;

    document.body.style.overscrollBehavior="none";

    this.canvas.style.touchAction="none";

    this.canvas.addEventListener("touchstart",(e)=>{

        e.preventDefault();

        startX=e.touches[0].clientX;
        startY=e.touches[0].clientY;

    },{passive:false});

    this.canvas.addEventListener("touchmove",(e)=>{

        e.preventDefault();

        const dx=e.touches[0].clientX-startX;
        const dy=e.touches[0].clientY-startY;

        if(Math.abs(dx)<25 && Math.abs(dy)<25) return;

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

        startX=e.touches[0].clientX;
        startY=e.touches[0].clientY;

    },{passive:false});

    if(this.canvas){

        this.canvas.addEventListener("click",()=>{

            if(this.gameOver){
                this.restart();
            }

        });

    }

}
