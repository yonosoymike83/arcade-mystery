const TETRIS_COLS = 10;
const TETRIS_ROWS = 20;

const PIECES = [

    [[1,1,1,1]],

    [
        [1,1],
        [1,1]
    ],

    [
        [0,1,0],
        [1,1,1]
    ],

    [
        [0,1,1],
        [1,1,0]
    ],

    [
        [1,1,0],
        [0,1,1]
    ],

    [
        [1,0,0],
        [1,1,1]
    ],

    [
        [0,0,1],
        [1,1,1]
    ]

];

class TetrisGame{

    constructor(canvas,challenge){

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.challenge = challenge || {};

        this.cols = TETRIS_COLS;
        this.rows = TETRIS_ROWS;

        this.block = Math.min(
            this.canvas.width / this.cols,
            this.canvas.height / this.rows
        );

        this.offsetX = (this.canvas.width - this.cols * this.block) / 2;
        this.offsetY = (this.canvas.height - this.rows * this.block) / 2;

        this.score = 0;
        this.goal = this.challenge.goal || 20;

        this.gameOver = false;
        this.completed = false;
        this.clearAnimation = false;
        this.linesToClear = [];
        
        this.board = [];

        for(let y=0;y<this.rows;y++){

            this.board[y]=[];

            for(let x=0;x<this.cols;x++){

                this.board[y][x]=0;

            }

        }

        this.spawnPiece();

        this.bindControls();

    }

    bindControls(){

        window.addEventListener("keydown",(e)=>{

    if(this.gameOver || this.completed) return;

    if([
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
    ].includes(e.key)){
        e.preventDefault();
    }

    switch(e.key){

        case "ArrowLeft":
            this.move(-1);
            break;

        case "ArrowRight":
            this.move(1);
            break;

        case "ArrowUp":
            this.rotate();
            break;

        case "ArrowDown":
            this.drop();
            break;
    }

    this.draw();

});

let touchStartX = 0;
let touchStartY = 0;

this.canvas.addEventListener("touchstart", (e) => {

    e.preventDefault();
    
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;

}, { passive: false });

this.canvas.addEventListener("touchend", (e) => {

    e.preventDefault();
    if(this.gameOver || this.completed) return;

    const t = e.changedTouches[0];

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    const minSwipe = 25;

    // Tap
    if(Math.abs(dx) < 10 && Math.abs(dy) < 10){

    this.hardDrop();
    return;

}

    if(Math.abs(dx) > Math.abs(dy)){

        if(Math.abs(dx) > minSwipe){

            if(dx > 0)
                this.move(1);
            else
                this.move(-1);

        }

    }else{

        if(Math.abs(dy) > minSwipe){

            if(dy > 0)
                this.drop();
            else
                this.rotate();

        }

    }

    this.draw();

}, { passive: false });
        
    }

    spawnPiece(){

        const shape = JSON.parse(
            JSON.stringify(
                PIECES[Math.floor(Math.random()*PIECES.length)]
            )
        );

        this.piece={

            shape:shape,

            x:Math.floor((this.cols-shape[0].length)/2),

            y:0

        };

        if(this.collides(
            this.piece.x,
            this.piece.y,
            this.piece.shape
        )){
        
            this.gameOver = true;
        
            clearInterval(this.timer);
        
            document.getElementById("gameOverButtons").style.display="block";
        
            this.draw();

        }

    }

    start(){

        clearInterval(this.timer);

        this.timer=setInterval(()=>{

            this.update();
            this.draw();

        },500);

        this.draw();

    }

    restart(){

        document.getElementById("gameOverButtons").style.display="none";
        document.getElementById("coordinates").style.display="none";
        
        clearInterval(this.timer);

        this.score=0;

        document.getElementById("score").textContent = "0000";
        document.getElementById("coordinates").style.display="none";
        document.getElementById("gameOverButtons").style.display="none";

        this.gameOver=false;
        this.completed=false;

        this.board=[];

        for(let y=0;y<this.rows;y++){

            this.board[y]=[];

            for(let x=0;x<this.cols;x++){

                this.board[y][x]=0;

            }

        }

        this.spawnPiece();

        this.start();

    }

    move(dir){

        if(!this.collides(
            this.piece.x+dir,
            this.piece.y,
            this.piece.shape
        )){
            this.piece.x+=dir;
        }

    }

    drop(){

        if(!this.collides(
            this.piece.x,
            this.piece.y+1,
            this.piece.shape
        )){
            this.piece.y++;
        }

    }
    
    hardDrop(){
    
        while(!this.collides(
            this.piece.x,
            this.piece.y + 1,
            this.piece.shape
        )){
            this.piece.y++;
        }
    
        this.lockPiece();
    
    }
    
    rotate(){

        const rotated=[];

        for(let x=0;x<this.piece.shape[0].length;x++){

            rotated[x]=[];

            for(let y=this.piece.shape.length-1;y>=0;y--){

                rotated[x].push(
                    this.piece.shape[y][x]
                );

            }

        }

        if(!this.collides(
            this.piece.x,
            this.piece.y,
            rotated
        )){
            this.piece.shape=rotated;
        }

    }

    collides(px,py,shape){

        for(let y=0;y<shape.length;y++){

            for(let x=0;x<shape[y].length;x++){

                if(!shape[y][x]) continue;

                let bx=px+x;
                let by=py+y;

                if(
                    bx<0 ||
                    bx>=this.cols ||
                    by>=this.rows
                ){
                    return true;
                }

                if(
                    by>=0 &&
                    this.board[by][bx]
                ){
                    return true;
                }

            }

        }

        return false;

    }
        lockPiece(){

        const s=this.piece.shape;

        for(let y=0;y<s.length;y++){

            for(let x=0;x<s[y].length;x++){

                if(!s[y][x]) continue;

                if(
    this.isInsideBoard(
        this.piece.x + x,
        this.piece.y + y
    )
){
    this.board[this.piece.y + y][this.piece.x + x] = 1;
}
            }

        }

        this.clearLines();

        if(this.completed || this.clearAnimation){
            return;
        }

    }
    
    clearLines(){

    let linesCleared = 0;
    const rows = [];

    // Buscar líneas completas
    for(let y = this.rows - 1; y >= 0; y--){

        let full = true;

        for(let x = 0; x < this.cols; x++){

            if(this.board[y][x] === 0){
                full = false;
                break;
            }

        }

        if(full){

            rows.push(y);
            linesCleared++;

        }

    }

    // Si no hay líneas, continuar normalmente
    if(linesCleared === 0){
        this.spawnPiece();
        return;
    }

    // Preparar animación
    this.clearAnimation = true;
    this.linesToClear = rows;

    clearInterval(this.timer);

    let flashes = 0;

    const anim = setInterval(()=>{

        this.draw();

        flashes++;

        if(flashes >= 6){

            clearInterval(anim);

            // Eliminar líneas
            for(let i = this.linesToClear.length - 1; i >= 0; i--){

                this.board.splice(this.linesToClear[i],1);
                this.board.unshift(new Array(this.cols).fill(0));

            }

            // Actualizar puntuación
            this.score += linesCleared;

            document.getElementById("score").textContent =
                this.score.toString().padStart(4,"0");

            this.clearAnimation = false;
            this.linesToClear = [];

            // ¿Reto completado?
            if(this.score >= this.goal){

                this.completed = true;

                document.getElementById("coordinates").style.display = "block";

                this.draw();

                return;

            }

            // Continuar juego
            this.spawnPiece();
            this.start();
            return;

        }

    },30);
    
    }
    
    update(){

         if(this.gameOver || this.completed)
            return;

        if(!this.collides(
            this.piece.x,
            this.piece.y+1,
            this.piece.shape
        )){

            this.piece.y++;

        }else{

            this.lockPiece();

        }

    }

    drawBlock(x,y){

        const px=this.offsetX+x*this.block;
        const py=this.offsetY+y*this.block;

        this.ctx.fillStyle="#d8d8d8";
        this.ctx.fillRect(
            px+1,
            py+1,
            this.block-2,
            this.block-2
        );

        this.ctx.strokeStyle="#8a8a8a";
        this.ctx.lineWidth=2;
        this.ctx.strokeRect(
            px+1,
            py+1,
            this.block-2,
            this.block-2
        );

    }

    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Cuadrícula

        this.ctx.strokeStyle="#222";
        this.ctx.lineWidth=1;

        for(let x=0;x<=this.cols;x++){

            this.ctx.beginPath();
            this.ctx.moveTo(
                this.offsetX+x*this.block,
                this.offsetY
            );
            this.ctx.lineTo(
                this.offsetX+x*this.block,
                this.offsetY+this.rows*this.block
            );
            this.ctx.stroke();

        }

        for(let y=0;y<=this.rows;y++){

            this.ctx.beginPath();
            this.ctx.moveTo(
                this.offsetX,
                this.offsetY+y*this.block
            );
            this.ctx.lineTo(
                this.offsetX+this.cols*this.block,
                this.offsetY+y*this.block
            );
            this.ctx.stroke();

        }

        // Tablero
for(let y=0; y<this.rows; y++){

    for(let x=0; x<this.cols; x++){

        // Animación de borrado
        if(
            this.clearAnimation &&
            this.linesToClear.includes(y)
        ){

            if(Math.floor(Date.now()/60)%2===0){

                this.ctx.fillStyle="#ffffff";
                this.ctx.fillRect(
                    this.offsetX+x*this.block+1,
                    this.offsetY+y*this.block+1,
                    this.block-2,
                    this.block-2
                );

            }else{

                this.drawBlock(x,y);

            }

        }
        else if(this.board[y][x]){

            this.drawBlock(x,y);

        }

    }

}

        // Pieza actual

        const s=this.piece.shape;

        for(let y=0;y<s.length;y++){

            for(let x=0;x<s[y].length;x++){

                if(!s[y][x]) continue;

                this.drawBlock(
                    this.piece.x+x,
                    this.piece.y+y
                );

            }

        }

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

}

    }
    
     // Evita errores cuando una pieza queda parcialmente
    // fuera del tablero superior al aparecer.

    isInsideBoard(x, y) {

        return (
            x >= 0 &&
            x < this.cols &&
            y >= 0 &&
            y < this.rows
        );

    }

}   
