// This file contains the complete survey logic based on the CRIBS flowchart
// It defines all questions, decision paths, and recommendations
import flowchartDataFromJson from './flowchartData.json'; // Import data from JSON file

// Re-export the imported data so App.svelte can access it
export const flowchartData = flowchartDataFromJson;

// Helper function to get the next question or recommendation
export function getNextStep(category, currentId, answer) {
  // Find the current question in the category
  const currentQuestion = flowchartData[category].find(q => q.id === currentId);
  
  if (!currentQuestion) {
    console.error(`Question with ID ${currentId} not found in category ${category}`);
    return null;
  }
  
  // Get the next step ID based on the answer
  const nextStepId = currentQuestion.next[answer];
  
  // Handle case where nextStepId is an array (multiple next steps)
  if (Array.isArray(nextStepId)) {
    // For now, we'll just use the first item in the array
    // In a more complete implementation, you might want to handle multiple paths
    const firstNextStepId = nextStepId[0];
    
    // Check if it's a recommendation
    if (typeof firstNextStepId === 'string' && firstNextStepId.startsWith('rec_')) {
      return {
        type: 'recommendation',
        data: flowchartData.recommendations[firstNextStepId]
      };
    }
    
    // If it's a question
    const nextQuestion = flowchartData[category].find(q => q.id === firstNextStepId);
    if (nextQuestion) {
      return {
        type: 'question',
        data: nextQuestion
      };
    }
    
    console.error(`Next question with ID ${firstNextStepId} not found in category ${category}`);
    return null;
  }
  
  // Normal string handling (non-array)
  // If it's a recommendation
  if (typeof nextStepId === 'string' && nextStepId.startsWith('rec_')) {
    return {
      type: 'recommendation',
      data: flowchartData.recommendations[nextStepId]
    };
  }
  
  // If it's the end of this path
  if (nextStepId === 'end') {
    return {
      type: 'end'
    };
  }
  
  // Otherwise it's another question in the same category
  const nextQuestion = flowchartData[category].find(q => q.id === nextStepId);
  
  if (!nextQuestion) {
    console.error(`Next question with ID ${nextStepId} not found in category ${category}`);
    return null;
  }
  
  return {
    type: 'question',
    data: nextQuestion
  };
}

// Function to get the first question for a category
export function getFirstQuestion(category) {
  if (!flowchartData[category] || flowchartData[category].length === 0) {
    return null;
  }
  
  return flowchartData[category][0];
}
