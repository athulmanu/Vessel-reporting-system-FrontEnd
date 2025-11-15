import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vesselsApi,
  VesselsResponse,
  VesselResponse,
  AssignedVesselsResponse,
  VesselListParams,
} from '../api/vessels';
import { CreateVesselData, UpdateVesselData, Vessel } from '../types/vessel';

const matchesVesselFilters = (vessel: Vessel, params?: VesselListParams) => {
  if (!params) return true;
  if (params.page && params.page !== 1) return false;
  if (params.status && params.status !== vessel.status) return false;
  if (params.type && params.type !== vessel.type) return false;
  if (params.flag && params.flag !== vessel.flag) return false;

  if (params.search) {
    const search = params.search.toLowerCase();
    const haystack = [vessel.name, vessel.imo, vessel.flag, vessel.type]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  return true;
};

const updateVesselQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (data: VesselsResponse, params?: VesselListParams) => VesselsResponse | undefined
) => {
  const entries = queryClient.getQueriesData<VesselsResponse>({ queryKey: ['vessels'] });
  entries.forEach(([key, data]) => {
    if (!data) return;
    const params = (Array.isArray(key) ? (key[1] as VesselListParams | undefined) : undefined) || undefined;
    const updated = updater(data, params);
    if (updated) {
      queryClient.setQueryData(key, updated);
    }
  });
};

const incrementPagination = (pagination: VesselsResponse['pagination']) => {
  if (!pagination) return pagination;
  const total = (pagination.total ?? 0) + 1;
  const totalPages = Math.max(Math.ceil(total / pagination.limit), 1);
  return { ...pagination, total, totalPages };
};

const decrementPagination = (pagination: VesselsResponse['pagination']) => {
  if (!pagination) return pagination;
  const total = Math.max((pagination.total ?? 0) - 1, 0);
  const totalPages = Math.max(Math.ceil(total / pagination.limit), 1);
  return { ...pagination, total, totalPages };
};

export const useFetchVessels = (params?: VesselListParams) => {
  return useQuery<VesselsResponse>({
    queryKey: ['vessels', params],
    queryFn: () => vesselsApi.getAll(params),
    keepPreviousData: true,
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
    onMutate: async (data: CreateVesselData) => {
      await queryClient.cancelQueries({ queryKey: ['vessels'] });

      const previousEntries = queryClient.getQueriesData<VesselsResponse>({ queryKey: ['vessels'] });
      const optimisticVessel: Vessel = {
        _id: `temp-${Date.now()}`,
        name: data.name,
        imo: data.imo,
        flag: data.flag,
        type: data.type,
        status: data.status || 'Active',
        lastInspectionDate: data.lastInspectionDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updateVesselQueries(queryClient, (existing, params) => {
        if (!matchesVesselFilters(optimisticVessel, params)) return existing;
        if (params?.page && params.page !== 1) return existing;

        const vessels = [optimisticVessel, ...(existing.data?.vessels || [])];
        return {
          ...existing,
          count: vessels.length,
          pagination: existing.pagination ? incrementPagination(existing.pagination) : existing.pagination,
          data: {
            ...existing.data,
            vessels,
          },
        };
      });

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

export const useUpdateVessel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVesselData }) => vesselsApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['vessels'] }),
        queryClient.cancelQueries({ queryKey: ['vessel', id] }),
      ]);

      const previousEntries = queryClient.getQueriesData<VesselsResponse>({ queryKey: ['vessels'] });

      updateVesselQueries(queryClient, (existing) => {
        const vessels = existing.data?.vessels || [];
        const index = vessels.findIndex((v) => v._id === id);
        if (index === -1) return existing;

        const updatedVessel = {
          ...vessels[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };

        const nextVessels = [...vessels];
        nextVessels[index] = updatedVessel;

        return {
          ...existing,
          data: {
            ...existing.data,
            vessels: nextVessels,
          },
        };
      });

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      queryClient.invalidateQueries({ queryKey: ['vessel', variables.id] });
    },
  });
};

export const useDeleteVessel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vesselsApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['vessels'] });
      const previousEntries = queryClient.getQueriesData<VesselsResponse>({ queryKey: ['vessels'] });

      updateVesselQueries(queryClient, (existing) => {
        const vessels = existing.data?.vessels || [];
        const index = vessels.findIndex((v) => v._id === id);
        if (index === -1) return existing;

        const nextVessels = vessels.filter((v) => v._id !== id);
        return {
          ...existing,
          count: nextVessels.length,
          pagination: existing.pagination ? decrementPagination(existing.pagination) : existing.pagination,
          data: {
            ...existing.data,
            vessels: nextVessels,
          },
        };
      });

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

export const useFetchAssignedVessels = (userId?: string) => {
  return useQuery<AssignedVesselsResponse>({
    queryKey: ['assigned-vessels', userId],
    queryFn: () => vesselsApi.getAssigned(userId),
  });
};

