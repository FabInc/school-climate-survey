<script>
  import { createEventDispatcher } from 'svelte';
  import { flowchartStore } from './flowchartStore.js';
  
  export let node;
  export let category;
  export let recommendations;
  export let allNodes = [];
  
  const dispatch = createEventDispatcher();
  
  let editedNode = JSON.parse(JSON.stringify(node)); // Deep copy to avoid direct mutation
  let answers = Object.keys(editedNode.next || {}).map(answer => ({
    text: answer,
    nextId: editedNode.next[answer]
  }));
  
  // Generate unique ID for new nodes
  function generateNodeId(category) {
    const prefix = category.split('-').map(part => part[0]).join('');
    const existingIds = allNodes
      .filter(n => n.id.startsWith(prefix))
      .map(n => {
        const num = parseInt(n.id.replace(/^[a-z]+/, ''), 10);
        return isNaN(num) ? 0 : num;
      });
    
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `${prefix}${maxId + 1}`;
  }
  
  function addAnswer() {
    answers = [...answers, { text: '', nextId: 'end' }];
  }
  
  function removeAnswer(index) {
    answers = answers.filter((_, i) => i !== index);
  }
  
  function saveChanges() {
    // Convert answers array back to the next object format
    editedNode.next = {};
    answers.forEach(answer => {
      if (answer.text.trim()) {
        editedNode.next[answer.text] = answer.nextId;
      }
    });
    
    dispatch('save', { 
      category,
      nodeId: editedNode.id,
      updatedNode: editedNode
    });
  }
  
  function cancel() {
    dispatch('cancel');
  }
  
  // Get all node IDs from this category for the dropdown
  $: nodeOptions = allNodes
    .filter(n => n.id !== editedNode.id) // Exclude current node
    .map(n => ({
      id: n.id,
      text: `${n.id}: ${n.text.substring(0, 30)}${n.text.length > 30 ? '...' : ''}`
    }));
  
  // Get all recommendation IDs
  $: recommendationOptions = Object.keys(recommendations || {}).map(id => ({
    id,
    text: `${id}: ${recommendations[id].text.substring(0, 30)}${recommendations[id].text.length > 30 ? '...' : ''}`
  }));
</script>

<div class="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
  <h3 class="text-lg font-semibold mb-4">
    {node.id ? 'Edit Node' : 'Create New Node'}
  </h3>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">Node ID</label>
    <input 
      type="text" 
      bind:value={editedNode.id} 
      class="w-full p-2 border rounded"
      disabled={!!node.id} 
      placeholder={node.id ? '' : generateNodeId(category)}
    />
    {#if !node.id}
      <p class="text-xs text-gray-500 mt-1">ID will be auto-generated if left blank</p>
    {/if}
  </div>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">Question Text</label>
    <textarea 
      bind:value={editedNode.text} 
      class="w-full p-2 border rounded"
      rows="3"
      placeholder="Enter the question or decision point text"
    ></textarea>
  </div>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">Help Text (Optional)</label>
    <textarea 
      bind:value={editedNode.help} 
      class="w-full p-2 border rounded"
      rows="2"
      placeholder="Additional context or help text for this question"
    ></textarea>
  </div>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-2">Answers</label>
    {#each answers as answer, i}
      <div class="flex items-center gap-2 mb-2">
        <input 
          type="text" 
          bind:value={answer.text} 
          placeholder="Answer option (e.g., yes, no, maybe)"
          class="flex-1 p-2 border rounded"
        />
        <select 
          bind:value={answer.nextId} 
          class="p-2 border rounded w-60"
        >
          <option value="end">End (No next node)</option>
          <optgroup label="Questions">
            {#each nodeOptions as option}
              <option value={option.id}>{option.text}</option>
            {/each}
          </optgroup>
          <optgroup label="Recommendations">
            {#each recommendationOptions as option}
              <option value={option.id}>{option.text}</option>
            {/each}
          </optgroup>
        </select>
        <button 
          on:click={() => removeAnswer(i)}
          class="p-1 text-red-500 hover:bg-red-100 rounded"
          aria-label="Remove answer"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}
    
    <button 
      on:click={addAnswer}
      class="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded flex items-center text-sm"
    >
      <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add Answer
    </button>
  </div>
  
  <div class="flex justify-end gap-2 mt-6">
    <button 
      on:click={cancel}
      class="px-4 py-2 border rounded hover:bg-gray-100"
    >
      Cancel
    </button>
    <button 
      on:click={saveChanges}
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      disabled={!editedNode.text || !editedNode.id}
    >
      Save Changes
    </button>
  </div>
</div> 