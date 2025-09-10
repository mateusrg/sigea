import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import ProfessorDashboard from '../screens/Professor/ProfessorDashboard';
import AlunoDashboard from '../screens/Aluno/AlunoDashboard';

const Stack = createStackNavigator();

export default function AppNavigator({ userProfile }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* {!userProfile ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : userProfile === 'admin' ? (
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        ) : userProfile === 'professor' ? (
          <Stack.Screen name="ProfessorDashboard" component={ProfessorDashboard} />
        ) : (
          <Stack.Screen name="AlunoDashboard" component={AlunoDashboard} />
        )} */}
        <Stack.Screen name="AlunoDashboard" component={AlunoDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}