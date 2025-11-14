import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi, IssuesResponse, IssueResponse } from '../api/issues';
import { CreateIssueData, UpdateIssueData, RecommendationsResponse } from '../types/issue';

export const useFetchIssues = (vesselId?: string, filters?: {
  status?: string;
  priority?: string;
  category?: string;
}) => {
  return useQuery<IssuesResponse>({
    queryKey: ['issues', vesselId, filters],
    queryFn: () => issuesApi.getAll({ vesselId, ...filters }),
  });
};

export const useFetchMyIssues = (filters?: {
  status?: string;
  priority?: string;
  category?: string;
}) => {
  return useQuery<IssuesResponse>({
    queryKey: ['my-issues', filters],
    queryFn: () => issuesApi.getMyIssues(filters),
  });
};

export const useFetchIssue = (id: string) => {
  return useQuery<IssueResponse>({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueData) => issuesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-issues'] });
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIssueData }) =>
      issuesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => issuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['my-issues'] });
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    },
  });
};

export const useFetchRecommendations = (category: string, vesselType: string) => {
  return useQuery<RecommendationsResponse>({
    queryKey: ['recommendations', category, vesselType],
    queryFn: () => issuesApi.getRecommendations(category, vesselType),
    enabled: !!category && !!vesselType,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches backend cache)
  });
};

