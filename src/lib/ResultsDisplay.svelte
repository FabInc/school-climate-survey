<script>
  import { createEventDispatcher } from 'svelte';
  import RecommendationCard from './RecommendationCard.svelte';
  
  export let results = [];
  export let category = '';
  export let fromBranch = false;
  
  const dispatch = createEventDispatcher();
  
  function goToCategories() {
    dispatch('categories');
  }
  
  function goToBranches() {
    dispatch('branches');
  }
  
  function exportResults() {
    dispatch('export');
  }
  
  // Map category IDs to readable names
  const categoryNames = {
    'water-supply': 'Water Supply Issues',
    'water-demand': 'Water Demand Issues',
    'dust-impacts': 'Airborne Dust Impacts',
    'heat-impacts': 'Heat Impacts',
    'rainwater-entry': 'Rainwater Entry',
    'flood-management': 'Flood Management',
    'wildfire-impacts': 'Wildfire Impacts',
    'electricity-supply': 'Electricity Supply',
    'air-quality': 'Air Quality',
    'rain-noise': 'Rain Noise Issues'
  };
</script>

<div class="results-container">
  <h2>Assessment Results: {categoryNames[category] || category}</h2>
  
  {#if results.length === 0}
    <div class="no-results">
      <p>No issues were identified in this category. Your school is doing well in this area!</p>
    </div>
  {:else}
    <p class="results-intro">Based on your responses, we recommend the following interventions:</p>
    
    <div class="recommendations-list">
      {#each results as result}
        <RecommendationCard recommendation={result.text} icon={result.icon} />
      {/each}
    </div>
  {/if}
  
  <div class="action-buttons">
    {#if fromBranch}
      <button class="secondary-button" on:click={goToBranches}>
        Return to Branches
      </button>
    {:else}
      <button class="secondary-button" on:click={goToCategories}>
        Return to Categories
      </button>
    {/if}
    <button class="primary-button" on:click={exportResults}>
      Export Results
    </button>
  </div>
</div>

<style lang="css">
  .results-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #F5F5F5; /* Light Gray */
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: #000000;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .results-intro {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #333333;
  }
  
  .no-results {
    background-color: #FFC04D; /* Yellow/Orange */
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .recommendations-list {
    margin-bottom: 2rem;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .primary-button, .secondary-button {
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .primary-button {
    background-color: #0066FF; /* Primary Blue */
    color: #FFFFFF;
    flex: 1;
  }
  
  .secondary-button {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #CCCCCC;
    flex: 1;
  }
  
  .primary-button:hover {
    background-color: #0052CC; /* Darker Blue */
  }
  
  .secondary-button:hover {
    background-color: #F5F5F5; /* Light Gray */
  }
  
  /* Responsive adjustments */
  @media (max-width: 650px) {
    .results-container {
      margin: 1rem;
      padding: 1rem;
    }
    
    .action-buttons {
      flex-direction: column;
    }
  }
</style>
