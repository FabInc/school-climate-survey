<script>
  import { createEventDispatcher } from 'svelte';
  import { flowchartData } from './flowchartLogic.js';
  
  export let question = '';
  export let helpText = '';
  export let showHelp = false;
  export let currentCategory = '';
  export let questionId = '';
  
  const dispatch = createEventDispatcher();
  
  // Determine available answer options for this question
  let answerOptions = [];
  
  $: {
    if (currentCategory && questionId) {
      const currentQuestion = flowchartData[currentCategory]?.find(q => q.id === questionId);
      if (currentQuestion && currentQuestion.next) {
        answerOptions = Object.keys(currentQuestion.next);
      } else {
        // Default to yes/no if we can't find the question or its next options
        answerOptions = ['yes', 'no'];
      }
    } else {
      // Default to yes/no if category or questionId not provided
      answerOptions = ['yes', 'no'];
    }
  }
  
  // Function to get user-friendly label for answer options
  function getAnswerLabel(option) {
    const labels = {
      'yes': 'Yes',
      'no': 'No',
      'optionA': 'Option A',
      'optionB': 'Option B',
      'stormDamage': 'Storm Damage',
      'rottenTrigrees': 'Rotten Timber',
      'rotDisrepaired': 'Disrepair',
      'insectAttack': 'Insect Attack'
    };
    
    return labels[option] || option.charAt(0).toUpperCase() + option.slice(1);
  }
  
  function toggleHelp() {
    showHelp = !showHelp;
  }
  
  function answerQuestion(option) {
    dispatch('answer', { answer: option });
  }
</script>

<div class="question-card">
  <div class="question-content">
    <h3>{question}</h3>
    <button class="help-button" on:click={toggleHelp}>
      {showHelp ? 'Hide Help' : 'Show Help'}
    </button>
  </div>
  
  {#if showHelp}
    <div class="help-text">
      <p>{helpText}</p>
    </div>
  {/if}
  
  <div class="answer-buttons {answerOptions.length > 2 ? 'multi-options' : ''}">
    {#each answerOptions as option}
      <button 
        class="answer-button {option === 'yes' ? 'yes-button' : option === 'no' ? 'no-button' : 'option-button'}" 
        on:click={() => answerQuestion(option)}
      >
        {getAnswerLabel(option)}
      </button>
    {/each}
  </div>
</div>

<style lang="css">
  .question-card {
    background-color: #FFC04D; /* Yellow/Orange */
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 600px;
    margin: 2rem auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .question-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  h3 {
    color: #000000;
    margin: 0;
    flex: 1;
  }
  
  .help-button {
    background-color: #9966FF; /* Purple */
    color: #FFFFFF;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    margin-left: 1rem;
  }
  
  .help-text {
    background-color: #F5F5F5; /* Light Gray */
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .help-text p {
    margin: 0;
    color: #333333;
  }
  
  .answer-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .multi-options {
    flex-wrap: wrap;
  }
  
  .answer-button, .yes-button, .no-button, .option-button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
    min-width: 100px;
    margin-bottom: 0.5rem;
  }
  
  .yes-button {
    background-color: #0066FF; /* Primary Blue */
    color: #FFFFFF;
  }
  
  .no-button {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #CCCCCC;
  }
  
  .option-button {
    background-color: #66CCFF; /* Light Blue */
    color: #000000;
  }
  
  .yes-button:hover {
    background-color: #0052CC; /* Darker Blue */
  }
  
  .no-button:hover {
    background-color: #F5F5F5; /* Light Gray */
  }
  
  .option-button:hover {
    background-color: #33BBFF; /* Slightly darker light blue */
  }
  
  /* Responsive adjustments */
  @media (max-width: 650px) {
    .question-card {
      margin: 1rem;
      padding: 1rem;
    }
    
    .question-content {
      flex-direction: column;
    }
    
    .help-button {
      margin: 0.5rem 0 0 0;
      align-self: flex-end;
    }
    
    .multi-options {
      flex-direction: column;
    }
  }
</style>
