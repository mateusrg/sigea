import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [userProfile, setUserProfile] = useState(null);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {!userProfile ? (
        <LoginScreen setUserProfile={setUserProfile} />
      ) : (
        <AppNavigator userProfile={userProfile} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
