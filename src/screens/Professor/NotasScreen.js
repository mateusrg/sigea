// src/screens/Professor/NotasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db } from '../../services/firebase';

export default function NotasScreen({ turmaId }) {
  const [alunos, setAlunos] = useState([]);
  const [notas, setNotas] = useState({});

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

  const salvarNotas = async (alunoId) => {
    try {
      const { nota1, nota2 } = notas[alunoId] || {};
      const mediaFinal = ((parseFloat(nota1) || 0) + (parseFloat(nota2) || 0)) / 2;
      await db.collection('notas').doc(alunoId).set({
        turmaId,
        alunoId,
        nota1: parseFloat(nota1) || 0,
        nota2: parseFloat(nota2) || 0,
        mediaFinal
      });
      Alert.alert('Sucesso', 'Notas salvas!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleNotaChange = (alunoId, field, value) => {
    setNotas(prev => ({
      ...prev,
      [alunoId]: { ...prev[alunoId], [field]: value }
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lançar/Editar Notas</Text>
      <FlatList
        data={alunos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alunoRow}>
            <Text>{item.nome}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nota 1"
              keyboardType="numeric"
              value={notas[item.id]?.nota1 || ''}
              onChangeText={v => handleNotaChange(item.id, 'nota1', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Nota 2"
              keyboardType="numeric"
              value={notas[item.id]?.nota2 || ''}
              onChangeText={v => handleNotaChange(item.id, 'nota2', v)}
            />
            <Button title="Salvar" onPress={() => salvarNotas(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  alunoRow: { marginBottom: 12, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 8 },
  input: { backgroundColor: '#fff', marginVertical: 4, padding: 8, borderRadius: 8, width: 70 }
});