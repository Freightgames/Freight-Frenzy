// Leaderboard UI Module
import { getLeaderboard } from '../config/firebase-config.js';

// State
let currentLeaderboard = [];
let difficultyFilter = 'all';
let refreshCallback = null;

/**
 * Initialize the leaderboard
 * @param {Function} onRefresh - Optional callback when leaderboard is refreshed
 */
export function initLeaderboard(onRefresh = null) {
  refreshCallback = onRefresh;
  
  // Set up difficulty filters
  setupDifficultyFilters();
  
  // Load initial leaderboard data
  refreshLeaderboard();
  
  console.log("Leaderboard initialized");
}

/**
 * Set up difficulty filter buttons
 */
function setupDifficultyFilters() {
  const filterButtons = document.querySelectorAll('.leaderboard-difficulty-filter button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const difficulty = button.dataset.difficulty;
      
      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update filter and refresh data
      difficultyFilter = difficulty;
      refreshLeaderboard();
    });
  });
}

/**
 * Refresh the leaderboard data
 */
export async function refreshLeaderboard() {
  try {
    showLoadingIndicator();
    
    // Fetch leaderboard data from Firebase
    currentLeaderboard = await getLeaderboard();
    
    // Filter by difficulty if needed
    let filteredData = currentLeaderboard;
    if (difficultyFilter !== 'all') {
      filteredData = currentLeaderboard.filter(entry => entry.difficulty === difficultyFilter);
    }
    
    // Sort by distance (descending)
    filteredData.sort((a, b) => b.distance - a.distance);
    
    // Update the UI
    updateLeaderboardUI(filteredData);
    
    hideLoadingIndicator();
    
    // Call refresh callback if provided
    if (refreshCallback) {
      refreshCallback(filteredData);
    }
  } catch (error) {
    console.error("Error refreshing leaderboard:", error);
    showLeaderboardError("Failed to load leaderboard data. Please try again later.");
    hideLoadingIndicator();
  }
}

/**
 * Update the leaderboard UI with data
 * @param {Array} data - Leaderboard data
 */
function updateLeaderboardUI(data) {
  const leaderboardBody = document.querySelector('.leaderboard-table tbody');
  if (!leaderboardBody) return;
  
  // Clear current entries
  leaderboardBody.innerHTML = '';
  
  if (data.length === 0) {
    // Show no data message
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="5" class="no-data">No entries found. Be the first to set a record!</td>
    `;
    leaderboardBody.appendChild(row);
    return;
  }
  
  // Add entries
  data.slice(0, 10).forEach((entry, index) => {
    const row = document.createElement('tr');
    
    // Highlight rows based on position
    if (index === 0) row.classList.add('first-place');
    if (index === 1) row.classList.add('second-place');
    if (index === 2) row.classList.add('third-place');
    
    // Format the date
    const date = new Date(entry.timestamp);
    const formattedDate = date.toLocaleDateString();
    
    // Calculate rate per mile
    const ratePerMile = (entry.money / entry.distance).toFixed(2);
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.playerName}</td>
      <td>${Math.round(entry.distance).toLocaleString()} miles</td>
      <td>$${Math.round(entry.money).toLocaleString()} ($${ratePerMile}/mi)</td>
      <td>${entry.difficulty}</td>
    `;
    
    leaderboardBody.appendChild(row);
  });
}

/**
 * Show the loading indicator
 */
function showLoadingIndicator() {
  const leaderboardContainer = document.querySelector('.leaderboard-container');
  if (!leaderboardContainer) return;
  
  // Create loading indicator if it doesn't exist
  let loadingIndicator = document.querySelector('.leaderboard-loading');
  if (!loadingIndicator) {
    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'leaderboard-loading';
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <p>Loading leaderboard data...</p>
    `;
    leaderboardContainer.appendChild(loadingIndicator);
  }
  
  loadingIndicator.style.display = 'flex';
}

/**
 * Hide the loading indicator
 */
function hideLoadingIndicator() {
  const loadingIndicator = document.querySelector('.leaderboard-loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

/**
 * Show an error message on the leaderboard
 * @param {string} message - Error message to display
 */
function showLeaderboardError(message) {
  const leaderboardBody = document.querySelector('.leaderboard-table tbody');
  if (!leaderboardBody) return;
  
  // Clear current entries
  leaderboardBody.innerHTML = '';
  
  // Show error message
  const row = document.createElement('tr');
  row.innerHTML = `
    <td colspan="5" class="error-message">${message}</td>
  `;
  leaderboardBody.appendChild(row);
}

/**
 * Show the leaderboard UI
 */
export function showLeaderboard() {
  const leaderboardContainer = document.querySelector('.leaderboard-container');
  if (leaderboardContainer) {
    leaderboardContainer.style.display = 'block';
    
    // Refresh data when shown
    refreshLeaderboard();
  }
}

/**
 * Hide the leaderboard UI
 */
export function hideLeaderboard() {
  const leaderboardContainer = document.querySelector('.leaderboard-container');
  if (leaderboardContainer) {
    leaderboardContainer.style.display = 'none';
  }
}

/**
 * Get the current leaderboard data
 * @returns {Array} - Current leaderboard data
 */
export function getLeaderboardData() {
  return [...currentLeaderboard];
} 