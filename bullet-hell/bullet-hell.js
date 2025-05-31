const canvas = document.getElementById('bullet-hell');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let score = 0;

// Player
const player = {
  x: W/2, y: H-60, r: 14, speed: 7,
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }
};

// Bullets
let bullets = [];
function spawnBullets() {
  const n = 18;
  const angleBase = Math.random()*Math.PI*2;
  for(let i=0; i<n; i++) {
    const angle = angleBase + (i/n)*Math.PI*2;
    const speed = 2 + Math.random()*2;
    bullets.push({
      x: W/2, y: 120,
      r: 8,
      dx: Math.cos(angle)*speed,
      dy: Math.sin(angle)*speed
    });
  }
}

// Controls
let left=false, right=false, up=false, down=false;
document.addEventListener('keydown', e => {
  if(e.key==='ArrowLeft') left=true;
  if(e.key==='ArrowRight') right=true;
  if(e.key==='ArrowUp') up=true;
  if(e.key==='ArrowDown') down=true;
});
document.addEventListener('keyup', e => {
  if(e.key==='ArrowLeft') left=false;
  if(e.key==='ArrowRight') right=false;
  if(e.key==='ArrowUp') up=false;
  if(e.key==='ArrowDown') down=false;
});

function update() {
  // Player move
  if(left) player.x -= player.speed;
  if(right) player.x += player.speed;
  if(up) player.y -= player.speed;
  if(down) player.y += player.speed;
  player.x = Math.max(player.r, Math.min(W-player.r, player.x));
  player.y = Math.max(player.r, Math.min(H-player.r, player.y));

  // Bullets move
  for(const b of bullets) {
    b.x += b.dx;
    b.y += b.dy;
  }
  // Remove out bullets
  bullets = bullets.filter(b => b.x>-20 && b.x<W+20 && b.y>-20 && b.y<H+20);

  // Collision
  for(const b of bullets) {
    const dx = b.x-player.x, dy = b.y-player.y;
    if(dx*dx+dy*dy < (b.r+player.r)*(b.r+player.r)) {
      gameOver();
      return;
    }
  }
  // Score
  score++;
  document.getElementById('bh-score').innerText = 'Score: ' + score;
}

function draw() {
  ctx.clearRect(0,0,W,H);
  // Player
  player.draw();
  // Bullets
  for(const b of bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fillStyle = '#f0f';
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

let interval = 0;
function loop() {
  update();
  draw();
  interval++;
  if(interval%45===0) spawnBullets();
  requestAnimationFrame(loop);
}

function gameOver() {
  alert('Game Over! Your score: '+score);
  document.location.reload();
}

spawnBullets();
loop();
