// Ayrshaer Social Media API Integration
// Based on the documentation provided for social media posting, scheduling, and analytics

export interface SocialMediaPost {
  id?: string;
  platforms: string[];
  post: string;
  mediaUrls?: string[];
  scheduleDate?: string;
  profileKeys?: string[];
  shortenLinks?: boolean;
  randomHashtags?: {
    hashtags: string[];
    count: number;
  };
}

export interface SocialMediaProfile {
  profileKey: string;
  platform: string;
  title: string;
  isActive: boolean;
}

export interface PostAnalytics {
  postId: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement: number;
}

export class AyrshaerAPI {
  private apiKey: string;
  private baseUrl: string = 'https://app.ayrshare.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Ayrshaer API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Post content to social media platforms
  async createPost(postData: SocialMediaPost): Promise<{ id: string; status: string }> {
    try {
      const response = await this.makeRequest('/post', 'POST', postData);
      return response;
    } catch (error) {
      console.error('Error creating social media post:', error);
      throw error;
    }
  }

  // Schedule a post for later
  async schedulePost(postData: SocialMediaPost): Promise<{ id: string; scheduleDate: string }> {
    if (!postData.scheduleDate) {
      throw new Error('Schedule date is required for scheduled posts');
    }

    try {
      const response = await this.makeRequest('/post', 'POST', {
        ...postData,
        scheduleDate: postData.scheduleDate
      });
      return response;
    } catch (error) {
      console.error('Error scheduling social media post:', error);
      throw error;
    }
  }

  // Get user's connected social media profiles
  async getProfiles(): Promise<SocialMediaProfile[]> {
    try {
      const response = await this.makeRequest('/profiles');
      return response.profiles || [];
    } catch (error) {
      console.error('Error fetching social media profiles:', error);
      throw error;
    }
  }

  // Get analytics for a specific post
  async getPostAnalytics(postId: string): Promise<PostAnalytics[]> {
    try {
      const response = await this.makeRequest(`/analytics/post/${postId}`);
      return response.analytics || [];
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      throw error;
    }
  }

  // Get historical posts
  async getPostHistory(limit: number = 25): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/history?lastRecords=${limit}`);
      return response.posts || [];
    } catch (error) {
      console.error('Error fetching post history:', error);
      throw error;
    }
  }

  // Delete a scheduled post
  async deletePost(postId: string): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest(`/delete/${postId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Get account analytics overview
  async getAccountAnalytics(platforms?: string[]): Promise<any> {
    try {
      const endpoint = platforms 
        ? `/analytics?platforms=${platforms.join(',')}`
        : '/analytics';
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching account analytics:', error);
      throw error;
    }
  }

  // Generate hashtag suggestions
  async generateHashtags(text: string, count: number = 5): Promise<string[]> {
    try {
      const response = await this.makeRequest('/hashtags', 'POST', {
        text,
        count
      });
      return response.hashtags || [];
    } catch (error) {
      console.error('Error generating hashtags:', error);
      throw error;
    }
  }

  // Check post limits and usage
  async getUsageStats(): Promise<{ postsRemaining: number; resetDate: string }> {
    try {
      const response = await this.makeRequest('/usage');
      return response;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  }
}

// Create a singleton instance if API key is available
export const ayrshaerAPI = process.env.AYRSHAER_API_KEY 
  ? new AyrshaerAPI(process.env.AYRSHAER_API_KEY)
  : null;