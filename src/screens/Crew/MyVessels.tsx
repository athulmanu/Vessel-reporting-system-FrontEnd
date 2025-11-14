import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFetchMyIssues } from '../../hooks/useIssues';
import { useAuth } from '../../hooks/useAuth';
import { VesselCard } from '../../components/VesselCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { Vessel } from '../../types/vessel';

export default function MyVessels() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: issuesData, isLoading, error, refetch } = useFetchMyIssues();

  // Extract unique vessels from issues
  const vessels = React.useMemo(() => {
    if (!issuesData?.data.issues) return [];

    const vesselMap = new Map<string, Vessel & { openIssuesCount: number }>();

    issuesData.data.issues.forEach((issue) => {
      const vesselId = typeof issue.vesselId === 'string' ? issue.vesselId : issue.vesselId._id;
      const vesselData = typeof issue.vesselId === 'object' ? issue.vesselId : null;

      if (vesselData && !vesselMap.has(vesselId)) {
        vesselMap.set(vesselId, {
          _id: vesselId,
          name: vesselData.name || 'Unknown',
          imo: vesselData.imo || '',
          flag: '',
          type: vesselData.type || '',
          status: (vesselData.status as 'Active' | 'Under Maintenance') || 'Active',
          openIssuesCount: 0,
        });
      }
    });

    // Count open issues
    issuesData.data.issues.forEach((issue) => {
      const vesselId = typeof issue.vesselId === 'string' ? issue.vesselId : issue.vesselId._id;
      const vessel = vesselMap.get(vesselId);
      if (vessel && (issue.status === 'Open' || issue.status === 'In Progress')) {
        vessel.openIssuesCount++;
      }
    });

    return Array.from(vesselMap.values());
  }, [issuesData]);

  if (isLoading) {
    return <Loading message="Loading vessels..." />;
  }

  if (error) {
    return <Error message="Failed to load vessels" onRetry={() => refetch()} />;
  }

  if (vessels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No vessels assigned to you</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vessels}
        renderItem={({ item }) => (
          <VesselCard
            vessel={item}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('MyIssues', { vesselId: item._id });
            }}
          />
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
});

