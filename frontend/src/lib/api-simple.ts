import axios from 'axios';
import { DashboardData, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('API Base URL:', API_BASE_URL);

export async function getDashboardData(): Promise<DashboardData> {
  try {
    console.log('Making dashboard API request to:', `${API_BASE_URL}/api/dashboard`);
    
    const response = await axios.get<ApiResponse<DashboardData>>(`${API_BASE_URL}/api/dashboard`, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Dashboard API response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'API request failed');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    throw new Error(`Failed to fetch dashboard data: ${error.message}`);
  }
}
