document.addEventListener('DOMContentLoaded', () => {
    // 1. CONFIGURATION AND STATE MANAGEMENT
    // Grouping constants, state, and DOM elements for better organization.
    const config = {
        BOARD_SIZE: 100,
        NUM_SNAKES: 8,
        NUM_LADDERS: 8,
        AI_THINK_TIME: 1500, // ms
        MODES: { PVP: 'pvp', PVA: 'pva' },
        CLASSES: { ACTIVE: 'active' }
    };

    const state = {
        gameMode: config.MODES.PVP,
        numPlayers: 2,
        playerPositions: [],
        currentPlayerIndex: 0,
        snakes: {},
        ladders: {},
        isMusicOn: true,
        isGameOver: false,
        confettiAnimationId: null,
    };

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
        gameModeBtns: document.getElementById('game-mode-btns'),
        playerCountBtns: document.getElementById('player-count-btns'),
    };

    const audio = {
        bgMusic: document.getElementById('bg-music'),
        dice: document.getElementById('dice-sound'),
        move: document.getElementById('move-sound'),
        ladder: document.getElementById('ladder-sound'),
        snake: document.getElementById('snake-sound'),
        win: document.getElementById('win-sound'),
        click: document.getElementById('click-sound'),
    };

    // 2. CORE GAME LOGIC
    function startGame() {
        if (state.isMusicOn) audio.bgMusic.play().catch(e => {});
        dom.mainMenu.classList.add('hidden');
        dom.gameContainer.classList.remove('hidden');
        
        resetGame();
        generateBoard();
        generateSnakesAndLadders();
        renderBoard();
        updateTurnInfo();
    }

    function resetGame() {
        state.isGameOver = false;
        state.playerPositions = Array(state.numPlayers).fill(1);
        state.currentPlayerIndex = 0;
        state.snakes = {};
        state.ladders = {};
        dom.messageLog.innerHTML = '';
        dom.rollDiceBtn.disabled = false;
        document.querySelectorAll('.player-token').forEach(token => token.remove());
    }

    async function handleTurn() {
        if (state.isGameOver) return;

        dom.rollDiceBtn.disabled = true;

        const diceRoll = await rollDice();
        logMessage(`Player ${state.currentPlayerIndex + 1} rolled a ${diceRoll}.`);

        await executePlayerMove(diceRoll);
        const hasLandedOnSpecial = await checkForSpecialSquare();

        if (state.playerPositions[state.currentPlayerIndex] === config.BOARD_SIZE) {
            showWinPopup();
        } else {
            switchPlayer();
        }
    }
    
    async function executePlayerMove(diceRoll) {
        const startPos = state.playerPositions[state.currentPlayerIndex];
        let targetPos = startPos + diceRoll;
        if (targetPos > config.BOARD_SIZE) {
            targetPos = startPos; // Don't move if roll overshoots
        }
        await movePlayer(startPos, targetPos);
    }
    
    async function checkForSpecialSquare() {
        const finalPos = state.playerPositions[state.currentPlayerIndex];
        if (state.snakes[finalPos]) {
            logMessage(`Oh no! Player ${state.currentPlayerIndex + 1} landed on a snake! 🐍`);
            playSound(audio.snake);
            await movePlayer(finalPos, state.snakes[finalPos], 800, false);
            return true;
        } else if (state.ladders[finalPos]) {
            logMessage(`Yay! Player ${state.currentPlayerIndex + 1} found a ladder! 🪜`);
            playSound(audio.ladder);
            await movePlayer(finalPos, state.ladders[finalPos], 100);
            return true;
        }
        return false;
    }

    function switchPlayer() {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.numPlayers;
        updateTurnInfo();
        
        const isAITurn = state.gameMode === config.MODES.PVA && state.currentPlayerIndex > 0;

        if (isAITurn) {
            setTimeout(handleTurn, config.AI_THINK_TIME);
        } else {
            dom.rollDiceBtn.disabled = false;
        }
    }

    // 3. GENERATION & RENDERING
    function generateBoard() {
        dom.gameBoard.innerHTML = '';
        for (let i = 0; i < config.BOARD_SIZE; i++) {
            dom.gameBoard.appendChild(document.createElement('div')).classList.add('cell');
        }
        const cells = Array.from(dom.gameBoard.children);
        let cellNumber = config.BOARD_SIZE;
        for (let row = 0; row < 10; row++) {
            const rowCells = cells.slice(row * 10, (row * 10) + 10);
            if (row % 2 !== 0) rowCells.reverse();
            for (const cell of rowCells) {
                cell.textContent = cellNumber;
                cell.dataset.cell = cellNumber--;
            }
        }
    }

    function generateSnakesAndLadders() {
        const occupied = new Set([1, config.BOARD_SIZE]);
        state.snakes = {};
        state.ladders = {};
        for (let i = 0; i < config.NUM_SNAKES; i++) {
            let start, end;
            do { start = Math.floor(Math.random() * (config.BOARD_SIZE - 20)) + 21; end = Math.floor(Math.random() * (start - 11)) + 1; } while (occupied.has(start) || occupied.has(end));
            occupied.add(start); occupied.add(end); state.snakes[start] = end;
        }
        for (let i = 0; i < config.NUM_LADDERS; i++) {
            let start, end;
            do { start = Math.floor(Math.random() * (config.BOARD_SIZE - 20)) + 2; end = Math.floor(Math.random() * (config.BOARD_SIZE - start - 10)) + start + 11; } while (occupied.has(start) || occupied.has(end) || end > config.BOARD_SIZE);
            occupied.add(start); occupied.add(end); state.ladders[start] = end;
        }
    }

    function renderBoard() {
        document.querySelectorAll('.cell').forEach(cell => { cell.classList.remove('snake-head', 'snake-tail', 'ladder-start', 'ladder-end'); delete cell.dataset.goto; });
        for (const [s, e] of Object.entries(state.snakes)) { const sc = document.querySelector(`[data-cell='${s}']`); sc.classList.add('snake-head'); sc.dataset.goto = `🐍 to ${e}`; document.querySelector(`[data-cell='${e}']`).classList.add('snake-tail'); }
        for (const [s, e] of Object.entries(state.ladders)) { const sc = document.querySelector(`[data-cell='${s}']`); sc.classList.add('ladder-start'); sc.dataset.goto = `🪜 to ${e}`; document.querySelector(`[data-cell='${e}']`).classList.add('ladder-end'); }
        renderPlayerTokens();
    }

    function renderPlayerTokens() {
        document.querySelectorAll('.player-token').forEach(t => t.remove());
        state.playerPositions.forEach((pos, i) => { const token = document.createElement('div'); token.className = `player-token player-${i}`; document.querySelector(`[data-cell='${pos}']`)?.appendChild(token); });
    }
    
    // 4. UI & EVENT HANDLERS
    function updateActiveButton(buttonGroup, clickedButton) {
        buttonGroup.querySelector(`.${config.CLASSES.ACTIVE}`)?.classList.remove(config.CLASSES.ACTIVE);
        clickedButton.classList.add(config.CLASSES.ACTIVE);
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
            state.numPlayers = parseInt(e.target.dataset.count);
            updateActiveButton(dom.playerCountBtns, e.target);
        }
    });

    dom.rollDiceBtn.addEventListener('click', () => { playSound(audio.click); handleTurn(); });
    dom.startGameBtn.addEventListener('click', () => { playSound(audio.click); startGame(); });
    dom.backToMenuBtn.addEventListener('click', () => { playSound(audio.click); dom.gameContainer.classList.add('hidden'); dom.mainMenu.classList.remove('hidden'); audio.bgMusic.pause(); });
    dom.playAgainBtn.addEventListener('click', () => { playSound(audio.click); dom.winPopup.classList.add('hidden'); stopConfetti(); startGame(); });
    dom.settingsBtn.addEventListener('click', () => { playSound(audio.click); toggleMusic(); });
    dom.homeBtn.addEventListener('click', () => { playSound(audio.click); window.location.href = '../../home/home.html'; });

    // 5. ANIMATIONS & EFFECTS
    function movePlayer(start, end, animationDuration = 100, playMoveSound = true) {
        return new Promise(resolve => {
            let current = start;
            const isClimbing = end > start;
            const interval = setInterval(() => {
                if ((isClimbing && current >= end) || (!isClimbing && current <= end)) {
                    clearInterval(interval);
                    state.playerPositions[state.currentPlayerIndex] = end;
                    renderPlayerTokens();
                    resolve();
                    return;
                }
                current = isClimbing ? current + 1 : current - 1;
                state.playerPositions[state.currentPlayerIndex] = current;
                if (playMoveSound) playSound(audio.move);
                renderPlayerTokens();
            }, animationDuration);
        });
    }

    function rollDice() {
        playSound(audio.dice);
        return new Promise(resolve => {
            const roll = Math.floor(Math.random() * 6) + 1;
            let i = 0;
            const interval = setInterval(() => { dom.diceFaces[i++ % 6].classList.remove(config.CLASSES.ACTIVE); dom.diceFaces[i % 6].classList.add(config.CLASSES.ACTIVE); }, 50);
            setTimeout(() => { clearInterval(interval); dom.diceFaces.forEach(f => f.classList.remove(config.CLASSES.ACTIVE)); document.querySelector(`.dice-face[data-face='${roll}']`).classList.add(config.CLASSES.ACTIVE); resolve(roll); }, 800);
        });
    }

    // 6. UTILITIES (Sound, Popups, etc.)
    function playSound(sound) { if (state.isMusicOn) { sound.currentTime = 0; sound.play().catch(e => {}); } }
    function toggleMusic() { state.isMusicOn = !state.isMusicOn; updateSettingsUI(); localStorage.setItem('snakeLadderMusic', state.isMusicOn); if (state.isMusicOn) { audio.bgMusic.play().catch(e => {}); } else { audio.bgMusic.pause(); } }
    function updateSettingsUI() { const btn = dom.settingsBtn; if (state.isMusicOn) { btn.classList.remove('sound-off'); btn.classList.add('sound-on'); btn.textContent = '🔊'; audio.bgMusic.muted = false; } else { btn.classList.remove('sound-on'); btn.classList.add('sound-off'); btn.textContent = '🔇'; audio.bgMusic.muted = true; } }
    function showWinPopup() { state.isGameOver = true; audio.bgMusic.pause(); playSound(audio.win); logMessage(`🎉 Player ${state.currentPlayerIndex + 1} Wins! 🎉`); dom.winMessage.textContent = `Player ${state.currentPlayerIndex + 1} Wins!`; dom.winPopup.classList.remove('hidden'); dom.rollDiceBtn.disabled = true; startConfetti(); }
    function updateTurnInfo() { const playerType = (state.gameMode === config.MODES.PVA && state.currentPlayerIndex > 0) ? 'AI' : 'Player'; dom.turnInfo.textContent = `${playerType} ${state.currentPlayerIndex + 1}'s Turn`; dom.turnInfo.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue(`--player${state.currentPlayerIndex + 1}-color`) || '#f0f0f0'; dom.turnInfo.style.color = (state.currentPlayerIndex === 1) ? '#000' : '#fff'; }
    function logMessage(msg) { const p = document.createElement('p'); p.textContent = msg; dom.messageLog.appendChild(p); dom.messageLog.scrollTop = dom.messageLog.scrollHeight; }
    
    // --- Confetti logic (unchanged) ---
    let confetti = [];
    function startConfetti() { const ctx = dom.confettiCanvas.getContext('2d'); dom.confettiCanvas.width = window.innerWidth; dom.confettiCanvas.height = window.innerHeight; confetti = []; const confettiCount = 200; const colors = ['#fde19a', '#ff9a9a', '#a2d2ff', '#bde0fe', '#ffc8dd']; for (let i = 0; i < confettiCount; i++) { confetti.push({ x: Math.random() * dom.confettiCanvas.width, y: Math.random() * dom.confettiCanvas.height - dom.confettiCanvas.height, radius: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)], speedX: Math.random() * 6 - 3, speedY: Math.random() * 5 + 2, opacity: 1 }); } function animateConfetti() { ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height); confetti.forEach((p, i) => { p.x += p.speedX; p.y += p.speedY; p.opacity -= 0.01; if(p.opacity <= 0) confetti.splice(i, 1); ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(${parseInt(p.color.slice(1,3),16)}, ${parseInt(p.color.slice(3,5),16)}, ${parseInt(p.color.slice(5,7),16)}, ${p.opacity})`; ctx.fill(); }); if (confetti.length > 0) { state.confettiAnimationId = requestAnimationFrame(animateConfetti); } else { ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height); } } animateConfetti(); }
    function stopConfetti() { if (state.confettiAnimationId) { cancelAnimationFrame(state.confettiAnimationId); } confetti = []; dom.confettiCanvas.getContext('2d').clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height); }

    // 7. INITIALIZATION
    (() => {
        const savedMusicSetting = localStorage.getItem('snakeLadderMusic');
        if (savedMusicSetting !== null) {
            state.isMusicOn = savedMusicSetting === 'true';
        }
        updateSettingsUI();
    })();
});