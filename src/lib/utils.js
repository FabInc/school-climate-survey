/**
 * Generate a unique ID for a node in a specific category
 * @param {string} category - The category for the node
 * @returns {string} - A unique ID for the node
 */
export function generateId(category) {
  // Create a prefix from the first letter of each part of the category
  const prefix = category.split('-').map(part => part[0]).join('');
  
  // Add a random number and timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  const random = Math.floor(Math.random() * 10000).toString(36);
  
  return `${prefix}-${timestamp}${random}`;
}

/**
 * Format a date as a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Delay for a specified amount of time
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an object is empty
 * @param {Object} obj - The object to check
 * @returns {boolean} - True if the object is empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Deep clone an object
 * @param {Object} obj - The object to clone
 * @returns {Object} - A deep clone of the object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
} 