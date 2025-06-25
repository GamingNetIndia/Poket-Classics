document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const startGameBtn = document.getElementById('start-game-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const gameBoard = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const turnInfo = document.getElementById('turn-info');
    const messageLog = document.getElementById('message-log');
    const diceFaces = document.querySelectorAll('.dice-face');
    const settingsBtn = document.getElementById('settings-btn');
    const winPopup = document.getElementById('win-popup');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const homeBtn = document.getElementById('home-btn');
    
    // NEW: Menu Option Buttons
    const gameModeBtns = document.getElementById('game-mode-btns');
    const playerCountBtns = document.getElementById('player-count-btns');
    const playerCountSection = document.getElementById('player-count-section');

    // Audio Elements
    const audio = { bgMusic: document.getElementById('bg-music'), dice: document.getElementById('dice-sound'), move: document.getElementById('move-sound'), ladder: document.getElementById('ladder-sound'), snake: document.getElementById('snake-sound'), win: document.getElementById('win-sound'), click: document.getElementById('click-sound'), };

    // Game State
    const BOARD_SIZE = 100, NUM_SNAKES = 8, NUM_LADDERS = 8;
    let gameMode = 'pvp'; // Default
    let numPlayers = 2; // Default
    let playerPositions = [], currentPlayerIndex = 0;
    let snakes = {}, ladders = {}, isMusicOn = true, confettiAnimationId;

    // --- Settings & Sound (unchanged) ---
    function loadSettings() { const savedMusicSetting = localStorage.getItem('snakeLadderMusic'); if (savedMusicSetting !== null) { isMusicOn = savedMusicSetting === 'true'; } updateSettingsUI(); }
    function saveSettings() { localStorage.setItem('snakeLadderMusic', isMusicOn); }
    function toggleMusic() { isMusicOn = !isMusicOn; updateSettingsUI(); saveSettings(); if (isMusicOn) { audio.bgMusic.play().catch(e => {}); } else { audio.bgMusic.pause(); } }
    function updateSettingsUI() { if (isMusicOn) { settingsBtn.classList.remove('sound-off'); settingsBtn.classList.add('sound-on'); settingsBtn.textContent = '🔊'; audio.bgMusic.muted = false; } else { settingsBtn.classList.remove('sound-on'); settingsBtn.classList.add('sound-off'); settingsBtn.textContent = '🔇'; audio.bgMusic.muted = true; } }
    function playSound(sound) { if (isMusicOn) { sound.currentTime = 0; sound.play(); } }

    // --- NEW: Menu Logic ---
    gameModeBtns.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            playSound(audio.click);
            gameMode = e.target.dataset.mode;
            gameModeBtns.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');

            // Smart UI: Lock player count for AI mode
            if (gameMode === 'pva') {
                playerCountSection.classList.add('disabled');
                numPlayers = 2;
                playerCountBtns.querySelector('.active').classList.remove('active');
                playerCountBtns.querySelector('[data-count="2"]').classList.add('active');
            } else {
                playerCountSection.classList.remove('disabled');
            }
        }
    });

    playerCountBtns.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && !playerCountSection.classList.contains('disabled')) {
            playSound(audio.click);
            numPlayers = parseInt(e.target.dataset.count);
            playerCountBtns.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
        }
    });

    // --- Event Listeners ---
    settingsBtn.addEventListener('click', () => { playSound(audio.click); toggleMusic(); });
    startGameBtn.addEventListener('click', () => { playSound(audio.click); startGame(); });
    backToMenuBtn.addEventListener('click', () => { playSound(audio.click); gameContainer.classList.add('hidden'); mainMenu.classList.remove('hidden'); audio.bgMusic.pause(); });
    playAgainBtn.addEventListener('click', () => { playSound(audio.click); winPopup.classList.add('hidden'); stopConfetti(); startGame(); });
    homeBtn.addEventListener('click', () => { playSound(audio.click); window.location.href = '../../home/home.html'; });
    
    // --- The rest of your game logic is unchanged and will work perfectly with the new menu system ---
    function startGame() { if (isMusicOn) { audio.bgMusic.play().catch(e => {}); } mainMenu.classList.add('hidden'); gameContainer.classList.remove('hidden'); resetGame(); generateBoard(); generateSnakesAndLadders(); renderBoard(); updateTurnInfo(); }
    function resetGame() { playerPositions = Array(numPlayers).fill(1); currentPlayerIndex = 0; snakes = {}; ladders = {}; messageLog.innerHTML = ''; rollDiceBtn.disabled = false; document.querySelectorAll('.player-token').forEach(token => token.remove()); }
    function generateBoard() { gameBoard.innerHTML = ''; for (let i = 0; i < BOARD_SIZE; i++) { gameBoard.appendChild(document.createElement('div')).classList.add('cell'); } const cells = Array.from(gameBoard.children); let cellNumber = BOARD_SIZE; for (let row = 0; row < 10; row++) { const rowCells = cells.slice(row * 10, (row * 10) + 10); if (row % 2 !== 0) { rowCells.reverse(); } for (const cell of rowCells) { cell.textContent = cellNumber; cell.dataset.cell = cellNumber--; } } }
    function generateSnakesAndLadders() { const occupied = new Set([1, BOARD_SIZE]); snakes = {}; ladders = {}; for (let i = 0; i < NUM_SNAKES; i++) { let start, end; do { start = Math.floor(Math.random() * (BOARD_SIZE - 20)) + 21; end = Math.floor(Math.random() * (start - 11)) + 1; } while (occupied.has(start) || occupied.has(end)); occupied.add(start); occupied.add(end); snakes[start] = end; } for (let i = 0; i < NUM_LADDERS; i++) { let start, end; do { start = Math.floor(Math.random() * (BOARD_SIZE - 20)) + 2; end = Math.floor(Math.random() * (BOARD_SIZE - start - 10)) + start + 11; } while (occupied.has(start) || occupied.has(end) || end > BOARD_SIZE); occupied.add(start); occupied.add(end); ladders[start] = end; } }
    function renderBoard() { document.querySelectorAll('.cell').forEach(cell => { cell.classList.remove('snake-head', 'snake-tail', 'ladder-start', 'ladder-end'); delete cell.dataset.goto; }); for (const [s, e] of Object.entries(snakes)) { const sc = document.querySelector(`[data-cell='${s}']`), ec = document.querySelector(`[data-cell='${e}']`); sc.classList.add('snake-head'); sc.dataset.goto = `🐍 to ${e}`; ec.classList.add('snake-tail'); } for (const [s, e] of Object.entries(ladders)) { const sc = document.querySelector(`[data-cell='${s}']`), ec = document.querySelector(`[data-cell='${e}']`); sc.classList.add('ladder-start'); sc.dataset.goto = `🪜 to ${e}`; ec.classList.add('ladder-end'); } renderPlayerTokens(); }
    function renderPlayerTokens() { document.querySelectorAll('.player-token').forEach(t => t.remove()); playerPositions.forEach((pos, i) => { const token = document.createElement('div'); token.className = `player-token player-${i}`; document.querySelector(`[data-cell='${pos}']`)?.appendChild(token); }); }
    rollDiceBtn.addEventListener('click', () => { playSound(audio.click); handleTurn(); });
    async function handleTurn() { rollDiceBtn.disabled = true; const diceRoll = await rollDice(); logMessage(`Player ${currentPlayerIndex + 1} rolled a ${diceRoll}.`); const startPos = playerPositions[currentPlayerIndex]; let targetPos = startPos + diceRoll; if (targetPos > BOARD_SIZE) { targetPos = startPos; } await movePlayer(startPos, targetPos); let finalPos = playerPositions[currentPlayerIndex]; if (snakes[finalPos]) { logMessage(`Oh no! Player ${currentPlayerIndex + 1} landed on a snake! 🐍`); playSound(audio.snake); await movePlayer(finalPos, snakes[finalPos], 800, false); } else if (ladders[finalPos]) { logMessage(`Yay! Player ${currentPlayerIndex + 1} found a ladder! 🪜`); playSound(audio.ladder); await movePlayer(finalPos, ladders[finalPos], 100); } if (playerPositions[currentPlayerIndex] === BOARD_SIZE) { showWinPopup(); return; } currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers; updateTurnInfo(); if (gameMode === 'pva' && currentPlayerIndex > 0) { setTimeout(handleTurn, 1500); } else { rollDiceBtn.disabled = false; } }
    function rollDice() { playSound(audio.dice); return new Promise(resolve => { const roll = Math.floor(Math.random() * 6) + 1; let i = 0, interval = setInterval(() => { diceFaces[i++ % 6].classList.remove('active'); diceFaces[i % 6].classList.add('active'); }, 50); setTimeout(() => { clearInterval(interval); diceFaces.forEach(f => f.classList.remove('active')); document.querySelector(`.dice-face[data-face='${roll}']`).classList.add('active'); resolve(roll); }, 800); }); }
    function movePlayer(start, end, animationDuration = 100, playMoveSound = true) { return new Promise(resolve => { let current = start; const isClimbing = end > start; const interval = setInterval(() => { if ((isClimbing && current >= end) || (!isClimbing && current <= end)) { clearInterval(interval); playerPositions[currentPlayerIndex] = end; renderPlayerTokens(); resolve(); return; } current = isClimbing ? current + 1 : current - 1; playerPositions[currentPlayerIndex] = current; if (playMoveSound) playSound(audio.move); renderPlayerTokens(); }, animationDuration); }); }
    function showWinPopup() { playSound(audio.win); logMessage(`🎉 Player ${currentPlayerIndex + 1} Wins! 🎉`); winMessage.textContent = `Player ${currentPlayerIndex + 1} Wins!`; winPopup.classList.remove('hidden'); rollDiceBtn.disabled = true; startConfetti(); }
    let confetti = [];
    function startConfetti() { const ctx = confettiCanvas.getContext('2d'); confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; confetti = []; const confettiCount = 200; const colors = ['#fde19a', '#ff9a9a', '#a2d2ff', '#bde0fe', '#ffc8dd']; for (let i = 0; i < confettiCount; i++) { confetti.push({ x: Math.random() * confettiCanvas.width, y: Math.random() * confettiCanvas.height - confettiCanvas.height, radius: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)], speedX: Math.random() * 6 - 3, speedY: Math.random() * 5 + 2, opacity: 1 }); } function animateConfetti() { ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); confetti.forEach((p, i) => { p.x += p.speedX; p.y += p.speedY; p.opacity -= 0.01; if(p.opacity <= 0) confetti.splice(i, 1); ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(${parseInt(p.color.slice(1,3),16)}, ${parseInt(p.color.slice(3,5),16)}, ${parseInt(p.color.slice(5,7),16)}, ${p.opacity})`; ctx.fill(); }); if (confetti.length > 0) { confettiAnimationId = requestAnimationFrame(animateConfetti); } else { ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); } } animateConfetti(); }
    function stopConfetti() { if (confettiAnimationId) { cancelAnimationFrame(confettiAnimationId); } confetti = []; const ctx = confettiCanvas.getContext('2d'); ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }
    function updateTurnInfo() { const playerType = (gameMode === 'pva' && currentPlayerIndex > 0) ? 'AI' : 'Player'; turnInfo.textContent = `${playerType} ${currentPlayerIndex + 1}'s Turn`; turnInfo.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--player${currentPlayerIndex + 1}-color`) || '#f0f0f0'; turnInfo.style.color = (currentPlayerIndex === 1) ? '#000' : '#fff'; }
    function logMessage(msg) { const p = document.createElement('p'); p.textContent = msg; messageLog.appendChild(p); messageLog.scrollTop = messageLog.scrollHeight; }
    loadSettings();
});