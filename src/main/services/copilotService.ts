function createCopilotClient() {
  // Eval to avoid webpack interfering with the import
  const { CopilotClient } = eval('import("@github/copilot-sdk")');

  // Windows has weird redirection issues, where the wrapper exits causing stdio to drop
  // To get around this, instead of launching `copilot` directly, we launch `node` with the 
  // `copilot` script as an argument. This seems to fix the issue.
  //
  // FIXME: Ideally once Copilot CLI or SDK come out of preview it will be working normally
  // and we can remove this
  if (process.platform === 'win32') {
    if (!process.env.NODE_PATH || !process.env.COPILOT_SCRIPT_PATH) {
      throw new Error('On Windows, both NODE_PATH and COPILOT_SCRIPT_PATH environment variables are required to initialise the Copilot client.');
    }
    return new CopilotClient({
      cliPath: process.env.NODE_PATH,
      cliArgs: [process.env.COPILOT_SCRIPT_PATH],
      useStdio: true
    });
  }

  return new CopilotClient();
}

export class CopilotService {
  private client: any = null;
  private session: any = null;

  private async ensureCopilotClient() {
    if (!this.client) {
      this.client = createCopilotClient();
    }
    await this.client.start();
    return this.client;
  }

  private async getSession() {
    await this.ensureCopilotClient();
    if (!this.session) {
      this.session = await this.client.createSession();
    }
    return this.session;
  }

  async checkAuthStatus() {
    try {
      await this.ensureCopilotClient();
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
