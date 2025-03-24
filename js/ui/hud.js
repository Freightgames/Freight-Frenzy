// In-Game HUD Module
import { GAME_SETTINGS } from '../config/constants.js';

// References
let gameState = null;
let healthElement = null;
let fuelElement = null;
let moneyElement = null;
let distanceElement = null;
let speedElement = null;
let activePowerupsContainer = null;

/**
 * Initialize the HUD
 * @param {Object} state - The game state object
 */
export function initHUD(state) {
  gameState = state;
  
  // Get references to UI elements
  healthElement = document.getElementById('health-value');
  fuelElement = document.getElementById('fuel-value');
  moneyElement = document.getElementById('money-value');
  distanceElement = document.getElementById('distance-value');
  speedElement = document.getElementById('speed-value');
  
  // Create active powerups container if it doesn't exist
  if (!document.getElementById('active-powerups')) {
    createActivePowerupsContainer();
  }
  
  // Show the HUD
  const ui = document.getElementById('ui');
  if (ui) {
    ui.style.display = 'flex';
  }
  
  console.log("HUD initialized");
}

/**
 * Create the active powerups container
 */
function createActivePowerupsContainer() {
  activePowerupsContainer = document.createElement('div');
  activePowerupsContainer.id = 'active-powerups';
  activePowerupsContainer.style.position = 'absolute';
  activePowerupsContainer.style.top = '20px';
  activePowerupsContainer.style.right = '20px';
  activePowerupsContainer.style.display = 'flex';
  activePowerupsContainer.style.flexDirection = 'column';
  activePowerupsContainer.style.gap = '10px';
  
  document.body.appendChild(activePowerupsContainer);
}

/**
 * Update the HUD with current game state
 */
export function updateHUD() {
  if (!gameState) return;
  
  // Update health
  if (healthElement) {
    healthElement.textContent = Math.round(gameState.health);
    
    // Change color based on health
    if (gameState.health < 30) {
      healthElement.style.color = '#FF0000';
    } else if (gameState.health < 60) {
      healthElement.style.color = '#FFAA00';
    } else {
      healthElement.style.color = '#FFFFFF';
    }
  }
  
  // Update fuel
  if (fuelElement) {
    fuelElement.textContent = Math.round(gameState.fuel);
    
    // Change color based on fuel
    if (gameState.fuel < 20) {
      fuelElement.style.color = '#FF0000';
    } else if (gameState.fuel < 40) {
      fuelElement.style.color = '#FFAA00';
    } else {
      fuelElement.style.color = '#FFFFFF';
    }
  }
  
  // Update money (formatted with commas)
  if (moneyElement) {
    moneyElement.textContent = Math.round(gameState.money).toLocaleString();
  }
  
  // Update distance (formatted with commas)
  if (distanceElement) {
    distanceElement.textContent = Math.round(gameState.distance).toLocaleString();
  }
  
  // Update speed
  if (speedElement) {
    speedElement.textContent = Math.round(gameState.speed);
  }
  
  // Update active powerups
  updateActivePowerupsUI();
}

/**
 * Update the active powerups UI
 */
function updateActivePowerupsUI() {
  if (!activePowerupsContainer || !gameState) return;
  
  // Clear existing powerups
  activePowerupsContainer.innerHTML = '';
  
  // Add active powerups with timers
  if (gameState.activePowerupTimers && gameState.activePowerupTimers.length > 0) {
    gameState.activePowerupTimers.forEach(powerup => {
      const powerupElement = document.createElement('div');
      powerupElement.className = 'powerup-indicator';
      powerupElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      powerupElement.style.padding = '8px 15px';
      powerupElement.style.borderRadius = '5px';
      powerupElement.style.color = 'white';
      powerupElement.style.display = 'flex';
      powerupElement.style.justifyContent = 'space-between';
      powerupElement.style.alignItems = 'center';
      
      // Set border color based on powerup type
      switch (powerup.type) {
        case 'zaps':
          powerupElement.style.borderLeft = '4px solid #00aa00';
          break;
        case 'energy':
          powerupElement.style.borderLeft = '4px solid #00ff00';
          break;
        default:
          powerupElement.style.borderLeft = '4px solid #ffffff';
      }
      
      // Create name element
      const nameElement = document.createElement('span');
      nameElement.textContent = getPowerupDisplayName(powerup.type);
      powerupElement.appendChild(nameElement);
      
      // Create timer element
      const timerElement = document.createElement('span');
      const secondsLeft = Math.ceil(powerup.timeLeft / 1000);
      timerElement.textContent = `${secondsLeft}s`;
      powerupElement.appendChild(timerElement);
      
      activePowerupsContainer.appendChild(powerupElement);
    });
  }
}

/**
 * Get a display name for a powerup type
 * @param {string} type - The powerup type
 * @returns {string} Display name
 */
function getPowerupDisplayName(type) {
  switch (type) {
    case 'zaps':
      return 'Zaps';
    case 'energy':
      return 'Energy Boost';
    case 'wrench':
      return 'Repair';
    case 'fuelCan':
      return 'Fuel';
    default:
      return type;
  }
}

/**
 * Show an in-game message
 * @param {string} message - The message to display
 * @param {string} type - Message type ('info', 'warning', 'error')
 * @param {number} duration - How long to show the message in ms
 */
export function showGameMessage(message, type = 'info', duration = 3000) {
  // Create message container if it doesn't exist
  let alertContainer = document.getElementById('alert-container');
  
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'absolute';
    alertContainer.style.top = '80px';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translateX(-50%)';
    alertContainer.style.display = 'flex';
    alertContainer.style.flexDirection = 'column';
    alertContainer.style.gap = '10px';
    alertContainer.style.width = '40%';
    alertContainer.style.maxWidth = '500px';
    alertContainer.style.zIndex = '1000';
    document.body.appendChild(alertContainer);
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = 'game-message';
  messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  messageElement.style.color = 'white';
  messageElement.style.padding = '12px 20px';
  messageElement.style.borderRadius = '5px';
  messageElement.style.marginBottom = '10px';
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(-20px)';
  messageElement.style.transition = 'all 0.3s ease';
  
  // Set border color based on message type
  switch (type) {
    case 'warning':
      messageElement.style.borderLeft = '4px solid #FFAA00';
      break;
    case 'error':
      messageElement.style.borderLeft = '4px solid #FF0000';
      break;
    case 'success':
      messageElement.style.borderLeft = '4px solid #00AA00';
      break;
    default:
      messageElement.style.borderLeft = '4px solid #4CAF50';
  }
  
  // Set message text
  messageElement.textContent = message;
  
  // Add to container
  alertContainer.appendChild(messageElement);
  
  // Animate in
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after duration
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(-20px)';
    
    // Remove from DOM after animation completes
    setTimeout(() => {
      if (alertContainer.contains(messageElement)) {
        alertContainer.removeChild(messageElement);
      }
    }, 300);
  }, duration);
}

/**
 * Show the HUD
 */
export function showHUD() {
  const ui = document.getElementById('ui');
  if (ui) {
    ui.style.display = 'flex';
  }
}

/**
 * Hide the HUD
 */
export function hideHUD() {
  const ui = document.getElementById('ui');
  if (ui) {
    ui.style.display = 'none';
  }
  
  if (activePowerupsContainer) {
    activePowerupsContainer.innerHTML = '';
  }
} 