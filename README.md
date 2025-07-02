# DocuCraft: AI-Powered Project Documentation

DocuCraft is an innovative application designed to streamline the process of creating comprehensive project documentation. Leveraging the power of AI, it assists users in generating, structuring, and refining various sections of a project document, from initial vision to final deployment plans.

## Key Features

*   **AI Content Generation**:
    *   **Project Scoping**: Get AI-suggested core and optional features based on your app's description, industry, and target audience.
    *   **Automated Descriptions**: Automatically generate detailed descriptions for each selected feature.
    *   **Section Drafting**: Instantly draft key sections like 'Product Vision' and 'App Overview' from your project's metadata.
    *   **User Personas**: Generate detailed user personas, including demographics, goals, and frustrations.

*   **Modular Document Builder**:
    *   Enable or disable a wide range of document sections (e.g., 'Technical Architecture', 'Monetization', 'Marketing Plan').
    *   The sidebar navigation dynamically updates to reflect your chosen document structure.

*   **Interactive AI-Powered Editor**:
    *   A two-panel layout with a Markdown editor on the left and a real-time preview on the right.
    *   **AI Writing Assistant**:
        *   **Improve Writing**: Fix grammar, improve clarity, and get concise rewrites for selected text.
        *   **Tone & Style Toggle**: Rewrite content for different audiences (Technical, Friendly, Investor Pitch, Instructional).
        *   **Suggest with AI**: Fill in missing details or expand upon existing content with contextual awareness of other sections.

*   **Customization & Export**:
    *   **Branding**: Customize documents with your own logo and a primary brand color.
    *   **Theme**: Toggle between light and dark modes for a comfortable editing experience.
    *   **Export Options**: Download your final documentation as a PDF, DOCX, or Markdown file.

*   **Project Management**:
    *   A dashboard to view, create, rename, and delete projects.
    *   All project data is saved locally in your browser.

## Technologies Used

*   **Frontend**:
    *   Next.js (App Router)
    *   React
    *   TypeScript
    *   Tailwind CSS
    *   Shadcn UI
*   **Backend & AI**:
    *   Google AI & Genkit
*   **Development**:
    *   This app is designed to be edited and run within Firebase Studio.

## Getting Started

To get this project up and running on your local machine, follow these steps.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a file named `.env` in the root of your project.
    *   You will need a Google AI API key to run the generative AI features. Add your key to the `.env` file:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```

4.  **Run the development server:**
    The application runs on two development servers: one for the Next.js frontend and one for the Genkit AI flows.

    *   In your first terminal, start the Next.js app:
        ```bash
        npm run dev
        ```
        This will typically start the frontend on `http://localhost:9002`.

    *   In a second terminal, start the Genkit development server:
        ```bash
        npm run genkit:dev
        ```
        This starts the local Genkit API server.

5.  **Open the app:**
    Navigate to `http://localhost:9002` in your web browser to start using DocuCraft AI.
