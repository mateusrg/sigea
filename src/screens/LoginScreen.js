// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { login } from '../services/authService';

export default function LoginScreen({ navigation, setUserProfile }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (profile) {
        setUserProfile(profile); // parent App sets navigation
      } else {
        Alert.alert('Erro', 'Perfil não encontrado.');
      }
    } catch (error) {
      Alert.alert('Erro de login', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGEAS Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator color="#2B6CB0" />
      ) : (
        <Button title="Entrar" onPress={handleLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 24 },
  input: { backgroundColor: '#E2E8F0', marginBottom: 16, padding: 12, borderRadius: 8 }
});