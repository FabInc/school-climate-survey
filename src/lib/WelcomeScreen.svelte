<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function startAssessment() {
    dispatch('start');
  }
</script>

<div class="welcome-container">
  <h2>Welcome to the CRIBS Climate Assessment Tool</h2>
  <p>
    This tool helps  to assess climate-related risks in their schools and health centres. Based on your responses, it provides tailored recommendations for improvement. It is a beta version and for experimental purposes only. 
  </p>
  <button on:click={startAssessment}>Start Assessment</button>
</div>

<style lang="css">
  .welcome-container {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    background-color: #F5F5F5; /* Light Gray */
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #000000; /* Black */
    margin-bottom: 1rem;
  }

  p {
    color: #333333;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  button {
    background-color: #0066FF; /* Primary Blue */
    color: #FFFFFF; /* White */
    border: none;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #0052CC; /* Darker Blue */
  }
</style>
