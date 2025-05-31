const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20;
let snake, direction, food, score, gameInterval, started;

function resetGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = 'RIGHT';
    food = spawnFood();
    score = 0;
    started = false;
    draw();
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            // 머리: 삼각형 방향 표시
            ctx.fillStyle = '#0f0';
            ctx.beginPath();
            const x = snake[i].x + box / 2;
            const y = snake[i].y + box / 2;
            if (direction === 'RIGHT') {
                ctx.moveTo(x + box / 2, y);
                ctx.lineTo(x - box / 2, y - box / 2);
                ctx.lineTo(x - box / 2, y + box / 2);
            } else if (direction === 'LEFT') {
                ctx.moveTo(x - box / 2, y);
                ctx.lineTo(x + box / 2, y - box / 2);
                ctx.lineTo(x + box / 2, y + box / 2);
            } else if (direction === 'UP') {
                ctx.moveTo(x, y - box / 2);
                ctx.lineTo(x - box / 2, y + box / 2);
                ctx.lineTo(x + box / 2, y + box / 2);
            } else if (direction === 'DOWN') {
                ctx.moveTo(x, y + box / 2);
                ctx.lineTo(x - box / 2, y - box / 2);
                ctx.lineTo(x + box / 2, y - box / 2);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // 몸통: 원형
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x, food.y, box, box);
    document.getElementById('score').innerText = 'Score: ' + score;
}

function update() {
    let head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'LEFT') head.x -= box;
    if (direction === 'UP') head.y -= box;
    if (direction === 'RIGHT') head.x += box;
    if (direction === 'DOWN') head.y += box;

    // Game over
    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        collision(head, snake)
    ) {
        clearInterval(gameInterval);
        alert('Game Over! Your score: ' + score);
        resetGame();
        return;
    }
    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = spawnFood();
    } else {
        snake.pop();
    }
    snake.unshift(head);
    draw();
}

function collision(head, array) {
    // snake.length가 1일 때는 충돌 체크 X
    if (array.length === 1) return false;
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) return true;
    }
    return false;
}

function spawnFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * (canvas.width / box)) * box;
        y = Math.floor(Math.random() * (canvas.height / box)) * box;
    } while (snake && snake.some(segment => segment.x === x && segment.y === y));
    return { x, y };
}

document.addEventListener('keydown', function handleKey(e) {
    if (!started && ['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].includes(e.key)) {
        started = true;
        gameInterval = setInterval(update, 120);
    }
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    else if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    else if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
    else if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
});

resetGame();
