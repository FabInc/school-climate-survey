<script>
  export let recommendation = '';
  export let icon = '';
</script>

<div class="recommendation-card">
  <div class="icon">{icon}</div>
  <p>{recommendation}</p>
</div>

<style lang="css">
  .recommendation-card {
    background-color: #0066FF; /* Primary Blue */
    color: #FFFFFF;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 600px;
    margin: 1rem auto;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    font-size: 2rem;
    margin-right: 1rem;
    min-width: 40px;
    text-align: center;
  }
  
  p {
    margin: 0;
    line-height: 1.5;
  }
  
  /* Responsive adjustments */
  @media (max-width: 650px) {
    .recommendation-card {
      margin: 1rem;
      padding: 1rem;
      flex-direction: column;
    }
    
    .icon {
      margin: 0 0 1rem 0;
    }
  }
</style>
