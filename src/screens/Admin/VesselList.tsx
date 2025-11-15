import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFetchVessels, useDeleteVessel } from '../../hooks/useVessels';
import { useRunMaintenanceScan } from '../../hooks/useJobs';
import { VesselCard } from '../../components/VesselCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

export default function VesselList() {
  const navigation = useNavigation();
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, error, refetch, isFetching } = useFetchVessels({
    search: searchTerm || undefined,
    page,
    limit,
  });
  const deleteVessel = useDeleteVessel();
  const maintenanceScan = useRunMaintenanceScan();

  const vessels = data?.data.vessels || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const isRefreshing = isFetching && !isLoading;

  const handleDelete = (vesselId: string, vesselName: string) => {
    Alert.alert(
      'Delete Vessel',
      `Are you sure you want to delete ${vesselName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVessel.mutateAsync(vesselId);
              Alert.alert('Success', 'Vessel deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete vessel');
            }
          },
        },
      ]
    );
  };

  const handleMaintenanceScan = () => {
    Alert.alert(
      'Run Maintenance Scan',
      'This will update vessel statuses based on open issues. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Run Scan',
          onPress: async () => {
            try {
              const result = await maintenanceScan.mutateAsync();
              Alert.alert(
                'Scan Complete',
                `Updated ${result.data.updated} vessels.\nActive: ${result.data.active}\nUnder Maintenance: ${result.data.underMaintenance}`
              );
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Scan failed');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !data) {
    return <Loading message="Loading vessels..." />;
  }

  if (error) {
    return <Error message="Failed to load vessels" onRetry={() => refetch()} />;
  }

  const handleNext = () => {
    if (pagination && page >= pagination.totalPages) return;
    setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, IMO, flag..."
          value={searchInput}
          onChangeText={setSearchInput}
          clearButtonMode="while-editing"
        />
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('VesselForm');
            }}
          >
            <Text style={styles.addButtonText}>+ Add Vessel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scanButton, maintenanceScan.isPending && styles.buttonDisabled]}
            onPress={handleMaintenanceScan}
            disabled={maintenanceScan.isPending}
          >
            {maintenanceScan.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.scanButtonText}>Run Maintenance Scan</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.paginationInfo}>
        <Text style={styles.paginationText}>
          Page {pagination?.page ?? 1} / {totalPages} · {pagination?.total ?? vessels.length} total
        </Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            onPress={handlePrev}
            disabled={page === 1}
          >
            <Text style={styles.pageButtonText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pageButton,
              pagination && page >= totalPages && styles.pageButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={pagination ? page >= totalPages : false}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {vessels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vessels found</Text>
        </View>
      ) : (
        <FlatList
          data={vessels}
          renderItem={({ item }) => (
            <View>
              <VesselCard
                vessel={item}
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('VesselIssues', { vesselId: item._id });
                }}
              />
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('VesselForm', { vessel: item });
                  }}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(item._id, item.name)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
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
  header: {
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  list: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
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
  paginationInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paginationText: {
    color: '#555',
    fontSize: 14,
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
});

