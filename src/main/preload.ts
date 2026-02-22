import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  fetchTicket: (id: string) => ipcRenderer.invoke('fetch-ticket', id),
  generateTestCases: (ticketData: any, context: string) => ipcRenderer.invoke('generate-test-cases', ticketData, context),
  addComment: (ticketId: string, text: string) => ipcRenderer.invoke('add-comment', ticketId, text),
  addChildTask: (parentTicketId: string, title: string, description: string) => ipcRenderer.invoke('add-child-task', parentTicketId, title, description),
  checkCopilotAuth: () => ipcRenderer.invoke('check-copilot-auth'),
});
