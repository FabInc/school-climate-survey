/**
 * Export the flowchart data to a downloadable JSON file
 * @param {Object} flowchartData - The current flowchart data
 * @returns {string} - The JSON string that was exported
 */
export function exportToJsonFile(flowchartData) {
  // Convert the data to a formatted JSON string
  const jsonString = JSON.stringify(flowchartData, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'flowchart_data.json';
  
  // Trigger a click on the link to start the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return jsonString;
}

/**
 * Import flowchart data from a JSON file
 * @param {string} jsonString - The JSON string to import
 * @returns {Object|null} - The parsed flowchart data or null if invalid
 */
export function importFromJsonString(jsonString) {
  try {
    // Parse the JSON string
    const parsedData = JSON.parse(jsonString);
    
    // Basic validation - check for required properties
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid JSON format: Not an object');
    }
    
    // Check if it has at least one category and recommendations
    const hasCategories = Object.keys(parsedData).some(key => key !== 'recommendations' && Array.isArray(parsedData[key]));
    const hasRecommendations = parsedData.recommendations && typeof parsedData.recommendations === 'object';
    
    if (!hasCategories || !hasRecommendations) {
      throw new Error('Invalid flowchart data: Missing categories or recommendations');
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error importing flowchart data:', error);
    return null;
  }
} 