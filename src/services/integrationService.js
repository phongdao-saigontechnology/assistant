import { Client } from '@microsoft/microsoft-graph-client';
import websiteService from './websiteService.js';

class IntegrationService {
  constructor() {
    // Removed Slack client initialization
  }

  async sendToTeams(options) {
    const { tenantId, clientId, clientSecret, teamId, channelId, subject, content, userEmail } = options;
    
    try {
      const authProvider = {
        getAccessToken: async () => {
          const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
          const params = new URLSearchParams();
          params.append('client_id', clientId);
          params.append('client_secret', clientSecret);
          params.append('scope', 'https://graph.microsoft.com/.default');
          params.append('grant_type', 'client_credentials');

          const response = await fetch(tokenUrl, {
            method: 'POST',
            body: params,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });

          const data = await response.json();
          return data.access_token;
        }
      };

      const graphClient = Client.initWithMiddleware({ authProvider });

      const message = {
        body: {
          contentType: 'html',
          content: `
            <h2>${subject}</h2>
            <div>${content.replace(/\n/g, '<br>')}</div>
            <hr>
            <small><em>Sent via Internal Communications Assistant by ${userEmail}</em></small>
          `
        }
      };

      const result = await graphClient
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(message);

      return {
        success: true,
        messageId: result.id,
        timestamp: result.createdDateTime
      };
    } catch (error) {
      console.error('Teams integration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }



  async scheduleMessage(messageData, scheduledFor) {
    const delay = new Date(scheduledFor).getTime() - Date.now();
    
    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }

    setTimeout(async () => {
      try {
        await this.sendMessage(messageData);
      } catch (error) {
        console.error('Scheduled message failed:', error);
      }
    }, delay);

    return {
      success: true,
      scheduledFor,
      delay
    };
  }

  async sendToWebsite(options) {
    const { message, companyInfo, userEmail } = options;
    
    try {
      const result = await websiteService.publishToWebsite(message, companyInfo);
      
      if (result.success) {
        return {
          success: true,
          url: result.url,
          publishedAt: result.publishedAt
        };
      } else {
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('Website publication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendMessage(messageData) {
    const { platform, config, subject, content, userEmail, userName } = messageData;
    
    switch (platform) {
      case 'teams':
        return await this.sendToTeams({
          tenantId: config.tenantId,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          teamId: config.teamId,
          channelId: config.channelId,
          subject,
          content,
          userEmail
        });

      case 'website':
        return await this.sendToWebsite({
          message: config.message,
          companyInfo: config.companyInfo || {},
          userEmail
        });

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

export default new IntegrationService();