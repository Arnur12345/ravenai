import config from '../config/config';

export interface SlackIntegration {
  id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_url?: string;
  default_channel_id?: string;
  default_channel_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
  num_members?: number;
}

export interface SlackWorkspace {
  id: string;
  name: string;
  url?: string;
  icon?: any;
}

export interface SlackOAuthUrl {
  oauth_url: string;
  state: string;
}

export interface SlackChannelsResponse {
  channels: SlackChannel[];
  workspace: SlackWorkspace;
}

class SlackApi {
  private baseUrl = `${config.API_BASE_URL}/api/slack`;

  private async getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getOAuthUrl(redirectUri: string): Promise<SlackOAuthUrl> {
    const response = await fetch(
      `${this.baseUrl}/oauth/url?redirect_uri=${encodeURIComponent(redirectUri)}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get Slack OAuth URL');
    }

    return response.json();
  }

  async handleOAuthCallback(code: string, state: string, redirectUri: string): Promise<SlackIntegration> {
    const response = await fetch(`${this.baseUrl}/oauth/callback`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        code,
        state,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to complete Slack OAuth');
    }

    return response.json();
  }

  async getIntegrations(): Promise<{ integrations: SlackIntegration[]; total: number }> {
    const response = await fetch(`${this.baseUrl}/integrations`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Slack integrations');
    }

    return response.json();
  }

  async getChannels(integrationId: string): Promise<SlackChannelsResponse> {
    const response = await fetch(`${this.baseUrl}/integrations/${integrationId}/channels`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Slack channels');
    }

    return response.json();
  }

  async setDefaultChannel(integrationId: string, channelId: string, channelName: string): Promise<SlackIntegration> {
    const response = await fetch(`${this.baseUrl}/integrations/${integrationId}/channel`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify({
        channel_id: channelId,
        channel_name: channelName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to set default channel');
    }

    return response.json();
  }

  async sendMeetingSummary(integrationId: string, meetingId: string, channelId?: string): Promise<{ message: string }> {
    const url = channelId
      ? `${this.baseUrl}/integrations/${integrationId}/send-meeting-summary/${meetingId}?channel_id=${channelId}`
      : `${this.baseUrl}/integrations/${integrationId}/send-meeting-summary/${meetingId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to send meeting summary to Slack');
    }

    return response.json();
  }

  async deleteIntegration(integrationId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/integrations/${integrationId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete Slack integration');
    }

    return response.json();
  }

  async testIntegration(integrationId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/integrations/${integrationId}/test`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Slack integration test failed');
    }

    return response.json();
  }
}

export const slackApi = new SlackApi(); 