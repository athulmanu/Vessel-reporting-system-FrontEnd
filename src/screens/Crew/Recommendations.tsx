import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useFetchRecommendations } from '../../hooks/useIssues';
import { IssueCard } from '../../components/IssueCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

export default function Recommendations() {
  const route = useRoute();
  // @ts-ignore
  const { category, vesselType } = route.params || {};

  const { data, isLoading, error } = useFetchRecommendations(
    category || '',
    vesselType || ''
  );

  const recommendations = data?.data.recommendations || [];

  if (!category || !vesselType) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Category and vessel type are required</Text>
      </View>
    );
  }

  if (isLoading) {
    return <Loading message="Loading recommendations..." />;
  }

  if (error) {
    return <Error message="Failed to load recommendations" />;
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recommendations available</Text>
        <Text style={styles.subText}>
          No resolved issues found for {category} on {vesselType} vessels
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recommendations</Text>
        <Text style={styles.subtitle}>
          Similar resolved issues for {category} on {vesselType} vessels
        </Text>
      </View>
      <FlatList
        data={recommendations}
        renderItem={({ item }) => <IssueCard issue={item} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

