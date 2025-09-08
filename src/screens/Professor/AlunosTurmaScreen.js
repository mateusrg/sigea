// src/screens/Professor/AlunosTurmaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../../services/firebase';

export default function AlunosTurmaScreen({ turmaId }) {
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    // Fetch alunos enrolled in turmaId
    const unsubscribe = db.collection('alunos')
      .where('turmaId', '==', turmaId)
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlunos(list);
      });
    return unsubscribe;
  }, [turmaId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alunos da Turma</Text>
      <FlatList
        data={alunos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alunoRow}>
            <Text>{item.nome}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  alunoRow: { padding: 12, backgroundColor: '#E2E8F0', borderRadius: 8, marginBottom: 8 }
});