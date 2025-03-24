// UI Module Index - Export all UI components

export * from './start-screen.js';
export * from './hud.js';
export * from './game-over.js';
export * from './truckstop-ui.js';
export * from './pause-menu.js';
export * from './leaderboard.js';

/**
 * Initialize all UI components
 * @param {Object} state - Game state
 * @param {Object} handlers - Object containing all event handlers
 */
export function initUI(state, handlers) {
  const {
    onGameStart,
    onRestart,
    onQuit,
    onResume,
    onMusicToggle,
    onSfxToggle,
    onLeaveTruckstop,
    onLeaderboardRefresh
  } = handlers;

  // Initialize all UI modules with their respective handlers
  import('./start-screen.js').then(startScreen => {
    startScreen.initStartScreen(onGameStart);
    console.log('Start screen initialized');
  });

  import('./hud.js').then(hud => {
    hud.initHUD(state);
    console.log('HUD initialized');
  });

  import('./game-over.js').then(gameOver => {
    gameOver.initGameOverScreen(state, onRestart);
    console.log('Game over screen initialized');
  });

  import('./truckstop-ui.js').then(truckstopUI => {
    truckstopUI.initTruckstopUI(state, onLeaveTruckstop);
    console.log('Truckstop UI initialized');
  });

  import('./pause-menu.js').then(pauseMenu => {
    pauseMenu.initPauseMenu(state, onResume, onRestart, onQuit, onMusicToggle, onSfxToggle);
    console.log('Pause menu initialized');
  });

  import('./leaderboard.js').then(leaderboard => {
    leaderboard.initLeaderboard(onLeaderboardRefresh);
    console.log('Leaderboard initialized');
  });
} 