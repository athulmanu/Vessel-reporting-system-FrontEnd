import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFetchMyIssues, useFetchIssues } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

export default function MyIssues() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const vesselId = route.params?.vesselId;

  const { data: issuesData, isLoading, error, refetch } = vesselId
    ? useFetchIssues(vesselId)
    : useFetchMyIssues();

  const issues = issuesData?.data.issues || [];

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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
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

