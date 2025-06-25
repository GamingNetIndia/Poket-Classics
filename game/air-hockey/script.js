document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainMenu = document.getElementById('main-menu');
    const difficultyMenu = document.getElementById('difficulty-menu');
    const settingsMenu = document.getElementById('settings-menu');
    const gameContainer = document.getElementById('game-container');
    const gameWrapper = document.getElementById('game-wrapper');
    
    // Buttons
    const pvpButton = document.getElementById('pvp-button');
    const pvaButton = document.getElementById('pva-button');
    const settingsButton = document.getElementById('settings-button');
    const musicToggle = document.getElementById('music-toggle');
    const playAgainButton = document.getElementById('play-again-button');
    const backToMenuIngameButton = document.getElementById('back-to-menu-ingame-button');
    
    // NEW: Get the home button
    const homeButton = document.getElementById('home-button');

    // Other elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scorePlayer1El = document.getElementById('score-player1');
    const scorePlayer2El = document.getElementById('score-player2');
    const winPopup = document.getElementById('win-popup');
    const winMessageEl = document.getElementById('win-message');
    const particleCanvas = document.getElementById('particle-canvas');
    const particleCtx = particleCanvas.getContext('2d');

    // --- Sound Management ---
    const bgMusic = new Audio('sounds/background.mp3');
    const hitSound = new Audio('sounds/hit.wav');
    const scoreSound = new Audio('sounds/score.wav');
    const winSound = new Audio('sounds/win.wav');
    const clickSound = new Audio('sounds/click.wav');
    let isMusicEnabled = true;

    function playSound(sound) { sound.currentTime = 0; sound.play().catch(e => {}); }
    function playMusic() { if (isMusicEnabled) { bgMusic.loop = true; bgMusic.volume = 0.5; bgMusic.play().catch(e => {}); } }
    function stopMusic() { bgMusic.pause(); bgMusic.currentTime = 0; }
    
    // --- Game State ---
    const WINNING_SCORE = 7;
    let gameMode = null, difficulty = null, animationId = null, particleAnimationId = null;
    let paddle1, paddle2, puck;

    // --- UI Navigation ---
    function showScreen(screen) {
        mainMenu.classList.remove('active');
        difficultyMenu.classList.remove('active');
        settingsMenu.classList.remove('active');
        gameContainer.style.display = 'none';
        
        if (screen === 'main') mainMenu.classList.add('active');
        if (screen === 'difficulty') difficultyMenu.classList.add('active');
        if (screen === 'settings') settingsMenu.classList.add('active');
        if (screen === 'game') gameContainer.style.display = 'block';
    }

    // Main Menu Buttons
    pvpButton.addEventListener('click', () => { playSound(clickSound); gameMode = 'pvp'; startGame(); });
    pvaButton.addEventListener('click', () => { playSound(clickSound); gameMode = 'pva'; showScreen('difficulty'); });
    settingsButton.addEventListener('click', () => { playSound(clickSound); showScreen('settings'); });

    // NEW: Add event listener for the Home button
    homeButton.addEventListener('click', () => {
        playSound(clickSound);
        window.location.href = '../../home/home.html';
    });

    // Difficulty Menu Buttons
    difficultyMenu.querySelectorAll('button[data-difficulty]').forEach(button => { button.addEventListener('click', () => { playSound(clickSound); difficulty = button.dataset.difficulty; startGame(); }); });
    document.querySelectorAll('.back-button').forEach(button => { button.addEventListener('click', () => { playSound(clickSound); showScreen('main'); }); });
    playAgainButton.addEventListener('click', () => { playSound(clickSound); winPopup.style.display = 'none'; stopParticleAnimation(); showScreen('main'); stopMusic(); });
    backToMenuIngameButton.addEventListener('click', () => { playSound(clickSound); stopMusic(); cancelAnimationFrame(animationId); animationId = null; showScreen('main'); });
    
    // Settings toggle
    musicToggle.addEventListener('change', (e) => {
        isMusicEnabled = e.target.checked;
        localStorage.setItem('musicEnabled', isMusicEnabled);
        if (animationId) { isMusicEnabled ? playMusic() : stopMusic(); }
    });
    function loadSettings() { const savedMusicSetting = localStorage.getItem('musicEnabled'); if (savedMusicSetting !== null) { isMusicEnabled = savedMusicSetting === 'true'; } musicToggle.checked = isMusicEnabled; }

    // --- The rest of your game logic is completely unchanged ---
    function resizeCanvas() { const rect = gameWrapper.getBoundingClientRect(); canvas.width = rect.width; canvas.height = rect.height; initGameObjects(); }
    function initGameObjects() { const paddleRadius = canvas.width * 0.08; const puckRadius = canvas.width * 0.05; paddle1 = { x: canvas.width / 2, y: canvas.height * 0.75, radius: paddleRadius, score: paddle1 ? paddle1.score : 0, color: '#ff00ff', active: false }; paddle2 = { x: canvas.width / 2, y: canvas.height * 0.25, radius: paddleRadius, score: paddle2 ? paddle2.score : 0, color: '#00ffff', active: false }; puck = { x: canvas.width / 2, y: canvas.height / 2, radius: puckRadius, speed: 6, dx: 0, dy: 0, color: '#ffffff' }; }
    window.addEventListener('resize', resizeCanvas);
    function startGame() { resizeCanvas(); resetGame(); showScreen('game'); if (animationId) cancelAnimationFrame(animationId); playMusic(); gameLoop(); }
    function resetGame() { paddle1.score = 0; paddle2.score = 0; updateScore(); resetRound(); }
    function resetRound() { initGameObjects(); updateScore(); let angle = (Math.random() * Math.PI / 2) + Math.PI / 4; if (Math.random() > 0.5) angle += Math.PI; puck.speed = canvas.height * 0.01; puck.dx = Math.cos(angle) * puck.speed; puck.dy = Math.sin(angle) * puck.speed; }
    function updateScore() { scorePlayer1El.textContent = paddle1.score; scorePlayer2El.textContent = paddle2.score; }
    function drawTable() { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 20; ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke(); ctx.beginPath(); ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.2, 0, Math.PI * 2); ctx.stroke(); const goalWidth = canvas.width * 0.4; ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 15; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(canvas.width/2 - goalWidth/2, 0); ctx.lineTo(canvas.width/2 + goalWidth/2, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(canvas.width/2 - goalWidth/2, canvas.height); ctx.lineTo(canvas.width/2 + goalWidth/2, canvas.height); ctx.stroke(); ctx.shadowBlur = 0; }
    function drawCircle(x, y, radius, color) { ctx.shadowColor = color; ctx.shadowBlur = 15; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
    const activeTouches = {}; function getTouchPos(e) { const rect = canvas.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; } function handleDown(e) { e.preventDefault(); const touches = e.changedTouches ? e.changedTouches : [e]; for (const touch of touches) { const pos = getTouchPos(touch); const id = e.changedTouches ? touch.identifier : 'mouse'; if (pos.y > canvas.height / 2) { activeTouches[id] = { paddle: paddle1, pos }; paddle1.active = true; } else if (gameMode === 'pvp') { activeTouches[id] = { paddle: paddle2, pos }; paddle2.active = true; } } } function handleMove(e) { e.preventDefault(); const touches = e.changedTouches ? e.changedTouches : [e]; for (const touch of touches) { const id = e.changedTouches ? touch.identifier : 'mouse'; if (activeTouches[id]) { const pos = getTouchPos(touch); activeTouches[id].paddle.x = pos.x; activeTouches[id].paddle.y = pos.y; } } } function handleUp(e) { e.preventDefault(); const touches = e.changedTouches ? e.changedTouches : [e]; for (const touch of touches) { const id = e.changedTouches ? touch.identifier : 'mouse'; if (activeTouches[id]) { activeTouches[id].paddle.active = false; delete activeTouches[id]; } } } canvas.addEventListener('mousedown', handleDown); canvas.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp); canvas.addEventListener('touchstart', handleDown, { passive: false }); canvas.addEventListener('touchmove', handleMove, { passive: false }); canvas.addEventListener('touchend', handleUp); canvas.addEventListener('touchcancel', handleUp);
    function clampPaddlePositions() { paddle1.x = Math.max(paddle1.radius, Math.min(paddle1.x, canvas.width - paddle1.radius)); paddle1.y = Math.max(canvas.height / 2 + paddle1.radius, Math.min(paddle1.y, canvas.height - paddle1.radius)); if (gameMode === 'pvp') { paddle2.x = Math.max(paddle2.radius, Math.min(paddle2.x, canvas.width - paddle2.radius)); paddle2.y = Math.max(paddle2.radius, Math.min(paddle2.y, canvas.height / 2 - paddle2.radius)); } } function moveAI() { if (paddle2.active) return; let targetX = puck.x, speedMultiplier; switch (difficulty) { case 'easy': speedMultiplier = 0.04; break; case 'medium': speedMultiplier = 0.08; break; case 'hard': speedMultiplier = 0.15; break; } if (puck.dy < 0) { paddle2.x += (targetX - paddle2.x) * speedMultiplier; } else { const defensiveY = canvas.height * 0.25; paddle2.x += (canvas.width / 2 - paddle2.x) * 0.04; paddle2.y += (defensiveY - paddle2.y) * 0.04; } paddle2.x = Math.max(paddle2.radius, Math.min(paddle2.x, canvas.width - paddle2.radius)); paddle2.y = Math.max(paddle2.radius, Math.min(paddle2.y, canvas.height / 2 - paddle2.radius)); }
    function checkCollisions() { if (puck.x - puck.radius < 0 || puck.x + puck.radius > canvas.width) { puck.dx *= -1; } [paddle1, paddle2].forEach(paddle => { const dist = Math.hypot(puck.x - paddle.x, puck.y - paddle.y); if (dist < puck.radius + puck.radius) { playSound(hitSound); const angle = Math.atan2(puck.y - paddle.y, puck.x - paddle.x); puck.speed = Math.min(puck.speed * 1.03, canvas.height * 0.03); puck.dx = Math.cos(angle) * puck.speed; puck.dy = Math.sin(angle) * puck.speed; if (paddle === paddle2 && gameMode === 'pva') { paddle2.active = true; setTimeout(() => { paddle2.active = false; }, 200); } } }); const goalWidth = canvas.width * 0.4; const goalLeft = canvas.width/2 - goalWidth/2; const goalRight = canvas.width/2 + goalWidth/2; if (puck.y - puck.radius < 0) { if (puck.x > goalLeft && puck.x < goalRight) { playSound(scoreSound); paddle1.score++; if (checkWin()) return; resetRound(); } else { puck.dy *= -1; puck.y = puck.radius; } } if (puck.y + puck.radius > canvas.height) { if (puck.x > goalLeft && puck.x < goalRight) { playSound(scoreSound); paddle2.score++; if (checkWin()) return; resetRound(); } else { puck.dy *= -1; puck.y = canvas.height - puck.radius; } } }
    function checkWin() { if (paddle1.score >= WINNING_SCORE) { endGame("Player 1 Wins!"); return true; } else if (paddle2.score >= WINNING_SCORE) { endGame(`${gameMode === 'pvp' ? "Player 2" : "AI"} Wins!`); return true; } return false; } function endGame(message) { stopMusic(); playSound(winSound); cancelAnimationFrame(animationId); animationId = null; winMessageEl.textContent = message; winPopup.style.display = 'flex'; startParticleAnimation(); }
    function gameLoop() { puck.x += puck.dx; puck.y += puck.dy; clampPaddlePositions(); if (gameMode === 'pva') { moveAI(); } checkCollisions(); drawTable(); drawCircle(paddle1.x, paddle1.y, paddle1.radius, paddle1.color); drawCircle(paddle2.x, paddle2.y, paddle2.radius, paddle2.color); drawCircle(puck.x, puck.y, puck.radius, puck.color); animationId = requestAnimationFrame(gameLoop); }
    let particles = []; function Particle(x, y, radius, color, velocity) { this.x = x; this.y = y; this.radius = radius; this.color = color; this.velocity = velocity; this.alpha = 1; this.draw = () => { particleCtx.save(); particleCtx.globalAlpha = this.alpha; particleCtx.beginPath(); particleCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); particleCtx.fillStyle = this.color; particleCtx.fill(); particleCtx.restore(); }; this.update = () => { this.draw(); this.velocity.y += 0.05; this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.015; }; } function initParticles() { particles = []; particleCanvas.width = window.innerWidth; particleCanvas.height = window.innerHeight; const particleCount = 250; const colors = ['#00ffff', '#ff00ff', '#ffffff', '#ff1b4c']; const centerX = particleCanvas.width / 2; const centerY = particleCanvas.height / 2; for (let i = 0; i < particleCount; i++) { const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 12 + 2; const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }; particles.push(new Particle(centerX, centerY, Math.random() * 3 + 1, colors[Math.floor(Math.random() * colors.length)], velocity)); } } function animateParticles() { particleCtx.fillStyle = 'rgba(0, 0, 0, 0.1)'; particleCtx.fillRect(0, 0, particleCanvas.width, particleCanvas.height); particles.forEach((p, i) => { p.alpha > 0 ? p.update() : particles.splice(i, 1); }); particleAnimationId = (particles.length > 0) ? requestAnimationFrame(animateParticles) : null; } function startParticleAnimation() { initParticles(); animateParticles(); } function stopParticleAnimation() { cancelAnimationFrame(particleAnimationId); particleAnimationId = null; particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height); }
    loadSettings(); showScreen('main');
});