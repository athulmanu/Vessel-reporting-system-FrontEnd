import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/Login/LoginScreen';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

// Crew Screens
import MyVessels from '../screens/Crew/MyVessels';
import ReportIssue from '../screens/Crew/ReportIssue';
import MyIssues from '../screens/Crew/MyIssues';
import Recommendations from '../screens/Crew/Recommendations';

// Admin Screens
import VesselList from '../screens/Admin/VesselList';
import VesselForm from '../screens/Admin/VesselForm';
import VesselIssues from '../screens/Admin/VesselIssues';

const Stack = createNativeStackNavigator();

// Crew Navigator
function CrewNavigator() {
  const { logout } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyVessels"
        component={MyVessels}
        options={({ navigation }) => ({
          title: 'My Vessels',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('ReportIssue');
                }}
              >
                <Text style={{ color: '#007AFF', fontSize: 16 }}>Report Issue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <Text style={{ color: '#FF3B30', fontSize: 16 }}>Logout</Text>
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Stack.Screen name="ReportIssue" component={ReportIssue} options={{ title: 'Report Issue' }} />
      <Stack.Screen name="MyIssues" component={MyIssues} options={{ title: 'My Issues' }} />
      <Stack.Screen
        name="Recommendations"
        component={Recommendations}
        options={{ title: 'Recommendations' }}
      />
    </Stack.Navigator>
  );
}

// Admin Navigator
function AdminNavigator() {
  const { logout } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VesselList"
        component={VesselList}
        options={{
          title: 'Vessel Management',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <Text style={{ color: '#FF3B30', fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="VesselForm" component={VesselForm} options={{ title: 'Vessel Form' }} />
      <Stack.Screen
        name="VesselIssues"
        component={VesselIssues}
        options={{ title: 'Vessel Issues' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : user?.role === 'admin' ? (
          <Stack.Screen
            name="Admin"
            component={AdminNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Crew"
            component={CrewNavigator}
            options={({ navigation }) => ({
              headerShown: false,
            })}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
