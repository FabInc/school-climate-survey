<script>
  import { createEventDispatcher } from 'svelte';
  import { flowchartData } from './flowchartLogic.js';
  
  // Dynamically generate categories from flowchartData
  const categoryIcons = {
    'water-supply': '💧',
    'water-demand': '🚰',
    'dust-impacts': '💨',
    'heat-impacts': '🔆',
    'rainwater-entry': '🌧️',
    'flood-management': '🌊',
    'wildfire-impacts': '🔥',
    'electricity-supply': '⚡',
    'air-quality': '🌬️',
    'rain-noise': '🔊'
  };
  
  const categoryTitles = {
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
  
  const categoryDescriptions = {
    'water-supply': 'Assess if your water supply is sufficient and reliable.',
    'water-demand': 'Evaluate if water demand can be reduced or managed better.',
    'dust-impacts': 'Assess how airborne dust affects your school environment.',
    'heat-impacts': 'Evaluate heat issues and cooling solutions.',
    'rainwater-entry': 'Address problems with rainwater entering buildings.',
    'flood-management': 'Manage flood risks and mitigation strategies.',
    'wildfire-impacts': 'Assess wildfire risks and protection measures.',
    'electricity-supply': 'Evaluate electricity supply and consumption.',
    'air-quality': 'Address indoor and outdoor air quality issues.',
    'rain-noise': 'Evaluate and mitigate noise from rain impacting building usability.'
  };
  
  // Generate categories array from flowchartData keys
  export let categories = Object.keys(flowchartData)
    .filter(key => key !== 'recommendations') // Exclude the recommendations object
    .map(categoryId => ({
      id: categoryId,
      title: categoryTitles[categoryId] || categoryId,
      description: categoryDescriptions[categoryId] || `Assess ${categoryId.replace('-', ' ')} issues.`,
      icon: categoryIcons[categoryId] || '📋'
    }));
  
  const dispatch = createEventDispatcher();
  
  function selectCategory(categoryId) {
    dispatch('select', { detail: categoryId });
  }
</script>

<div class="categories-container">
  <h2>Select Assessment Category</h2>
  <p>Choose one of the following categories to begin your assessment:</p>
  
  <div class="category-cards">
    {#each categories as category}
      <div class="category-card" on:click={() => selectCategory(category.id)}>
        <div class="icon">{category.icon}</div>
        <h3>{category.title}</h3>
        <p>{category.description}</p>
      </div>
    {/each}
  </div>
</div>

<style lang="css">
  .categories-container {
    max-width: 900px;
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
  
  .category-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
  }
  
  .category-card {
    background-color: #FFC04D; /* Yellow/Orange */
    border-radius: 8px;
    padding: 1.5rem;
    width: 250px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
  }
  
  h3 {
    color: #000000;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  .category-card p {
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 0;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .category-card {
      width: 100%;
    }
  }
</style>
