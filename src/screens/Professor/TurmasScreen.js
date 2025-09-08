// src/screens/Professor/TurmasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../../services/firebase';

export default function TurmasScreen({ professorId, onSelectTurma }) {
  const [turmas, setTurmas] = useState([]);

  useEffect(() => {
    // Fetch turmas where professorId is assigned
    const unsubscribe = db.collection('turmas')
      .where('professorId', '==', professorId)
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTurmas(list);
      });
    return unsubscribe;
  }, [professorId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Turmas</Text>
      <FlatList
        data={turmas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.turmaRow} onPress={() => onSelectTurma(item)}>
            <Text>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  turmaRow: { padding: 12, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 8 }
});