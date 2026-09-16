# Conduit Web

Conduit Web is the frontend interface for Conduit, a node-based workflow automation engine. It provides a visual canvas for users to build, configure, and manage automation workflows.

## Features

- Visual Workflow Builder: Drag-and-drop interface powered by Vue Flow.
- Node Configuration: Customize triggers, HTTP requests, AI vision tasks, conditional logic, and email actions.
- Real-time Execution Feedback: Monitor workflow status and node execution directly on the canvas.
- Dynamic Variable Interpolation: Map outputs from previous nodes into downstream actions.

## Screenshots

<!-- Add screenshots or recordings of the Node UI here -->

## Tech Stack

- Framework: Vue 3 (Composition API)
- Build Tool: Vite
- State Management: Pinia
- Graph Canvas: Vue Flow
- Styling: Tailwind CSS

## Project Setup

Ensure you have Node.js installed.

1. Install dependencies:

```sh
npm install
```

2. Environment Variables:
   Create a `.env` file in the root directory and set your backend URL (defaults to localhost:3000 if omitted):

```sh
VITE_BACKEND_URL=http://localhost:3000
```

3. Run the development server:

```sh
npm run dev
```

4. Build for production:

```sh
npm run build
```
