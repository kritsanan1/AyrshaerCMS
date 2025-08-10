// Ayrshaer API integration tests
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AyrshaerAPI } from '../server/ayrshaer-api';
import { mockSuccessResponse, mockErrorResponse } from './setup';

// Mock fetch globally
global.fetch = jest.fn();

describe('AyrshaerAPI', () => {
  let api: AyrshaerAPI;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    api = new AyrshaerAPI(mockApiKey);
    jest.clearAllMocks();
  });

  describe('Social Media Posting', () => {
    it('should create post successfully', async () => {
      const mockResponse = { id: 'post-123', status: 'success' };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      const postData = {
        platforms: ['twitter', 'facebook'],
        post: 'Test social media post content',
        mediaUrls: ['https://example.com/image.jpg'],
      };

      const result = await api.createPost(postData);

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/post',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(postData),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle post creation errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse(400, 'Bad Request'));

      const postData = {
        platforms: ['twitter'],
        post: 'Test post',
      };

      await expect(api.createPost(postData)).rejects.toThrow('Ayrshaer API error: 400 Bad Request');
    });

    it('should schedule post successfully', async () => {
      const mockResponse = { id: 'post-456', scheduleDate: '2024-12-01T10:00:00Z' };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      const postData = {
        platforms: ['linkedin'],
        post: 'Scheduled post content',
        scheduleDate: '2024-12-01T10:00:00Z',
      };

      const result = await api.schedulePost(postData);

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when scheduling without date', async () => {
      const postData = {
        platforms: ['twitter'],
        post: 'Test post without schedule date',
      };

      await expect(api.schedulePost(postData)).rejects.toThrow('Schedule date is required for scheduled posts');
    });
  });

  describe('Profile Management', () => {
    it('should get profiles successfully', async () => {
      const mockProfiles = [
        { profileKey: 'twitter-123', platform: 'twitter', title: 'My Twitter', isActive: true },
        { profileKey: 'facebook-456', platform: 'facebook', title: 'My Facebook', isActive: true },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse({ profiles: mockProfiles }));

      const result = await api.getProfiles();

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/profiles',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
          }),
        })
      );

      expect(result).toEqual(mockProfiles);
    });

    it('should return empty array when no profiles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse({}));

      const result = await api.getProfiles();
      expect(result).toEqual([]);
    });
  });

  describe('Analytics', () => {
    it('should get post analytics successfully', async () => {
      const mockAnalytics = [
        { postId: 'post-123', platform: 'twitter', likes: 50, comments: 10, shares: 5, reach: 1000, impressions: 1500, engagement: 65 },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse({ analytics: mockAnalytics }));

      const result = await api.getPostAnalytics('post-123');

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/analytics/post/post-123',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockAnalytics);
    });

    it('should get account analytics successfully', async () => {
      const mockAnalytics = { totalPosts: 100, totalReach: 50000, avgEngagement: 75 };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse(mockAnalytics));

      const result = await api.getAccountAnalytics(['twitter', 'facebook']);

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/analytics?platforms=twitter,facebook',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('Hashtag Generation', () => {
    it('should generate hashtags successfully', async () => {
      const mockHashtags = ['#contentmarketing', '#socialmedia', '#digitalmarketing', '#growth', '#strategy'];
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse({ hashtags: mockHashtags }));

      const result = await api.generateHashtags('Content marketing tips for small businesses', 5);

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/hashtags',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            text: 'Content marketing tips for small businesses',
            count: 5,
          }),
        })
      );

      expect(result).toEqual(mockHashtags);
    });

    it('should return empty array when no hashtags generated', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse({}));

      const result = await api.generateHashtags('test', 3);
      expect(result).toEqual([]);
    });
  });

  describe('Usage Statistics', () => {
    it('should get usage stats successfully', async () => {
      const mockUsage = { postsRemaining: 45, resetDate: '2024-01-01T00:00:00Z' };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse(mockUsage));

      const result = await api.getUsageStats();

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/usage',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockUsage);
    });
  });

  describe('Post Management', () => {
    it('should delete post successfully', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse(mockResponse));

      const result = await api.deletePost('post-123');

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/delete/post-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should get post history successfully', async () => {
      const mockPosts = [
        { id: 'post-1', content: 'First post', createdAt: '2024-01-01' },
        { id: 'post-2', content: 'Second post', createdAt: '2024-01-02' },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse({ posts: mockPosts }));

      const result = await api.getPostHistory(25);

      expect(fetch).toHaveBeenCalledWith(
        'https://app.ayrshare.com/api/history?lastRecords=25',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockPosts);
    });
  });
});