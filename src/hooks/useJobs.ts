import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi, MaintenanceScanResponse } from '../api/jobs';

export const useRunMaintenanceScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (): Promise<MaintenanceScanResponse> => jobsApi.runMaintenanceScan(),
    onSuccess: () => {
      // Invalidate vessels and issues after scan
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-issues'] });
    },
  });
};

