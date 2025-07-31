import { WebClient } from '@slack/web-api';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@azure/msal-node';
import nodemailer from 'nodemailer';

class IntegrationService {
  constructor() {
    this.slackClients = new Map();
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  initializeEmailTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  async sendToSlack(options) {
    const { token, channel, subject, content, userEmail } = options;
    
    try {
      if (!this.slackClients.has(token)) {
        this.slackClients.set(token, new WebClient(token));
      }
      
      const slack = this.slackClients.get(token);
      
      const message = {
        channel: channel,
        text: subject,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: subject
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: content
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Sent via Internal Communications Assistant by ${userEmail}`
              }
            ]
          }
        ]
      };

      const result = await slack.chat.postMessage(message);
      
      return {
        success: true,
        messageId: result.ts,
        channel: result.channel,
        timestamp: result.ts
      };
    } catch (error) {
      console.error('Slack integration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
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

  async sendEmail(options) {
    const { to, cc, bcc, subject, content, userEmail, userName } = options;
    
    if (!this.emailTransporter) {
      return {
        success: false,
        error: 'Email transporter not configured'
      };
    }

    try {
      const mailOptions = {
        from: `"${userName}" <${process.env.EMAIL_USER}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            ${content.replace(/\n/g, '<br>')}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
              <em>This message was sent via Internal Communications Assistant by ${userEmail}</em>
            </p>
          </div>
        `,
        text: content + `\n\n---\nThis message was sent via Internal Communications Assistant by ${userEmail}`
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected
      };
    } catch (error) {
      console.error('Email integration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testSlackConnection(token) {
    try {
      if (!this.slackClients.has(token)) {
        this.slackClients.set(token, new WebClient(token));
      }
      
      const slack = this.slackClients.get(token);
      const result = await slack.auth.test();
      
      return {
        success: true,
        team: result.team,
        user: result.user,
        teamId: result.team_id,
        userId: result.user_id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSlackChannels(token) {
    try {
      if (!this.slackClients.has(token)) {
        this.slackClients.set(token, new WebClient(token));
      }
      
      const slack = this.slackClients.get(token);
      const result = await slack.conversations.list({
        types: 'public_channel,private_channel',
        limit: 100
      });
      
      return {
        success: true,
        channels: result.channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.is_private,
          memberCount: channel.num_members
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testEmailConnection() {
    if (!this.emailTransporter) {
      return {
        success: false,
        error: 'Email transporter not configured'
      };
    }

    try {
      await this.emailTransporter.verify();
      return {
        success: true,
        message: 'Email connection verified'
      };
    } catch (error) {
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

  async sendMessage(messageData) {
    const { platform, config, subject, content, userEmail, userName } = messageData;
    
    switch (platform) {
      case 'slack':
        return await this.sendToSlack({
          token: config.token,
          channel: config.channel,
          subject,
          content,
          userEmail
        });
        
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
        
      case 'email':
        return await this.sendEmail({
          to: config.to,
          cc: config.cc,
          bcc: config.bcc,
          subject,
          content,
          userEmail,
          userName
        });
        
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

export default new IntegrationService();