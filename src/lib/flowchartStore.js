import { writable } from 'svelte/store';
import { flowchartData as initialData } from './flowchartLogic.js';
import { exportToJsonFile, importFromJsonString } from './exportJson.js';

// Create a writable store with the initial flowchart data
export const flowchartStore = writable(JSON.parse(JSON.stringify(initialData)));

// Functions to modify the flowchart data
export function updateNode(category, nodeId, updatedNodeData) {
  flowchartStore.update(data => {
    const nodeIndex = data[category].findIndex(node => node.id === nodeId);
    if (nodeIndex !== -1) {
      data[category][nodeIndex] = { ...data[category][nodeIndex], ...updatedNodeData };
    }
    return data;
  });
}

export function addNode(category, newNode) {
  flowchartStore.update(data => {
    data[category] = [...data[category], newNode];
    return data;
  });
}

export function deleteNode(category, nodeId) {
  flowchartStore.update(data => {
    // Remove the node
    data[category] = data[category].filter(node => node.id !== nodeId);
    
    // Update any references to this node
    data[category].forEach(node => {
      if (node.next) {
        Object.entries(node.next).forEach(([answer, nextId]) => {
          if (nextId === nodeId) {
            node.next[answer] = 'end';
          } else if (Array.isArray(nextId)) {
            node.next[answer] = nextId.filter(id => id !== nodeId);
            if (nextId.length === 0) {
              node.next[answer] = 'end';
            }
          }
        });
      }
    });
    
    return data;
  });
}

export function addCategory(categoryName) {
  flowchartStore.update(data => {
    if (!data[categoryName]) {
      data[categoryName] = [];
    }
    return data;
  });
}

export function deleteCategory(categoryName) {
  flowchartStore.update(data => {
    if (data[categoryName]) {
      // Create a new object without the deleted category
      const { [categoryName]: _, ...restData } = data;
      return restData;
    }
    return data;
  });
}

export function updateRecommendation(recommendationId, updatedData) {
  flowchartStore.update(data => {
    if (data.recommendations && data.recommendations[recommendationId]) {
      data.recommendations[recommendationId] = {
        ...data.recommendations[recommendationId],
        ...updatedData
      };
    }
    return data;
  });
}

export function addRecommendation(recommendationId, newRecommendation) {
  flowchartStore.update(data => {
    if (!data.recommendations) {
      data.recommendations = {};
    }
    data.recommendations[recommendationId] = newRecommendation;
    return data;
  });
}

export function deleteRecommendation(recommendationId) {
  flowchartStore.update(data => {
    if (data.recommendations && data.recommendations[recommendationId]) {
      // Remove the recommendation
      const { [recommendationId]: _, ...restRecommendations } = data.recommendations;
      data.recommendations = restRecommendations;
      
      // Update any references to this recommendation in nodes
      Object.keys(data).forEach(category => {
        if (category !== 'recommendations') {
          data[category].forEach(node => {
            if (node.next) {
              Object.entries(node.next).forEach(([answer, nextId]) => {
                if (nextId === recommendationId) {
                  node.next[answer] = 'end';
                } else if (Array.isArray(nextId)) {
                  node.next[answer] = nextId.filter(id => id !== recommendationId);
                  if (nextId.length === 0) {
                    node.next[answer] = 'end';
                  }
                }
              });
            }
          });
        }
      });
    }
    return data;
  });
}

export function saveFlowchart() {
  let jsonData;
  
  // Get the current state of the flowchart
  const unsubscribe = flowchartStore.subscribe(data => {
    jsonData = JSON.stringify(data, null, 2);
  });
  
  // Unsubscribe to prevent memory leaks
  unsubscribe();
  
  // Save to localStorage for immediate persistence
  try {
    localStorage.setItem('flowchartData', jsonData);
    console.log('Flowchart saved to localStorage');
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

export function loadFlowchart() {
  try {
    const savedData = localStorage.getItem('flowchartData');
    if (savedData) {
      flowchartStore.set(JSON.parse(savedData));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return false;
  }
}

export function exportFlowchart() {
  let currentData;
  
  // Get the current state of the flowchart
  const unsubscribe = flowchartStore.subscribe(data => {
    currentData = data;
  });
  
  // Unsubscribe to prevent memory leaks
  unsubscribe();
  
  // Use the exportToJsonFile function to download the file
  return exportToJsonFile(currentData);
}

export function importFlowchart(jsonData) {
  try {
    const parsedData = importFromJsonString(jsonData);
    if (parsedData) {
      flowchartStore.set(parsedData);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return false;
  }
} 