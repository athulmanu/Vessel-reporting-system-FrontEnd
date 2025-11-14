import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vesselsApi, VesselsResponse, VesselResponse } from '../api/vessels';
import { CreateVesselData, UpdateVesselData } from '../types/vessel';

export const useFetchVessels = () => {
  return useQuery<VesselsResponse>({
    queryKey: ['vessels'],
    queryFn: () => vesselsApi.getAll(),
  });
};

export const useFetchVessel = (id: string) => {
  return useQuery<VesselResponse>({
    queryKey: ['vessel', id],
    queryFn: () => vesselsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateVessel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVesselData) => vesselsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

export const useUpdateVessel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVesselData }) =>
      vesselsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      queryClient.invalidateQueries({ queryKey: ['vessel', variables.id] });
    },
  });
};

export const useDeleteVessel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vesselsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

// For crew: Get assigned vessels from issues
// Note: This hook should be used with useFetchMyIssues from useIssues
export const useFetchAssignedVessels = (issuesData: any) => {

  // Extract unique vessels from issues
  const vessels = React.useMemo(() => {
    if (!issuesData?.data.issues) return [];
    
    const vesselMap = new Map();
    issuesData.data.issues.forEach((issue: any) => {
      const vesselId = typeof issue.vesselId === 'string' ? issue.vesselId : issue.vesselId._id;
      const vessel = typeof issue.vesselId === 'object' ? issue.vesselId : null;
      
      if (vessel && !vesselMap.has(vesselId)) {
        vesselMap.set(vesselId, {
          _id: vesselId,
          name: vessel.name,
          imo: vessel.imo,
          status: vessel.status,
          type: vessel.type,
          openIssuesCount: 0,
        });
      }
    });

    // Count open issues per vessel
    issuesData.data.issues.forEach((issue: any) => {
      const vesselId = typeof issue.vesselId === 'string' ? issue.vesselId : issue.vesselId._id;
      const vessel = vesselMap.get(vesselId);
      if (vessel && (issue.status === 'Open' || issue.status === 'In Progress')) {
        vessel.openIssuesCount++;
      }
    });

    return Array.from(vesselMap.values());
  }, [issuesData]);

  return {
    data: { data: { vessels } },
    isLoading: false,
    error: null,
  };
};

