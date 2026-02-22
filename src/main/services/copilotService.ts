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

  async checkAuthStatus() {
    try {
      if (!this.client) {
        const { CopilotClient } = await eval('import("@github/copilot-sdk")');
        this.client = new CopilotClient();
        await this.client.start();
      }
      const authStatus = await this.client.getAuthStatus();
      const status = await this.client.getStatus();
      return { authStatus, status };
    } catch (error) {
      console.error('Error checking Copilot auth status:', error);
      throw error;
    }
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

  async generateStories(pageData: any, additionalContext: string) {
    try {
      const session = await this.getSession();
      
      const prompt = `
        Generate a set of user stories based on the following functional requirements from a Confluence page.
        
        Page Title: ${pageData.title}
        Page Content: ${pageData.body}
        
        Additional Context: ${additionalContext || 'None provided'}
        
        Please output ONLY a valid JSON array of objects, with no markdown formatting or other text.
        Each object should have the following properties:
        - "title": (string) The title of the story
        - "description": (string) Description. This should contain a statement in the format "As a... I want to... So that..." followed by 2 blank lines and then a longer description of the changes required for story.
        - "acceptanceCriteria": (string) Formatted as a list. Use markdown within the string with \\n for newlines.
        - "notes": (string) Any additional notes or assumptions (Optional, can be empty)
      `;

      // Send message and wait for assistant to finish
      const response = await session.sendAndWait({ prompt });
      const rawContent = response?.data?.content || '[]';
      
      try {
        // Attempt to extract JSON from markdown code block if present
        const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : rawContent.trim();
        return JSON.parse(jsonString);
      } catch (e) {
        console.error('Failed to parse JSON from Copilot response:', rawContent);
        throw new Error('Failed to parse stories from Copilot. The output was not valid JSON.');
      }
    } catch (error) {
      console.error('Error generating stories:', error);
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
