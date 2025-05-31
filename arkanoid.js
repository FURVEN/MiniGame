const canvas = document.getElementById('arkanoid');
const ctx = canvas.getContext('2d');
const paddleHeight = 10, paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false, leftPressed = false;
let ballRadius = 8;
let x = canvas.width / 2, y = canvas.height - 30;
let dx = 1, dy = -1; // 속도 0.5배로 감소
let brickRowCount = 5, brickColumnCount = 7;
let brickWidth = 55, brickHeight = 20, brickPadding = 8, brickOffsetTop = 30, brickOffsetLeft = 20;
let score = 0;
let bricks = [];

for(let c=0; c<brickColumnCount; c++){
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++){
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
    else if(e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
}
function keyUpHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
    else if(e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
}

function collisionDetection() {
    for(let c=0; c<brickColumnCount; c++){
        for(let r=0; r<brickRowCount; r++){
            let b = bricks[c][r];
            if(b.status === 1){
                if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight){
                    dy = -dy;
                    b.status = 0;
                    score++;
                    document.getElementById('score').innerText = 'Score: ' + score;
                    if(score === brickRowCount * brickColumnCount){
                        alert('YOU WIN!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = '#09f';
    ctx.fill();
    ctx.closePath();
}
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight-2, paddleWidth, paddleHeight);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();
}
function drawBricks() {
    for(let c=0; c<brickColumnCount; c++){
        for(let r=0; r<brickRowCount; r++){
            if(bricks[c][r].status === 1){
                let brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                let brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0ff';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) dx = -dx;
    if(y + dy < ballRadius) dy = -dy;
    else if(y + dy > canvas.height-ballRadius-paddleHeight-2){
        if(x > paddleX && x < paddleX + paddleWidth) dy = -dy;
        else {
            // GameOver 후 alert창에서 확인 버튼 누르면 재시작
            setTimeout(()=>{ document.location.reload(); }, 100);
            alert('GAME OVER');
        }
    }

    if(rightPressed && paddleX < canvas.width-paddleWidth) paddleX += 6;
    else if(leftPressed && paddleX > 0) paddleX -= 6;

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}
draw();
