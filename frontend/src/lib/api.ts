import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, DashboardData, NeuraScore, TeamMetrics, Insight } from '@/types';

/**
 * API client configuration for NeuraScore platform
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log('Initializing API client with baseURL:', baseURL);
    
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API client initialized successfully');

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('API Response Success:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get dashboard overview data
   */
  async getDashboardData(): Promise<DashboardData> {
    if (!this.client) {
      throw new Error('API client not initialized');
    }
    console.log('Making dashboard API request...');
    const response: AxiosResponse<ApiResponse<DashboardData>> = await this.client.get('/api/dashboard');
    console.log('Dashboard API response received:', response.data);
    return response.data.data;
  }

  /**
   * Get user scores with pagination
   */
  async getUserScores(page: number = 1, limit: number = 50): Promise<{
    scores: NeuraScore[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/api/users/scores', {
      params: { page, limit }
    });
    return response.data.data;
  }

  /**
   * Get specific user's detailed score
   */
  async getUserScore(userId: string): Promise<NeuraScore> {
    const response: AxiosResponse<ApiResponse<NeuraScore>> = await this.client.get(`/api/users/${userId}/score`);
    return response.data.data;
  }

  /**
   * Get team metrics
   */
  async getTeamMetrics(teamId?: string): Promise<TeamMetrics[]> {
    const url = teamId ? `/api/teams/${teamId}` : '/api/teams';
    const response: AxiosResponse<ApiResponse<TeamMetrics[]>> = await this.client.get(url);
    return response.data.data;
  }

  /**
   * Get insights and recommendations
   */
  async getInsights(entityType?: string, entityId?: string): Promise<Insight[]> {
    const response: AxiosResponse<ApiResponse<Insight[]>> = await this.client.get('/api/insights', {
      params: { entityType, entityId }
    });
    return response.data.data;
  }

  /**
   * Trigger score recalculation
   */
  async recalculateScores(): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/api/scores/recalculate');
    return response.data.data;
  }

  /**
   * Get activity timeline data
   */
  async getActivityTimeline(startDate?: string, endDate?: string): Promise<{
    date: string;
    interactions: number;
    unique_users: number;
  }[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.client.get('/api/analytics/timeline', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }

  /**
   * Export report as PDF
   */
  async exportReport(type: 'dashboard' | 'team' | 'user', entityId?: string): Promise<Blob> {
    const response = await this.client.get('/api/reports/export', {
      params: { type, entityId },
      responseType: 'blob'
    });
    return response.data;
  }

  /**
   * Get data processing status
   */
  async getProcessingStatus(): Promise<{
    status: 'idle' | 'processing' | 'completed' | 'error';
    progress: number;
    message: string;
    last_updated: string;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/api/processing/status');
    return response.data.data;
  }

  /**
   * Trigger data reprocessing
   */
  async triggerReprocessing(): Promise<{ message: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await this.client.post('/api/processing/trigger');
    return response.data.data;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.client.get('/api/health');
    return response.data.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual methods for convenience
export const getDashboardData = () => apiClient.getDashboardData();
export const getUserScores = (page?: number, limit?: number) => apiClient.getUserScores(page, limit);
export const getUserScore = (userId: string) => apiClient.getUserScore(userId);
export const getTeamMetrics = (teamId?: string) => apiClient.getTeamMetrics(teamId);
export const getInsights = (entityType?: string, entityId?: string) => apiClient.getInsights(entityType, entityId);
export const recalculateScores = () => apiClient.recalculateScores();
export const getActivityTimeline = (startDate?: string, endDate?: string) => apiClient.getActivityTimeline(startDate, endDate);
export const exportReport = (type: 'dashboard' | 'team' | 'user', entityId?: string) => apiClient.exportReport(type, entityId);
export const getProcessingStatus = () => apiClient.getProcessingStatus();
export const triggerReprocessing = () => apiClient.triggerReprocessing();
export const healthCheck = () => apiClient.healthCheck();
