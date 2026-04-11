import * as azdev from 'azure-devops-node-api';
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import {
  PublicClientApplication,
  Configuration,
  AuthenticationResult,
  LogLevel,
  AccountInfo,
  InteractiveRequest,
} from '@azure/msal-node';
import { shell } from 'electron';

const CLIENT_ID = '4e8ba545-31c8-4734-afb2-158ee44a051c'; // Azure DevOps App Registration Client ID
const AUTHORITY = 'https://login.microsoftonline.com/common';
const SCOPES = ['499b84ac-1321-427f-aa17-267ca6975798/.default'];

export class AzureDevOpsService {
  private witApi: IWorkItemTrackingApi | null = null;
  private pca: PublicClientApplication;
  private account: AccountInfo | null = null;

  constructor(public org: string) {
    const msalConfig: Configuration = {
      auth: {
        clientId: CLIENT_ID,
        authority: AUTHORITY,
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel, message, containsPii) {
            if (!containsPii) console.log(message);
          },
          piiLoggingEnabled: false,
          logLevel: LogLevel.Info,
        },
      },
    };
    this.pca = new PublicClientApplication(msalConfig);
  }

  private async getAccount(): Promise<AccountInfo | null> {
    if (!this.account) {
      const cache = this.pca.getTokenCache();
      const accounts = await cache.getAllAccounts();
      if (accounts.length > 0) {
        this.account = accounts[0];
      }
    }
    return this.account;
  }

  async login(): Promise<AuthenticationResult | null> {
    const interactiveRequest: InteractiveRequest = {
      scopes: SCOPES,
      openBrowser: async (url: string) => {
        await shell.openExternal(url);
      },
      successTemplate:
        '<h1>Authentication Successful</h1><p>You can close this window now.</p>',
      errorTemplate:
        '<h1>Authentication Failed</h1><p>Please check the logs.</p>',
    };

    try {
      const result = await this.pca.acquireTokenInteractive(interactiveRequest);
      this.account = result.account;
      this.witApi = null; // Reset API client to use new token
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const account = await this.getAccount();
    if (account) {
      await this.pca.getTokenCache().removeAccount(account);
      this.account = null;
      this.witApi = null;
    }
  }

  async getAccessToken(): Promise<string> {
    const account = await this.getAccount();
    if (!account) {
      throw new Error('No account found. Please log in first.');
    }

    try {
      const result = await this.pca.acquireTokenSilent({
        account: account,
        scopes: SCOPES,
      });
      return result.accessToken;
    } catch (error) {
      console.warn(
        'Silent token acquisition failed, attempting interactive login...',
        error,
      );
      const result = await this.login();
      if (!result) throw new Error('Failed to acquire token.');
      return result.accessToken;
    }
  }

  private async getApi(): Promise<IWorkItemTrackingApi> {
    if (!this.witApi) {
      const token = await this.getAccessToken();
      const authHandler = azdev.getBearerHandler(token);
      const connection = new azdev.WebApi(this.org, authHandler);
      this.witApi = await connection.getWorkItemTrackingApi();
    }
    return this.witApi;
  }

  async fetchTicket(ticketId: string) {
    const witApi = await this.getApi();

    try {
      const workItem = await witApi.getWorkItem(parseInt(ticketId));
      if (!workItem || !workItem.fields) {
        throw new Error('Work item not found.');
      }

      return {
        id: workItem.id,
        title: workItem.fields['System.Title'],
        description: workItem.fields['System.Description'],
        acceptanceCriteria:
          workItem.fields['Microsoft.VSTS.Common.AcceptanceCriteria'],
        project: workItem.fields['System.TeamProject'],
      };
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  }

  async addComment(ticketId: string, text: string) {
    const witApi = await this.getApi();
    const document = [
      {
        op: 'add',
        path: '/fields/System.History',
        value: text,
      },
      {
        op: 'add',
        path: '/multilineFieldsFormat/System.History',
        value: 'Markdown',
      },
    ];
    return witApi.updateWorkItem(
      undefined,
      document as any,
      parseInt(ticketId),
    );
  }

  async addChildTask(
    parentTicketId: string,
    title: string,
    description: string,
  ) {
    const witApi = await this.getApi();

    const parentWorkItem = await witApi.getWorkItem(parseInt(parentTicketId));
    if (!parentWorkItem || !parentWorkItem.fields) {
      throw new Error('Parent work item not found.');
    }

    const project = parentWorkItem.fields['System.TeamProject'];
    const parentUrl = parentWorkItem.url;

    const document = [
      { op: 'add', path: '/fields/System.Title', value: title },
      { op: 'add', path: '/fields/System.Description', value: description },
      {
        op: 'add',
        path: '/multilineFieldsFormat/System.Description',
        value: 'Markdown',
      },
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'System.LinkTypes.Hierarchy-Reverse',
          url: parentUrl,
          attributes: { comment: 'Added via Copilot test case generation' },
        },
      },
    ];

    return witApi.createWorkItem(undefined, document as any, project, 'Task');
  }

  async createProductBacklogItem(
    parentTicketId: string,
    title: string,
    description: string,
    acceptanceCriteria: string,
  ) {
    const witApi = await this.getApi();

    const parentWorkItem = await witApi.getWorkItem(parseInt(parentTicketId));
    if (!parentWorkItem || !parentWorkItem.fields) {
      throw new Error('Parent work item not found.');
    }

    const project = parentWorkItem.fields['System.TeamProject'];
    const parentUrl = parentWorkItem.url;

    const document = [
      { op: 'add', path: '/fields/System.Title', value: title },
      { op: 'add', path: '/fields/System.Description', value: description },
      {
        op: 'add',
        path: '/multilineFieldsFormat/System.Description',
        value: 'Markdown',
      },
      {
        op: 'add',
        path: '/fields/Microsoft.VSTS.Common.AcceptanceCriteria',
        value: acceptanceCriteria,
      },
      {
        op: 'add',
        path: '/multilineFieldsFormat/Microsoft.VSTS.Common.AcceptanceCriteria',
        value: 'Markdown',
      },
      {
        op: 'add',
        path: '/relations/-',
        value: {
          rel: 'System.LinkTypes.Hierarchy-Reverse',
          url: parentUrl,
          attributes: { comment: 'Added via Copilot story generation' },
        },
      },
    ];

    return witApi.createWorkItem(
      undefined,
      document as any,
      project,
      'Product Backlog Item',
    );
  }
}
