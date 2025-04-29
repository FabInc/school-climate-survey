<script>
  import { createEventDispatcher } from 'svelte';
  import { generateId } from './utils.js';
  
  export let node;
  export let category;
  export let recommendations = {};
  export let allNodes = [];
  
  // Make deep copy to avoid modifying parent's node directly
  let workingNode = JSON.parse(JSON.stringify(node));
  let nodeIdError = '';
  let linkError = '';
  
  // Tracking which next option should be removed
  let toRemoveKey = null;
  
  const dispatch = createEventDispatcher();
  
  function validateNodeId(id) {
    if (!id.trim()) {
      return 'Node ID is required';
    }
    
    // Check if ID is already being used by another node
    const isExistingNode = allNodes.some(n => n.id === id && n.id !== node.id);
    if (isExistingNode) {
      return 'This Node ID is already in use';
    }
    
    return '';
  }
  
  function handleAddNext() {
    const key = prompt('Enter key (option text like "yes", "no", etc.):');
    if (key && key.trim()) {
      // Validate option isn't duplicate
      if (workingNode.next && workingNode.next[key]) {
        alert(`Option "${key}" already exists.`);
        return;
      }
      
      // Ensure next exists
      if (!workingNode.next) {
        workingNode.next = {};
      }
      
      // Add default next endpoint
      workingNode.next[key] = 'end';
      workingNode = {...workingNode}; // Trigger reactivity
    }
  }
  
  function handleRemoveNext() {
    if (toRemoveKey && workingNode.next) {
      delete workingNode.next[toRemoveKey];
      workingNode = {...workingNode}; // Trigger reactivity
      toRemoveKey = null;
    }
  }
  
  function saveNode() {
    const updatedId = workingNode.id || generateId(category);
    nodeIdError = validateNodeId(updatedId);
    
    if (nodeIdError) {
      return;
    }
    
    // Check if we're linking to a node that doesn't exist
    linkError = '';
    if (workingNode.next) {
      for (const [key, value] of Object.entries(workingNode.next)) {
        if (value === 'end' || value.startsWith('rec:')) continue;
        
        // Check if the node exists
        const targetExists = allNodes.some(n => n.id === value);
        if (!targetExists) {
          linkError = `Target node "${value}" doesn't exist. Either create it or use a valid node ID.`;
          return;
        }
      }
    }
    
    if (linkError) {
      return;
    }
    
    dispatch('save', {
      category,
      nodeId: node.id,
      updatedNode: workingNode
    });
  }
  
  function cancel() {
    dispatch('cancel');
  }
  
  // For prefixing recommendation IDs in the select
  function getDisplayName(value) {
    if (value === 'end') return 'END';
    
    if (value.startsWith('rec:')) {
      const recId = value.replace('rec:', '');
      if (recommendations[recId]) {
        return `REC: ${recId} - ${recommendations[recId].text}`;
      }
      return `REC: ${recId}`;
    }
    
    return value;
  }
</script>

<div class="editor-panel">
  <div class="editor-panel-header">
    <h2 class="editor-panel-title">{node.id ? 'Edit Node' : 'New Node'}</h2>
  </div>
  
  <div class="editor-panel-body">
    <div class="form-group">
      <label for="node-id" class="form-label">Node ID</label>
      <input 
        type="text" 
        id="node-id" 
        placeholder="Enter node ID or leave blank to auto-generate"
        bind:value={workingNode.id}
        class="form-input {nodeIdError ? 'error' : ''}"
      />
      {#if nodeIdError}
        <div class="form-error">{nodeIdError}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="node-text" class="form-label">Question Text</label>
      <textarea 
        id="node-text" 
        placeholder="Enter the question text"
        bind:value={workingNode.text}
        class="form-textarea"
        rows="4"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="node-help" class="form-label">Help Text (Optional)</label>
      <textarea 
        id="node-help" 
        placeholder="Enter any help text to clarify the question"
        bind:value={workingNode.help}
        class="form-textarea"
        rows="3"
      ></textarea>
    </div>
    
    <!-- Next Options -->
    <div class="form-section">
      <div class="form-section-header">
        <h3 class="form-section-title">Navigation Options</h3>
        <button 
          on:click={handleAddNext}
          class="action-button primary-button small"
          type="button"
        >
          <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Option
        </button>
      </div>
      
      {#if linkError}
        <div class="alert alert-error">{linkError}</div>
      {/if}
      
      {#if workingNode.next && Object.keys(workingNode.next).length > 0}
        <div class="options-list">
          {#each Object.entries(workingNode.next) as [key, value]}
            <div class="option-item">
              <div class="option-key">{key}</div>
              
              <select 
                bind:value={workingNode.next[key]}
                class="form-select"
              >
                <option value="end">END (Visualization End)</option>
                
                <optgroup label="Go to Recommendation">
                  {#each Object.keys(recommendations) as recId}
                    <option value="rec:{recId}">
                      {recId} - {recommendations[recId].text.substring(0, 40)}...
                    </option>
                  {/each}
                </optgroup>
                
                <optgroup label="Go to Node">
                  {#each allNodes.filter(n => n.id !== node.id) as otherNode}
                    <option value={otherNode.id}>
                      {otherNode.id} - {otherNode.text.substring(0, 40)}...
                    </option>
                  {/each}
                </optgroup>
              </select>
              
              <button 
                on:click={() => toRemoveKey = key}
                class="icon-button delete-button"
                title="Remove this option"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state small">
          <svg class="empty-state-icon small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p class="empty-state-text">No options defined yet. Click "Add Option" to add navigation paths.</p>
        </div>
      {/if}
    </div>
    
    {#if toRemoveKey}
      <div class="confirm-dialog">
        <p>Remove option "{toRemoveKey}" that goes to {getDisplayName(workingNode.next[toRemoveKey])}?</p>
        <div class="confirm-actions">
          <button 
            on:click={() => toRemoveKey = null}
            class="action-button secondary-button"
          >
            Cancel
          </button>
          <button 
            on:click={handleRemoveNext}
            class="action-button danger-button"
          >
            Remove
          </button>
        </div>
      </div>
    {/if}
  </div>
  
  <div class="editor-panel-footer">
    <button 
      on:click={cancel}
      class="action-button secondary-button"
    >
      Cancel
    </button>
    <button 
      on:click={saveNode}
      class="action-button primary-button"
    >
      Save
    </button>
  </div>
</div> 