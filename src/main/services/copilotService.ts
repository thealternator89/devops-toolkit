export class CopilotService {
  private client: any = null;
  private session: any = null;

  private async getSession() {
    if (!this.session) {
      // Dynamic import for Copilot SDK using eval to bypass Webpack bundling
      const { CopilotClient } = await eval('import("@github/copilot-sdk")');
      this.client = new CopilotClient();
      await this.client.start();
      this.session = await this.client.createSession();
    }
    return this.session;
  }

  async generateTestCases(ticketData: any, additionalContext: string) {
    try {
      const session = await this.getSession();
      
      const prompt = `
        Generate a set of comprehensive test cases for the following user story/ticket.
        
        Ticket ID: ${ticketData.id}
        Title: ${ticketData.title}
        Description: ${ticketData.description}
        Acceptance Criteria: ${ticketData.acceptanceCriteria || 'N/A'}
        
        Additional Context: ${additionalContext || 'None provided'}
        
        Please format the output in a Markdown table, including:
        - Test Case ID
        - Description
        - Pre-conditions
        - Steps
        - Expected Result
        - Priority
      `;

      // Send message and wait for assistant to finish
      const response = await session.sendAndWait({ prompt });
      return response?.data?.content || 'No content returned from Copilot.';
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.session) {
      await this.session.destroy();
      this.session = null;
    }
    if (this.client) {
      await this.client.stop();
      this.client = null;
    }
  }
}
