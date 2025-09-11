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
      // Validation
      if (
        nota1 === undefined || nota2 === undefined ||
        isNaN(nota1) || isNaN(nota2) ||
        nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10
      ) {
        Alert.alert('Erro', 'Notas devem ser números entre 0 e 10.');
        return;
      }
      const mediaFinal = ((parseFloat(nota1) || 0) + (parseFloat(nota2) || 0)) / 2;
      const notaDoc = await db.collection('notas').doc(alunoId).get();
      let historico = [];
      if (notaDoc.exists) {
        historico = notaDoc.data().historico || [];
        historico.push({
          nota1: notaDoc.data().nota1,
          nota2: notaDoc.data().nota2,
          mediaFinal: notaDoc.data().mediaFinal,
          timestamp: new Date().toISOString()
        });
      }
      await db.collection('notas').doc(alunoId).set({
        turmaId,
        alunoId,
        nota1: parseFloat(nota1),
        nota2: parseFloat(nota2),
        mediaFinal,
        historico
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
            <Text style={styles.alunoNome}>{item.nome}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nota 1"
              keyboardType="numeric"
              value={notas[item.id]?.nota1 || ''}
              onChangeText={v => handleNotaChange(item.id, 'nota1', v)}
              accessibilityLabel={`Nota 1 de ${item.nome}`}
            />
            <TextInput
              style={styles.input}
              placeholder="Nota 2"
              keyboardType="numeric"
              value={notas[item.id]?.nota2 || ''}
              onChangeText={v => handleNotaChange(item.id, 'nota2', v)}
              accessibilityLabel={`Nota 2 de ${item.nome}`}
            />
            <Button title="Salvar" onPress={() => salvarNotas(item.id)} />
            {/* Histórico de notas */}
            <NotasHistorico alunoId={item.id} />
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
  alunoNome: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  input: { backgroundColor: '#fff', marginVertical: 4, padding: 8, borderRadius: 8, width: 70 }
});

// Histórico de notas por aluno
import React, { useEffect, useState } from 'react';
function NotasHistorico({ alunoId }) {
  const [historico, setHistorico] = useState([]);
  useEffect(() => {
    const unsub = db.collection('notas').doc(alunoId).onSnapshot(doc => {
      if (doc.exists && doc.data().historico) {
        setHistorico(doc.data().historico.slice(-3).reverse());
      } else {
        setHistorico([]);
      }
    });
    return () => unsub();
  }, [alunoId]);
  if (!historico.length) return null;
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 12, color: '#4A5568' }}>Histórico:</Text>
      {historico.map((h, idx) => (
        <Text key={idx} style={{ fontSize: 12 }}>
          {h.timestamp?.slice(0, 16).replace('T', ' ')} | N1: {h.nota1} | N2: {h.nota2} | Média: {h.mediaFinal}
        </Text>
      ))}
    </View>
  );
}