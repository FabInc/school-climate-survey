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
  import './editor-styles.css';
  
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
      recommendation: JSON.parse(JSON.stringify(recommendation)),
      category: recommendation.category
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
      },
      category: activeCategory
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

<div class="editor-container">
  <div class="editor-header">
    <h1 class="editor-title">Flowchart Editor</h1>
    
    <div class="action-buttons flex gap-3">
      <button 
        on:click={handleSave}
        class="action-button success-button"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        Save
      </button>
      
      <button 
        on:click={handleExport}
        class="action-button info-button"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>
      
      <button 
        on:click={toggleImport}
        class="action-button secondary-button"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 10 12 15 7 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Import
      </button>
    </div>
  </div>

  {#if showSavedMessage}
    <div class="alert alert-success mb-4">
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Flowchart saved successfully!</span>
    </div>
  {/if}
  
  {#if isImporting}
    <div class="modal-content mb-4">
      <div class="modal-header">
        <h3 class="modal-title">Import Flowchart Data</h3>
      </div>
      <div class="form-group">
        <textarea 
          bind:value={importText} 
          class="form-textarea"
          rows="8"
          placeholder="Paste JSON here..."
        ></textarea>
      </div>
      <div class="form-buttons">
        <button 
          on:click={toggleImport}
          class="action-button secondary-button"
        >
          Cancel
        </button>
        <button 
          on:click={handleImport}
          class="action-button primary-button"
        >
          Import
        </button>
      </div>
    </div>
  {/if}
  
  <div class="categories-grid">
    {#each Object.keys($flowchartStore).filter(key => key !== 'recommendations') as category}
      <div 
        class="category-card {activeCategory === category ? 'active' : ''}"
        on:click={() => activeCategory = category}
      >
        <div 
          class="category-card-color"
          style="background-color: {getCategoryColor(category)};"
        ></div>
        <h2 class="category-title capitalize">
          {category.replace(/-/g, ' ')}
        </h2>
        <p class="category-count">
          {$flowchartStore[category].length} decision points
        </p>
      </div>
    {/each}
    
    <div 
      class="add-category-card"
      on:click={handleAddCategory}
    >
      <svg class="add-category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span class="add-category-text">Add New Category</span>
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
            class="icon-button delete-button ml-2"
            title="Delete this category"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
        
        <div class="flex gap-2">
          <div class="tab-container">
            <button 
              class="tab-button {activeTab === 'nodes' ? 'active' : ''}" 
              on:click={() => activeTab = 'nodes'}
            >
              Nodes
            </button>
            <button 
              class="tab-button {activeTab === 'recommendations' ? 'active' : ''}" 
              on:click={() => activeTab = 'recommendations'}
            >
              Recommendations
            </button>
          </div>
          
          {#if activeTab === 'nodes'}
            <button 
              on:click={startCreatingNode}
              class="action-button primary-button"
            >
              <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Node
            </button>
          {:else}
            <button 
              on:click={startCreatingRecommendation}
              class="action-button primary-button"
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
            class="search-input"
          />
        </div>
        
        <div class="space-y-2">
          {#each filteredNodes as node}
            <div class="node-card">
              <div 
                class="node-card-color"
                style="background-color: {getCategoryColor(activeCategory)};"
              ></div>
              
              <div class="node-title">{node.text}</div>
              <div class="node-id">ID: {node.id}</div>
              
              {#if node.next}
                <div class="node-options">
                  Options: {Object.keys(node.next).join(', ')}
                </div>
              {/if}
              
              <div class="node-actions">
                <button 
                  on:click={() => startEditingNode(node)}
                  class="icon-button edit-button"
                  title="Edit node"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                
                <button 
                  on:click={() => handleDeleteNode(node.id)}
                  class="icon-button delete-button"
                  title="Delete node"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <div class="empty-state">
              <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <line x1="9" y1="12" x2="15" y2="12"></line>
              </svg>
              <p class="empty-state-text">
                {nodeSearchQuery ? 'No nodes matching your search' : 'No nodes in this category yet. Click "Add Node" to create one.'}
              </p>
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
            class="search-input"
          />
        </div>
        
        <div class="space-y-2">
          {#each filteredRecommendations as rec}
            <div class="node-card">
              <div class="flex items-start">
                <div class="mr-3 text-2xl">{rec.icon || '💡'}</div>
                <div class="flex-1">
                  <div class="node-title">{rec.text}</div>
                  <div class="node-id">ID: {rec.id}</div>
                </div>
              </div>
              
              <div class="node-actions">
                <button 
                  on:click={() => startEditingRecommendation(rec.id, rec)}
                  class="icon-button edit-button"
                  title="Edit recommendation"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                
                <button 
                  on:click={() => handleDeleteRecommendation(rec.id)}
                  class="icon-button delete-button"
                  title="Delete recommendation"
                >
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <div class="empty-state">
              <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <p class="empty-state-text">
                {recommendationSearchQuery 
                  ? 'No recommendations matching your search' 
                  : 'No recommendations available yet. Click "Add Recommendation" to create one.'}
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Modal for Node Editing -->
  {#if editingNode}
    <div class="modal-overlay">
      <div class="modal-content max-w-2xl">
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
    <div class="modal-overlay">
      <div class="modal-content max-w-2xl">
        <RecommendationEditor
          recommendation={editingRecommendation.recommendation}
          category={editingRecommendation.category}
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