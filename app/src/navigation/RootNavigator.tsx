import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import EndScreen from '../screens/EndScreen';
import ExoDetailScreen from '../screens/ExoDetailScreen';
import ExoEditScreen from '../screens/ExoEditScreen';
import ExosScreen from '../screens/ExosScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import PlanningScreen from '../screens/PlanningScreen';
import RestScreen from '../screens/RestScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SessionEditScreen from '../screens/SessionEditScreen';
import SessionsScreen from '../screens/SessionsScreen';
import SetScreen from '../screens/SetScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Set" component={SetScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Rest" component={RestScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="End" component={EndScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        <Stack.Screen name="Exos" component={ExosScreen} />
        <Stack.Screen name="ExoDetail" component={ExoDetailScreen} />
        <Stack.Screen name="ExoEdit" component={ExoEditScreen} />
        <Stack.Screen name="Sessions" component={SessionsScreen} />
        <Stack.Screen name="SessionEdit" component={SessionEditScreen} />
        <Stack.Screen name="Planning" component={PlanningScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
