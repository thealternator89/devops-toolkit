export class ConfluenceService {
  constructor(private url: string, private user: string, private token: string) {}

  async fetchPage(pageId: string) {
    let authHeader = '';
    if (this.user) {
      const auth = Buffer.from(`${this.user}:${this.token}`).toString('base64');
      authHeader = `Basic ${auth}`;
    } else {
      authHeader = `Bearer ${this.token}`;
    }
    
    let baseUrl = this.url;
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    // Handle user entering just the base URL or appending /wiki
    if (!baseUrl.includes('/wiki')) {
      baseUrl += '/wiki';
    }

    let apiUrl = `${baseUrl}/rest/api/content/${pageId}?expand=body.storage`;

    
    console.log('Final API URL:', apiUrl);
    try {
      // In newer Node/Electron versions, fetch is globally available
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Confluence page: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        title: data.title,
        body: data.body?.storage?.value || ''
      };
    } catch (error) {
      console.error('Error fetching Confluence page:', error);
      throw error;
    }
  }
}
