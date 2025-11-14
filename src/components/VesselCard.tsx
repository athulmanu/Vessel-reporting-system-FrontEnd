import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Vessel } from '../types/vessel';

interface VesselCardProps {
  vessel: Vessel;
  onPress?: () => void;
}

export const VesselCard: React.FC<VesselCardProps> = ({ vessel, onPress }) => {
  const getStatusColor = (status: string) => {
    return status === 'Active' ? '#34C759' : '#FF9500';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{vessel.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vessel.status) }]}>
          <Text style={styles.statusText}>{vessel.status}</Text>
        </View>
      </View>
      
      <View style={styles.body}>
        <Text style={styles.imo}>IMO: {vessel.imo}</Text>
        {vessel.openIssuesCount !== undefined && (
          <View style={styles.issuesRow}>
            <Text style={styles.issuesLabel}>Open Issues:</Text>
            <Text style={styles.issuesCount}>{vessel.openIssuesCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    gap: 8,
  },
  imo: {
    fontSize: 14,
    color: '#666',
  },
  issuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  issuesLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  issuesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

