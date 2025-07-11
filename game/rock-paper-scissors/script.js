// --- DOM Elements ---
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const settingsScreen = document.getElementById('settings-screen');
const playBtn = document.getElementById('play-btn');
const settingsBtn = document.getElementById('settings-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const backFromSettingsBtn = document.getElementById('back-from-settings-btn');
const choiceBtns = document.querySelectorAll('.choice-btn');
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const resultMessageEl = document.getElementById('result-message');
const playerChoiceDisplay = document.getElementById('player-choice-display');
const computerChoiceDisplay = document.getElementById('computer-choice-display');
const sfxToggle = document.getElementById('sfx-toggle');
const musicToggle = document.getElementById('music-toggle');
const homeBtn = document.getElementById('home-btn');

// --- Audio Elements ---
const bgMusic = new Audio('sounds/bg-music.mp3');
bgMusic.loop = true;
bgMusic.volume = 1;
const clickSound = new Audio('sounds/click.wav');
const winSound = new Audio('sounds/win.wav');
const loseSound = new Audio('sounds/lose.wav');
const tieSound = new Audio('sounds/tie.wav');

// --- Game & Settings State ---
let playerScore = 0, computerScore = 0;
const choices = ['rock', 'paper', 'scissors'];
const choiceEmojis = { rock: '✊', paper: '✋', scissors: '✌️' };
let sfxOn = true, musicOn = true, musicHasStarted = false;

// --- Sound Functions ---
function playSfx(sound) {
    if (sfxOn) {
        sound.currentTime = 0;
        sound.play();
    }
}
function toggleMusic() {
    if (musicOn && !musicHasStarted) {
        bgMusic.play().then(() => {
            musicHasStarted = true;
        }).catch(error => {
            console.error("Music failed to play:", error);
            musicOn = false;
            musicToggle.checked = false;
        });
    } else if (musicOn && musicHasStarted) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
}

// --- Screen Navigation ---
function showScreen(screen) {
    [mainMenu, gameScreen, settingsScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}
playBtn.addEventListener('click', () => {
    playSfx(clickSound);
    showScreen(gameScreen);
    resetGame();
    if (musicOn && !musicHasStarted) {
        toggleMusic();
    }
});
settingsBtn.addEventListener('click', () => {
    playSfx(clickSound);
    showScreen(settingsScreen);
});
backToMenuBtn.addEventListener('click', () => {
    playSfx(clickSound);
    showScreen(mainMenu);
});
backFromSettingsBtn.addEventListener('click', () => {
    playSfx(clickSound);
    showScreen(mainMenu);
});
homeBtn.addEventListener('click', () => {
    playSfx(clickSound);
    // This path is relative. It goes up two directories from the current one.
    // Adjust if your file structure is different.
    window.location.href = '/../home/index.html';
});

// --- Settings Toggles ---
sfxToggle.addEventListener('change', (e) => { sfxOn = e.target.checked; });
musicToggle.addEventListener('change', (e) => { musicOn = e.target.checked; toggleMusic(); });

// --- Game Logic ---
choiceBtns.forEach(button => {
    button.addEventListener('click', () => {
        const playerChoice = button.dataset.choice;
        const computerChoice = getComputerChoice();
        playRound(playerChoice, computerChoice);
    });
});
function getComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}
function playRound(playerChoice, computerChoice) {
    let result = '', resultColor = '', roundSound;
    if (playerChoice === computerChoice) {
        result = "It's a Tie!";
        resultColor = 'var(--tie-color)';
        roundSound = tieSound;
    } else if ((playerChoice === 'rock' && computerChoice === 'scissors') || (playerChoice === 'paper' && computerChoice === 'rock') || (playerChoice === 'scissors' && computerChoice === 'paper')) {
        playerScore++;
        result = 'You Win!';
        resultColor = 'var(--secondary-color)';
        roundSound = winSound;
    } else {
        computerScore++;
        result = 'You Lose!';
        resultColor = 'var(--danger-color)';
        roundSound = loseSound;
    }
    playSfx(roundSound);
    updateUI(result, resultColor, playerChoice, computerChoice);
}

// --- UI Updates ---
function updateUI(result, color, playerChoice, computerChoice) {
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    resultMessageEl.textContent = result;
    resultMessageEl.style.color = color;
    playerChoiceDisplay.textContent = choiceEmojis[playerChoice];
    computerChoiceDisplay.textContent = choiceEmojis[computerChoice];
    playerChoiceDisplay.classList.add('active');
    computerChoiceDisplay.classList.add('active');
}
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = 0;
    computerScoreEl.textContent = 0;
    resultMessageEl.textContent = 'Choose your weapon!';
    resultMessageEl.style.color = 'var(--light-color)';
    playerChoiceDisplay.textContent = '?';
    computerChoiceDisplay.textContent = '?';
    playerChoiceDisplay.classList.remove('active');
    computerChoiceDisplay.classList.remove('active');
}