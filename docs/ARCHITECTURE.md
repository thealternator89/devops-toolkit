# Architecture Overview

This project follows Electron's recommended security practices by separating the
main (Node.js) process from the renderer (Chromium) process.

## Process Model

- **Main Process (`src/main/index.ts`):**
  - Manages application lifecycle.
  - Handles sensitive API integrations (Azure DevOps, GitHub Copilot).
  - Manages persistent state using `electron-store`.
- **Preload Script (`src/main/preload.ts`):**
  - Exposes a secure `electronAPI` bridge to the renderer.
  - Provides methods for settings management and tool-specific backend actions.
- **Renderer Process (`src/renderer/renderer.tsx`):**
  - Built with React and TypeScript.
  - Uses `HashRouter` for navigation between tools.
  - Renders Markdown results using `react-markdown`.

## Configuration Management

We use `electron-store` to persist user settings (like Azure DevOps PATs)
locally on the machine.

- **Encryption:** Settings are stored in the default Electron user data path.
- **IPC Access:** The renderer fetches and saves settings through the
  `get-settings` and `save-settings` IPC handlers.

## External Integrations

### Azure DevOps

- **Library:** `azure-devops-node-api`
- **Method:** Uses Personal Access Tokens (PAT) via the Work Item Tracking API.
- **Scope:** Fetches work item details (ID, Title, Description, Acceptance
  Criteria), and allows pushing generated test cases back to Azure DevOps as
  Comments or Child Tasks.

### GitHub Copilot

- **Library:** `@github/copilot-sdk`
- **Authentication:** Relies on the machine's local GitHub CLI authentication
  (`gh auth login`). The application can check the active connection and auth
  status using the SDK.
- **Generation:** Uses a conversation session to pass ticket context and custom
  prompts to generate structured test cases.

## Technical Decisions

### Hybrid ESM/CommonJS Approach

The project is configured as CommonJS (`"type": "commonjs"`) to maintain
compatibility with standard Electron Forge/Webpack templates. However, to
support modern ESM-only libraries like `electron-store` and
`@github/copilot-sdk`, we use:

1. **Dynamic `import()`**: For `electron-store` to load the module
   asynchronously.
2. **`eval('import(...)')` Workaround**: For `@github/copilot-sdk` to bypass
   Webpack's static analysis, ensuring the library is loaded as a native ESM
   module by Node.js at runtime.

## Inter-Process Communication (IPC) Handlers

- `get-settings`: Returns the current application configuration.
- `save-settings`: Updates and persists configuration.
- `fetch-ticket`: Retrieves work item data from Azure DevOps.
- `generate-test-cases`: Interfaces with Copilot to produce Markdown test plans.
- `check-copilot-auth`: Checks Copilot CLI authentication and connection status.
- `add-comment`: Pushes text as a comment onto an Azure DevOps work item.
- `add-child-task`: Creates a new linked task in Azure DevOps with the given
  details.
