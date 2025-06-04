const canvas = document.getElementById('arkanoid');
const ctx = canvas.getContext('2d');
const paddleHeight = 10, paddleWidthDefault = 75, paddleWidthMax = 150;
let paddleWidth = paddleWidthDefault;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false, leftPressed = false;
let ballRadius = 8;
let x = canvas.width / 2, y = canvas.height - 30;
const dxDefault = 8, dyDefault = -8; // 속도를 4배로 증가 (2 -> 8)
let dx = dxDefault, dy = dyDefault;
let brickRowCount = 5, brickColumnCount = 14; // 좌우 2배
let brickWidth = 55, brickHeight = 20, brickPadding = 8, brickOffsetTop = 30;
// 중앙 정렬을 위한 offsetLeft 계산
let totalBricksWidth = brickColumnCount * brickWidth + (brickColumnCount - 1) * brickPadding;
let brickOffsetLeft = (canvas.width - totalBricksWidth) / 2;
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
                        setTimeout(()=>{
                            if(confirm('YOU WIN!\\n다시 시작할까요?')) window.location.reload();
                        }, 100);
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
let animationId;
let startTime;
function resetGame() {
    // 게임 상태 초기화
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = dxDefault;
    dy = dyDefault;
    paddleWidth = paddleWidthDefault;
    paddleX = (canvas.width - paddleWidth) / 2;
    rightPressed = false;
    leftPressed = false;
    score = 0;
    document.getElementById('score').innerText = 'Score: ' + score;
    for(let c=0; c<brickColumnCount; c++){
        for(let r=0; r<brickRowCount; r++){
            bricks[c][r].status = 1;
        }
    }
    startTime = Date.now();
    animationId = requestAnimationFrame(draw);
}

function draw() {
    // Paddle width 증가: 60초 동안 선형적으로 2배까지
    const elapsed = (Date.now() - startTime) / 1000;
    paddleWidth = Math.min(paddleWidthDefault + (paddleWidthMax - paddleWidthDefault) * (elapsed / 60), paddleWidthMax);
    paddleX = Math.max(0, Math.min(paddleX, canvas.width - paddleWidth));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // 공이 좌우 벽에 부딪히면 속도 증가 (개선된 속도 증가율과 최대 속도)
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
        // 속도 4배 제한으로 증가, 증가율도 1.08로 조정
        dx = Math.sign(dx) * Math.min(Math.abs(dx) * 1.05, Math.abs(dxDefault) * 4);
        dy = Math.sign(dy) * Math.min(Math.abs(dy) * 1.05, Math.abs(dyDefault) * 4);
    }
    // 천장에 부딪히면 속도 증가
    if(y + dy < ballRadius) {
        dy = -dy;
        dx = Math.sign(dx) * Math.min(Math.abs(dx) * 1.05, Math.abs(dxDefault) * 4);
        dy = Math.sign(dy) * Math.min(Math.abs(dy) * 1.05, Math.abs(dyDefault) * 4);
    }
    else if(y + dy > canvas.height-ballRadius-paddleHeight-2){
        if(x > paddleX && x < paddleX + paddleWidth) {
            // 패들 중앙 기준 offset (-1 ~ 1)
            let hit = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            // 최대 각도(라디안) 예: 60도 = Math.PI/3
            let maxAngle = Math.PI / 3;
            let angle = hit * maxAngle;
            let speed = Math.sqrt(dx * dx + dy * dy);
            dx = speed * Math.sin(angle);
            dy = -Math.abs(speed * Math.cos(angle));
            // 속도 증가(최대 4배로 조정)
            dx = Math.sign(dx) * Math.min(Math.abs(dx), Math.abs(dxDefault) * 4);
            dy = Math.sign(dy) * Math.min(Math.abs(dy), Math.abs(dyDefault) * 4);
        }
        else {
            cancelAnimationFrame(animationId);
            setTimeout(()=>{
                if(confirm('GAME OVER! 다시 시작할까요?')) {
                    resetGame();
                }
            }, 100);
        }
    }

    if(rightPressed && paddleX < canvas.width-paddleWidth) paddleX += 8; // 패들 속도도 약간 증가
    else if(leftPressed && paddleX > 0) paddleX -= 8;

    x += dx;
    y += dy;
    animationId = requestAnimationFrame(draw);
}

resetGame();