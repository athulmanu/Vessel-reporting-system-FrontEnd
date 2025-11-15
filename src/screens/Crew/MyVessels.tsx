import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFetchAssignedVessels } from '../../hooks/useVessels';
import { VesselCard } from '../../components/VesselCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

export default function MyVessels() {
  const navigation = useNavigation();
  const { data, isLoading, isRefetching, error, refetch } = useFetchAssignedVessels();

  if (isLoading) {
    return <Loading message="Loading vessels..." />;
  }

  if (error) {
    return <Error message="Failed to load vessels" onRetry={() => refetch()} />;
  }

  const vessels = data?.data.vessels ?? [];
  const emptyMessage = data?.message ?? 'No vessels assigned to you';

  if (vessels.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
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

