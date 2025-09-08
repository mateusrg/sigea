// src/screens/Admin/TurmasScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { db } from '../../services/firebase';

export default function TurmasScreen() {
  const [turmas, setTurmas] = useState([]);
  const [novaTurma, setNovaTurma] = useState('');

  useEffect(() => {
    const unsubscribe = db.collection('turmas').onSnapshot(snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTurmas(list);
    });
    return unsubscribe;
  }, []);

  const criarTurma = async () => {
    if (!novaTurma.trim()) return;
    try {
      await db.collection('turmas').add({ nome: novaTurma });
      setNovaTurma('');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const excluirTurma = async (id) => {
    try {
      await db.collection('turmas').doc(id).delete();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Turmas</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nova turma"
          value={novaTurma}
          onChangeText={setNovaTurma}
        />
        <Button title="Criar" onPress={criarTurma} />
      </View>
      <FlatList
        data={turmas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.turmaRow}>
            <Text>{item.nome}</Text>
            <Button title="Excluir" color="#E53E3E" onPress={() => excluirTurma(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  row: { flexDirection: 'row', marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#E2E8F0', padding: 12, borderRadius: 8, marginRight: 8 },
  turmaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 8 }
});