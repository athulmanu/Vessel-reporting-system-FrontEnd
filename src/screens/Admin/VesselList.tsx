import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFetchVessels, useDeleteVessel } from '../../hooks/useVessels';
import { useRunMaintenanceScan } from '../../hooks/useJobs';
import { VesselCard } from '../../components/VesselCard';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';

export default function VesselList() {
  const navigation = useNavigation();
  const { data, isLoading, error, refetch } = useFetchVessels();
  const deleteVessel = useDeleteVessel();
  const maintenanceScan = useRunMaintenanceScan();

  const vessels = data?.data.vessels || [];

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
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
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
});

