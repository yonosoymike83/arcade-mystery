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

        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");

        this.challenge=challenge||{};

        this.cols=TETRIS_COLS;
        this.rows=TETRIS_ROWS;

        this.block=this.canvas.width/this.cols;

        this.score=0;
        this.goal=this.challenge.goal||20;

        this.gameOver=false;

        this.board=[];

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

        // De momento vacío

    }

    spawnPiece(){

        const shape=PIECES[Math.floor(Math.random()*PIECES.length)];

        this.piece={

            shape:shape,

            x:Math.floor((this.cols-shape[0].length)/2),

            y:0

        };

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

        clearInterval(this.timer);

        this.score=0;

        document.getElementById("score").textContent="0000";
        document.getElementById("coordinates").style.display="none";
        document.getElementById("gameOverButtons").style.display="none";

        this.gameOver=false;

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

    update(){

        if(this.gameOver)
            return;

        this.piece.y++;

        if(this.piece.y+this.piece.shape.length>this.rows){

            this.spawnPiece();

        }

    }

    draw(){

        this.ctx.fillStyle="#111";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        // Cuadrícula

        this.ctx.strokeStyle="#1f1f1f";

        for(let x=0;x<=this.cols;x++){

            this.ctx.beginPath();
            this.ctx.moveTo(x*this.block,0);
            this.ctx.lineTo(x*this.block,this.canvas.height);
            this.ctx.stroke();

        }

        for(let y=0;y<=this.rows;y++){

            this.ctx.beginPath();
            this.ctx.moveTo(0,y*this.block);
            this.ctx.lineTo(this.canvas.width,y*this.block);
            this.ctx.stroke();

        }

        // Tablero

        this.ctx.fillStyle="#42ff42";

        for(let y=0;y<this.rows;y++){

            for(let x=0;x<this.cols;x++){

                if(this.board[y][x]){

                    this.ctx.fillRect(

                        x*this.block+1,
                        y*this.block+1,
                        this.block-2,
                        this.block-2

                    );

                }

            }

        }

        // Pieza actual

        const s=this.piece.shape;

        for(let y=0;y<s.length;y++){

            for(let x=0;x<s[y].length;x++){

                if(!s[y][x])
                    continue;

                this.ctx.fillRect(

                    (this.piece.x+x)*this.block+1,
                    (this.piece.y+y)*this.block+1,
                    this.block-2,
                    this.block-2

                );

            }

        }

    }

}
