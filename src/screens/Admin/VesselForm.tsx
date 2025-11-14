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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCreateVessel, useUpdateVessel } from '../../hooks/useVessels';
import { Vessel, VesselStatus } from '../../types/vessel';

export default function VesselForm() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const editingVessel: Vessel | undefined = route.params?.vessel;

  const [name, setName] = useState('');
  const [imo, setImo] = useState('');
  const [flag, setFlag] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState<VesselStatus>('Active');
  const [lastInspectionDate, setLastInspectionDate] = useState('');

  const createVessel = useCreateVessel();
  const updateVessel = useUpdateVessel();

  useEffect(() => {
    if (editingVessel) {
      setName(editingVessel.name);
      setImo(editingVessel.imo);
      setFlag(editingVessel.flag);
      setType(editingVessel.type);
      setStatus(editingVessel.status);
      setLastInspectionDate(editingVessel.lastInspectionDate || '');
    }
  }, [editingVessel]);

  const handleSubmit = async () => {
    if (!name.trim() || !imo.trim() || !flag.trim() || !type.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate IMO (7 digits)
    if (!/^\d{7}$/.test(imo)) {
      Alert.alert('Error', 'IMO must be exactly 7 digits');
      return;
    }

    try {
      const vesselData = {
        name: name.trim(),
        imo: imo.trim(),
        flag: flag.trim(),
        type: type.trim(),
        status,
        lastInspectionDate: lastInspectionDate || undefined,
      };

      if (editingVessel) {
        await updateVessel.mutateAsync({ id: editingVessel._id, data: vesselData });
        Alert.alert('Success', 'Vessel updated successfully');
      } else {
        await createVessel.mutateAsync(vesselData);
        Alert.alert('Success', 'Vessel created successfully');
      }

      // @ts-ignore
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    }
  };

  const isPending = createVessel.isPending || updateVessel.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{editingVessel ? 'Edit Vessel' : 'Add Vessel'}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Vessel name"
            editable={!isPending}
          />

          <Text style={styles.label}>IMO (7 digits) *</Text>
          <TextInput
            style={styles.input}
            value={imo}
            onChangeText={setImo}
            placeholder="1234567"
            keyboardType="numeric"
            maxLength={7}
            editable={!editingVessel && !isPending}
          />

          <Text style={styles.label}>Flag *</Text>
          <TextInput
            style={styles.input}
            value={flag}
            onChangeText={setFlag}
            placeholder="Country flag"
            editable={!isPending}
          />

          <Text style={styles.label}>Type *</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="Vessel type"
            editable={!isPending}
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusSelector}>
            <TouchableOpacity
              style={[styles.statusOption, status === 'Active' && styles.statusOptionSelected]}
              onPress={() => setStatus('Active')}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  status === 'Active' && styles.statusOptionTextSelected,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusOption,
                status === 'Under Maintenance' && styles.statusOptionSelected,
              ]}
              onPress={() => setStatus('Under Maintenance')}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  status === 'Under Maintenance' && styles.statusOptionTextSelected,
                ]}
              >
                Under Maintenance
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Last Inspection Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={lastInspectionDate}
            onChangeText={setLastInspectionDate}
            placeholder="YYYY-MM-DD"
            editable={!isPending}
          />

          <TouchableOpacity
            style={[styles.button, isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
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
  statusSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  statusOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#333',
  },
  statusOptionTextSelected: {
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
});

