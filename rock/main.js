// DOM elements
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const resultText = document.getElementById('result-text');
const choiceBtns = document.querySelectorAll('.choice');
const resetBtn = document.getElementById('reset');

// Scores
let playerScore = 0;
let computerScore = 0;

// Computer random choice
function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    const randomIndex = Math.floor(Math.random() * 3);
    return choices[randomIndex];
}

// Determine winner
function determineWinner(player, computer) {
    if (player === computer) return 'draw';
    
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')
    ) {
        return 'player';
    } else {
        return 'computer';
    }
}

// Update UI with result
function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);
    
    let message = '';
    if (winner === 'draw') {
        message = `😲 Draw! Both chose ${playerChoice}`;
    } else if (winner === 'player') {
        message = `✅ You win! ${playerChoice} beats ${computerChoice}`;
        playerScore++;
        playerScoreEl.textContent = playerScore;
    } else {
        message = `❌ You lose! ${computerChoice} beats ${playerChoice}`;
        computerScore++;
        computerScoreEl.textContent = computerScore;
    }
    
    resultText.textContent = message;
}

// Event listeners for choice buttons
choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const playerChoice = btn.dataset.choice;
        playRound(playerChoice);
    });
});

// Reset game
function resetGame() {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    resultText.textContent = 'Game reset! Make your move.';
}

resetBtn.addEventListener('click', resetGame);
