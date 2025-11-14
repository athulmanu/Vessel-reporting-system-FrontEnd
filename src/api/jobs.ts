import { apiClient } from './axiosClient';

export interface MaintenanceScanResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    updated: number;
    active: number;
    underMaintenance: number;
    details: Array<{
      vesselId: string;
      vesselName: string;
      imo: string;
      previousStatus: string;
      currentStatus: string;
      openIssues: number;
      statusChanged: boolean;
    }>;
  };
}

export const jobsApi = {
  runMaintenanceScan: async (): Promise<MaintenanceScanResponse> => {
    const response = await apiClient.post<MaintenanceScanResponse>('/jobs/maintenance-scan');
    return response.data;
  },
};

