// Truckstop UI Module
import { GAME_SETTINGS, PRICES } from '../config/constants.js';

// UI elements
let truckstopContainer;
let repairsButton;
let refuelButton;
let restButton;
let exitButton;
let truckstopTitle;
let playerMoneyDisplay;

// State
let isVisible = false;
let gameState = null;
let onInteractionComplete = null;

/**
 * Initialize the truckstop UI
 * @param {Object} state - Game state reference
 * @param {Function} onComplete - Callback for when interaction is complete
 * @returns {Object} - Truckstop UI instance
 */
export function initTruckstopUI(state, onComplete) {
  gameState = state;
  onInteractionComplete = onComplete;
  
  // Create UI if it doesn't exist
  if (!truckstopContainer) {
    createTruckstopUI();
  }
  
  // Initially hide the UI
  hideUI();
  
  console.log("Truckstop UI initialized");
  
  return {
    show: () => showUI(),
    hide: () => hideUI(),
    isVisible: () => isVisible
  };
}

/**
 * Create the truckstop UI elements
 */
function createTruckstopUI() {
  // Create container
  truckstopContainer = document.createElement('div');
  truckstopContainer.id = 'truckstop-container';
  truckstopContainer.className = 'game-modal';
  truckstopContainer.style.display = 'none';
  
  // Create title
  truckstopTitle = document.createElement('h2');
  truckstopTitle.textContent = 'BIG RIG REST STOP';
  truckstopTitle.className = 'modal-title';
  
  // Player money display
  playerMoneyDisplay = document.createElement('div');
  playerMoneyDisplay.className = 'player-money';
  playerMoneyDisplay.innerHTML = `<span>Your Money:</span> <span class="money-amount">$0</span>`;
  
  // Create service options
  const servicesContainer = document.createElement('div');
  servicesContainer.className = 'services-container';
  
  // Repair truck option
  repairsButton = createServiceButton(
    'Repair Truck',
    `$${PRICES.REPAIR_COST.toFixed(2)} - Restore truck health`,
    'repair',
    handleRepair
  );
  
  // Refuel truck option
  refuelButton = createServiceButton(
    'Refuel Truck',
    `$${PRICES.FUEL_COST_PER_GALLON.toFixed(2)}/gal - Fill up your tank`,
    'refuel',
    handleRefuel
  );
  
  // Rest option
  restButton = createServiceButton(
    'Take a Rest',
    'Free - Regain energy and save progress',
    'rest',
    handleRest
  );
  
  // Add buttons to services container
  servicesContainer.appendChild(repairsButton);
  servicesContainer.appendChild(refuelButton);
  servicesContainer.appendChild(restButton);
  
  // Create exit button
  exitButton = document.createElement('button');
  exitButton.className = 'exit-button';
  exitButton.textContent = 'Back to Road';
  exitButton.addEventListener('click', handleExit);
  
  // Add elements to container
  truckstopContainer.appendChild(truckstopTitle);
  truckstopContainer.appendChild(playerMoneyDisplay);
  truckstopContainer.appendChild(servicesContainer);
  truckstopContainer.appendChild(exitButton);
  
  // Add to document
  document.body.appendChild(truckstopContainer);
}

/**
 * Create a service button with icon and description
 * @param {string} title - Button title
 * @param {string} description - Service description
 * @param {string} iconType - Type of icon to display
 * @param {Function} handler - Click handler
 * @returns {HTMLElement} - The created button
 */
function createServiceButton(title, description, iconType, handler) {
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'service-option';
  
  const button = document.createElement('button');
  button.className = `service-button ${iconType}-button`;
  button.addEventListener('click', handler);
  
  // Create icon
  const icon = document.createElement('div');
  icon.className = `service-icon ${iconType}-icon`;
  
  // Create text container
  const textContainer = document.createElement('div');
  textContainer.className = 'service-text';
  
  // Create title
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  
  // Create description
  const descElement = document.createElement('p');
  descElement.textContent = description;
  
  // Assemble elements
  textContainer.appendChild(titleElement);
  textContainer.appendChild(descElement);
  button.appendChild(icon);
  button.appendChild(textContainer);
  buttonContainer.appendChild(button);
  
  return buttonContainer;
}

/**
 * Show the truckstop UI
 */
function showUI() {
  // Update money display
  updateMoneyDisplay();
  
  // Show the container
  truckstopContainer.style.display = 'flex';
  isVisible = true;
  
  // Add CSS class for animation
  setTimeout(() => {
    truckstopContainer.classList.add('visible');
  }, 10);
  
  // Pause game
  if (gameState) {
    gameState.isPaused = true;
  }
}

/**
 * Hide the truckstop UI
 */
function hideUI() {
  // Remove CSS class for animation
  truckstopContainer.classList.remove('visible');
  
  // Hide after animation
  setTimeout(() => {
    truckstopContainer.style.display = 'none';
    isVisible = false;
  }, 300);
  
  // Unpause game
  if (gameState) {
    gameState.isPaused = false;
  }
}

/**
 * Update the money display
 */
function updateMoneyDisplay() {
  if (!gameState || !playerMoneyDisplay) return;
  
  const moneyAmount = playerMoneyDisplay.querySelector('.money-amount');
  if (moneyAmount) {
    moneyAmount.textContent = `$${gameState.money.toFixed(2)}`;
  }
}

/**
 * Handle truck repair
 */
function handleRepair() {
  if (!gameState) return;
  
  const repairCost = PRICES.REPAIR_COST;
  
  // Check if repair is needed
  if (gameState.health >= GAME_SETTINGS.MAX_HEALTH) {
    showServiceMessage('Your truck is already in perfect condition!', 'info');
    return;
  }
  
  // Check if player has enough money
  if (gameState.money < repairCost) {
    showServiceMessage('Not enough money for repairs!', 'error');
    return;
  }
  
  // Calculate how much health will be restored
  const previousHealth = gameState.health;
  gameState.health = GAME_SETTINGS.MAX_HEALTH;
  const healthRestored = gameState.health - previousHealth;
  
  // Deduct money
  gameState.money -= repairCost;
  
  // Update money display
  updateMoneyDisplay();
  
  // Show success message
  showServiceMessage(`Truck repaired! Health restored to 100%`, 'success');
  
  // Play repair sound
  if (gameState.audio && gameState.audio.playSound) {
    gameState.audio.playSound('repair');
  }
}

/**
 * Handle truck refueling
 */
function handleRefuel() {
  if (!gameState) return;
  
  const fuelCostPerGallon = PRICES.FUEL_COST_PER_GALLON;
  const maxFuel = GAME_SETTINGS.MAX_FUEL;
  
  // Check if tank is already full
  if (gameState.fuel >= maxFuel) {
    showServiceMessage('Your fuel tank is already full!', 'info');
    return;
  }
  
  // Calculate how much fuel is needed
  const fuelNeeded = maxFuel - gameState.fuel;
  const totalCost = fuelNeeded * fuelCostPerGallon;
  
  // Check if player has enough money
  if (gameState.money < totalCost) {
    // Calculate how much fuel they can afford
    const affordableFuel = Math.floor(gameState.money / fuelCostPerGallon);
    
    if (affordableFuel <= 0) {
      showServiceMessage('Not enough money to buy any fuel!', 'error');
      return;
    }
    
    // Partial refueling
    const partialCost = affordableFuel * fuelCostPerGallon;
    gameState.fuel += affordableFuel;
    gameState.money -= partialCost;
    
    // Update money display
    updateMoneyDisplay();
    
    // Show partial success message
    showServiceMessage(`Partially refueled with ${affordableFuel.toFixed(1)} gallons`, 'warning');
  } else {
    // Full refueling
    gameState.fuel = maxFuel;
    gameState.money -= totalCost;
    
    // Update money display
    updateMoneyDisplay();
    
    // Show success message
    showServiceMessage(`Tank filled! Added ${fuelNeeded.toFixed(1)} gallons for $${totalCost.toFixed(2)}`, 'success');
  }
  
  // Play refuel sound
  if (gameState.audio && gameState.audio.playSound) {
    gameState.audio.playSound('refuel');
  }
}

/**
 * Handle player rest
 */
function handleRest() {
  if (!gameState) return;
  
  // Save the game state (simulation)
  const savedSuccessfully = true; // This would normally involve actual saving logic
  
  if (savedSuccessfully) {
    // Show success message
    showServiceMessage('Your progress has been saved. You feel rested and ready to drive!', 'success');
    
    // Simulate any benefits from resting (if needed)
    // e.g., gameState.driverFatigue = 0;
    
    // Play rest sound
    if (gameState.audio && gameState.audio.playSound) {
      gameState.audio.playSound('rest');
    }
  } else {
    // Show error message
    showServiceMessage('Unable to save your progress. Please try again.', 'error');
  }
}

/**
 * Handle exit from truckstop
 */
function handleExit() {
  hideUI();
  
  // Call the completion callback
  if (onInteractionComplete && typeof onInteractionComplete === 'function') {
    onInteractionComplete();
  }
}

/**
 * Show a service message
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, warning, info)
 */
function showServiceMessage(message, type = 'info') {
  // Create message container if it doesn't exist
  let messageContainer = document.getElementById('service-message');
  
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'service-message';
    truckstopContainer.appendChild(messageContainer);
  }
  
  // Set message content and type
  messageContainer.textContent = message;
  messageContainer.className = `service-message ${type}`;
  
  // Show message
  messageContainer.style.display = 'block';
  messageContainer.classList.add('visible');
  
  // Hide after delay
  setTimeout(() => {
    messageContainer.classList.remove('visible');
    setTimeout(() => {
      messageContainer.style.display = 'none';
    }, 300);
  }, 3000);
} 