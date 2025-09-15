// src/screens/Aluno/HistoricoPresencaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db } from '../../services/firebase';

export default function HistoricoPresencaScreen({ alunoId }) {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const unsubscribe = db.collection('presencas')
      .where('alunoId', '==', alunoId)
      .orderBy('data', 'desc')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => doc.data());
        setHistorico(list);
      });
    return unsubscribe;
  }, [alunoId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Presenças</Text>
      <FlatList
        data={historico}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.data}: {item.presente ? 'Presente' : 'Falta'}</Text>
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