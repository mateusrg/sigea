// src/screens/Admin/AdminDashboard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Administrador</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFBFC' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2B6CB0' }
});