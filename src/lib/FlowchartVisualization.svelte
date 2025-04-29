<script>
  import { flowchartData } from './flowchartLogic.js';
  import DecisionNode from './DecisionNode.svelte';
  
  let activeCategory = null;
  let expandedNodes = {};
  let tooltipInfo = { visible: false, text: '', x: 0, y: 0 };

  // Define colors for different categories
  const categoryColors = {
    'water-supply': '#2196F3', // Blue
    'water-demand': '#4CAF50', // Green
    'dust-impacts': '#FFC107', // Amber
    'heat-impacts': '#FF5722', // Deep Orange
    'rainwater-entry': '#3F51B5', // Indigo
    'flood-management': '#00BCD4', // Cyan
    'wildfire-impacts': '#F44336', // Red
    'electricity-supply': '#9C27B0', // Purple
    'rain-noise': '#607D8B', // Blue Grey
    'air-quality': '#8BC34A'  // Light Green
  };

  // Handle category selection
  function handleCategoryClick(category) {
    activeCategory = activeCategory === category ? null : category;
    // Reset expanded nodes when changing categories
    expandedNodes = {};
  }

  // Handle node expansion
  function handleToggleNode(event) {
    const { nodeId } = event.detail;
    console.log('Handling toggle node:', nodeId, 'Current state:', expandedNodes[nodeId]);
    
    // Create a new object to ensure reactivity
    expandedNodes = {
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    };
    
    console.log('Updated expandedNodes:', expandedNodes, 'New state for', nodeId, ':', !expandedNodes[nodeId]);
  }

  // Handle tooltip event from child component
  function handleShowTooltip(event) {
    const { e, helpText } = event.detail;
    const x = e.clientX;
    const y = e.clientY;
    
    tooltipInfo = {
      visible: true,
      text: helpText,
      x,
      y
    };
  }

  // Hide tooltip
  function hideTooltip() {
    tooltipInfo = { ...tooltipInfo, visible: false };
  }
</script>

<div class="max-w-full">
  <h1 class="text-2xl font-bold mb-4">School Facility Management Decision Trees</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
    {#each Object.keys(flowchartData).filter(key => key !== 'recommendations') as category}
      <div 
        class="p-4 rounded-lg shadow cursor-pointer transition-all {activeCategory === category ? 'ring-2 ring-offset-2' : 'hover:shadow-md'}"
        style="
          background-color: {categoryColors[category] + '10'};
          border-left: 4px solid {categoryColors[category] || '#CBD5E0'};
          {activeCategory === category ? `ring-color: ${categoryColors[category]};` : ''}
        "
        on:click={() => handleCategoryClick(category)}
      >
        <h2 class="text-lg font-semibold capitalize">
          {category.replace(/-/g, ' ')}
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          {flowchartData[category].length} decision points
        </p>
      </div>
    {/each}
  </div>

  {#if activeCategory}
    <div class="mt-6 border-t pt-4">
      <h2 class="text-xl font-semibold capitalize mb-4" style="color: {categoryColors[activeCategory]}">
        {activeCategory.replace(/-/g, ' ')} Decision Tree
      </h2>
      <div class="space-y-2">
        {#each flowchartData[activeCategory].filter(node => node.id.endsWith('1')) as startNode}
          <DecisionNode 
            nodeId={startNode.id} 
            category={activeCategory} 
            level={0} 
            {expandedNodes} 
            {categoryColors}
            on:toggleNode={handleToggleNode}
            on:showTooltip={handleShowTooltip}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Tooltip -->
  {#if tooltipInfo.visible}
    <div 
      class="fixed bg-white p-3 rounded shadow-lg max-w-xs z-50 text-sm"
      style="top: {tooltipInfo.y + 10}px; left: {tooltipInfo.x + 10}px;"
      on:mouseleave={hideTooltip}
    >
      {tooltipInfo.text}
    </div>
  {/if}
</div>

<style>
  /* Add any custom styles here */
  h1, h2 {
    font-family: var(--font-heading);
  }
</style> 