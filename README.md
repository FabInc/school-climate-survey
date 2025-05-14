# CRIBS Climate Intervention Survey

A web application built with Svelte and Vite to guide users through decision trees related to school facility climate resilience, providing relevant recommendations based on their answers.

The application's logic is driven by a central JSON data file (`src/lib/flowchartData.json`). This file defines the structure of the decision trees for various climate-related categories.

*   **Categories:** The top level organizes flowcharts by categories (e.g., `water-supply`, `heat-impacts`).
*   **Nodes:** Each category contains an array of nodes. Each node represents either a decision point (question) or a final recommendation.
*   **Questions:** Decision nodes contain question text (`text`), optional help text (`help`), and a `next` object mapping user answers (e.g., "Yes", "No") to the ID of the subsequent node or recommendation.
*   **Recommendations:** Recommendation nodes contain the recommendation text (`text`), an icon (`icon`), and a flag indicating if it's a final step (`final: true`). Shared recommendations are defined in a separate `recommendations` key within the JSON.
*   **Flow:** The Svelte application reads this JSON data. Starting from an initial node (often determined by category/branch selection), it displays the question (`QuestionCard.svelte`), waits for user input, uses the `next` mapping to find the ID of the next step based on the answer, and dynamically renders the next question or displays the final recommendation (`ResultsDisplay.svelte`). The visualization (`FlowchartVisualization.svelte`, `DecisionNode.svelte`) also uses this data to render the tree structure.
*   **Editing:** The application includes a built-in editor (`FlowchartEditor.svelte`, `NodeEditor.svelte`, `RecommendationEditor.svelte`) which allows users to visually modify the flowchart structure. This includes adding, editing, or deleting categories, questions (nodes), answers, recommendations, and changing the navigation flow between them. *([Optional: Add specific instructions here on how to access the editor if known, e.g., "Accessed via the '/editor' route"])*. Changes made in the editor directly update the underlying flowchart data structure.






## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte Extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Technologies Used

*   [Svelte 5](https://svelte.dev/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS v3](https://tailwindcss.com/)
*   [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) (for PDF export)

## Prerequisites

*   [Node.js](https://nodejs.org/) - **LTS version is recommended** (Developed using v20.17.0). Download from the official Node.js website.

## Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd climate_miro/cribs-app
    ```
    *(Replace `<your-repository-url>` with the actual URL if cloning)*

2.  **Install dependencies:** Open your terminal in the `cribs-app` directory and run:
    ```bash
    npm install
    ```
    *   **Windows Note:** If you encounter errors during installation (especially related to permissions or missing files in `node_modules/.bin`), try opening your terminal (e.g., PowerShell or Command Prompt) **"as Administrator"** and running `npm install` again after cleaning up:
        ```powershell
        # Run these in an Administrator terminal if npm install fails
        Remove-Item -Recurse -Force node_modules
        Remove-Item -Force package-lock.json
        npm install
        ```
        Ensure any running development servers are stopped before attempting installation. Antivirus software might also interfere; consider adding the project folder and Node.js executables to your exclusion list if problems persist.

## Running the Development Server

1.  Open your terminal in the `cribs-app` directory.
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open your web browser and navigate to the local URL provided by Vite (usually `http://localhost:5173` or the next available port).

The application will automatically reload as you make changes to the source files.

## Building for Production

1.  Open your terminal in the `cribs-app` directory.
2.  Run the build command:
    ```bash
    npm run build
    ```
3.  This will create a production-ready build of the application in the `docs/` directory (configured for GitHub Pages deployment).

## Deployment

This project is configured for deployment to GitHub Pages via a GitHub Actions workflow (`.github/workflows/deploy.yml`). Pushing changes to the `main` branch will automatically trigger the build process and deploy the contents of the `docs/` directory to the `gh-pages` branch.
