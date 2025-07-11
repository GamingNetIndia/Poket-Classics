<?php
// Set the content type to JSON so our JavaScript can understand the response
header('Content-Type: application/json');

// --- THE COMPLETE LIST OF CRITICAL FILES ---
$critical_files = [
    // --- Root Loader Assets (from the very first index.html) ---
    "developer-logo.png",
    "logo.png",
    
    // --- Home Menu Assets ---
    "home/index.html",
    "home/style.css",
    "home/script.js",
    "home/background.mp3",
    "home/click.mp3",
    "home/2048-icon.png",
    "home/airhockey-icon.png",
    "home/checkers-icon.png",
    "home/chess-icon.png",
    "home/minesweeper-icon.png",
    "home/othello-icon.png",
    "home/rps-icon.png",
    "home/snake-icon.png",
    "home/snakes-ladders-icon.png",
    "home/tictactoe-icon.png",

    // --- 2048 Game Assets ---
    "game/2048/index.html",
    "game/2048/style.css",
    "game/2048/script.js",
    "game/2048/sounds/music.mp3",
    "game/2048/sounds/move.wav",
    "game/2048/sounds/merge.wav",
    "game/2048/sounds/win.wav",
    "game/2048/sounds/lose.wav",
    "game/2048/sounds/click.wav",
    "game/2048/ss1.png",
    "game/2048/ss2.png",

    // --- Air Hockey Game Assets ---
    "game/air-hockey/index.html",
    "game/air-hockey/style.css",
    "game/air-hockey/script.js",
    "game/air-hockey/sounds/background.mp3",
    "game/air-hockey/sounds/hit.wav",
    "game/air-hockey/sounds/score.wav",
    "game/air-hockey/sounds/win.wav",
    "game/air-hockey/sounds/click.wav",
    "game/air-hockey/ss1.png",
    "game/air-hockey/ss2.png",

    // --- Checkers Game Assets ---
    "game/checkers/index.html",
    "game/checkers/style.css",
    "game/checkers/script.js",
    "game/checkers/sounds/move.wav",
    "game/checkers/sounds/capture.wav",
    "game/checkers/sounds/game-over.wav",
    "game/checkers/sounds/ui_click.wav",
    "game/checkers/sounds/game_start.wav",
    "game/checkers/sounds/select.wav",
    "game/checkers/sounds/invalid.wav",
    "game/checkers/sounds/menu-music.mp3",
    "game/checkers/sounds/game-music.mp3",
    "game/checkers/ss1.png",
    "game/checkers/ss2.png",

    // --- Chess Game Assets ---
    "game/chess/index.html",
    "game/chess/style.css",
    "game/chess/script.js",
    "game/chess/sounds/move.wav",
    "game/chess/sounds/capture.wav",
    "game/chess/sounds/check.wav",
    "game/chess/sounds/game-over.wav",
    "game/chess/sounds/ui_click.wav",
    "game/chess/sounds/game_start.wav",
    "game/chess/sounds/castling.wav",
    "game/chess/sounds/promotion.wav",
    "game/chess/sounds/select.wav",
    "game/chess/sounds/invalid.wav",
    "game/chess/sounds/menu-music.mp3",
    "game/chess/sounds/game-music.mp3",
    "game/chess/ss1.png",
    "game/chess/ss2.png",

    // --- Minesweeper Game Assets ---
    "game/minesweeper/index.html",
    "game/minesweeper/style.css",
    "game/minesweeper/script.js",
    "game/minesweeper/sounds/music-background.mp3",
    "game/minesweeper/sounds/sfx-click.wav",
    "game/minesweeper/sounds/sfx-flag.wav",
    "game/minesweeper/sounds/sfx-reveal.wav",
    "game/minesweeper/sounds/sfx-explode.wav",
    "game/minesweeper/sounds/sfx-win.mp3",
    "game/minesweeper/sounds/sfx-lose.mp3",
    "game/minesweeper/ss1.png",
    "game/minesweeper/ss2.png",

    // --- Othello Game Assets ---
    "game/othello/index.html",
    "game/othello/style.css",
    "game/othello/script.js",
    "game/othello/sounds/music.mp3",
    "game/othello/sounds/click.wav",
    "game/othello/sounds/game over.wav",
    "game/othello/sounds/pop.wav",
    "game/othello/ss1.png",
    "game/othello/ss2.png",

    // --- Rock Paper Scissors Game Assets ---
    "game/rock-paper-scissors/index.html",
    "game/rock-paper-scissors/style.css",
    "game/rock-paper-scissors/script.js",
    "game/rock-paper-scissors/sounds/bg-music.mp3",
    "game/rock-paper-scissors/sounds/click.wav",
    "game/rock-paper-scissors/sounds/win.wav",
    "game/rock-paper-scissors/sounds/lose.wav",
    "game/rock-paper-scissors/sounds/tie.wav",
    "game/rock-paper-scissors/ss1.png",
    "game/rock-paper-scissors/ss2.png",

    // --- Snake Game Assets ---
    "game/snake/index.html",
    "game/snake/style.css",
    "game/snake/script.js",
    "game/snake/sounds/bg-music.mp3",
    "game/snake/sounds/eat.wav",
    "game/snake/sounds/game-over.wav",
    "game/snake/sounds/click.wav",
    "game/snake/sounds/turn.wav",
    "game/snake/ss1.png",
    "game/snake/ss2.png",
    
    // --- Snakes & Ladders Game Assets ---
    "game/snakes-ladders/index.html",
    "game/snakes-ladders/style.css",
    "game/snakes-ladders/script.js",
    "game/snakes-ladders/assets/dice.mp3",
    "game/snakes-ladders/ss1.png",
    "game/snakes-ladders/ss2.png",

    // --- Tic-Tac-Toe Game Assets ---
    "game/tictactoe/index.html",
    "game/tictactoe/style.css",
    "game/tictactoe/script.js",
    "game/tictactoe/audio/background.mp3",
    "game/tictactoe/audio/click.wav",
    "game/tictactoe/audio/win.wav",
    "game/tictactoe/audio/draw.wav",
    "game/tictactoe/ss1.png",
    "game/tictactoe/ss2.png"
];

$missing_files = [];

// Get the directory where this PHP script is located.
$baseDir = __DIR__;

// Loop through each file and check if it exists
foreach ($critical_files as $file) {
    // Construct the full, absolute path for the file check
    $fullPath = $baseDir . '/' . $file;

    if (!file_exists($fullPath)) {
        $missing_files[] = $file; // We report the relative path for easy debugging
    }
}

// Prepare the result to send back to the JavaScript
$response = [
    'success' => empty($missing_files),
    'total_files' => count($critical_files),
    'checked_files' => count($critical_files), // Since we check all, this is always the total
    'missing_files' => $missing_files
];

// Send the JSON response
echo json_encode($response);
?>