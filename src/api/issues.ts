import { apiClient } from './axiosClient';
import { Issue, CreateIssueData, UpdateIssueData, RecommendationsResponse } from '../types/issue';

export interface IssuesResponse {
  success: boolean;
  count: number;
  data: {
    issues: Issue[];
    message?: string;
    assignedVessels?: number;
  };
}

export interface IssueResponse {
  success: boolean;
  data: {
    issue: Issue;
  };
}

export const issuesApi = {
  getAll: async (params?: {
    vesselId?: string;
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<IssuesResponse> => {
    const response = await apiClient.get<IssuesResponse>('/issues', { params });
    return response.data;
  },

  getMyIssues: async (params?: {
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<IssuesResponse> => {
    const response = await apiClient.get<IssuesResponse>('/issues/my-issues', { params });
    return response.data;
  },

  getById: async (id: string): Promise<IssueResponse> => {
    const response = await apiClient.get<IssueResponse>(`/issues/${id}`);
    return response.data;
  },

  create: async (data: CreateIssueData): Promise<IssueResponse> => {
    const response = await apiClient.post<IssueResponse>('/issues', data);
    return response.data;
  },

  update: async (id: string, data: UpdateIssueData): Promise<IssueResponse> => {
    const response = await apiClient.put<IssueResponse>(`/issues/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/issues/${id}`);
    return response.data;
  },

  getRecommendations: async (category: string, vesselType: string): Promise<RecommendationsResponse> => {
    const response = await apiClient.get<RecommendationsResponse>('/issues/recommend', {
      params: { category, vesselType },
    });
    return response.data;
  },
};

