<script>
  import { onMount } from 'svelte';
  import { 
    flowchartStore, 
    updateNode, 
    addNode, 
    deleteNode, 
    addCategory, 
    deleteCategory,
    updateRecommendation,
    addRecommendation,
    deleteRecommendation,
    saveFlowchart,
    loadFlowchart, 
    exportFlowchart, 
    importFlowchart 
  } from './flowchartStore.js';
  import NodeEditor from './NodeEditor.svelte';
  import RecommendationEditor from './RecommendationEditor.svelte';
  
  let activeCategory = null;
  let editingNode = null;
  let editingRecommendation = null;
  let isCreatingNode = false;
  let isCreatingRecommendation = false;
  let activeTab = 'nodes'; // 'nodes' or 'recommendations'
  let isImporting = false;
  let importText = '';
  let filteredNodes = [];
  let nodeSearchQuery = '';
  let recommendationSearchQuery = '';
  let filteredRecommendations = [];
  let showSavedMessage = false;

  // Define colors for different categories (same as in visualization)
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
  
  // Load saved data on component mount
  onMount(() => {
    loadFlowchart();
  });

  // Filter nodes when search query changes
  $: {
    if (activeCategory && $flowchartStore[activeCategory]) {
      filteredNodes = $flowchartStore[activeCategory].filter(node => 
        nodeSearchQuery === '' || 
        node.id.toLowerCase().includes(nodeSearchQuery.toLowerCase()) || 
        node.text.toLowerCase().includes(nodeSearchQuery.toLowerCase())
      );
    } else {
      filteredNodes = [];
    }
  }

  // Filter recommendations when search query changes
  $: {
    if ($flowchartStore.recommendations) {
      filteredRecommendations = Object.entries($flowchartStore.recommendations)
        .filter(([id, rec]) => 
          recommendationSearchQuery === '' || 
          id.toLowerCase().includes(recommendationSearchQuery.toLowerCase()) || 
          rec.text.toLowerCase().includes(recommendationSearchQuery.toLowerCase())
        )
        .map(([id, rec]) => ({ id, ...rec }));
    } else {
      filteredRecommendations = [];
    }
  }
  
  function startEditingNode(node) {
    editingNode = { 
      node: JSON.parse(JSON.stringify(node)), 
      category: activeCategory 
    };
    isCreatingNode = false;
  }
  
  function startCreatingNode() {
    isCreatingNode = true;
    editingNode = { 
      node: {
        id: '', // Will be generated
        text: '',
        help: '',
        next: { 'yes': 'end', 'no': 'end' } // Default options
      }, 
      category: activeCategory 
    };
  }

  function startEditingRecommendation(id, recommendation) {
    editingRecommendation = {
      recommendationId: id,
      recommendation: JSON.parse(JSON.stringify(recommendation))
    };
    isCreatingRecommendation = false;
  }

  function startCreatingRecommendation() {
    isCreatingRecommendation = true;
    editingRecommendation = {
      recommendationId: '',
      recommendation: {
        text: '',
        icon: '💡',
        final: true
      }
    };
  }
  
  function handleNodeSave(event) {
    const { category, nodeId, updatedNode } = event.detail;
    
    if (isCreatingNode) {
      const finalNodeId = nodeId || generateNodeId(category);
      const finalNode = {
        ...updatedNode,
        id: finalNodeId
      };
      addNode(category, finalNode);
    } else {
      updateNode(category, nodeId, updatedNode);
    }
    
    editingNode = null;
    isCreatingNode = false;
  }

  function handleRecommendationSave(event) {
    const { recommendationId, updatedRecommendation } = event.detail;
    
    if (isCreatingRecommendation) {
      addRecommendation(recommendationId, updatedRecommendation);
    } else {
      updateRecommendation(recommendationId, updatedRecommendation);
    }
    
    editingRecommendation = null;
    isCreatingRecommendation = false;
  }
  
  function handleCancel() {
    editingNode = null;
    editingRecommendation = null;
    isCreatingNode = false;
    isCreatingRecommendation = false;
  }
  
  function handleDeleteNode(nodeId) {
    if (confirm(`Are you sure you want to delete this node (${nodeId})? This action cannot be undone.`)) {
      deleteNode(activeCategory, nodeId);
    }
  }

  function handleDeleteRecommendation(id) {
    if (confirm(`Are you sure you want to delete this recommendation (${id})? This action cannot be undone.`)) {
      deleteRecommendation(id);
    }
  }
  
  function handleAddCategory() {
    const categoryName = prompt('Enter new category name (use kebab-case, e.g., "my-category"):');
    if (categoryName && categoryName.trim()) {
      const formatted = categoryName.trim().toLowerCase().replace(/\s+/g, '-');
      addCategory(formatted);
      activeCategory = formatted;
    }
  }

  function handleDeleteCategory() {
    if (activeCategory && confirm(`Are you sure you want to delete the entire "${activeCategory}" category? This action cannot be undone.`)) {
      deleteCategory(activeCategory);
      activeCategory = null;
    }
  }
  
  function handleSave() {
    const success = saveFlowchart();
    if (success) {
      showSavedMessage = true;
      setTimeout(() => {
        showSavedMessage = false;
      }, 3000);
    } else {
      alert('Failed to save. This may be due to storage limitations in your browser.');
    }
  }
  
  function handleExport() {
    const jsonData = exportFlowchart();
    console.log('Exported JSON data:', jsonData);
  }
  
  function toggleImport() {
    isImporting = !isImporting;
    importText = '';
  }
  
  function handleImport() {
    try {
      const success = importFlowchart(importText);
      if (success) {
        alert('Flowchart imported successfully!');
        isImporting = false;
      } else {
        alert('Failed to import flowchart. Please check the JSON format.');
      }
    } catch (e) {
      alert(`Error importing: ${e.message}`);
    }
  }

  // Generate unique ID for new nodes
  function generateNodeId(category) {
    if (!category) return '';

    const prefix = category.split('-').map(part => part[0]).join('');
    const existingIds = ($flowchartStore[category] || [])
      .filter(n => n.id.startsWith(prefix))
      .map(n => {
        const num = parseInt(n.id.replace(/^[a-z]+/, ''), 10);
        return isNaN(num) ? 0 : num;
      });
    
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `${prefix}${maxId + 1}`;
  }

  // Get color for category, or generate one if it doesn't exist
  function getCategoryColor(category) {
    if (categoryColors[category]) return categoryColors[category];
    
    // Generate a consistent color based on the category name
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 50%)`;
  }
</script>

<div class="max-w-full">
  <div class="flex justify-between items-center mb-4">
    <h1 class="text-2xl font-bold">Flowchart Editor</h1>
    
    <div class="flex gap-2">
      <button 
        on:click={handleSave}
        class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
      >
        <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save
      </button>
      
      <button 
        on:click={handleExport}
        class="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
      >
        <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
      
      <button 
        on:click={toggleImport}
        class="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
      >
        <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 10 12 15 7 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Import
      </button>
    </div>
  </div>

  {#if showSavedMessage}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Flowchart saved successfully!</span>
    </div>
  {/if}
  
  {#if isImporting}
    <div class="bg-white p-4 rounded-lg shadow-lg mb-4">
      <h3 class="text-lg font-semibold mb-2">Import Flowchart Data</h3>
      <textarea 
        bind:value={importText} 
        class="w-full p-2 border rounded"
        rows="8"
        placeholder="Paste JSON here..."
      ></textarea>
      <div class="flex justify-end gap-2 mt-3">
        <button 
          on:click={toggleImport}
          class="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button 
          on:click={handleImport}
          class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Import
        </button>
      </div>
    </div>
  {/if}
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
    {#each Object.keys($flowchartStore).filter(key => key !== 'recommendations') as category}
      <div 
        class="p-4 rounded-lg shadow cursor-pointer transition-all {activeCategory === category ? 'ring-2 ring-offset-2' : 'hover:shadow-md'}"
        style="
          background-color: {getCategoryColor(category) + '10'};
          border-left: 4px solid {getCategoryColor(category)};
          {activeCategory === category ? `ring-color: ${getCategoryColor(category)};` : ''}
        "
        on:click={() => activeCategory = category}
      >
        <h2 class="text-lg font-semibold capitalize">
          {category.replace(/-/g, ' ')}
        </h2>
        <p class="text-sm text-gray-600 mt-1">
          {$flowchartStore[category].length} decision points
        </p>
      </div>
    {/each}
    
    <div 
      class="p-4 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50"
      on:click={handleAddCategory}
    >
      <div class="text-center">
        <svg class="w-8 h-8 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span class="block mt-1 text-sm text-gray-500">Add New Category</span>
      </div>
    </div>
  </div>
  
  {#if activeCategory}
    <div class="mt-6 border-t pt-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <h2 class="text-xl font-semibold capitalize" style="color: {getCategoryColor(activeCategory)}">
            {activeCategory.replace(/-/g, ' ')}
          </h2>
          <button 
            on:click={handleDeleteCategory}
            class="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
            title="Delete this category"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
        
        <div class="flex gap-2">
          <div class="flex border rounded overflow-hidden">
            <button 
              class="px-3 py-1 {activeTab === 'nodes' ? 'bg-blue-500 text-white' : 'bg-gray-100'}" 
              on:click={() => activeTab = 'nodes'}
            >
              Nodes
            </button>
            <button 
              class="px-3 py-1 {activeTab === 'recommendations' ? 'bg-blue-500 text-white' : 'bg-gray-100'}" 
              on:click={() => activeTab = 'recommendations'}
            >
              Recommendations
            </button>
          </div>
          
          {#if activeTab === 'nodes'}
            <button 
              on:click={startCreatingNode}
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded flex items-center text-sm"
            >
              <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Node
            </button>
          {:else}
            <button 
              on:click={startCreatingRecommendation}
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded flex items-center text-sm"
            >
              <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Recommendation
            </button>
          {/if}
        </div>
      </div>
      
      {#if activeTab === 'nodes'}
        <div class="mb-4">
          <input 
            type="text"
            placeholder="Search nodes..."
            bind:value={nodeSearchQuery}
            class="w-full p-2 border rounded"
          />
        </div>
        
        <div class="space-y-2">
          {#each filteredNodes as node}
            <div 
              class="p-3 rounded-lg shadow-sm flex items-start relative hover:shadow-md"
              style="
                background-color: {getCategoryColor(activeCategory) + '20'};
                border-left: 4px solid {getCategoryColor(activeCategory)};
              "
            >
              <div class="flex-1">
                <div class="font-medium">{node.text}</div>
                <div class="text-sm text-gray-500 mt-1">ID: {node.id}</div>
                {#if node.next}
                  <div class="text-xs text-gray-500 mt-1">
                    Options: {Object.keys(node.next).join(', ')}
                  </div>
                {/if}
              </div>
              
              <div class="flex">
                <button 
                  on:click={() => startEditingNode(node)}
                  class="p-1.5 hover:bg-blue-100 rounded-full text-blue-600"
                  title="Edit node"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                
                <button 
                  on:click={() => handleDeleteNode(node.id)}
                  class="p-1.5 hover:bg-red-100 rounded-full text-red-600"
                  title="Delete node"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
          
          {#if filteredNodes.length === 0}
            <div class="p-4 text-center text-gray-500">
              {nodeSearchQuery ? 'No nodes matching your search' : 'No nodes in this category yet'}
            </div>
          {/if}
        </div>
      {:else}
        <!-- Recommendations Tab -->
        <div class="mb-4">
          <input 
            type="text"
            placeholder="Search recommendations..."
            bind:value={recommendationSearchQuery}
            class="w-full p-2 border rounded"
          />
        </div>
        
        <div class="space-y-2">
          {#each filteredRecommendations as rec}
            <div 
              class="p-3 rounded-lg shadow-sm flex items-start relative hover:shadow-md"
              style="background-color: rgba(100, 100, 100, 0.05);"
            >
              <div class="mr-3 text-2xl">{rec.icon || '💡'}</div>
              <div class="flex-1">
                <div class="font-medium">{rec.text}</div>
                <div class="text-sm text-gray-500 mt-1">ID: {rec.id}</div>
              </div>
              
              <div class="flex">
                <button 
                  on:click={() => startEditingRecommendation(rec.id, rec)}
                  class="p-1.5 hover:bg-blue-100 rounded-full text-blue-600"
                  title="Edit recommendation"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                
                <button 
                  on:click={() => handleDeleteRecommendation(rec.id)}
                  class="p-1.5 hover:bg-red-100 rounded-full text-red-600"
                  title="Delete recommendation"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
          
          {#if filteredRecommendations.length === 0}
            <div class="p-4 text-center text-gray-500">
              {recommendationSearchQuery 
                ? 'No recommendations matching your search' 
                : 'No recommendations available yet'}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Modal for Node Editing -->
  {#if editingNode}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <NodeEditor 
          node={editingNode.node} 
          category={editingNode.category}
          recommendations={$flowchartStore.recommendations || {}}
          allNodes={$flowchartStore[activeCategory] || []}
          on:save={handleNodeSave}
          on:cancel={handleCancel}
        />
      </div>
    </div>
  {/if}

  <!-- Modal for Recommendation Editing -->
  {#if editingRecommendation}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <RecommendationEditor 
          recommendation={editingRecommendation.recommendation} 
          recommendationId={editingRecommendation.recommendationId}
          allRecommendations={$flowchartStore.recommendations || {}}
          on:save={handleRecommendationSave}
          on:cancel={handleCancel}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  /* Add any custom styles here */
  h1, h2 {
    font-family: var(--font-heading);
  }
</style> 