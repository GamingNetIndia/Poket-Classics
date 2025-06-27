document.addEventListener('DOMContentLoaded', () => {
    // --- CACHED DOM ELEMENTS ---
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const playPlayerBtn = document.getElementById('play-player');
    const playAiBtn = document.getElementById('play-ai');
    const aiDifficultySelector = document.getElementById('ai-difficulty-selector');
    const startAiGameBtn = document.getElementById('start-ai-game');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const homeBtn = document.getElementById('home-button');
    const promotionDialog = document.getElementById('promotion-dialog');
    
    // NEW SETTINGS ELEMENTS
    const settingsBtn = document.getElementById('settings-button');
    const settingsDialog = document.getElementById('settings-dialog');
    const closeSettingsBtn = document.getElementById('close-settings-button');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');

    // --- AUDIO & GAME STATE ---
    const sounds = { /* ... (same as before) ... */ };
    let board = [], currentPlayer = 'w', selectedPiece = null, validMoves = [], gameMode = null, aiLevel = 'easy', isGameOver = false, lastMove = { from: null, to: null }, castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } }, enPassantTarget = null;
    const pieces = { /* ... (same as before) ... */ };

    // NEW SOUND STATE
    let isMusicEnabled = true;
    let isSfxEnabled = true;
    let gameOverSoundPlayed = false;

    // --- INITIALIZATION & MENU ---
    function showMainMenu() { /* ... */ }
    function initializeGame(mode) { /* ... */ }
    showMainMenu();

    // --- SOUND SYSTEM (UPDATED) ---
    function playSound(soundKey) {
        // Now checks if SFX are enabled
        if (!isSfxEnabled) return; 
        const sound = sounds[soundKey];
        if (sound) { sound.currentTime = 0; sound.play().catch(e => {}); }
    }
    function playMusic(musicKey) {
        // Now checks if Music is enabled
        if (!isMusicEnabled) return; 
        const music = sounds[musicKey];
        if (music) { music.currentTime = 0; music.play().catch(e => {}); }
    }
    function stopAllMusic() {
        sounds.menuMusic.pause();
        sounds.gameMusic.pause();
    }

    // --- EVENT HANDLERS ---
    playPlayerBtn.addEventListener('click', () => { playSound('uiClick'); initializeGame('pvp'); });
    playAiBtn.addEventListener('click', () => { playSound('uiClick'); aiDifficultySelector.classList.toggle('hidden'); });
    startAiGameBtn.addEventListener('click', () => { playSound('uiClick'); initializeGame('pvai'); });
    backToMenuBtn.addEventListener('click', () => { playSound('uiClick'); showMainMenu(); });
    homeBtn.addEventListener('click', () => { playSound('uiClick'); window.location.href = '../../home/home.html'; });

    // NEW SETTINGS EVENT LISTENERS
    settingsBtn.addEventListener('click', () => {
        playSound('uiClick');
        settingsDialog.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        playSound('uiClick');
        settingsDialog.classList.add('hidden');
    });

    // Close settings if user clicks on the dark background
    settingsDialog.addEventListener('click', (event) => {
        if (event.target === settingsDialog) {
            playSound('uiClick');
            settingsDialog.classList.add('hidden');
        }
    });

    musicToggle.addEventListener('change', () => {
        isMusicEnabled = musicToggle.checked;
        if (isSfxEnabled) playSound('uiClick'); // Play sound only if SFX are on
        
        if (isMusicEnabled) {
            // If we are in the menu, play menu music. Otherwise, play game music.
            if (!mainMenu.classList.contains('hidden')) {
                playMusic('menuMusic');
            } else {
                playMusic('gameMusic');
            }
        } else {
            stopAllMusic();
        }
    });

    sfxToggle.addEventListener('change', () => {
        isSfxEnabled = sfxToggle.checked;
        if (isSfxEnabled) playSound('uiClick'); // Play the click sound itself to confirm it's on
    });
    
    // --- The rest of your script.js (renderBoard, makeMove, AI logic, etc.) remains exactly the same ---
    // ... PASTE THE REST OF YOUR WORKING SCRIPT.JS LOGIC HERE ...
    // (Starting from `function renderBoard() { ...`)
});