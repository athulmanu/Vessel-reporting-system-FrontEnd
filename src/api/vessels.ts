import { apiClient } from './axiosClient';
import { Vessel, CreateVesselData, UpdateVesselData } from '../types/vessel';

export interface VesselsResponse {
  success: boolean;
  count: number;
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

export const vesselsApi = {
  getAll: async (): Promise<VesselsResponse> => {
    const response = await apiClient.get<VesselsResponse>('/vessels');
    return response.data;
  },

  getById: async (id: string): Promise<VesselResponse> => {
    const response = await apiClient.get<VesselResponse>(`/vessels/${id}`);
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

