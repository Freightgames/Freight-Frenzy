import gameState from '../gameState.js';

// UI References
let healthElem, fuelElem, moneyElem, distanceElem, speedElem, 
    truckstopMoneyElem, finalScoreElem;

// Function to initialize UI elements
export function initializeUIElements() {
    console.log("Initializing UI elements");
    
    // Re-assign UI element references to global variables
    healthElem = document.getElementById('health-value');
    fuelElem = document.getElementById('fuel-value');
    moneyElem = document.getElementById('money-value');
    distanceElem = document.getElementById('distance-value');
    speedElem = document.getElementById('speed-value');
    truckstopMoneyElem = document.getElementById('truckstop-money');
    finalScoreElem = document.getElementById('final-score');
    
    // Check if all the required UI elements are present
    if (!healthElem) console.warn("Health value element not found");
    if (!fuelElem) console.warn("Fuel value element not found");
    if (!moneyElem) console.warn("Money value element not found");
    if (!distanceElem) console.warn("Distance value element not found");
    if (!speedElem) console.warn("Speed value element not found");
    
    console.log("UI elements initialized");
}

// Function to create UI elements if they don't exist
export function createGameUI() {
    // Re-initialize UI elements after creating them
    initializeUIElements();
    console.log("UI elements re-initialized after creating game UI");
}

// Update UI display
export function updateUI() {
    if (healthElem) healthElem.textContent = Math.floor(gameState.health);
    if (fuelElem) fuelElem.textContent = Math.floor(gameState.fuel);
    if (moneyElem) moneyElem.textContent = Math.floor(gameState.money);
    if (distanceElem) distanceElem.textContent = Math.floor(gameState.distanceTraveled);
    
    // Update speed display - convert to mph for a more realistic feel
    const speedMph = Math.floor(gameState.speed * 6); // Simple conversion for visual purposes
    if (speedElem) speedElem.textContent = speedMph;
    
    // Update active powerups UI
    updateActivePowerupsUI();
}

// Function to update the active powerups UI
export function updateActivePowerupsUI() {
    // Find or create the powerups container
    let powerupsContainer = document.getElementById('powerups-container');
    if (!powerupsContainer) {
        powerupsContainer = document.createElement('div');
        powerupsContainer.id = 'powerups-container';
        powerupsContainer.className = 'stat';
        powerupsContainer.style.position = 'fixed';
        powerupsContainer.style.display = 'flex';
        powerupsContainer.style.flexDirection = 'column';
        powerupsContainer.style.gap = '5px';
        powerupsContainer.style.background = 'rgba(0, 0, 0, 0.5)';
        powerupsContainer.style.padding = '10px';
        powerupsContainer.style.borderRadius = '10px';
        powerupsContainer.style.zIndex = '100';

        if(window.innerWidth <= 768) {
            powerupsContainer.style.top = window.innerHeight - 100;
            console.log(window.innerHeight-100);
        } else {
            powerupsContainer.style.top = '20px';
        }

        powerupsContainer.style.right = '20px';

        document.body.appendChild(powerupsContainer);
    }
    
    // Clear existing content
    powerupsContainer.innerHTML = '<div style="font-weight: bold; margin-bottom: 5px; text-align: center;">Active Powerups</div>';
    
    // Check if there are any active powerups
    if (gameState.activePowerups.length === 0) {
        const noPowerups = document.createElement('div');
        noPowerups.textContent = 'None';
        noPowerups.style.textAlign = 'center';
        noPowerups.style.color = '#888';
        noPowerups.style.fontSize = '14px';
        powerupsContainer.appendChild(noPowerups);
    } else {
        // Sort powerups by remaining time (ascending)
        gameState.activePowerups.sort((a, b) => a.remainingTime - b.remainingTime);
        
        // Add each active powerup to the container
        gameState.activePowerups.forEach(powerup => {
            const powerupElem = document.createElement('div');
            powerupElem.style.display = 'flex';
            powerupElem.style.justifyContent = 'space-between';
            powerupElem.style.alignItems = 'center';
            powerupElem.style.padding = '3px 8px';
            powerupElem.style.borderRadius = '5px';
            
            // Different colors based on powerup type
            let backgroundColor, icon, label;
            switch (powerup.type) {
                case 'zaps':
                    backgroundColor = 'rgba(255, 215, 0, 0.3)'; // Gold for ZAPS
                    icon = '⚡';
                    label = 'ZAPS';
                    break;
                case 'energy':
                    backgroundColor = 'rgba(0, 255, 0, 0.3)'; // Green for Energy
                    icon = '🔋';
                    label = 'Energy';
                    break;
                default:
                    backgroundColor = 'rgba(255, 255, 255, 0.3)'; // Default
                    icon = '✨';
                    label = powerup.type;
            }
            
            powerupElem.style.backgroundColor = backgroundColor;
            
            // Create the label with icon
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${icon} ${label}`;
            nameSpan.style.fontWeight = 'bold';
            
            // Create the timer
            const timerSpan = document.createElement('span');
            const seconds = Math.ceil(powerup.remainingTime / 1000);
            timerSpan.textContent = `${seconds}s`;
            timerSpan.style.marginLeft = '10px';
            
            // Pulse animation for ending soon
            if (seconds <= 5) {
                timerSpan.style.animation = 'pulse 1s infinite';
                // Add keyframes if they don't exist yet
                if (!document.getElementById('powerup-animation-style')) {
                    const style = document.createElement('style');
                    style.id = 'powerup-animation-style';
                    style.textContent = `
                        @keyframes pulse {
                            0% { opacity: 1; }
                            50% { opacity: 0.5; }
                            100% { opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            powerupElem.appendChild(nameSpan);
            powerupElem.appendChild(timerSpan);
            powerupsContainer.appendChild(powerupElem);
        });
    }
}

// Add mobile controls to the game
export function addMobileControls() {
    const mobileControls = document.createElement('div');
    mobileControls.id = 'mobile-controls';
    mobileControls.style.position = 'fixed';
    mobileControls.style.bottom = '20px';
    mobileControls.style.left = '0';
    mobileControls.style.width = '100%';
    mobileControls.style.display = 'flex';
    mobileControls.style.justifyContent = 'space-between';
    mobileControls.style.padding = '0 20px';
    mobileControls.style.boxSizing = 'border-box';
    mobileControls.style.zIndex = '1000';
    
    // Left lane change button
    const leftButton = document.createElement('button');
    leftButton.innerHTML = '←';
    leftButton.className = 'mobile-button';
    leftButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.lane > -1) gameState.lane--;
    });
    
    // Right lane change button
    const rightButton = document.createElement('button');
    rightButton.innerHTML = '→';
    rightButton.className = 'mobile-button';
    rightButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.lane < 1) gameState.lane++;
    });
    
    // Pause button
    const pauseButton = document.createElement('button');
    pauseButton.innerHTML = '⏸️';
    pauseButton.className = 'mobile-button';
    pauseButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        togglePause();
    });
    
    // Add buttons to the controls container
    mobileControls.appendChild(leftButton);
    mobileControls.appendChild(pauseButton);
    mobileControls.appendChild(rightButton);
    
    // Add the controls to the page
    document.body.appendChild(mobileControls);
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
        .mobile-button {
            background: rgba(255, 255, 255, 0.3);
            border: 2px solid white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            color: white;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
        }
        
        .mobile-button:active {
            background: rgba(255, 255, 255, 0.5);
        }
        
        @media (min-width: 769px) {
            #mobile-controls {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add touch event listeners for swipe detection
export function initializeTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
            e.preventDefault(); // Prevent scrolling when swiping
            if (deltaX > 0 && gameState.lane < 1) {
                // Swipe right
                gameState.lane++;
            } else if (deltaX < 0 && gameState.lane > -1) {
                // Swipe left
                gameState.lane--;
            }
            
            // Reset touch start coordinates
            touchStartX = null;
            touchStartY = null;
        }
    }, false);
    
    document.addEventListener('touchend', () => {
        touchStartX = null;
        touchStartY = null;
    }, false);
}

// Add responsive styles for mobile UI
export function addResponsiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            #score-container {
                font-size: 14px !important;
                padding: 5px !important;
                top: 10px !important;
            }
            
            #health-container, #fuel-container, #money-container {
                margin: 2px !important;
                padding: 3px 6px !important;
            }
            
            #game-over {
                font-size: 16px !important;
                padding: 15px !important;
            }
            
            #truckstop-ui {
                font-size: 14px !important;
                padding: 10px !important;
                width: 90% !important;
                max-width: 300px !important;
            }
            
            .upgrade-button {
                font-size: 12px !important;
                padding: 8px !important;
                margin: 5px !important;
            }
            
            #lizard-warning {
                font-size: 16px !important;
                padding: 10px !important;
            }
            
            #powerups-container {
                font-size: 12px !important;
                padding: 8px !important;
                top: 105px !important;
                right: 10px !important;
                max-width: 150px !important;
            }
            
            .mobile-notice {
                display: block;
                position: fixed;
                bottom: 90px;
                left: 0;
                width: 100%;
                text-align: center;
                color: white;
                font-size: 14px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.5);
                pointer-events: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add mobile instructions
    const mobileNotice = document.createElement('div');
    mobileNotice.className = 'mobile-notice';
    mobileNotice.innerHTML = 'Swipe left/right or use buttons to change lanes';
    mobileNotice.style.display = 'none';
    document.body.appendChild(mobileNotice);
    
    // Only show the notice on mobile devices
    if (window.innerWidth <= 768) {
        mobileNotice.style.display = 'block';
        // Hide the notice after 5 seconds
        setTimeout(() => {
            mobileNotice.style.opacity = '0';
            mobileNotice.style.transition = 'opacity 1s';
            setTimeout(() => mobileNotice.remove(), 1000);
        }, 5000);
    }
}

export function displayInGameMessage(message) {
    // Get or create the alert box container
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translateX(-50%)';
        alertContainer.style.zIndex = '1000';
        alertContainer.style.display = 'flex';
        alertContainer.style.flexDirection = 'column';
        alertContainer.style.gap = '10px';
        alertContainer.style.alignItems = 'center';
        alertContainer.style.width = 'auto';
        alertContainer.style.maxWidth = '80%';
        document.body.appendChild(alertContainer);
    }

    // Create the message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'game-message'; // Add a class for easier styling
    messageDiv.style.background = 'rgba(0,0,0,0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontSize = '24px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = '1001';
    messageDiv.style.width = '100%';
    messageDiv.style.boxSizing = 'border-box';
    messageDiv.innerHTML = message;
    
    // Add the message to the container
    alertContainer.appendChild(messageDiv);
    
    // Remove the message after timeout
    setTimeout(() => {
        if (messageDiv && messageDiv.parentNode) {
            alertContainer.removeChild(messageDiv);
            
            // If no more messages, remove the container too
            if (alertContainer.children.length === 0) {
                document.body.removeChild(alertContainer);
            }
        }
    }, 4000);
}

// Function to show the truck stop prompt
export function showTruckStopPrompt(enterTruckstopCallback, offRamp, truckStop) {
    // Create a prompt div if it doesn't exist
    let truckStopPrompt = document.getElementById('truckstop-prompt');
    if (!truckStopPrompt) {
        truckStopPrompt = document.createElement('div');
        truckStopPrompt.id = 'truckstop-prompt';
        truckStopPrompt.style.position = 'fixed';
        truckStopPrompt.style.top = '50%';
        truckStopPrompt.style.left = '50%';
        truckStopPrompt.style.transform = 'translate(-50%, -50%)';
        truckStopPrompt.style.background = 'rgba(0, 0, 0, 0.8)';
        truckStopPrompt.style.color = 'white';
        truckStopPrompt.style.padding = '20px';
        truckStopPrompt.style.borderRadius = '10px';
        truckStopPrompt.style.textAlign = 'center';
        truckStopPrompt.style.zIndex = '1000';
        truckStopPrompt.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        
        const message = document.createElement('p');
        message.textContent = 'Truck Stop Ahead!';
        message.style.fontSize = '24px';
        message.style.margin = '0 0 15px 0';
        truckStopPrompt.appendChild(message);
        
        const description = document.createElement('p');
        description.textContent = 'Would you like to stop for fuel and repairs?';
        description.style.fontSize = '16px';
        description.style.margin = '0 0 20px 0';
        truckStopPrompt.appendChild(description);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.gap = '10px';
        
        const enterButton = document.createElement('button');
        enterButton.textContent = 'Enter Truck Stop';
        enterButton.style.padding = '10px 20px';
        enterButton.style.background = '#4CAF50';
        enterButton.style.color = 'white';
        enterButton.style.border = 'none';
        enterButton.style.borderRadius = '5px';
        enterButton.style.cursor = 'pointer';
        enterButton.onclick = function() {
            document.body.removeChild(truckStopPrompt);
            gameState.isPaused = false;
            enterTruckstopCallback(offRamp, truckStop);
        };
        buttonContainer.appendChild(enterButton);
        
        const skipButton = document.createElement('button');
        skipButton.textContent = 'Continue Driving';
        skipButton.style.padding = '10px 20px';
        skipButton.style.background = '#f44336';
        skipButton.style.color = 'white';
        skipButton.style.border = 'none';
        skipButton.style.borderRadius = '5px';
        skipButton.style.cursor = 'pointer';
        skipButton.onclick = function() {
            document.body.removeChild(truckStopPrompt);
            // Add a small notification that we skipped the truck stop
            displayInGameMessage("Skipped truck stop. Next one in " + Math.floor(gameState.nextTruckStopDistance/100) + " miles.");
            // Resume the game
            gameState.isPaused = false;
        };
        buttonContainer.appendChild(skipButton);
        
        truckStopPrompt.appendChild(buttonContainer);
        document.body.appendChild(truckStopPrompt);
        
        // Pause the game while deciding
        gameState.isPaused = true;
    }
} 