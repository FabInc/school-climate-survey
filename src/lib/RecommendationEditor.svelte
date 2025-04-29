<script>
  import { createEventDispatcher } from 'svelte';
  import { generateId } from './utils.js';
  
  export let recommendation;
  export let category;
  export let allRecommendations = [];
  
  // Make deep copy to avoid modifying parent's recommendation directly
  let workingRec = JSON.parse(JSON.stringify(recommendation));
  let recIdError = '';
  
  const dispatch = createEventDispatcher();
  
  function validateRecId(id) {
    if (!id.trim()) {
      return 'Recommendation ID is required';
    }
    
    // Check if ID is already being used by another recommendation
    const isExistingRec = allRecommendations.some(r => r.id === id && r.id !== recommendation.id);
    if (isExistingRec) {
      return 'This Recommendation ID is already in use';
    }
    
    return '';
  }
  
  function saveRecommendation() {
    const updatedId = workingRec.id || generateId(`${category}-rec`);
    recIdError = validateRecId(updatedId);
    
    if (recIdError) {
      return;
    }
    
    // Add ID to the working copy if it's a new recommendation
    if (!workingRec.id) {
      workingRec.id = updatedId;
    }
    
    dispatch('save', {
      category,
      recId: recommendation.id,
      updatedRecommendation: workingRec
    });
  }
  
  function cancel() {
    dispatch('cancel');
  }
</script>

<div class="editor-panel">
  <div class="editor-panel-header">
    <h2 class="editor-panel-title">{recommendation.id ? 'Edit Recommendation' : 'New Recommendation'}</h2>
  </div>
  
  <div class="editor-panel-body">
    <div class="form-group">
      <label for="rec-id" class="form-label">Recommendation ID</label>
      <input 
        type="text" 
        id="rec-id" 
        placeholder="Enter recommendation ID or leave blank to auto-generate"
        bind:value={workingRec.id}
        class="form-input {recIdError ? 'error' : ''}"
      />
      {#if recIdError}
        <div class="form-error">{recIdError}</div>
      {/if}
    </div>
    
    <div class="form-group">
      <label for="rec-text" class="form-label">Recommendation Text</label>
      <textarea 
        id="rec-text" 
        placeholder="Enter the recommendation text"
        bind:value={workingRec.text}
        class="form-textarea"
        rows="6"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="rec-description" class="form-label">Description (Optional)</label>
      <textarea 
        id="rec-description" 
        placeholder="Enter additional details about this recommendation"
        bind:value={workingRec.description}
        class="form-textarea"
        rows="4"
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="rec-reference" class="form-label">Reference (Optional)</label>
      <input 
        type="text" 
        id="rec-reference" 
        placeholder="Enter any reference information"
        bind:value={workingRec.reference}
        class="form-input"
      />
    </div>
    
    <div class="form-group">
      <label class="form-label">Priority</label>
      <div class="radio-group">
        <label class="radio-label">
          <input 
            type="radio" 
            name="priority" 
            value="high" 
            bind:group={workingRec.priority}
          />
          <span class="radio-text priority-high">High</span>
        </label>
        
        <label class="radio-label">
          <input 
            type="radio" 
            name="priority" 
            value="medium" 
            bind:group={workingRec.priority}
          />
          <span class="radio-text priority-medium">Medium</span>
        </label>
        
        <label class="radio-label">
          <input 
            type="radio" 
            name="priority" 
            value="low" 
            bind:group={workingRec.priority}
          />
          <span class="radio-text priority-low">Low</span>
        </label>
      </div>
    </div>
  </div>
  
  <div class="editor-panel-footer">
    <button 
      on:click={cancel}
      class="action-button secondary-button"
    >
      Cancel
    </button>
    <button 
      on:click={saveRecommendation}
      class="action-button primary-button"
    >
      Save
    </button>
  </div>
</div> 