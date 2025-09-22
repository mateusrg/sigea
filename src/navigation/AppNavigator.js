import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import AlunosScreen from '../screens/Admin/AlunosScreen';
import ProfessoresScreen from '../screens/Admin/ProfessoresScreen';
import TurmasScreenAdmin from '../screens/Admin/TurmasScreen';
import ProfessorDashboard from '../screens/Professor/ProfessorDashboard';
import AlunoDashboard from '../screens/Aluno/AlunoDashboard';
import TurmasScreen from '../screens/Professor/TurmasScreen';
import AulasTurmaScreen from '../screens/Professor/AulasTurmaScreen';
import PresencaScreen from '../screens/Professor/PresencaScreen';
import NotasScreen from '../screens/Professor/NotasScreen';
import AlunosTurmaScreen from '../screens/Professor/AlunosTurmaScreen';
import NotasAlunoScreen from '../screens/Aluno/NotasAlunoScreen';

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
          <>
            <Stack.Screen name="AdminDashboard">
              {props => <AdminDashboard {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="AlunosScreen">
              {props => <AlunosScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="ProfessoresScreen">
              {props => <ProfessoresScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="TurmasScreen">
              {props => <TurmasScreenAdmin {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
          </>
        ) : userProfile === 'professor' ? (
          <>
            <Stack.Screen name="ProfessorDashboard">
              {props => <ProfessorDashboard {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="TurmasScreen">
              {props => <TurmasScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="AulasTurmaScreen">
              {props => <AulasTurmaScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="PresencaScreen">
              {props => <PresencaScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="NotasScreen">
              {props => <NotasScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="AlunosTurmaScreen">
              {props => <AlunosTurmaScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="AlunoDashboard">
              {props => <AlunoDashboard {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
            <Stack.Screen name="NotasAlunoScreen">
              {props => <NotasAlunoScreen {...props} setUserProfile={setUserProfile} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}