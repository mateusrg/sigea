// src/screens/Aluno/NotasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../../services/firebase';

export default function NotasScreen({ alunoId }) {
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    // Fetch grades for alunoId
    const unsubscribe = db.collection('notas')
      .where('alunoId', '==', alunoId)
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => doc.data());
        setNotas(list);
      });
    return unsubscribe;
  }, [alunoId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Notas</Text>
      <FlatList
        data={notas}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>Nota 1: {item.nota1}</Text>
            <Text>Nota 2: {item.nota2}</Text>
            <Text>Média Final: {item.mediaFinal}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  row: { backgroundColor: '#E2E8F0', padding: 8, borderRadius: 8, marginBottom: 8 }
});