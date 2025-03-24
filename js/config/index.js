// Config Module Index - Export all configuration

export * from './constants.js';
export * from './firebase-config.js';

/**
 * Initialize all configuration
 */
export async function initConfig() {
  // Initialize Firebase
  const { initFirebase } = await import('./firebase-config.js');
  await initFirebase();
  
  console.log('Configuration initialized');
  
  return {
    initialized: true
  };
} 