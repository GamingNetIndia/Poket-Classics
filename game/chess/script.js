document.addEventListener('DOMContentLoaded', () => {
    // --- CACHED DOM ELEMENTS ---
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const playPlayerBtn = document.getElementById('play-player');
    const playAiBtn = document.getElementById('play-ai');
    const aiDifficultySelector = document.getElementById('ai-difficulty-selector');
    const aiDifficulty = document.getElementById('ai-difficulty');
    const startAiGameBtn = document.getElementById('start-ai-game');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const homeBtn = document.getElementById('home-button');
    const promotionDialog = document.getElementById('promotion-dialog');
    const soundToggleBtn = document.getElementById('sound-toggle');
    // NEW: Get captured pieces containers
    const whiteCapturedEl = document.getElementById('white-captured');
    const blackCapturedEl = document.getElementById('black-captured');

    // --- Audio and Game State ---
    const sounds = { move: document.getElementById('sound-move'), capture: document.getElementById('sound-capture'), check: document.getElementById('sound-check'), gameOver: document.getElementById('sound-game-over'), menuMusic: document.getElementById('music-menu'), gameMusic: document.getElementById('music-game'), };
    let board = [], currentPlayer = 'w', selectedPiece = null, validMoves = [], gameMode = null, aiLevel = 'easy', isGameOver = false, lastMove = { from: null, to: null }, castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } }, enPassantTarget = null;
    let isSoundEnabled = true, gameOverSoundPlayed = false;
    const pieces = { 'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚' };

    // --- Core Functions ---
    function showMainMenu() { gameContainer.classList.add('hidden'); mainMenu.classList.remove('hidden'); aiDifficultySelector.classList.add('hidden'); stopAllMusic(); playMusic('menuMusic'); }
    function initializeGame(mode) {
        gameMode = mode;
        if (mode === 'pvai') { aiLevel = aiDifficulty.value; }
        board = setupBoard();
        currentPlayer = 'w'; selectedPiece = null; validMoves = []; isGameOver = false; gameOverSoundPlayed = false;
        castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
        enPassantTarget = null; lastMove = { from: null, to: null };
        mainMenu.classList.add('hidden');
        gameContainer.style.display = 'flex'; // Use style.display to make it visible
        // NEW: Clear captured pieces display
        whiteCapturedEl.innerHTML = '';
        blackCapturedEl.innerHTML = '';
        stopAllMusic(); playMusic('gameMusic');
        renderBoard(); updateStatus();
    }
    showMainMenu();
    function playSound(soundKey) { if (!isSoundEnabled) return; const sound = sounds[soundKey]; if (sound) { sound.currentTime = 0; sound.play().catch(e => console.error(`Error playing ${soundKey}:`, e)); } }
    function playMusic(musicKey) { if (!isSoundEnabled) return; const music = sounds[musicKey]; if (music) { music.currentTime = 0; music.play().catch(e => console.error(`Error playing ${musicKey}:`, e)); } }
    function stopAllMusic() { sounds.menuMusic.pause(); sounds.gameMusic.pause(); }

    // --- EVENT HANDLERS ---
    playPlayerBtn.addEventListener('click', () => initializeGame('pvp'));
    playAiBtn.addEventListener('click', () => aiDifficultySelector.classList.toggle('hidden'));
    startAiGameBtn.addEventListener('click', () => initializeGame('pvai'));
    backToMenuBtn.addEventListener('click', showMainMenu);
    homeBtn.addEventListener('click', () => { window.location.href = '../../home/home.html'; });
    soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggleBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
        if (isSoundEnabled) { if (!mainMenu.classList.contains('hidden')) playMusic('menuMusic'); else playMusic('gameMusic'); } else { stopAllMusic(); }
    });

    // --- GAME LOGIC (makeMove is updated) ---
    function makeMove(from, to, promotionPiece = null) {
        const piece = board[from.r][from.c];
        const capturedPiece = board[to.r][to.c];

        // NEW: Handle displaying captured pieces
        if (capturedPiece) {
            playSound('capture');
            const capturedSide = getPieceColor(capturedPiece) === 'w' ? whiteCapturedEl : blackCapturedEl;
            const capturedPieceEl = document.createElement('div');
            capturedPieceEl.className = 'piece';
            capturedPieceEl.innerText = pieces[capturedPiece];
            capturedSide.appendChild(capturedPieceEl);
        } else {
            playSound('move');
        }

        if (piece.toLowerCase() === 'p' && to.r === enPassantTarget?.r && to.c === enPassantTarget?.c) {
            const capturedPawnRow = currentPlayer === 'w' ? to.r + 1 : to.r - 1;
            board[capturedPawnRow][to.c] = null;
        }

        board[to.r][to.c] = piece;
        board[from.r][from.c] = null;

        if (piece.toLowerCase() === 'k' && Math.abs(from.c - to.c) === 2) {
            const rookCol = to.c > from.c ? 7 : 0;
            const newRookCol = to.c > from.c ? 5 : 3;
            board[from.r][newRookCol] = board[from.r][rookCol];
            board[from.r][rookCol] = null;
        }

        enPassantTarget = (piece.toLowerCase() === 'p' && Math.abs(from.r - to.r) === 2) ? { r: (from.r + to.r) / 2, c: from.c } : null;

        if (piece.toLowerCase() === 'p' && (to.r === 0 || to.r === 7)) {
            if (promotionPiece) {
                board[to.r][to.c] = currentPlayer === 'w' ? promotionPiece.toUpperCase() : promotionPiece.toLowerCase();
                finishMove(from, to);
            } else {
                if (gameMode === 'pvai' && currentPlayer === 'b') { // AI auto-promotes to queen
                    board[to.r][to.c] = 'q';
                    finishMove(from, to);
                } else {
                    showPromotionDialog(from, to);
                }
            }
            return;
        }
        finishMove(from, to);
    }
    
    // The rest of your script.js is unchanged. Copy the rest from your working file.
    // ... (renderBoard, handleSquareClick, selectPiece, deselect, finishMove, etc.)
    function renderBoard(){boardElement.innerHTML="";for(let e=0;e<8;e++)for(let t=0;t<8;t++){const o=document.createElement("div");o.classList.add("square",(e+t)%2==0?"light":"dark"),o.dataset.row=e,o.dataset.col=t;const r=board[e][t];if(r){const a=document.createElement("div");a.classList.add("piece"),a.classList.add("w"===getPieceColor(r)?"white-piece":"black-piece"),a.innerText=pieces[r],a.dataset.piece=r,o.appendChild(a)}lastMove.from&&lastMove.from.r===e&&lastMove.from.c===t||lastMove.to&&lastMove.to.r===e&&lastMove.to.c===t?o.classList.add("last-move"):o.classList.remove("last-move"),boardElement.appendChild(o)}boardElement.querySelectorAll(".square").forEach(e=>{e.addEventListener("click",handleSquareClick)}),highlightValidMoves()}function highlightValidMoves(){document.querySelectorAll(".valid-move-dot").forEach(e=>e.remove()),document.querySelectorAll(".selected").forEach(e=>e.classList.remove("selected")),selectedPiece&&boardElement.querySelector(`[data-row='${selectedPiece.r}'][data-col='${selectedPiece.c}']`).classList.add("selected"),validMoves.forEach(e=>{const t=boardElement.querySelector(`[data-row='${e.r}'][data-col='${e.c}']`);if(t){const o=document.createElement("div");o.classList.add("valid-move-dot"),t.appendChild(o)}})}function handleSquareClick(e){if(isGameOver)return;const t=e.currentTarget,o=parseInt(t.dataset.row),r=parseInt(t.dataset.col),a=board[o][r];selectedPiece?validMoves.some(e=>e.r===o&&e.c===r)?makeMove(selectedPiece,{r:o,c:r}):(deselect(),a&&getPieceColor(a)===currentPlayer&&selectPiece(o,r)):a&&getPieceColor(a)===currentPlayer&&selectPiece(o,r)}function selectPiece(e,t){selectedPiece={r:e,c:t,piece:board[e][t]},validMoves=getValidMovesForPiece(e,t),renderBoard()}function deselect(){selectedPiece=null,validMoves=[],renderBoard()}function finishMove(e,t){updateCastlingRights(e,t),lastMove={from:e,to:t},deselect(),switchPlayer(),renderBoard(),updateStatus(),"pvai"===gameMode&&"b"===currentPlayer&&!isGameOver&&setTimeout(makeAiMove,500)}function showPromotionDialog(e,t){promotionDialog.classList.remove("hidden"),promotionDialog.querySelectorAll("button").forEach(o=>{const r=()=>{const r=o.dataset.piece;promotionDialog.classList.add("hidden"),makeMove(e,t,r),promotionDialog.querySelectorAll("button").forEach(e=>e.removeEventListener("click",r))};o.addEventListener("click",r,{once:!0})})}function switchPlayer(){currentPlayer="w"===currentPlayer?"b":"w"}function updateStatus(){let e;const t=currentPlayer,o=isKingInCheck(t),r=hasAnyValidMoves(t);isGameOver=o&&!r?(!0,e=`Checkmate! ${"w"===t?"Black":"White"} wins.`):!o&&!r?(!0,e="Stalemate! It's a draw."):(e=`${"w"===t?"White":"Black"}'s Turn`,o&&(e+=" - Check!",playSound("check"))),isGameOver&&!gameOverSoundPlayed&&(playSound("gameOver"),gameOverSoundPlayed=!0),statusElement.textContent=e}function setupBoard(){return[["r","n","b","q","k","b","n","r"],["p","p","p","p","p","p","p","p"],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],["P","P","P","P","P","P","P","P"],["R","N","B","Q","K","B","N","R"]]}function updateCastlingRights(e,t){const o=board[t.r][t.c]||"";"k"===o.toLowerCase()?castlingRights[currentPlayer]={k:!1,q:!1}:"r"===o.toLowerCase()&&(0===e.r&&0===e.c?castlingRights.b.q=!1:0===e.r&&7===e.c?castlingRights.b.k=!1:7===e.r&&0===e.c?castlingRights.w.q=!1:7===e.r&&7===e.c&&(castlingRights.w.k=!1))}function getValidMovesForPiece(e,t){const o=board[e][t];if(!o)return[];const r=getPieceColor(o);return getPseudoLegalMoves(e,t,o,r).filter(a=>{const s=board.map(e=>[...e]);return s[a.r][a.c]=o,s[e][t]=null,!isKingInCheck(r,s)})}function getPseudoLegalMoves(e,t,o,r){switch(o.toLowerCase()){case"p":return getPawnMoves(e,t,r);case"r":return getSlidingMoves(e,t,[[0,1],[0,-1],[1,0],[-1,0]]);case"n":return getKnightMoves(e,t);case"b":return getSlidingMoves(e,t,[[1,1],[1,-1],[-1,1],[-1,-1]]);case"q":return getSlidingMoves(e,t,[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);case"k":return getKingMoves(e,t,r);default:return[]}}function getPawnMoves(e,t,o){const r=[];-1===(o,1);const a="w"===o?6:1;return isValid(e+ -1,t)&&!board[e+ -1][t]&&(r.push({r:e+ -1,c:t}),e===a&&!board[e+-2][t]&&r.push({r:e+-2,c:t})),[-1,1].forEach(a=>{isValid(e+ -1,t+a)&&(board[e+ -1][t+a]&&getPieceColor(board[e+ -1][t+a])!==o&&r.push({r:e+ -1,c:t+a}),enPassantTarget&&enPassantTarget.r===e+ -1&&enPassantTarget.c===t+a&&r.push({r:e+ -1,c:t+a}))}),r}function getSlidingMoves(e,t,o){const r=[];getPieceColor(board[e][t]);for(let[a,s]of o){let c=e+a,n=t+s;for(;isValid(c,n);){const i=board[c][n];if(i){getPieceColor(i),r.push({r:c,c:n});break}r.push({r:c,c:n}),c+=a,n+=s}}return r}function getKnightMoves(e,t){const o=[];getPieceColor(board[e][t]);for(let[r,a]of[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]){const s=e+r,c=t+a;isValid(s,c)&&(!board[s][c]||(getPieceColor(board[s][c]),o.push({r:s,c:c})))}return o}function getKingMoves(e,t,o){const r=[];for(let[a,s]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const c=e+a,n=t+s;isValid(c,n)&&(!board[c][n]||(getPieceColor(board[c][n]),r.push({r:c,c:n})))}return castlingRights[o].k&&!board[e][t+1]&&!board[e][t+2]&&!isSquareAttacked(e,t,o)&&!isSquareAttacked(e,t+1,o)&&!isSquareAttacked(e,t+2,o)&&r.push({r:e,c:t+2}),castlingRights[o].q&&!board[e][t-1]&&!board[e][t-2]&&!board[e][t-3]&&!isSquareAttacked(e,t,o)&&!isSquareAttacked(e,t-1,o)&&!isSquareAttacked(e,t-2,o)&&r.push({r:e,c:t-2}),r}function isKingInCheck(e,t=board){const o=findKing(e,t);return!!o&&isSquareAttacked(o.r,o.c,e,t)}function isSquareAttacked(e,t,o,r=board){"w"===(o,"b");for(let a=0;a<8;a++)for(let s=0;s<8;s++){const c=r[a][s];if(c&&"b"===getPieceColor(c)&&getPseudoLegalMoves(a,s,c,"b").some(o=>o.r===e&&o.c===t))return!0}return!1}function hasAnyValidMoves(e){for(let t=0;t<8;t++)for(let o=0;o<8;o++){const r=board[t][o];if(r&&getPieceColor(r)===e&&getValidMovesForPiece(t,o).length>0)return!0}return!1}function isValid(e,t){return e>=0&&e<8&&t>=0&&t<8}function getPieceColor(e){return e===e.toUpperCase()?"w":"b"}function findKing(e,t=board){const o="w"===e?"K":"k";for(let r=0;r<8;r++)for(let a=0;a<8;a++)if(t[r][a]===o)return{r,c:a};return null}function makeAiMove(){if(!isGameOver){let e=null;e="easy"===aiLevel?getEasyAiMove():"medium"===aiLevel?getMediumAiMove():"hard"===aiLevel?getHardAiMove():getEasyAiMove(),e&&makeMove(e.from,e.to)}}function getAllValidMoves(e){const t=[];for(let o=0;o<8;o++)for(let r=0;r<8;r++){const a=board[o][r];a&&getPieceColor(a)===e&&getValidMovesForPiece(o,r).forEach(e=>{t.push({from:{r:o,c:r},to:e})})}return t}function getEasyAiMove(){const e=getAllValidMoves("b");return 0===e.length?null:e[Math.floor(Math.random()*e.length)]}function getMediumAiMove(){const e=getAllValidMoves("b");if(0===e.length)return null;const t={p:1,n:3,b:3,r:5,q:9,k:100};let o=null,r=-1;for(const a of e){const s=board[a.to.r][a.to.c];let c=0;s&&(c=t[s.toLowerCase()]),c>r&&(r=c,o=a)}return r>0?o:e[Math.floor(Math.random()*e.length)]}function getHardAiMove(){const e=3;let t=null,o=-1/0;const r=getAllValidMoves("b");if(0===r.length)return null;for(const a of r){const s=board.map(e=>[...e]),c=s[a.from.r][a.from.c];s[a.to.r][a.to.c]=c,s[a.from.r][a.from.c]=null;const n=minimax(s,e-1,-1/0,1/0,!1);n>o&&(o=n,t=a)}return t||getEasyAiMove()}function minimax(e,t,o,r,a){if(0===t)return-evaluateBoard(e);const s=a?"b":"w",c=getAllValidMovesForBoard(e,s);if(a){let n=-1/0;for(const i of c){const l=e.map(e=>[...e]),d=l[i.from.r][i.from.c];l[i.to.r][i.to.c]=d,l[i.from.r][i.from.c]=null;const u=minimax(l,t-1,o,r,!1);if(n=Math.max(n,u),o=Math.max(o,u),r<=o)break}return n}let n=1/0;for(const i of c){const l=e.map(e=>[...e]),d=l[i.from.r][i.from.c];l[i.to.r][i.to.c]=d,l[i.from.r][i.from.c]=null;const u=minimax(l,t-1,o,r,!0);if(n=Math.min(n,u),r=Math.min(r,u),r<=o)break}return n}function evaluateBoard(e){let t=0;const o={p:1,n:3,b:3.2,r:5,q:9,k:100};for(let r=0;r<8;r++)for(let a=0;a<8;a++){const s=e[r][a];s&&(t+="w"===getPieceColor(s)?o[s.toLowerCase()]:-o[s.toLowerCase()])}return t}function getAllValidMovesForBoard(e,t){const o=[];for(let r=0;r<8;r++)for(let a=0;a<8;a++){const s=e[r][a];s&&getPieceColor(s)===t&&getPseudoLegalMoves(r,a,s,t).forEach(e=>{o.push({from:{r,c:a},to:e})})}return o}
});
