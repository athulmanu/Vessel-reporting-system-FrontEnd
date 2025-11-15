import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  issuesApi,
  IssuesResponse,
  IssueResponse,
  IssueListParams,
  MyIssueListParams,
} from '../api/issues';
import { Issue, CreateIssueData, UpdateIssueData, RecommendationsResponse } from '../types/issue';

const normalizeVesselId = (vesselId: Issue['vesselId']) => {
  if (!vesselId) return undefined;
  return typeof vesselId === 'string' ? vesselId : vesselId._id;
};

const matchesIssueFilters = (
  issue: Issue,
  params?: IssueListParams | MyIssueListParams
) => {
  if (!params) return true;
  const targetPage = params.page ?? 1;
  if (targetPage !== 1) return false;

  const vesselId = normalizeVesselId(issue.vesselId);

  if ('vesselId' in params && params.vesselId && params.vesselId !== vesselId) {
    return false;
  }
  if (params.status && params.status !== issue.status) return false;
  if (params.priority && params.priority !== issue.priority) return false;
  if (params.category && params.category !== issue.category) return false;

  if (params.search) {
    const search = params.search.toLowerCase();
    const text = `${issue.description || ''} ${issue.category || ''}`.toLowerCase();
    if (!text.includes(search)) {
      return false;
    }
  }

  return true;
};

const incrementIssuesPagination = (pagination: IssuesResponse['pagination']) => {
  if (!pagination) return pagination;
  const total = (pagination.total ?? 0) + 1;
  const totalPages = Math.max(Math.ceil(total / pagination.limit), 1);
  return { ...pagination, total, totalPages };
};

const decrementIssuesPagination = (pagination: IssuesResponse['pagination']) => {
  if (!pagination) return pagination;
  const total = Math.max((pagination.total ?? 0) - 1, 0);
  const totalPages = Math.max(Math.ceil(total / pagination.limit), 1);
  return { ...pagination, total, totalPages };
};

const updateIssueQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  keyPrefix: 'issues' | 'my-issues',
  updater: (
    data: IssuesResponse,
    params?: IssueListParams | MyIssueListParams
  ) => IssuesResponse | undefined
) => {
  const entries = queryClient.getQueriesData<IssuesResponse>({ queryKey: [keyPrefix] });
  entries.forEach(([key, data]) => {
    if (!data) return;
    const params = (Array.isArray(key) ? (key[1] as IssueListParams | MyIssueListParams | undefined) : undefined) || undefined;
    const updated = updater(data, params);
    if (updated) {
      queryClient.setQueryData(key, updated);
    }
  });
};

export const useFetchIssues = (params?: IssueListParams, options?: { enabled?: boolean }) => {
  return useQuery<IssuesResponse>({
    queryKey: ['issues', params],
    queryFn: () => issuesApi.getAll(params),
    keepPreviousData: true,
    enabled: options?.enabled ?? true,
  });
};

export const useFetchMyIssues = (params?: MyIssueListParams, options?: { enabled?: boolean }) => {
  return useQuery<IssuesResponse>({
    queryKey: ['my-issues', params],
    queryFn: () => issuesApi.getMyIssues(params),
    keepPreviousData: true,
    enabled: options?.enabled ?? true,
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
    onMutate: async (data: CreateIssueData) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['issues'] }),
        queryClient.cancelQueries({ queryKey: ['my-issues'] }),
      ]);

      const previousIssues = queryClient.getQueriesData<IssuesResponse>({ queryKey: ['issues'] });
      const previousMyIssues = queryClient.getQueriesData<IssuesResponse>({ queryKey: ['my-issues'] });

      const now = new Date().toISOString();
      const optimisticIssue: Issue = {
        _id: `temp-${Date.now()}`,
        vesselId: data.vesselId,
        category: data.category,
        description: data.description,
        priority: data.priority || 'Medium',
        status: data.status || 'Open',
        createdAt: now,
        updatedAt: now,
      } as Issue;

      const prependIssue = (existing: IssuesResponse, params?: IssueListParams | MyIssueListParams) => {
        if (!matchesIssueFilters(optimisticIssue, params)) return existing;
        const issues = [optimisticIssue, ...(existing.data?.issues || [])];
        return {
          ...existing,
          count: issues.length,
          pagination: existing.pagination ? incrementIssuesPagination(existing.pagination) : existing.pagination,
          data: {
            ...existing.data,
            issues,
          },
        };
      };

      updateIssueQueries(queryClient, 'issues', prependIssue);
      updateIssueQueries(queryClient, 'my-issues', prependIssue);

      return { previousIssues, previousMyIssues };
    },
    onError: (_error, _variables, context) => {
      context?.previousIssues?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      context?.previousMyIssues?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
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
    onMutate: async ({ id, data }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['issues'] }),
        queryClient.cancelQueries({ queryKey: ['my-issues'] }),
        queryClient.cancelQueries({ queryKey: ['issue', id] }),
      ]);

      const previousIssues = queryClient.getQueriesData<IssuesResponse>({ queryKey: ['issues'] });
      const previousMyIssues = queryClient.getQueriesData<IssuesResponse>({ queryKey: ['my-issues'] });

      const patchIssues = (existing: IssuesResponse) => {
        const issues = existing.data?.issues || [];
        const index = issues.findIndex((issue) => issue._id === id);
        if (index === -1) return existing;

        const updatedIssue = {
          ...issues[index],
          ...data,
          updatedAt: new Date().toISOString(),
        } as Issue;

        const nextIssues = [...issues];
        nextIssues[index] = updatedIssue;

        return {
          ...existing,
          data: {
            ...existing.data,
            issues: nextIssues,
          },
        };
      };

      updateIssueQueries(queryClient, 'issues', patchIssues);
      updateIssueQueries(queryClient, 'my-issues', patchIssues);

      return { previousIssues, previousMyIssues };
    },
    onError: (_error, variables, context) => {
      context?.previousIssues?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      context?.previousMyIssues?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      queryClient.invalidateQueries({ queryKey: ['issue', variables.id] });
    },
    onSettled: (_data, _error, variables) => {
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
    onMutate: async (id: string) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['issues'] }),
        queryClient.cancelQueries({ queryKey: ['my-issues'] }),
      ]);

      const previousIssues = queryClient.getQueriesData<IssuesResponse>({ queryKey: ['issues'] });
      const previousMyIssues = queryClient.getQueriesData<IssuesResponse>({ queryKey: ['my-issues'] });

      const removeIssue = (existing: IssuesResponse) => {
        const issues = existing.data?.issues || [];
        const exists = issues.some((issue) => issue._id === id);
        if (!exists) return existing;

        const filtered = issues.filter((issue) => issue._id !== id);
        return {
          ...existing,
          count: filtered.length,
          pagination: existing.pagination ? decrementIssuesPagination(existing.pagination) : existing.pagination,
          data: {
            ...existing.data,
            issues: filtered,
          },
        };
      };

      updateIssueQueries(queryClient, 'issues', removeIssue);
      updateIssueQueries(queryClient, 'my-issues', removeIssue);

      return { previousIssues, previousMyIssues };
    },
    onError: (_error, _variables, context) => {
      context?.previousIssues?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      context?.previousMyIssues?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
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

