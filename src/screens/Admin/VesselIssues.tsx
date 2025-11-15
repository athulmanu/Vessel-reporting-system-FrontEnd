import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFetchIssues, useUpdateIssue } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { IssueStatus } from '../../types/issue';

export default function VesselIssues() {
  const route = useRoute();
  // @ts-ignore
  const vesselId = route.params?.vesselId;

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data: issuesData, isLoading, error, refetch, isFetching } = useFetchIssues({
    vesselId,
    search: searchTerm || undefined,
    page,
    limit,
  });
  const updateIssue = useUpdateIssue();

  const issues = issuesData?.data.issues || [];
  const pagination = issuesData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const isRefreshing = isFetching && !isLoading;

  const handleResolve = (issueId: string) => {
    Alert.alert(
      'Resolve Issue',
      'Mark this issue as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              await updateIssue.mutateAsync({
                id: issueId,
                data: { status: 'Resolved' as IssueStatus },
              });
              Alert.alert('Success', 'Issue marked as resolved');
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to update issue');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <Loading message="Loading issues..." />;
  }

  if (error) {
    return <Error message="Failed to load issues" onRetry={() => refetch()} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search issues..."
          value={searchInput}
          onChangeText={setSearchInput}
        />
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Page {pagination?.page ?? 1} / {totalPages}
          </Text>
          <View style={styles.paginationButtons}>
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <Text style={styles.pageButtonText}>Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pageButton,
                pagination && page >= totalPages && styles.pageButtonDisabled,
              ]}
              onPress={() => {
                if (pagination && page >= totalPages) return;
                setPage((prev) => prev + 1);
              }}
              disabled={pagination ? page >= totalPages : false}
            >
              <Text style={styles.pageButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {issues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No issues found for this vessel</Text>
        </View>
      ) : (
        <FlatList
          data={issues}
          renderItem={({ item }) => (
            <View>
              <IssueCard issue={item} />
              {item.status !== 'Resolved' && item.status !== 'Closed' && (
                <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(item._id)}>
                  <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  controls: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationText: {
    color: '#555',
  },
  paginationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  pageButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  resolveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

