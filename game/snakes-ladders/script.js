document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const startGameBtn = document.getElementById('start-game-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn'); 
    const homeBtn = document.getElementById('home-btn');
    const gameModeSelect = document.getElementById('game-mode');
    const playerCountSelect = document.getElementById('player-count');
    const gameBoard = document.getElementById('game-board');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const turnInfo = document.getElementById('turn-info');
    const messageLog = document.getElementById('message-log');
    const diceFaces = document.querySelectorAll('.dice-face');
    
    // Settings Modal Elements
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');

    // Win Popup Elements
    const winPopup = document.getElementById('win-popup');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');

    // Audio Elements
    const audio = {
        bgMusic: document.getElementById('bg-music'),
        dice: document.getElementById('dice-sound'),
        move: document.getElementById('move-sound'),
        ladder: document.getElementById('ladder-sound'),
        snake: document.getElementById('snake-sound'),
        win: document.getElementById('win-sound'),
        click: document.getElementById('click-sound'),
    };

    // Game State
    const BOARD_SIZE = 100, NUM_SNAKES = 8, NUM_LADDERS = 8;
    let gameMode, numPlayers, playerPositions, currentPlayerIndex, snakes, ladders;
    let isMusicOn = true, isSfxOn = true, confettiAnimationId;

    // --- SETTINGS & AUDIO LOGIC ---
    function loadSettings() {
        isMusicOn = localStorage.getItem('snakeLadderMusic') !== 'false';
        isSfxOn = localStorage.getItem('snakeLadderSfx') !== 'false';
        updateSettingsUI();
    }

    function updateSettingsUI() {
        musicToggle.checked = isMusicOn;
        sfxToggle.checked = isSfxOn;
        if (isMusicOn && !gameContainer.classList.contains('hidden')) {
            audio.bgMusic.play().catch(e => {});
        } else {
            audio.bgMusic.pause();
        }
    }

    function playSoundEffect(sound) {
        if (isSfxOn) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    // --- EVENT LISTENERS ---
    openSettingsBtn.addEventListener('click', () => { playSoundEffect(audio.click); settingsModal.classList.remove('hidden'); });
    closeSettingsBtn.addEventListener('click', () => { playSoundEffect(audio.click); settingsModal.classList.add('hidden'); });
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    musicToggle.addEventListener('change', () => { isMusicOn = musicToggle.checked; localStorage.setItem('snakeLadderMusic', isMusicOn); updateSettingsUI(); });
    sfxToggle.addEventListener('change', () => { isSfxOn = sfxToggle.checked; localStorage.setItem('snakeLadderSfx', isSfxOn); });

    startGameBtn.addEventListener('click', () => { playSoundEffect(audio.click); startGame(); });
    
    // Listener for the "Back to Menu" button
    backToMenuBtn.addEventListener('click', () => {
        playSoundEffect(audio.click);
        gameContainer.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        audio.bgMusic.pause();
        winPopup.classList.add('hidden');
        if (confettiAnimationId) stopConfetti();
    });

    // Listener for your custom "Home" button
    homeBtn.addEventListener('click', () => {
        playSoundEffect(audio.click);
        // IMPORTANT: Replace this placeholder with the actual URL of your games catalogue.
        window.location.href = "https://your-games-catalogue-url.com";
    });

    rollDiceBtn.addEventListener('click', () => { playSoundEffect(audio.click); handleTurn(); });
    
    playAgainBtn.addEventListener('click', () => {
        playSoundEffect(audio.click);
        winPopup.classList.add('hidden');
        if (confettiAnimationId) stopConfetti();
        startGame();
    });

    // --- MAIN GAME FLOW ---
    function startGame() {
        gameMode = gameModeSelect.value;
        numPlayers = parseInt(playerCountSelect.value);
        if (isMusicOn) audio.bgMusic.play().catch(e => {});
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        resetGame();
        generateBoard();
        generateSnakesAndLadders();
        renderBoard();
        updateTurnInfo();
    }
    
    function resetGame() {
        playerPositions = Array(numPlayers).fill(1);
        currentPlayerIndex = 0;
        snakes = {}; ladders = {};
        messageLog.innerHTML = '';
        rollDiceBtn.disabled = false;
        document.querySelectorAll('.player-token').forEach(token => token.remove());
    }

    // --- BOARD GENERATION ---
    function generateBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < BOARD_SIZE; i++) { gameBoard.appendChild(document.createElement('div')).classList.add('cell'); }
        const cells = Array.from(gameBoard.children);
        let cellNumber = BOARD_SIZE;
        for (let row = 0; row < 10; row++) {
            const rowCells = cells.slice(row * 10, (row * 10) + 10);
            if (row % 2 !== 0) { rowCells.reverse(); }
            for (const cell of rowCells) { cell.textContent = cellNumber; cell.dataset.cell = cellNumber--; }
        }
    }
    function generateSnakesAndLadders() {
        const occupied = new Set([1, BOARD_SIZE]);
        snakes = {}; ladders = {};
        for (let i = 0; i < NUM_SNAKES; i++) { let start, end; do { start = Math.floor(Math.random() * (BOARD_SIZE-20))+21; end = Math.floor(Math.random() * (start-11))+1; } while (occupied.has(start) || occupied.has(end)); occupied.add(start); occupied.add(end); snakes[start] = end; }
        for (let i = 0; i < NUM_LADDERS; i++) { let start, end; do { start = Math.floor(Math.random() * (BOARD_SIZE-20))+2; end = Math.floor(Math.random() * (BOARD_SIZE-start-10))+start+11; } while (occupied.has(start) || occupied.has(end) || end > BOARD_SIZE); occupied.add(start); occupied.add(end); ladders[start] = end; }
    }

    // --- RENDERING ---
    function renderBoard() {
        document.querySelectorAll('.cell').forEach(cell => { cell.classList.remove('snake-head', 'snake-tail', 'ladder-start', 'ladder-end'); delete cell.dataset.goto; });
        for (const [s, e] of Object.entries(snakes)) { const sc = document.querySelector(`[data-cell='${s}']`), ec = document.querySelector(`[data-cell='${e}']`); sc.classList.add('snake-head'); sc.dataset.goto = `🐍 to ${e}`; ec.classList.add('snake-tail'); }
        for (const [s, e] of Object.entries(ladders)) { const sc = document.querySelector(`[data-cell='${s}']`), ec = document.querySelector(`[data-cell='${e}']`); sc.classList.add('ladder-start'); sc.dataset.goto = `🪜 to ${e}`; ec.classList.add('ladder-end'); }
        renderPlayerTokens();
    }
    function renderPlayerTokens() {
        document.querySelectorAll('.player-token').forEach(t => t.remove());
        playerPositions.forEach((pos, i) => { const token = document.createElement('div'); token.className = `player-token player-${i}`; document.querySelector(`[data-cell='${pos}']`)?.appendChild(token); });
    }
    
    // --- GAME LOOP ---
    async function handleTurn() {
        rollDiceBtn.disabled = true;
        const diceRoll = await rollDice();
        logMessage(`Player ${currentPlayerIndex + 1} rolled a ${diceRoll}.`);
        const startPos = playerPositions[currentPlayerIndex];
        let targetPos = startPos + diceRoll;
        if (targetPos > BOARD_SIZE) targetPos = startPos;
        await movePlayer(startPos, targetPos);
        let finalPos = playerPositions[currentPlayerIndex];
        if (snakes[finalPos]) {
            logMessage(`Oh no! Player ${currentPlayerIndex + 1} landed on a snake! 🐍`);
            playSoundEffect(audio.snake);
            await movePlayer(finalPos, snakes[finalPos], 800, false);
        } else if (ladders[finalPos]) {
            logMessage(`Yay! Player ${currentPlayerIndex + 1} found a ladder! 🪜`);
            playSoundEffect(audio.ladder);
            await movePlayer(finalPos, ladders[finalPos], 100);
        }
        if (playerPositions[currentPlayerIndex] === BOARD_SIZE) { showWinPopup(); return; }
        currentPlayerIndex = (currentPlayerIndex + 1) % numPlayers;
        updateTurnInfo();
        if (gameMode === 'pva' && currentPlayerIndex > 0) { setTimeout(handleTurn, 1500); } else { rollDiceBtn.disabled = false; }
    }
    function rollDice() {
        playSoundEffect(audio.dice);
        return new Promise(resolve => {
            const roll = Math.floor(Math.random() * 6) + 1;
            let i = 0, interval = setInterval(() => { diceFaces[i++ % 6].classList.remove('active'); diceFaces[i % 6].classList.add('active'); }, 50);
            setTimeout(() => { clearInterval(interval); diceFaces.forEach(f => f.classList.remove('active')); document.querySelector(`.dice-face[data-face='${roll}']`).classList.add('active'); resolve(roll); }, 800);
        });
    }
    function movePlayer(start, end, animationDuration = 100, playMoveSound = true) {
        return new Promise(resolve => {
            let current = start;
            const isClimbing = end > start;
            const interval = setInterval(() => {
                if ((isClimbing && current >= end) || (!isClimbing && current <= end)) { clearInterval(interval); playerPositions[currentPlayerIndex] = end; renderPlayerTokens(); resolve(); return; }
                current = isClimbing ? current + 1 : current - 1;
                playerPositions[currentPlayerIndex] = current;
                if (playMoveSound) playSoundEffect(audio.move);
                renderPlayerTokens();
            }, animationDuration);
        });
    }

    // --- UI & WIN LOGIC ---
    function updateTurnInfo() {
        const playerType = (gameMode === 'pva' && currentPlayerIndex > 0) ? 'AI' : 'Player';
        turnInfo.textContent = `${playerType} ${currentPlayerIndex + 1}'s Turn`;
        turnInfo.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--player${currentPlayerIndex + 1}-color`) || '#f0f0f0';
        turnInfo.style.color = (currentPlayerIndex === 1) ? '#000' : '#fff';
    }
    function logMessage(msg) {
        const p = document.createElement('p'); p.textContent = msg; messageLog.appendChild(p); messageLog.scrollTop = messageLog.scrollHeight;
    }
    function showWinPopup() {
        playSoundEffect(audio.win);
        if (isMusicOn) audio.bgMusic.pause();
        logMessage(`🎉 Player ${currentPlayerIndex + 1} Wins! 🎉`);
        winMessage.textContent = `Player ${currentPlayerIndex + 1} Wins!`;
        winPopup.classList.remove('hidden');
        rollDiceBtn.disabled = true;
        startConfetti();
    }
    
    // --- CONFETTI LOGIC ---
    let confetti = [];
    function startConfetti() {
        const ctx = confettiCanvas.getContext('2d');
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
        confetti = [];
        const confettiCount = 200, colors = ['#fde19a', '#ff9a9a', '#a2d2ff', '#bde0fe', '#ffc8dd'];
        for (let i = 0; i < confettiCount; i++) {
            confetti.push({ x: Math.random() * confettiCanvas.width, y: Math.random() * confettiCanvas.height - confettiCanvas.height, radius: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)], speedX: Math.random() * 6 - 3, speedY: Math.random() * 5 + 2, opacity: 1 });
        }
        function animateConfetti() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            confetti.forEach((p, i) => { p.x += p.speedX; p.y += p.speedY; p.opacity -= 0.01; if(p.opacity <= 0) confetti.splice(i, 1); ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(${parseInt(p.color.slice(1,3),16)}, ${parseInt(p.color.slice(3,5),16)}, ${parseInt(p.color.slice(5,7),16)}, ${p.opacity})`; ctx.fill(); });
            if (confetti.length > 0) confettiAnimationId = requestAnimationFrame(animateConfetti); else { ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); confettiAnimationId = null; }
        }
        animateConfetti();
    }

    function stopConfetti() {
        if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
        confetti = [];
        const ctx = confettiCanvas.getContext('2d');
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiAnimationId = null;
    }

    // --- INITIAL LOAD ---
    loadSettings();
});