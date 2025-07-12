document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainMenu = document.getElementById('main-menu');
    const settingsScreen = document.getElementById('settings-screen');
    const gameContainer = document.getElementById('game-container');
    const winPopup = document.getElementById('win-popup');
    const vsPlayerBtn = document.getElementById('vs-player-btn');
    const vsAiBtn = document.getElementById('vs-ai-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const homeBtn = document.getElementById('home-btn'); // NEW: Get the home button
    const aiDifficultySelection = document.getElementById('ai-difficulty-selection');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status-display');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const winMessage = document.getElementById('win-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const lineCanvas = document.getElementById('line-canvas');
    const lineCtx = lineCanvas.getContext('2d');
    const particleCanvas = document.getElementById('particle-canvas');
    const particleCtx = particleCanvas.getContext('2d');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');

    // --- Audio Elements ---
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = new Audio('audio/click.wav');
    const winSound = new Audio('audio/win.wav');
    const drawSound = new Audio('audio/draw.wav');
    
    // --- Game & Settings State ---
    let gameMode = null, aiDifficulty = null, currentPlayer = 'X', boardState = Array(9).fill(null), gameActive = false, particleAnimationId, isMusicOn = true, isSfxOn = true;
    const winningCombinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

    // --- Audio & Settings Logic (Unchanged) ---
    function loadSettings() {
        const musicSetting = localStorage.getItem('ticTacToeMusic'), sfxSetting = localStorage.getItem('ticTacToeSfx');
        isMusicOn = musicSetting === null ? true : JSON.parse(musicSetting);
        isSfxOn = sfxSetting === null ? true : JSON.parse(sfxSetting);
        musicToggle.checked = isMusicOn; sfxToggle.checked = isSfxOn; updateMusicState();
    }
    function updateMusicState() { if (isMusicOn) { backgroundMusic.play().catch(e => {}); } else { backgroundMusic.pause(); } }
    function playSound(sound) { if (isSfxOn) { sound.currentTime = 0; sound.play(); } }

    // --- Screen Navigation & Main Menu Buttons ---
    function showScreen(screenToShow) {
        [mainMenu, settingsScreen, gameContainer, winPopup].forEach(screen => { screen.classList.add('hidden'); screen.classList.remove('active'); });
        screenToShow.classList.remove('hidden');
        if (screenToShow === mainMenu || screenToShow === settingsScreen) { screenToShow.classList.add('active'); }
    }

    vsPlayerBtn.addEventListener('click', () => { playSound(clickSound); gameMode = 'pvp'; startGame(); });
    vsAiBtn.addEventListener('click', () => { playSound(clickSound); aiDifficultySelection.classList.remove('hidden'); });
    settingsBtn.addEventListener('click', () => { playSound(clickSound); showScreen(settingsScreen); });
    backToMenuBtn.addEventListener('click', () => { playSound(clickSound); showScreen(mainMenu); });
    
    // NEW: Logic for the Home button to go back to Pocket Classics
    homeBtn.addEventListener('click', () => {
        playSound(clickSound);
        // Navigate up two directories (from /game/tictactoe/ to root) then into /home/
        window.location.href = '../../home/index.html';
    });

    difficultyBtns.forEach(button => { button.addEventListener('click', () => { playSound(clickSound); gameMode = 'ai'; aiDifficulty = button.dataset.difficulty; startGame(); }); });
    mainMenuBtn.addEventListener('click', () => { playSound(clickSound); showScreen(mainMenu); aiDifficultySelection.classList.add('hidden'); if (particleAnimationId) cancelAnimationFrame(particleAnimationId); });
    playAgainBtn.addEventListener('click', () => { playSound(clickSound); startGame(); });
    musicToggle.addEventListener('change', (e) => { playSound(clickSound); isMusicOn = e.target.checked; localStorage.setItem('ticTacToeMusic', isMusicOn); updateMusicState(); });
    sfxToggle.addEventListener('change', (e) => { playSound(clickSound); isSfxOn = e.target.checked; localStorage.setItem('ticTacToeSfx', isSfxOn); });

    // --- Game Logic (Unchanged, so it's condensed) ---
    function startGame(){gameActive=!0,currentPlayer="X",boardState.fill(null),cells.forEach(e=>{e.textContent="",e.classList.remove("x","o")}),statusDisplay.textContent=`${currentPlayer}'s Turn`,showScreen(gameContainer),aiDifficultySelection.classList.add("hidden"),resizeCanvas(),lineCtx.clearRect(0,0,lineCanvas.width,lineCanvas.height),particleAnimationId&&cancelAnimationFrame(particleAnimationId),updateMusicState()}function handleCellClick(e){const l=e.target,t=parseInt(l.dataset.cellIndex);boardState[t]||!gameActive||(playSound(clickSound),makeMove(t,currentPlayer),checkGameStatus()||(switchPlayer(),"ai"===gameMode&&"O"===currentPlayer&&gameActive&&(statusDisplay.textContent="AI is thinking...",setTimeout(aiMove,500))))}function makeMove(e,l){boardState[e]=l,cells[e].textContent=l,cells[e].classList.add(l.toLowerCase())}function switchPlayer(){currentPlayer="X"===currentPlayer?"O":"X",statusDisplay.textContent=`${currentPlayer}'s Turn`}function checkGameStatus(){const e=checkWin();return e?(endGame(!1,e),!0):!!boardState.every(e=>e)&&(endGame(!0),!0)}function checkWin(){for(let e=0;e<winningCombinations.length;e++){const[l,t,a]=winningCombinations[e];if(boardState[l]&&boardState[l]===boardState[t]&&boardState[l]===boardState[a])return{winner:boardState[l],combination:winningCombinations[e],index:e}}return null}function endGame(e,l=null){gameActive=!1,e?(winMessage.textContent="It's a Draw!",playSound(drawSound)):(winMessage.textContent=`${l.winner} Wins!`,playSound(winSound),drawWinningLine(l.index),startParticles()),setTimeout(()=>winPopup.classList.remove("hidden"),500)}function aiMove(){if(gameActive){let e;"easy"===aiDifficulty?e=(l=boardState.map((e,l)=>null===e?l:null).filter(e=>null!==e))[Math.floor(Math.random()*l.length)]:"medium"===aiDifficulty?e=findBestMove("medium"):"hard"===aiDifficulty&&(e=findBestMove("hard"));makeMove(e,"O"),playSound(clickSound),checkGameStatus()||switchPlayer()}}function findBestMove(e){for(let e=0;e<boardState.length;e++)if(null===boardState[e]){if(boardState[e]="O","O"===checkWin()?.winner)return boardState[e]=null,e;boardState[e]=null}for(let e=0;e<boardState.length;e++)if(null===boardState[e]){if(boardState[e]="X","X"===checkWin()?.winner)return boardState[e]=null,e;boardState[e]=null}if("hard"===e)return minimax(boardState,"O").index;const l=boardState.map((e,l)=>null===e?l:null).filter(e=>null!==e);return l.includes(4)?4:l[Math.floor(Math.random()*l.length)]}function minimax(e,l){const t=e.map((e,l)=>null===e?l:null).filter(e=>null!==e),a=checkWinForBoard(e);if("X"===a?.winner)return{score:-10};if("O"===a?.winner)return{score:10};if(0===t.length)return{score:0};const n=[];for(let a=0;a<t.length;a++){const r={index:t[a]};e[t[a]]=l;const o=minimax(e,"O"===l?"X":"O");r.score=o.score,e[t[a]]=null,n.push(r)}let r;if("O"===l){let e=-1e4;for(let l=0;l<n.length;l++)n[l].score>e&&(e=n[l].score,r=l)}else{let e=1e4;for(let l=0;l<n.length;l++)n[l].score<e&&(e=n[l].score,r=l)}return n[r]}function checkWinForBoard(e){for(const[l,t,a]of winningCombinations)if(e[l]&&e[l]===e[t]&&e[l]===e[a])return{winner:e[l]};return null}function resizeCanvas(){const e=board.getBoundingClientRect();lineCanvas.width=e.width,lineCanvas.height=e.height,particleCanvas.width=window.innerWidth,particleCanvas.height=window.innerHeight}function drawWinningLine(e){const l=lineCanvas.width,t=lineCanvas.height,a=l/3,n=a/2;switch(lineCtx.clearRect(0,0,l,t),lineCtx.strokeStyle="#e94560",lineCtx.lineWidth=10,lineCtx.lineCap="round",lineCtx.shadowColor="#e94560",lineCtx.shadowBlur=15,lineCtx.beginPath(),e){case 0:lineCtx.moveTo(n,n),lineCtx.lineTo(l-n,n);break;case 1:lineCtx.moveTo(n,a+n),lineCtx.lineTo(l-n,a+n);break;case 2:lineCtx.moveTo(n,2*a+n),lineCtx.lineTo(l-n,2*a+n);break;case 3:lineCtx.moveTo(n,n),lineCtx.lineTo(n,t-n);break;case 4:lineCtx.moveTo(a+n,n),lineCtx.lineTo(a+n,t-n);break;case 5:lineCtx.moveTo(2*a+n,n),lineCtx.lineTo(2*a+n,t-n);break;case 6:lineCtx.moveTo(n,n),lineCtx.lineTo(l-n,t-n);break;case 7:lineCtx.moveTo(l-n,n),lineCtx.lineTo(n,t-n)}lineCtx.stroke()}let particles=[];function startParticles(){particles=[];for(let e=0;e<100;e++)particles.push(createParticle());animateParticles()}function createParticle(){const e=particleCanvas.width/2,l=particleCanvas.height/2,t=2*Math.random()*Math.PI,a=5*Math.random()+2;return{x:e,y:l,vx:Math.cos(t)*a,vy:Math.sin(t)*a,r:4*Math.random()+1,c:`hsl(${60*Math.random()+20},100%,70%)`,l:100}}function animateParticles(){particleCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height),particles.forEach((e,l)=>{e.x+=e.vx,e.y+=e.vy,e.l--,e.l<=0&&particles.splice(l,1),particleCtx.beginPath(),particleCtx.arc(e.x,e.y,e.r,0,2*Math.PI),particleCtx.fillStyle=e.c,particleCtx.globalAlpha=e.l/100,particleCtx.fill(),particleCtx.closePath()}),particles.length>0?particleAnimationId=requestAnimationFrame(animateParticles):particleCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height)}cells.forEach(e=>{e.addEventListener("click",handleCellClick)}),window.addEventListener("resize",resizeCanvas),loadSettings(),showScreen(mainMenu);
});
