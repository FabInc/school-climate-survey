<script>
  import { createEventDispatcher } from 'svelte';
  
  export let recommendation;
  export let recommendationId;
  export let allRecommendations = {};
  
  const dispatch = createEventDispatcher();
  
  // Deep copy to avoid direct mutation
  let editedRecommendation = recommendation 
    ? JSON.parse(JSON.stringify(recommendation)) 
    : { text: '', icon: '💡', final: true };
  
  let editedId = recommendationId || '';
  
  // Common emoji options for recommendations
  const commonEmojis = [
    '💧', '🚰', '🌊', '🚿', '🚽', '♻️', '🏭', 
    '🌡️', '❄️', '🔥', '💨', '☁️', '🌤️', 
    '🌧️', '⚡', '🔌', '🔋', '💡', '🔍', 
    '🏠', '🏢', '🏫', '🏥', '🛠️', '🔧', 
    '🧰', '📝', '📋', '⚠️', '🚨', '🚫'
  ];
  
  function generateRecommendationId() {
    // Find highest rec_XX number
    const recIds = Object.keys(allRecommendations)
      .filter(id => id.startsWith('rec_'))
      .map(id => {
        const num = parseInt(id.replace('rec_', ''), 10);
        return isNaN(num) ? 0 : num;
      });
    
    const maxId = recIds.length > 0 ? Math.max(...recIds) : 0;
    return `rec_${maxId + 1}`;
  }
  
  function saveChanges() {
    // Use provided ID or generate a new one if creating new recommendation
    const finalId = editedId || generateRecommendationId();
    
    dispatch('save', { 
      recommendationId: finalId,
      updatedRecommendation: editedRecommendation
    });
  }
  
  function cancel() {
    dispatch('cancel');
  }
</script>

<div class="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
  <h3 class="text-lg font-semibold mb-4">
    {recommendationId ? 'Edit Recommendation' : 'Create New Recommendation'}
  </h3>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">Recommendation ID</label>
    <input 
      type="text" 
      bind:value={editedId} 
      class="w-full p-2 border rounded"
      disabled={!!recommendationId} 
      placeholder={recommendationId ? '' : generateRecommendationId()}
    />
    {#if !recommendationId}
      <p class="text-xs text-gray-500 mt-1">ID will be auto-generated if left blank (format: rec_XX)</p>
    {/if}
  </div>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">Recommendation Text</label>
    <textarea 
      bind:value={editedRecommendation.text} 
      class="w-full p-2 border rounded"
      rows="3"
      placeholder="Enter the recommendation text"
    ></textarea>
  </div>
  
  <div class="mb-4">
    <label class="block text-sm font-medium mb-1">Icon</label>
    <div class="flex flex-wrap gap-2 mb-2 p-2 border rounded bg-gray-50">
      {#each commonEmojis as emoji}
        <button 
          class="w-8 h-8 flex items-center justify-center rounded {editedRecommendation.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-200'}"
          on:click={() => editedRecommendation.icon = emoji}
        >
          {emoji}
        </button>
      {/each}
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm">Custom:</span>
      <input 
        type="text" 
        bind:value={editedRecommendation.icon} 
        class="p-2 border rounded w-20 text-center text-lg"
        maxlength="2"
      />
      <span class="text-xs text-gray-500">Emoji or 1-2 character symbol</span>
    </div>
  </div>
  
  <div class="mb-4">
    <label class="flex items-center">
      <input 
        type="checkbox" 
        bind:checked={editedRecommendation.final} 
        class="mr-2"
      />
      <span class="text-sm font-medium">This is a final recommendation (end of path)</span>
    </label>
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
      disabled={!editedRecommendation.text}
    >
      Save Changes
    </button>
  </div>
</div> 