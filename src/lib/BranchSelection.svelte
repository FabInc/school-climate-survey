<script>
  import { createEventDispatcher } from 'svelte';
  
  export let category = '';
  export let branches = [];
  export let completedBranches = [];
  
  const dispatch = createEventDispatcher();
  
  // Category display names
  const categoryNames = {
    'water-supply': 'Water Supply Issues',
    'water-demand': 'Water Demand Issues',
    'dust-impacts': 'Airborne Dust Impacts',
    'heat-impacts': 'Heat Impacts',
    'rainwater-entry': 'Rainwater Entry',
    'flood-management': 'Flood Management',
    'wildfire-impacts': 'Wildfire Impacts',
    'electricity-supply': 'Electricity Supply',
    'air-quality': 'Air Quality'
  };
  
  function selectBranch(branchId) {
    dispatch('select', { detail: branchId });
  }
  
  function goBackToCategories() {
    dispatch('back');
  }
</script>

<div class="branch-container">
  <h2>{categoryNames[category] || category}</h2>
  <p>This area has multiple question paths. Select one to begin:</p>
  
  <div class="branch-list">
    {#each branches as branch}
      <div class="branch-card" on:click={() => selectBranch(branch.id)}>
        <div class="branch-header">
          <h3>{branch.title}</h3>
          {#if completedBranches.includes(branch.id)}
            <span class="completed-badge">✓</span>
          {/if}
        </div>
        <p>{branch.description}</p>
      </div>
    {/each}
  </div>
  
  <div class="action-buttons">
    <button class="secondary-button" on:click={goBackToCategories}>
      Return to Categories
    </button>
  </div>
</div>

<style lang="css">
  .branch-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1rem;
  }
  
  h2 {
    color: #000000;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  p {
    text-align: center;
    margin-bottom: 2rem;
    color: #333333;
  }
  
  .branch-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .branch-card {
    background-color: #F5F5F5;
    border-radius: 8px;
    padding: 1.5rem;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .branch-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .branch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  h3 {
    color: #000000;
    margin: 0;
  }
  
  .completed-badge {
    background-color: #4CAF50;
    color: white;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  
  .branch-card p {
    font-size: 0.9rem;
    text-align: left;
    margin-bottom: 0;
    color: #555;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
  }
  
  .secondary-button {
    padding: 0.8rem 1.5rem;
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #CCCCCC;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .secondary-button:hover {
    background-color: #F5F5F5;
  }
  
  @media (max-width: 650px) {
    .branch-container {
      padding: 0.5rem;
    }
  }
</style> 