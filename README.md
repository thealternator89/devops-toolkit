# DevOps Toolkit

An Electron-based desktop application for DevOps workflows, built with React and TypeScript using Electron Forge.

## Features

- **Menu Dashboard**: A central hub for all DevOps tools using a clean Bootstrap-based UI.
- **Test Case Writer**: 
  - Integration with **Azure DevOps** to fetch work item details (ID, Title, Description, Acceptance Criteria).
  - Integration with **GitHub Copilot SDK** to automatically generate comprehensive test cases based on ticket context.
  - Markdown support with GFM (tables, lists, etc.) for rendered results.
- **Persistent Settings**: Securely store Azure DevOps credentials and project configuration locally.

## Tech Stack

- **Framework:** [Electron](https://www.electronjs.org/) (via [Electron Forge](https://www.electronforge.io/))
- **Frontend:** [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Bootstrap 5](https://getbootstrap.com/) + [FontAwesome 6](https://fontawesome.com/)
- **Navigation:** [React Router Dom](https://reactrouter.com/)
- **APIs & Integration:**
  - `azure-devops-node-api`: For interacting with Azure DevOps REST APIs.
  - `@github/copilot-sdk`: For AI-powered generation via GitHub Copilot.
- **Storage:** `electron-store` for persistent configuration.
- **Markdown:** `react-markdown` + `remark-gfm` for rich text rendering.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- **GitHub Copilot CLI**: You must be authenticated via the Copilot CLI on your machine (`gh auth login` and `gh extension install github/gh-copilot`).
- **Azure DevOps PAT**: A Personal Access Token with "Work Items: Read" permissions.

### Installation

```bash
npm install
```

### Running the Application (Development)

```bash
npm start
```

### Packaging for Distribution

```bash
npm run package
# or
npm run make
```

## Project Structure

```text
.
├── src/
│   ├── main/           # Main process logic (Node.js environment)
│   │   ├── index.ts    # Main process entry point & IPC Handlers
│   │   └── preload.ts  # Preload script for IPC and secure bridge
│   └── renderer/       # Renderer process (React environment)
│       ├── pages/      # Application views (Menu, Settings, TestCaseWriter)
│       ├── App.tsx     # Main React component with Routing
│       ├── index.css   # Global styles & Markdown overrides
│       ├── index.html  # Main HTML template
│       └── renderer.tsx # Renderer entry point (React mount)
├── forge.config.ts     # Electron Forge configuration
├── tsconfig.json       # TypeScript configuration
├── webpack.main.config.ts     # Webpack config for main process
└── webpack.renderer.config.ts # Webpack config for renderer process
```

## Architecture

For a detailed explanation of the process model, configuration management, and AI integration, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## License

MIT
