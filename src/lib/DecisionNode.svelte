<script>
  import { createEventDispatcher } from 'svelte';
  import { flowchartData } from './flowchartLogic.js';
  
  export let nodeId;
  export let category;
  export let level = 0;
  export let expandedNodes = {};
  export let categoryColors;
  
  const dispatch = createEventDispatcher();
  
  // Find node data by ID
  function findNodeById(id, category) {
    if (!flowchartData || !flowchartData[category]) return null;
    return flowchartData[category].find(node => node.id === id);
  }

  // Find recommendation by ID
  function findRecommendationById(id) {
    if (!flowchartData || !flowchartData.recommendations) return null;
    return flowchartData.recommendations[id];
  }
  
  $: node = findNodeById(nodeId, category);
  $: recommendation = !node ? findRecommendationById(nodeId) : null;
  $: isExpanded = expandedNodes[nodeId];
  $: indentLevel = level * 16;
  
  function toggleNodeExpansion() {
    console.log('Toggling node:', nodeId);
    dispatch('toggleNode', { nodeId });
  }
  
  function showTooltip(e, helpText) {
    e.preventDefault();
    e.stopPropagation();
    dispatch('showTooltip', { e, helpText });
  }
</script>

{#if !nodeId}
  <!-- Return null if no nodeId -->
{:else if !node && recommendation}
  <div 
    class="p-3 rounded-lg border border-dashed mt-2 flex items-center"
    style="
      border-color: {categoryColors[category] || '#CBD5E0'};
      margin-left: {indentLevel + 24}px;
    "
  >
    <span class="mr-2 text-xl">{recommendation.icon}</span>
    <span class="font-medium">{recommendation.text}</span>
  </div>
{:else if node}
  <div class="decision-node-container mb-4">
    <!-- Node header - always visible -->
    <div 
      class="p-3 rounded-lg shadow-sm flex items-start cursor-pointer relative hover:shadow-md transition-all"
      style="
        background-color: {categoryColors[category] + '20'};
        border-left: 4px solid {categoryColors[category] || '#CBD5E0'};
        margin-left: {indentLevel}px;
      "
      on:click={toggleNodeExpansion}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && toggleNodeExpansion()}
      aria-expanded={isExpanded}
    >
      <div class="mr-2 mt-1 flex-shrink-0 w-5 h-5 transition-transform duration-200" 
          style="transform: {isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
      <div class="flex-1">
        <div class="font-medium">{node.text}</div>
      </div>
      {#if node.help}
        <button 
          class="ml-2 p-1 hover:bg-gray-200 rounded-full"
          on:click={(e) => showTooltip(e, node.help)}
          aria-label="Show help information"
        >
          <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      {/if}
    </div>

    <!-- Expanded content - only visible when expanded -->
    {#if isExpanded && node.next}
      <div class="ml-8 mt-2" style="margin-left: {indentLevel + 16}px;">
        {#if typeof node.next === 'object'}
          {#each Object.entries(node.next) as [answer, nextNodeId]}
            <div class="mb-2 answer-path">
              <div class="flex items-center mb-1">
                <div class="px-3 py-1 rounded bg-gray-200 text-gray-800 text-sm mr-2 flex items-center">
                  <svg class="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {answer}
                </div>
                <div class="h-px flex-1 bg-gray-300"></div>
              </div>
              
              {#if Array.isArray(nextNodeId)}
                {#each nextNodeId as id}
                  <svelte:self nodeId={id} {category} level={level + 1} {expandedNodes} {categoryColors} on:toggleNode on:showTooltip />
                {/each}
              {:else if nextNodeId !== 'end'}
                <svelte:self nodeId={nextNodeId} {category} level={level + 1} {expandedNodes} {categoryColors} on:toggleNode on:showTooltip />
              {:else}
                <div class="p-3 rounded-lg border border-dashed mt-2 flex items-center" 
                    style="
                      border-color: {categoryColors[category] || '#CBD5E0'};
                      margin-left: 8px;
                    ">
                  <span class="font-medium">End of this path</span>
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .decision-node-container {
    position: relative;
  }
  
  .answer-path::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #e2e8f0;
  }
  
  [role="button"]:hover {
    filter: brightness(0.95);
  }
  
  [role="button"]:focus {
    outline: 2px solid #4299e1;
    outline-offset: 2px;
  }
</style> 