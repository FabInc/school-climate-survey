<script>
  import Header from './lib/Header.svelte';
  import WelcomeScreen from './lib/WelcomeScreen.svelte';
  import CategorySelection from './lib/CategorySelection.svelte';
  import BranchSelection from './lib/BranchSelection.svelte';
  import QuestionCard from './lib/QuestionCard.svelte';
  import ResultsDisplay from './lib/ResultsDisplay.svelte';
  import FlowchartVisualization from './lib/FlowchartVisualization.svelte';
  import { flowchartData, getNextStep, getFirstQuestion } from './lib/flowchartLogic.js';
  import { downloadPDF } from './lib/ExportResults.js'; // Import PDF export function

  // Application State
  let currentScreen = 'welcome'; // welcome, categories, branches, question, results, visualization
  let currentCategory = null;
  let currentBranch = null;
  let currentQuestionData = {};
  let currentProgress = 0;
  let answers = {};
  let recommendations = [];
  let visitedQuestions = new Set(); // To track progress more accurately
  let completedBranches = new Set(); // To track which branches have been completed
  
  // Branch definitions (would be moved to a proper data file in production)
  const branchData = {
    'water-supply': [
      {
        id: 'ws-availability',
        title: 'Water Availability',
        description: 'Evaluate if the current water supply meets the facility needs.',
        startQuestionId: 'ws1' // First question ID from flowchartData
      },
      {
        id: 'ws-storage',
        title: 'Water Storage Capacity',
        description: 'Assess if water storage and distribution systems are sufficient.',
        startQuestionId: 'ws4' // Different starting point
      }
    ],
    'water-demand': [
      {
        id: 'wd-toilets',
        title: 'Toilet Water Usage',
        description: 'Evaluate toilet water consumption and alternatives.',
        startQuestionId: 'wd1'
      },
      {
        id: 'wd-irrigation',
        title: 'Irrigation Water Usage',
        description: 'Assess water usage for gardens and outdoor areas.',
        startQuestionId: 'wd3'
      }
    ],
    'dust-impacts': [
      {
        id: 'di-internal',
        title: 'Internal Dust Sources',
        description: 'Evaluate dust sources within the facility grounds.',
        startQuestionId: 'di1'
      },
      {
        id: 'di-external',
        title: 'External Dust Sources',
        description: 'Assess impact of dust from outside the facility.',
        startQuestionId: 'di2'
      },
      {
        id: 'di-mitigation',
        title: 'Dust Mitigation Options',
        description: 'Explore options for reducing dust impacts on the facility.',
        startQuestionId: 'di5'
      }
    ],
    'heat-impacts': [
      {
        id: 'hi-direct-sunlight',
        title: 'Direct Sunlight Issues',
        description: 'Evaluate how direct sunlight affects building temperature.',
        startQuestionId: 'hi1'
      },
      {
        id: 'hi-roof-heat',
        title: 'Roof Heat Transfer',
        description: 'Assess how heat transfers through the roof structure.',
        startQuestionId: 'hi12'
      }
    ],
    'rainwater-entry': [
      {
        id: 're-roof',
        title: 'Roof Leakage',
        description: 'Address rainwater entry through the roof.',
        startQuestionId: 're1'
      },
      {
        id: 're-windows',
        title: 'Window Leakage',
        description: 'Evaluate rainwater entry through windows.',
        startQuestionId: 're8'
      },
      {
        id: 're-doors',
        title: 'Door Leakage',
        description: 'Address rainwater entry under doors.',
        startQuestionId: 're12'
      }
    ],
    'flood-management': [
      {
        id: 'fm-external',
        title: 'External Flooding',
        description: 'Manage external flood water sources.',
        startQuestionId: 'fm1'
      },
      {
        id: 'fm-drainage',
        title: 'Site Drainage',
        description: 'Improve site drainage to manage rainwater.',
        startQuestionId: 'fm5'
      },
      {
        id: 'fm-building',
        title: 'Building Protection',
        description: 'Protect buildings from flood damage.',
        startQuestionId: 'fm7'
      },
      {
        id: 'fm-contamination',
        title: 'Water Contamination',
        description: 'Address water contamination during flooding.',
        startQuestionId: 'fm11'
      }
    ],
    'wildfire-impacts': [
      {
        id: 'wi-air',
        title: 'Air Quality',
        description: 'Manage air quality impacts from wildfires.',
        startQuestionId: 'wi1'
      },
      {
        id: 'wi-prevention',
        title: 'Fire Prevention',
        description: 'Reduce risk of fires spreading to site.',
        startQuestionId: 'wi2'
      },
      {
        id: 'wi-escape',
        title: 'Emergency Escape',
        description: 'Plan evacuation routes and emergency access.',
        startQuestionId: 'wi3'
      }
    ],
    'electricity-supply': [
      {
        id: 'es-increase',
        title: 'Increase Supply',
        description: 'Evaluate options to enhance electricity supply.',
        startQuestionId: 'es1'
      },
      {
        id: 'es-reduce',
        title: 'Reduce Demand',
        description: 'Implement strategies to reduce electricity consumption.',
        startQuestionId: 'es5'
      },
      {
        id: 'es-lighting',
        title: 'Natural Lighting',
        description: 'Improve natural lighting to reduce electricity needs.',
        startQuestionId: 'es11'
      }
    ],
    'air-quality': [
      {
        id: 'aq-outdoor',
        title: 'Outdoor Air Quality',
        description: 'Address external air quality issues affecting the facility.',
        startQuestionId: 'aq1'
      },
      {
        id: 'aq-indoor',
        title: 'Indoor Air Quality',
        description: 'Improve indoor air quality within the facility.',
        startQuestionId: 'aq9'
      }
    ],
    'rain-noise': [
      {
        id: 'rn-building',
        title: 'Rain Noise Impact',
        description: 'Assess and mitigate the impact of rain noise on buildings',
        startQuestionId: 'rn1'
      }
    ]
  };
  
  // Store all recommendations from all branches
  let allRecommendations = {};

  function handleStart() {
    currentScreen = 'categories';
    resetState();
  }

  function handleCategorySelect(event) {
    currentCategory = event.detail.detail;
    
    // Check if this category has multiple branches
    if (branchData[currentCategory] && branchData[currentCategory].length > 1) {
      resetStateForCategory();
      currentScreen = 'branches';
    } else {
      // If no branches, proceed directly to questions
      resetStateForCategory();
      currentScreen = 'question';
      const firstQuestion = getFirstQuestion(currentCategory);
      if (firstQuestion) {
        currentQuestionData = firstQuestion;
        visitedQuestions.add(currentQuestionData.id);
        updateProgress();
      } else {
        console.error("No first question found for category ID:", currentCategory);
        currentScreen = 'results';
        updateProgress();
      }
    }
  }
  
  function handleBranchSelect(event) {
    const branchId = event.detail.detail;
    currentBranch = branchId;
    
    // Get the branch object
    const branch = branchData[currentCategory].find(b => b.id === branchId);
    if (!branch) {
      console.error("Branch not found:", branchId);
      return;
    }
    
    // Find the starting question for this branch
    resetStateForBranch();
    currentScreen = 'question';
    
    // Get the starting question for this branch
    const startQuestionId = branch.startQuestionId;
    const questionList = flowchartData[currentCategory];
    const startQuestion = questionList.find(q => q.id === startQuestionId);
    
    if (startQuestion) {
      currentQuestionData = startQuestion;
      visitedQuestions.add(currentQuestionData.id);
      updateProgress();
    } else {
      console.error("Start question not found for branch:", branchId, "startQuestionId:", startQuestionId);
      currentScreen = 'branches';
    }
  }

  function handleAnswer(event) {
    const answer = event.detail.answer;
    const questionId = currentQuestionData.id;
    answers[questionId] = answer;

    const nextStep = getNextStep(currentCategory, questionId, answer);

    if (!nextStep) {
      console.error("Error determining next step from", questionId, "with answer", answer);
      currentScreen = 'results';
    } else if (nextStep.type === 'recommendation') {
      recommendations.push(nextStep.data);
      recommendations = recommendations; // For Svelte reactivity
      
      // Store recommendations in allRecommendations
      if (currentBranch) {
        if (!allRecommendations[currentBranch]) {
          allRecommendations[currentBranch] = [];
        }
        allRecommendations[currentBranch].push(nextStep.data);
        completedBranches.add(currentBranch);
      }
      
      currentScreen = 'results';
    } else if (nextStep.type === 'end') {
      if (currentBranch) {
        completedBranches.add(currentBranch);
      }
      currentScreen = 'results';
    } else if (nextStep.type === 'question') {
      currentQuestionData = nextStep.data;
      visitedQuestions.add(currentQuestionData.id);
    } else {
      console.error("Unknown next step type:", nextStep.type);
      currentScreen = 'results';
    }

    updateProgress();
  }

  function handleGoToCategories() {
    currentScreen = 'categories';
    resetState();
  }
  
  function handleGoToBranches() {
    currentScreen = 'branches';
    // Keep the current category but reset other branch-specific state
    resetStateForBranch();
  }

  function handleExport() {
    // Ask for school name (optional)
    const schoolName = prompt("Enter school name (optional) for the PDF report:", "");
    if (schoolName === null) { // User cancelled prompt
      return;
    }
    
    // Collect all recommendations from all completed branches
    const allRecs = [];
    for (const branch in allRecommendations) {
      allRecs.push(...allRecommendations[branch]);
    }
    
    try {
      const filename = downloadPDF(allRecs.length > 0 ? allRecs : recommendations, currentCategory, schoolName);
      alert(`Results exported successfully as ${filename}`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("An error occurred while exporting the results.");
    }
  }

  function resetState() {
    currentCategory = null;
    currentBranch = null;
    currentQuestionData = {};
    currentProgress = 0;
    answers = {};
    recommendations = [];
    visitedQuestions = new Set();
    completedBranches = new Set();
    allRecommendations = {};
  }
  
  function resetStateForCategory() {
    currentBranch = null;
    currentQuestionData = {};
    currentProgress = 0;
    answers = {};
    recommendations = [];
    visitedQuestions = new Set();
    completedBranches = new Set();
    allRecommendations = {};
  }
  
  function resetStateForBranch() {
    currentQuestionData = {};
    currentProgress = 0;
    answers = {};
    recommendations = [];
    visitedQuestions = new Set();
  }

  function updateProgress() {
    if (currentScreen === 'question' && currentCategory) {
      // Calculate progress based on answered questions
      const questionsAnswered = Object.keys(answers).length;
      const totalEstimatedQuestions = 3; // Assuming average path length of 3 questions
      currentProgress = Math.min(99, Math.round((questionsAnswered / totalEstimatedQuestions) * 100));
    } else if (currentScreen === 'results') {
      currentProgress = 100;
    } else if (currentScreen === 'branches') {
      // Calculate progress based on completed branches
      const totalBranches = branchData[currentCategory]?.length || 1;
      const completedCount = completedBranches.size;
      currentProgress = Math.round((completedCount / totalBranches) * 100);
    } else {
      currentProgress = 0;
    }
  }
  
  // Toggle visualization mode
  function toggleVisualization() {
    if (currentScreen === 'visualization') {
      // Return to the previous screen or categories
      currentScreen = 'categories';
    } else {
      // Go to visualization
      currentScreen = 'visualization';
    }
  }
</script>

<Header progress={currentProgress} />

<!-- Mode toggle button -->
<div class="container px-4 mt-2">
  <button 
    class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
    on:click={toggleVisualization}
  >
    {currentScreen === 'visualization' ? 'Switch to Questionnaire' : 'View Decision Trees'}
  </button>
</div>

{#key currentScreen}
<main class="container fade-in">
  {#if currentScreen === 'welcome'}
    <WelcomeScreen on:start={handleStart} />
  {:else if currentScreen === 'categories'}
    <CategorySelection on:select={handleCategorySelect} />
  {:else if currentScreen === 'branches'}
    <BranchSelection 
      category={currentCategory}
      branches={branchData[currentCategory] || []}
      completedBranches={Array.from(completedBranches)}
      on:select={handleBranchSelect}
      on:back={handleGoToCategories}
    />
  {:else if currentScreen === 'question'}
    <QuestionCard 
      question={currentQuestionData.text}
      helpText={currentQuestionData.help}
      currentCategory={currentCategory}
      questionId={currentQuestionData.id}
      on:answer={handleAnswer} 
    />
  {:else if currentScreen === 'results'}
    <ResultsDisplay 
      results={recommendations} 
      category={currentCategory}
      fromBranch={!!currentBranch}
      on:categories={handleGoToCategories}
      on:branches={handleGoToBranches}
      on:export={handleExport} 
    />
  {:else if currentScreen === 'visualization'}
    <FlowchartVisualization />
  {/if}
</main>
{/key}

<style lang="css">
  /* Remove component-specific styles that are now handled globally */
  /* Add any App.svelte specific styles if needed */
  main {
    padding-top: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
  }
</style>
