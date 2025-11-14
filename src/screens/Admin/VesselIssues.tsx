import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
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

  const { data: issuesData, isLoading, error, refetch } = useFetchIssues(vesselId);
  const updateIssue = useUpdateIssue();

  const issues = issuesData?.data.issues || [];

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

  if (issues.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No issues found for this vessel</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={issues}
        renderItem={({ item }) => (
          <View>
            <IssueCard issue={item} />
            {item.status !== 'Resolved' && item.status !== 'Closed' && (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => handleResolve(item._id)}
              >
                <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
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

