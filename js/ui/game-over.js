// Game Over UI Module
import { submitScore } from '../config/firebase-config.js';

// References
let gameState = null;
let restartHandler = null;

/**
 * Initialize the game over screen
 * @param {Object} state - Game state
 * @param {Function} onRestart - Function to call when restarting the game
 */
export function initGameOverScreen(state, onRestart) {
  gameState = state;
  restartHandler = onRestart;
  
  // Set up restart button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', handleRestart);
  }
  
  // Set up share button
  const shareBtn = document.querySelector('button[onclick="shareScore()"]');
  if (shareBtn) {
    // Replace the inline handler with our function
    shareBtn.removeAttribute('onclick');
    shareBtn.addEventListener('click', shareScore);
  }
  
  console.log("Game over screen initialized");
}

/**
 * Show the game over screen with final stats
 * @param {number} distance - Distance traveled
 * @param {number} money - Money earned
 * @param {string} playerName - Player's name
 * @param {string} difficulty - Game difficulty
 */
export function showGameOver(distance, money, playerName, difficulty) {
  // Update final score display
  const finalScoreEl = document.getElementById('final-score');
  if (finalScoreEl) {
    finalScoreEl.textContent = `Distance: ${Math.round(distance).toLocaleString()}m | Money: $${Math.round(money).toLocaleString()}`;
  }
  
  // Calculate and update rate per mile
  const rpmScoreEl = document.getElementById('rpm-score');
  if (rpmScoreEl) {
    const rpm = money > 0 && distance > 0 ? (money / (distance / 1000)) : 0;
    rpmScoreEl.textContent = `Rate per Mile: $${rpm.toFixed(2)}`;
  }
  
  // Store values for sharing
  window.gameScore = {
    distance: Math.round(distance),
    money: Math.round(money),
    rpm: money > 0 && distance > 0 ? (money / (distance / 1000)) : 0,
    playerName: playerName || 'Anonymous Trucker',
    difficulty: difficulty || 'medium'
  };
  
  // Submit score to leaderboard
  submitScoreToLeaderboard(window.gameScore);
  
  // Show the game over screen
  document.getElementById('game-over').style.display = 'block';
  document.getElementById('ui').style.display = 'none';
  
  // Hide any other UI elements
  const activePopups = document.getElementById('active-powerups');
  if (activePopups) {
    activePopups.innerHTML = '';
  }
  
  // Create crashed truck imagery if applicable
  createCrashedTruck(distance, playerName);
}

/**
 * Submit score to leaderboard
 * @param {Object} score - Score data
 */
async function submitScoreToLeaderboard(score) {
  try {
    await submitScore(
      score.playerName,
      score.money,
      score.distance,
      score.difficulty
    );
    console.log("Score submitted to leaderboard");
  } catch (error) {
    console.error("Error submitting score:", error);
  }
}

/**
 * Handle restart button click
 */
function handleRestart() {
  // Hide game over screen
  document.getElementById('game-over').style.display = 'none';
  
  // Call restart handler
  if (restartHandler) {
    restartHandler();
  } else {
    console.error("Restart handler not set");
    // Fallback to reloading the page
    window.location.reload();
  }
}

/**
 * Share score on social media
 */
function shareScore() {
  if (!window.gameScore) return;
  
  const score = window.gameScore;
  const text = `I just drove ${score.distance.toLocaleString()}m in Freight Frenzy and earned $${score.money.toLocaleString()}! Rate per Mile: $${score.rpm.toFixed(2)} (${score.difficulty} difficulty)`;
  
  // Check if Web Share API is available
  if (navigator.share) {
    navigator.share({
      title: 'My Freight Frenzy Score',
      text: text,
      url: window.location.href
    })
    .then(() => console.log('Successful share'))
    .catch(error => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support Web Share API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '0';
    textArea.style.top = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Score copied to clipboard! Share it with your friends.');
      } else {
        alert('Failed to copy score to clipboard.');
      }
    } catch (err) {
      console.error('Error copying text: ', err);
      alert('Failed to copy score to clipboard.');
    }
    
    document.body.removeChild(textArea);
  }
}

/**
 * Create a visual of a crashed truck (if game ended due to crash)
 * @param {number} distance - Distance traveled
 * @param {string} playerName - Player's name
 */
function createCrashedTruck(distance, playerName) {
  // Only create crashed truck if health reached zero (not for fuel)
  if (gameState && gameState.health > 0) return;
  
  // Check if scene still exists
  if (!gameState || !gameState.scene) return;
  
  const crashContainer = document.createElement('div');
  crashContainer.id = 'crash-scene';
  crashContainer.style.position = 'absolute';
  crashContainer.style.bottom = '20px';
  crashContainer.style.right = '20px';
  crashContainer.style.width = '200px';
  crashContainer.style.height = '120px';
  crashContainer.style.border = '3px solid #FF0000';
  crashContainer.style.borderRadius = '10px';
  crashContainer.style.overflow = 'hidden';
  crashContainer.style.backgroundColor = '#000000';
  
  // Add crashed truck image/animation
  const truckElement = document.createElement('div');
  truckElement.style.width = '60px';
  truckElement.style.height = '40px';
  truckElement.style.position = 'absolute';
  truckElement.style.bottom = '10px';
  truckElement.style.left = '70px';
  truckElement.style.backgroundColor = '#FF0000';
  truckElement.style.transform = 'rotate(15deg)';
  
  // Add smoke effect
  const smokeElement = document.createElement('div');
  smokeElement.style.width = '0px';
  smokeElement.style.height = '0px';
  smokeElement.style.position = 'absolute';
  smokeElement.style.bottom = '40px';
  smokeElement.style.left = '80px';
  smokeElement.style.backgroundColor = 'rgba(100, 100, 100, 0.8)';
  smokeElement.style.borderRadius = '50%';
  
  // Add a "RIP" marker with player name
  const ripMarker = document.createElement('div');
  ripMarker.style.width = '40px';
  ripMarker.style.height = '50px';
  ripMarker.style.position = 'absolute';
  ripMarker.style.bottom = '20px';
  ripMarker.style.right = '20px';
  ripMarker.style.backgroundColor = '#555555';
  ripMarker.style.borderTopLeftRadius = '20px';
  ripMarker.style.borderTopRightRadius = '20px';
  ripMarker.style.display = 'flex';
  ripMarker.style.justifyContent = 'center';
  ripMarker.style.alignItems = 'center';
  ripMarker.style.flexDirection = 'column';
  ripMarker.style.color = 'white';
  ripMarker.style.fontSize = '10px';
  ripMarker.style.fontWeight = 'bold';
  
  // Add text to RIP marker
  const ripText = document.createElement('div');
  ripText.textContent = 'RIP';
  ripText.style.marginBottom = '2px';
  
  const nameText = document.createElement('div');
  nameText.textContent = playerName || 'Trucker';
  nameText.style.fontSize = '8px';
  nameText.style.maxWidth = '36px';
  nameText.style.overflow = 'hidden';
  nameText.style.textOverflow = 'ellipsis';
  nameText.style.whiteSpace = 'nowrap';
  nameText.style.textAlign = 'center';
  
  // Add distance milestone
  const distanceMarker = document.createElement('div');
  distanceMarker.textContent = `${Math.round(distance).toLocaleString()}m`;
  distanceMarker.style.fontSize = '7px';
  
  // Assemble RIP marker
  ripMarker.appendChild(ripText);
  ripMarker.appendChild(nameText);
  ripMarker.appendChild(distanceMarker);
  
  // Assemble crash scene
  crashContainer.appendChild(truckElement);
  crashContainer.appendChild(smokeElement);
  crashContainer.appendChild(ripMarker);
  
  // Add to DOM
  document.body.appendChild(crashContainer);
  
  // Animate smoke
  let smokeSize = 0;
  let opacity = 0.8;
  
  const animateSmoke = function() {
    smokeSize += 0.5;
    opacity -= 0.01;
    
    if (opacity <= 0) {
      smokeSize = 0;
      opacity = 0.8;
    }
    
    smokeElement.style.width = `${smokeSize}px`;
    smokeElement.style.height = `${smokeSize}px`;
    smokeElement.style.opacity = opacity;
    smokeElement.style.transform = `translate(-${smokeSize / 2}px, -${smokeSize / 2}px)`;
    
    if (document.getElementById('crash-scene')) {
      requestAnimationFrame(animateSmoke);
    }
  };
  
  animateSmoke();
}

// Expose functions needed by HTML
window.shareScore = shareScore; 