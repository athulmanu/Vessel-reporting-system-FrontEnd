import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFetchIssues } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

export default function MyIssues() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const vesselId = route.params?.vesselId;

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    setPage(1);
    setSearchInput('');
    setSearchTerm('');
  }, [vesselId]);

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

  const issues = issuesData?.data.issues || [];
  const pagination = issuesData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const isRefreshing = isFetching && !isLoading;

  if (isLoading) {
    return <Loading message="Loading issues..." />;
  }

  if (error) {
    return <Error message="Failed to load issues" onRetry={() => refetch()} />;
  }

  if (issues.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No issues found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by category or description"
          value={searchInput}
          onChangeText={setSearchInput}
        />
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <Text style={styles.pageButtonText}>Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageIndicator}>
            {pagination?.page ?? 1}/{totalPages}
          </Text>
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

      <FlatList
        data={issues}
        renderItem={({ item }) => (
          <IssueCard
            issue={item}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Recommendations', {
                category: item.category,
                vesselType:
                  typeof item.vesselId === 'object' ? item.vesselId.type : '',
              });
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.recommendationsButton}
            onPress={() => {
              if (issues.length > 0) {
                const firstIssue = issues[0];
                // @ts-ignore
                navigation.navigate('Recommendations', {
                  category: firstIssue.category,
                  vesselType:
                    typeof firstIssue.vesselId === 'object' ? firstIssue.vesselId.type : '',
                });
              }
            }}
          >
            <Text style={styles.recommendationsButtonText}>View Recommendations</Text>
          </TouchableOpacity>
        }
      />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    justifyContent: 'flex-end',
    gap: 12,
  },
  pageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pageButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pageIndicator: {
    color: '#555',
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
  recommendationsButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

