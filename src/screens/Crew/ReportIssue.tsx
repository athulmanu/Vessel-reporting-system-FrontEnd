import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreateIssue, useFetchMyIssues, useFetchIssues } from '../../hooks/useIssues';
import { useAuth } from '../../hooks/useAuth';
import { IssuePriority } from '../../types/issue';

const PRIORITIES: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function ReportIssue() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [vesselId, setVesselId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('Medium');

  const { data: myIssuesData } = useFetchMyIssues();
  const { data: vesselIssuesData } = useFetchIssues(vesselId || undefined);
  const createIssue = useCreateIssue();
  
  // Extract unique vessels from issues
  const vessels = React.useMemo(() => {
    const vesselMap = new Map();
    
    // Get vessels from issues
    if (myIssuesData?.data.issues) {
      myIssuesData.data.issues.forEach((issue: any) => {
        const id = typeof issue.vesselId === 'string' ? issue.vesselId : issue.vesselId._id;
        const data = typeof issue.vesselId === 'object' ? issue.vesselId : null;

        if (data && !vesselMap.has(id)) {
          vesselMap.set(id, {
            _id: id,
            name: data.name || 'Unknown',
          });
        }
      });
    }
    
    // Also include assigned vessels that might not have issues yet
    if (user?.assignedVesselIds) {
      user.assignedVesselIds.forEach((id: string) => {
        if (!vesselMap.has(id)) {
          vesselMap.set(id, {
            _id: id,
            name: 'Vessel', // Will be populated when issues are created
          });
        }
      });
    }

    return Array.from(vesselMap.values());
  }, [myIssuesData, user]);

  // Count open issues for selected vessel (all issues for that vessel, not just user's)
  const openIssuesCount = React.useMemo(() => {
    if (!vesselId || !vesselIssuesData?.data.issues) return 0;
    return vesselIssuesData.data.issues.filter(
      (issue) => issue.status === 'Open' || issue.status === 'In Progress'
    ).length;
  }, [vesselId, vesselIssuesData]);

  const handleSubmit = async () => {
    if (!vesselId) {
      Alert.alert('Error', 'Please select a vessel');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Error', 'Please enter a category');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (openIssuesCount >= 3) {
      Alert.alert(
        'Error',
        'This vessel cannot have more than 3 open issues. Please resolve existing issues before creating new ones.'
      );
      return;
    }

    try {
      await createIssue.mutateAsync({
        vesselId,
        category: category.trim(),
        description: description.trim(),
        priority,
      });

      Alert.alert('Success', 'Issue reported successfully', [
        {
          text: 'OK',
          onPress: () => {
            setVesselId('');
            setCategory('');
            setDescription('');
            setPriority('Medium');
            // @ts-ignore
            navigation.navigate('MyIssues');
          },
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to report issue. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report Issue</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Vessel *</Text>
          {vessels.length === 0 ? (
            <Text style={styles.errorText}>No vessels assigned to you</Text>
          ) : (
            <View style={styles.vesselSelector}>
              {vessels.map((vessel) => (
                <TouchableOpacity
                  key={vessel._id}
                  style={[
                    styles.vesselOption,
                    vesselId === vessel._id && styles.vesselOptionSelected,
                  ]}
                  onPress={() => setVesselId(vessel._id)}
                >
                  <Text
                    style={[
                      styles.vesselOptionText,
                      vesselId === vessel._id && styles.vesselOptionTextSelected,
                    ]}
                  >
                    {vessel.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {vesselId && openIssuesCount >= 3 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                This vessel has {openIssuesCount} open issues. Cannot create more.
              </Text>
            </View>
          )}

          {vesselId && openIssuesCount < 3 && (
            <Text style={styles.infoText}>Open issues: {openIssuesCount}/3</Text>
          )}

          <Text style={styles.label}>Category *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Engine, Hull, Electrical"
            value={category}
            onChangeText={setCategory}
            editable={!createIssue.isPending}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!createIssue.isPending}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.prioritySelector}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityOption, priority === p && styles.priorityOptionSelected]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityOptionText,
                    priority === p && styles.priorityOptionTextSelected,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (createIssue.isPending || openIssuesCount >= 3) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createIssue.isPending || openIssuesCount >= 3}
          >
            {createIssue.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Issue</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  vesselSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vesselOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  vesselOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  vesselOptionText: {
    fontSize: 14,
    color: '#333',
  },
  vesselOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityOptionText: {
    fontSize: 14,
    color: '#333',
  },
  priorityOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  warningText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
});

