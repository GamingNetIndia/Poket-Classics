document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const boardContainer = document.getElementById('board-container');
    const playerTurnEl = document.getElementById('player-turn');
    const blackScoreEl = document.getElementById('black-score');
    const whiteScoreEl = document.getElementById('white-score');
    const statusMessageEl = document.getElementById('status-message');
    const menuOverlay = document.getElementById('menu-overlay');
    const mainMenu = document.getElementById('main-menu');
    const aiDifficultyMenu = document.getElementById('ai-difficulty-menu');
    const gameScreen = document.getElementById('game-screen');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    const musicFileInput = document.getElementById('music-file-input');
    const sfxFileInput = document.getElementById('sfx-file-input');
    const bgMusic = document.getElementById('bg-music');
    const sfxSound = document.getElementById('sfx-sound');
    const winPopupOverlay = document.getElementById('win-popup-overlay');
    const winParticlesCanvas = document.getElementById('win-particles-canvas');
    const winResultEl = document.getElementById('win-result');
    const winScoreEl = document.getElementById('win-score');
    const winSound = document.getElementById('win-sound');
    const winFileInput = document.getElementById('win-file-input');
    const homeBtn = document.getElementById('home-btn');

    // --- Game State ---
    const BOARD_SIZE = 8, PLAYER_BLACK = 1, PLAYER_WHITE = 2;
    const DIRECTIONS = [ [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1] ];
    let board = [], currentPlayer, gameMode, aiDifficulty, gameOver;
    let particles = [];
    let isMusicOn = true, isSfxOn = true;

    // --- Audio Logic ---
    function playSfx() { if(isSfxOn && sfxSound.src) { sfxSound.currentTime = 0; sfxSound.play().catch(e => {}); } }
    function playWinSound() { if(isSfxOn && winSound.src) { winSound.currentTime = 0; winSound.play().catch(e => {}); } }
    musicToggle.addEventListener('change', (e) => {
        isMusicOn = e.target.checked;
        isMusicOn && bgMusic.src ? bgMusic.play().catch(e => {}) : bgMusic.pause();
    });
    sfxToggle.addEventListener('change', (e) => isSfxOn = e.target.checked);
    const setupFileInput = (input, audioElement) => { input.addEventListener('change', (e) => { const file = e.target.files[0]; if (file) audioElement.src = URL.createObjectURL(file); }); };
    setupFileInput(musicFileInput, bgMusic);
    setupFileInput(sfxFileInput, sfxSound);
    setupFileInput(winFileInput, winSound);
    musicFileInput.addEventListener('change', () => { if (isMusicOn) bgMusic.play().catch(e => {}); });
    document.addEventListener('click', (e) => { if (e.target.matches('button, #settings-btn')) playSfx(); });
    
    // --- Menu & Navigation Logic (with corrected button listeners) ---
    const setupButton = (id, callback) => document.getElementById(id).addEventListener('click', callback);
    setupButton('pvp-btn', () => { gameMode = 'pvp'; startGame(); });
    setupButton('pvai-btn', () => { mainMenu.classList.add('hidden'); aiDifficultyMenu.classList.remove('hidden'); });
    aiDifficultyMenu.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' && e.target.dataset.difficulty) { gameMode = 'pvai'; aiDifficulty = e.target.dataset.difficulty; startGame(); } });
    setupButton('back-to-main-btn', () => { aiDifficultyMenu.classList.add('hidden'); mainMenu.classList.remove('hidden'); });
    
    // This is the function for all "Back to Menu" buttons inside the Othello game
    const goBackToMenu = () => {
        winPopupOverlay.classList.add('invisible');
        gameScreen.classList.add('hidden');
        menuOverlay.classList.remove('invisible');
        mainMenu.classList.remove('hidden');
        aiDifficultyMenu.classList.add('hidden'); // Ensure AI menu is also hidden
        particles = []; // Stop particle animation
    };
    
    // Wire up all the "Back to Menu" buttons to the function above
    setupButton('back-to-menu-game-btn', goBackToMenu);
    setupButton('win-back-to-menu-btn', goBackToMenu);
    
    setupButton('play-again-btn', () => { winPopupOverlay.classList.add('invisible'); particles = []; initGame(); });
    setupButton('settings-btn', () => settingsMenu.classList.remove('invisible'));
    setupButton('close-settings-btn', () => settingsMenu.classList.add('invisible'));

    // The "Home" button to go back to Pocket Classics
    homeBtn.addEventListener('click', () => {
        window.location.href = '../../home/home.html';
    });

    // --- Core Game & UI Logic (Now Complete) ---
    function startGame() { menuOverlay.classList.add('invisible'); gameScreen.classList.remove('hidden'); aiDifficultyMenu.classList.add('hidden'); initGame(); }
    function initGame() { board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0)); board[3][3] = PLAYER_WHITE; board[3][4] = PLAYER_BLACK; board[4][3] = PLAYER_BLACK; board[4][4] = PLAYER_WHITE; currentPlayer = PLAYER_BLACK; gameOver = false; statusMessageEl.textContent = ''; boardContainer.style.pointerEvents = 'auto'; renderBoard(); updateUI(); highlightValidMoves(); }
    boardContainer.addEventListener('click', (e) => { if (gameOver) return; const highlighter = e.target.closest('.valid-move-highlighter'); if (highlighter) { playSfx(); const cell = highlighter.parentElement; makeMove(parseInt(cell.dataset.row), parseInt(cell.dataset.col)); } });
    function makeMove(row, col) { const piecesToFlip = getPiecesToFlip(row, col, currentPlayer); if (piecesToFlip.length === 0) return; boardContainer.style.pointerEvents = 'none'; document.querySelectorAll('.valid-move-highlighter').forEach(h => h.remove()); statusMessageEl.textContent = ''; board[row][col] = currentPlayer; piecesToFlip.forEach(p => { board[p.row][p.col] = currentPlayer; }); const playerClass = currentPlayer === PLAYER_BLACK ? 'black' : 'white'; const opponentClass = currentPlayer === PLAYER_BLACK ? 'white' : 'black'; const newPieceCell = boardContainer.children[row * BOARD_SIZE + col]; const newPiece = document.createElement('div'); newPiece.className = `piece ${playerClass}`; newPiece.style.transform = 'scale(0)'; newPieceCell.appendChild(newPiece); requestAnimationFrame(() => { newPiece.style.transform = 'scale(1)'; }); let maxDelay = 0; piecesToFlip.forEach((p, i) => { const delay = 100 + 50 * i; maxDelay = delay; setTimeout(() => { const pieceToFlip = boardContainer.children[p.row * BOARD_SIZE + p.col].querySelector('.piece'); if (pieceToFlip) { pieceToFlip.style.transform = 'rotateY(180deg)'; setTimeout(() => { pieceToFlip.classList.remove(opponentClass); pieceToFlip.classList.add(playerClass); pieceToFlip.style.transform = ''; }, 300); } }, delay); }); setTimeout(switchPlayer, maxDelay + 600); }
    function switchPlayer() { updateUI(); const opponent = (currentPlayer === PLAYER_BLACK) ? PLAYER_WHITE : PLAYER_BLACK; if (getValidMoves(opponent).length > 0) { currentPlayer = opponent; } else if (getValidMoves(currentPlayer).length > 0) { statusMessageEl.textContent = `${opponent === PLAYER_BLACK ? 'Black' : 'White'} has no moves! Turn skipped.`; } else { endGame(); return; } updateUI(); highlightValidMoves(); if (!gameOver && gameMode === 'pvai' && currentPlayer === PLAYER_WHITE) { setTimeout(makeAiMove, 800); } else { boardContainer.style.pointerEvents = 'auto'; } }
    function getValidMoves(player) { const moves = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { if (board[r][c] === 0 && getPiecesToFlip(r, c, player).length > 0) moves.push({ row: r, col: c }); } return moves; }
    function getPiecesToFlip(row, col, player) { const opponent = (player === 1) ? 2 : 1; let allPiecesToFlip = []; for (const [dr, dc] of DIRECTIONS) { let path = [], r = row + dr, c = col + dc; while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) { path.push({ row: r, col: c }); r += dr; c += dc; } if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) { allPiecesToFlip.push(...path); } } return allPiecesToFlip; }
    function endGame() { playWinSound(); gameOver = true; boardContainer.style.pointerEvents = 'none'; const scores = getScores(); let winner; if (scores.black > scores.white) { winResultEl.textContent = "Black Wins!"; winner = 'black'; } else if (scores.white > scores.black) { winResultEl.textContent = "White Wins!"; winner = 'white'; } else { winResultEl.textContent = "It's a Draw!"; winner = 'draw'; } winScoreEl.textContent = `Final Score: Black ${scores.black} - ${scores.white} White`; winPopupOverlay.classList.remove('invisible'); initParticles(winner); }
    function renderBoard() { boardContainer.innerHTML = ''; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.row = r; cell.dataset.col = c; if (board[r][c] !== 0) { const piece = document.createElement('div'); piece.className = `piece ${board[r][c] === 1 ? 'black' : 'white'}`; cell.appendChild(piece); } boardContainer.appendChild(cell); } }
    function updateUI() { const scores = getScores(); blackScoreEl.textContent = scores.black; whiteScoreEl.textContent = scores.white; if (!gameOver) { playerTurnEl.innerHTML = `<div class="piece ${currentPlayer === 1 ? 'black' : 'white'}" style="width:24px; height:24px; display:inline-block; vertical-align:middle; margin: 0 10px;"></div>`; } else { playerTurnEl.innerHTML = ''; } }
    function getScores() { return board.flat().reduce((acc, cell) => { if (cell === 1) acc.black++; else if (cell === 2) acc.white++; return acc; }, { black: 0, white: 0 });}
    function highlightValidMoves() { document.querySelectorAll('.valid-move-highlighter').forEach(h => h.remove()); if(gameOver) return; getValidMoves(currentPlayer).forEach(move => { const cell = boardContainer.children[move.row * 8 + move.col]; const highlighter = document.createElement('div'); highlighter.className = 'valid-move-highlighter'; cell.appendChild(highlighter); }); }
    function makeAiMove() { if (gameOver) return; const validMoves = getValidMoves(2); if (validMoves.length === 0) return; let bestMove; switch (aiDifficulty) { case 'easy': bestMove = validMoves[Math.floor(Math.random() * validMoves.length)]; break; case 'medium': bestMove = validMoves.reduce((best, move) => { const flips = getPiecesToFlip(move.row, move.col, 2).length; return flips > best.flips ? { move, flips } : best; }, { move: validMoves[0], flips: 0 }).move; break; case 'hard': const w = [ [120,-20,20,5,5,20,-20,120],[-20,-40,-5,-5,-5,-5,-40,-20],[20,-5,15,3,3,15,-5,20],[5,-5,3,3,3,3,-5,5],[5,-5,3,3,3,3,-5,5],[20,-5,15,3,3,15,-5,20],[-20,-40,-5,-5,-5,-5,-40,-20],[120,-20,20,5,5,20,-20,120]]; bestMove = validMoves.reduce((best, move) => { const score = w[move.row][move.col]; return score > best.score ? { move, score } : best; }, { move: null, score: -Infinity }).move || validMoves[0]; break; } playSfx(); makeMove(bestMove.row, bestMove.col); }
    function initParticles(winner) { const ctx = winParticlesCanvas.getContext('2d'); winParticlesCanvas.width = window.innerWidth; winParticlesCanvas.height = window.innerHeight; const colors = { black: ['#111', '#333', '#555'], white: ['#fff', '#f0f0f0', '#ddd'], draw: ['#111', '#333', '#fff', '#ddd'] }[winner]; particles = []; for (let i = 0; i < 150; i++) { particles.push({ x: winParticlesCanvas.width / 2, y: winParticlesCanvas.height / 2, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, size: Math.random() * 3 + 2, color: colors[Math.floor(Math.random() * colors.length)], life: Math.random() * 100 + 50 }); } animateParticles(ctx); }
    function animateParticles(ctx) { if (particles.length === 0) { ctx.clearRect(0, 0, winParticlesCanvas.width, winParticlesCanvas.height); return; } requestAnimationFrame(() => animateParticles(ctx)); ctx.clearRect(0, 0, winParticlesCanvas.width, winParticlesCanvas.height); for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--; if (p.life <= 0) { particles.splice(i, 1); continue; } ctx.globalAlpha = p.life / 100; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } }
});