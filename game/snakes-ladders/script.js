document.addEventListener('DOMContentLoaded', () => {
    // --- STATE AND CONFIGURATION ---
    const config = { BOARD_SIZE: 100, NUM_SNAKES: 8, NUM_LADDERS: 8, AI_THINK_TIME: 1500 };
    let state = {
        gameMode: 'pvp',
        numPlayers: 2,
        playerPositions: [],
        currentPlayerIndex: 0,
        snakes: {},
        ladders: {},
        isMusicOn: true,
        isGameOver: false,
        confettiAnimationId: null
    };

    // --- DOM ELEMENTS ---
    const dom = {
        mainMenu: document.getElementById('main-menu'),
        gameContainer: document.getElementById('game-container'),
        startGameBtn: document.getElementById('start-game-btn'),
        backToMenuBtn: document.getElementById('back-to-menu-btn'),
        gameBoard: document.getElementById('game-board'),
        rollDiceBtn: document.getElementById('roll-dice-btn'),
        turnInfo: document.getElementById('turn-info'),
        messageLog: document.getElementById('message-log'),
        diceFaces: document.querySelectorAll('.dice-face'),
        settingsBtn: document.getElementById('settings-btn'),
        winPopup: document.getElementById('win-popup'),
        winMessage: document.getElementById('win-message'),
        playAgainBtn: document.getElementById('play-again-btn'),
        confettiCanvas: document.getElementById('confetti-canvas'),
        homeBtn: document.getElementById('home-btn'),
        // New menu buttons
        gameModeBtns: document.getElementById('game-mode-btns'),
        playerCountBtns: document.getElementById('player-count-btns')
    };

    const audio = {
        bgMusic: document.getElementById('bg-music'),
        dice: document.getElementById('dice-sound'),
        move: document.getElementById('move-sound'),
        ladder: document.getElementById('ladder-sound'),
        snake: document.getElementById('snake-sound'),
        win: document.getElementById('win-sound'),
        click: document.getElementById('click-sound')
    };

    // --- SOUND & SETTINGS ---
    function playSound(sound) { if (state.isMusicOn) { sound.currentTime = 0; sound.play().catch(e => {}); } }
    function toggleMusic() { state.isMusicOn = !state.isMusicOn; updateSettingsUI(); localStorage.setItem('snakeLadderMusic', state.isMusicOn); if (state.isMusicOn) { if(!dom.mainMenu.classList.contains('hidden')) audio.bgMusic.play().catch(e => {}); } else { audio.bgMusic.pause(); } }
    function updateSettingsUI() { const btn = dom.settingsBtn; if (state.isMusicOn) { btn.classList.remove('sound-off'); btn.textContent = '🔊'; audio.bgMusic.muted = false; } else { btn.classList.add('sound-off'); btn.textContent = '🔇'; audio.bgMusic.muted = true; } }
    function loadSettings() { const saved = localStorage.getItem('snakeLadderMusic'); if (saved !== null) { state.isMusicOn = saved === 'true'; } updateSettingsUI(); }

    // --- MENU LOGIC ---
    function updateActiveButton(buttonGroup, clickedButton) {
        Array.from(buttonGroup.children).forEach(button => button.classList.remove('active'));
        clickedButton.classList.add('active');
    }

    dom.gameModeBtns.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            playSound(audio.click);
            state.gameMode = e.target.dataset.mode;
            updateActiveButton(dom.gameModeBtns, e.target);
        }
    });

    dom.playerCountBtns.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            playSound(audio.click);
            state.numPlayers = parseInt(e.target.dataset.count, 10);
            updateActiveButton(dom.playerCountBtns, e.target);
        }
    });

    // --- EVENT LISTENERS ---
    dom.settingsBtn.addEventListener('click', () => { playSound(audio.click); toggleMusic(); });
    dom.startGameBtn.addEventListener('click', () => { playSound(audio.click); startGame(); });
    dom.homeBtn.addEventListener('click', () => { playSound(audio.click); window.location.href = "https://your-games-catalogue.com"; });
    dom.backToMenuBtn.addEventListener('click', () => { playSound(audio.click); dom.gameContainer.classList.add('hidden'); dom.mainMenu.classList.remove('hidden'); audio.bgMusic.pause(); if (state.confettiAnimationId) stopConfetti(); });
    dom.rollDiceBtn.addEventListener('click', () => { playSound(audio.click); handleTurn(); });
    dom.playAgainBtn.addEventListener('click', () => { playSound(audio.click); dom.winPopup.classList.add('hidden'); if (state.confettiAnimationId) stopConfetti(); startGame(); });
    
    // --- CORE GAME LOGIC (Unchanged from your preferred version) ---
    function startGame() { if (state.isMusicOn) audio.bgMusic.play().catch(e => {}); dom.mainMenu.classList.add('hidden'); dom.gameContainer.classList.remove('hidden'); resetGame(); generateBoard(); generateSnakesAndLadders(); renderBoard(); updateTurnInfo(); }
    function resetGame() { state.isGameOver = false; state.playerPositions = Array(state.numPlayers).fill(1); state.currentPlayerIndex = 0; state.snakes = {}; state.ladders = {}; dom.messageLog.innerHTML = ''; dom.rollDiceBtn.disabled = false; document.querySelectorAll('.player-token').forEach(t => t.remove()); }
    async function handleTurn() { if (state.isGameOver) return; dom.rollDiceBtn.disabled = true; const diceRoll = await rollDice(); logMessage(`Player ${state.currentPlayerIndex + 1} rolled a ${diceRoll}.`); let startPos = state.playerPositions[state.currentPlayerIndex]; let targetPos = startPos + diceRoll; if (targetPos > config.BOARD_SIZE) targetPos = startPos; await movePlayer(startPos, targetPos); let finalPos = state.playerPositions[state.currentPlayerIndex]; if (state.snakes[finalPos]) { logMessage(`Oh no! Player ${state.currentPlayerIndex + 1} found a snake! 🐍`); playSound(audio.snake); await movePlayer(finalPos, state.snakes[finalPos], 800, false); } else if (state.ladders[finalPos]) { logMessage(`Yay! Player ${state.currentPlayerIndex + 1} found a ladder! 🪜`); playSound(audio.ladder); await movePlayer(finalPos, state.ladders[finalPos], 100); } if (state.playerPositions[state.currentPlayerIndex] === config.BOARD_SIZE) { showWinPopup(); return; } state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.numPlayers; updateTurnInfo(); if (state.gameMode === 'pva' && state.currentPlayerIndex > 0) { setTimeout(handleTurn, config.AI_THINK_TIME); } else { dom.rollDiceBtn.disabled = false; } }
    function generateBoard() { dom.gameBoard.innerHTML = ''; for (let i = 0; i < config.BOARD_SIZE; i++) { dom.gameBoard.appendChild(document.createElement('div')).classList.add('cell'); } const cells = Array.from(dom.gameBoard.children); let num = config.BOARD_SIZE; for (let row = 0; row < 10; row++) { const rowCells = cells.slice(row * 10, (row * 10) + 10); if (row % 2 !== 0) rowCells.reverse(); for (const cell of rowCells) { cell.textContent = num; cell.dataset.cell = num--; } } }
    function generateSnakesAndLadders() { const occupied = new Set([1, config.BOARD_SIZE]); state.snakes = {}; state.ladders = {}; for (let i = 0; i < config.NUM_SNAKES; i++) { let start, end; do { start = Math.floor(Math.random()*(config.BOARD_SIZE-20))+21; end = Math.floor(Math.random()*(start-11))+1; } while (occupied.has(start) || occupied.has(end)); occupied.add(start); occupied.add(end); state.snakes[start] = end; } for (let i = 0; i < config.NUM_LADDERS; i++) { let start, end; do { start = Math.floor(Math.random()*(config.BOARD_SIZE-20))+2; end = Math.floor(Math.random()*(config.BOARD_SIZE-start-10))+start+11; } while (occupied.has(start) || occupied.has(end) || end > config.BOARD_SIZE); occupied.add(start); occupied.add(end); state.ladders[start] = end; } }
    function renderBoard() { document.querySelectorAll('.cell').forEach(c => { c.classList.remove('snake-head', 'snake-tail', 'ladder-start', 'ladder-end'); delete c.dataset.goto; }); for (const [s, e] of Object.entries(state.snakes)) { const sc = document.querySelector(`[data-cell='${s}']`); sc.classList.add('snake-head'); sc.dataset.goto = `🐍 to ${e}`; document.querySelector(`[data-cell='${e}']`).classList.add('snake-tail'); } for (const [s, e] of Object.entries(state.ladders)) { const sc = document.querySelector(`[data-cell='${s}']`); sc.classList.add('ladder-start'); sc.dataset.goto = `🪜 to ${e}`; document.querySelector(`[data-cell='${e}']`).classList.add('ladder-end'); } renderPlayerTokens(); }
    function renderPlayerTokens() { document.querySelectorAll('.player-token').forEach(t => t.remove()); state.playerPositions.forEach((pos, i) => { const token = document.createElement('div'); token.className = `player-token player-${i}`; document.querySelector(`[data-cell='${pos}']`)?.appendChild(token); }); }
    function movePlayer(start, end, duration = 100, playMoveSound = true) { return new Promise(resolve => { let current = start; const isUp = end > start; const interval = setInterval(() => { if ((isUp && current >= end) || (!isUp && current <= end)) { clearInterval(interval); state.playerPositions[state.currentPlayerIndex] = end; renderPlayerTokens(); resolve(); return; } current = isUp ? current + 1 : current - 1; state.playerPositions[state.currentPlayerIndex] = current; if (playMoveSound) playSound(audio.move); renderPlayerTokens(); }, duration); }); }
    function rollDice() { playSound(audio.dice); return new Promise(resolve => { const roll = Math.floor(Math.random()*6)+1; let i = 0; const interval = setInterval(() => { dom.diceFaces[i++ % 6].classList.remove('active'); dom.diceFaces[i % 6].classList.add('active'); }, 50); setTimeout(() => { clearInterval(interval); dom.diceFaces.forEach(f => f.classList.remove('active')); document.querySelector(`.dice-face[data-face='${roll}']`).classList.add('active'); resolve(roll); }, 800); }); }
    function updateTurnInfo() { const type = (state.gameMode === 'pva' && state.currentPlayerIndex > 0) ? 'AI' : 'Player'; dom.turnInfo.textContent = `${type} ${state.currentPlayerIndex + 1}'s Turn`; dom.turnInfo.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--player${state.currentPlayerIndex + 1}-color`) || '#f0f0f0'; dom.turnInfo.style.color = (state.currentPlayerIndex === 1) ? '#000' : '#fff'; }
    function logMessage(msg) { const p = document.createElement('p'); p.textContent = msg; dom.messageLog.appendChild(p); dom.messageLog.scrollTop = dom.messageLog.scrollHeight; }
    function showWinPopup() { state.isGameOver = true; playSound(audio.win); if (state.isMusicOn) audio.bgMusic.pause(); logMessage(`🎉 Player ${state.currentPlayerIndex + 1} Wins! 🎉`); dom.winMessage.textContent = `Player ${state.currentPlayerIndex + 1} Wins!`; dom.winPopup.classList.remove('hidden'); dom.rollDiceBtn.disabled = true; startConfetti(); }
    let confetti = []; function startConfetti() { const ctx = dom.confettiCanvas.getContext('2d'); dom.confettiCanvas.width = window.innerWidth; dom.confettiCanvas.height = window.innerHeight; confetti = []; const confettiCount = 200, colors = ['#fde19a', '#ff9a9a', '#a2d2ff', '#bde0fe', '#ffc8dd']; for (let i=0; i<confettiCount; i++) { confetti.push({x:Math.random()*dom.confettiCanvas.width, y:Math.random()*dom.confettiCanvas.height - dom.confettiCanvas.height, radius:Math.random()*5+2, color:colors[Math.floor(Math.random()*colors.length)], speedX:Math.random()*6-3, speedY:Math.random()*5+2, opacity:1}); } function animate() { ctx.clearRect(0,0,dom.confettiCanvas.width,dom.confettiCanvas.height); confetti.forEach((p,i)=>{p.x+=p.speedX; p.y+=p.speedY; p.opacity-=0.01; if(p.opacity<=0)confetti.splice(i,1); ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fillStyle=`rgba(${parseInt(p.color.slice(1,3),16)}, ${parseInt(p.color.slice(3,5),16)}, ${parseInt(p.color.slice(5,7),16)}, ${p.opacity})`;ctx.fill();}); if(confetti.length > 0) state.confettiAnimationId = requestAnimationFrame(animate); else { state.confettiAnimationId = null; } } animate(); }
    function stopConfetti() { if (state.confettiAnimationId) cancelAnimationFrame(state.confettiAnimationId); confetti = []; const ctx = dom.confettiCanvas.getContext('2d'); ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height); state.confettiAnimationId = null; }
    
    // --- INITIALIZATION ---
    loadSettings();
});