import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import ProfessorDashboard from '../screens/Professor/ProfessorDashboard';
import AlunoDashboard from '../screens/Aluno/AlunoDashboard';

const Stack = createStackNavigator();

export default function AppNavigator({ userProfile, setUserProfile }) {
  return (
    <NavigationContainer>
      <Stack.Navigator key={userProfile || 'login'} screenOptions={{ headerShown: false }}>
        {!userProfile ? (
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} setUserProfile={setUserProfile} />}
          </Stack.Screen>
        ) : userProfile === 'admin' ? (
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        ) : userProfile === 'professor' ? (
          <>
            <Stack.Screen name="ProfessorDashboard">
              {props => <ProfessorDashboard {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="TurmasScreen" component={require('../screens/Professor/TurmasScreen').default} />
            <Stack.Screen name="PresencaScreen" component={require('../screens/Professor/PresencaScreen').default} />
            <Stack.Screen name="NotasScreen" component={require('../screens/Professor/NotasScreen').default} />
            <Stack.Screen name="AlunosTurmaScreen" component={require('../screens/Professor/AlunosTurmaScreen').default} />
          </>
        ) : (
          <Stack.Screen name="AlunoDashboard" component={AlunoDashboard} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}