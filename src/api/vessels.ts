import { apiClient } from './axiosClient';
import { Vessel, CreateVesselData, UpdateVesselData } from '../types/vessel';
import { PaginationMeta } from '../types/common';

export interface VesselsResponse {
  success: boolean;
  count: number;
  pagination?: PaginationMeta;
  data: {
    vessels: Vessel[];
  };
}

export interface VesselResponse {
  success: boolean;
  data: {
    vessel: Vessel;
  };
}

export interface AssignedVesselsResponse {
  success: boolean;
  data: {
    vessels: Vessel[];
    assignedCount: number;
    userId: string;
  };
  message?: string;
}

export interface VesselListParams {
  status?: string;
  type?: string;
  flag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const vesselsApi = {
  getAll: async (params?: VesselListParams): Promise<VesselsResponse> => {
    const response = await apiClient.get<VesselsResponse>('/vessels', { params });
    return response.data;
  },

  getById: async (id: string): Promise<VesselResponse> => {
    const response = await apiClient.get<VesselResponse>(`/vessels/${id}`);
    return response.data;
  },

  getAssigned: async (userId?: string): Promise<AssignedVesselsResponse> => {
    const response = await apiClient.get<AssignedVesselsResponse>('/vessels/assigned', {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },

  create: async (data: CreateVesselData): Promise<VesselResponse> => {
    const response = await apiClient.post<VesselResponse>('/vessels', data);
    return response.data;
  },

  update: async (id: string, data: UpdateVesselData): Promise<VesselResponse> => {
    const response = await apiClient.put<VesselResponse>(`/vessels/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/vessels/${id}`);
    return response.data;
  },
};

