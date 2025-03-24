// Firebase Configuration for Freight Frenzy

// Firebase configuration object
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
let app;
let db;
let analytics;

/**
 * Initialize Firebase
 */
export async function initFirebase() {
  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded. Leaderboard and analytics will be unavailable.');
      return false;
    }
    
    // Initialize app if not already initialized
    if (!app) {
      app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      analytics = firebase.analytics();
      
      console.log('Firebase initialized successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

/**
 * Submit a score to the leaderboard
 * @param {Object} scoreData - Score data to submit
 * @param {string} scoreData.playerName - Player name
 * @param {number} scoreData.distance - Distance traveled
 * @param {number} scoreData.money - Money earned
 * @param {string} scoreData.difficulty - Game difficulty
 * @param {string} scoreData.truckType - Truck type
 * @param {string} scoreData.trailerType - Trailer type
 * @returns {Promise<boolean>} - Success status
 */
export async function submitScore(scoreData) {
  try {
    // Initialize Firebase if not initialized
    if (!db) {
      const initialized = await initFirebase();
      if (!initialized) return false;
    }
    
    // Add timestamp
    const data = {
      ...scoreData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Submit to leaderboard collection
    await db.collection('leaderboard').add(data);
    
    // Log analytics event
    if (analytics) {
      analytics.logEvent('game_over_score_submitted', {
        distance: scoreData.distance,
        money: scoreData.money,
        difficulty: scoreData.difficulty
      });
    }
    
    console.log('Score submitted successfully');
    return true;
  } catch (error) {
    console.error('Error submitting score:', error);
    return false;
  }
}

/**
 * Get leaderboard data
 * @param {number} limit - Maximum number of entries to return (default: 100)
 * @returns {Promise<Array>} - Leaderboard entries
 */
export async function getLeaderboard(limit = 100) {
  try {
    // Initialize Firebase if not initialized
    if (!db) {
      const initialized = await initFirebase();
      if (!initialized) return [];
    }
    
    // Query leaderboard collection
    const snapshot = await db.collection('leaderboard')
      .orderBy('distance', 'desc')
      .limit(limit)
      .get();
    
    // Convert to array
    const leaderboard = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert timestamp to JS Date if it exists
      if (data.timestamp && data.timestamp.toDate) {
        data.timestamp = data.timestamp.toDate().getTime();
      }
      
      return data;
    });
    
    console.log(`Retrieved ${leaderboard.length} leaderboard entries`);
    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Log an analytics event
 * @param {string} eventName - Name of the event
 * @param {Object} params - Event parameters
 */
export function logEvent(eventName, params = {}) {
  try {
    if (!analytics) return;
    
    analytics.logEvent(eventName, params);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
}

/**
 * Initialize analytics for the game
 * @param {Object} initialData - Initial game data
 */
export function initAnalytics(initialData) {
  try {
    if (!analytics) {
      initFirebase();
      if (!analytics) return;
    }
    
    // Set user properties
    if (initialData.playerName) {
      analytics.setUserProperty('player_name', initialData.playerName);
    }
    
    if (initialData.difficulty) {
      analytics.setUserProperty('difficulty', initialData.difficulty);
    }
    
    if (initialData.truckType) {
      analytics.setUserProperty('truck_type', initialData.truckType);
    }
    
    if (initialData.trailerType) {
      analytics.setUserProperty('trailer_type', initialData.trailerType);
    }
    
    // Log game start event
    analytics.logEvent('game_started', {
      difficulty: initialData.difficulty,
      truck_type: initialData.truckType,
      trailer_type: initialData.trailerType
    });
    
    console.log('Analytics initialized');
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
} 