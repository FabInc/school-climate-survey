<script>
  export let progress = 0; // Progress percentage (0-100)
</script>

<header>
  <h1>CRIBS Climate Assessment Tool</h1>
  
  <div class="actions-container">
    <!-- Slot for navigation buttons -->
    <slot></slot>
    
    {#if progress > 0}
      <div class="progress-container">
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: {progress}%;"></div>
        </div>
        <span>{progress}% Complete</span>
      </div>
    {/if}
  </div>
</header>

<style lang="css">
  header {
    background-color: #0066FF; /* Primary Blue */
    color: #FFFFFF; /* White */
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .actions-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .progress-container {
    display: flex;
    align-items: center;
  }

  .progress-bar-container {
    width: 150px;
    height: 10px;
    background-color: #FFFFFF; /* White */
    border-radius: 5px;
    overflow: hidden;
    margin-left: 1rem;
  }

  .progress-bar {
    height: 100%;
    background-color: #FFC04D; /* Yellow/Orange */
    transition: width 0.3s ease-in-out;
  }

  span {
    margin-left: 0.5rem;
    font-size: 0.9rem;
  }

  /* Basic responsiveness */
  @media (max-width: 768px) {
    header {
      flex-direction: column;
      align-items: flex-start;
      padding: 1rem;
    }
    
    h1 {
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
    }
    
    .actions-container {
      flex-direction: column;
      width: 100%;
      align-items: flex-start;
      gap: 0.5rem;
    }
    
    .progress-container {
      width: 100%;
      margin-top: 0.5rem;
    }
    
    .progress-bar-container {
      width: 100%;
      margin-left: 0;
    }
  }
</style>
