import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Issue } from '../types/issue';

interface IssueCardProps {
  issue: Issue;
  onPress?: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return '#FF3B30';
      case 'High':
        return '#FF9500';
      case 'Medium':
        return '#FFCC00';
      case 'Low':
        return '#34C759';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return '#007AFF';
      case 'In Progress':
        return '#FF9500';
      case 'Resolved':
        return '#34C759';
      case 'Closed':
        return '#8E8E93';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.category}>{issue.category}</Text>
        <View style={[styles.badge, { backgroundColor: getPriorityColor(issue.priority) }]}>
          <Text style={styles.badgeText}>{issue.priority}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {issue.description}
      </Text>

      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
          <Text style={styles.statusText}>{issue.status}</Text>
        </View>
        <Text style={styles.date}>{formatDate(issue.createdAt)}</Text>
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
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

