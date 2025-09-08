// src/screens/Professor/PresencaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { db } from '../../services/firebase';

export default function PresencaScreen({ turmaId }) {
  const [alunos, setAlunos] = useState([]);
  const [presencas, setPresencas] = useState({});

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

  const registrarPresenca = async (alunoId, presente) => {
    try {
      await db.collection('presencas').add({
        alunoId,
        turmaId,
        presente,
        data: new Date().toISOString().slice(0, 10)
      });
      setPresencas(prev => ({ ...prev, [alunoId]: presente }));
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Presença</Text>
      <FlatList
        data={alunos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.alunoRow}>
            <Text>{item.nome}</Text>
            <Button
              title={presencas[item.id] === true ? 'Presente' : presencas[item.id] === false ? 'Falta' : 'Marcar Presença'}
              color={presencas[item.id] === true ? '#2F855A' : presencas[item.id] === false ? '#E53E3E' : '#3182CE'}
              onPress={() => registrarPresenca(item.id, presencas[item.id] !== true)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  alunoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 8 }
});