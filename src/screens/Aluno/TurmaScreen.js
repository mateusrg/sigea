// src/screens/Aluno/TurmaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '../../services/firebase';

export default function TurmaScreen({ alunoId }) {
  const [turma, setTurma] = useState(null);

  useEffect(() => {
    // Fetch turma for alunoId
    const fetchTurma = async () => {
      const alunoDoc = await db.collection('alunos').doc(alunoId).get();
      const turmaId = alunoDoc.exists ? alunoDoc.data().turmaId : null;
      if (turmaId) {
        const turmaDoc = await db.collection('turmas').doc(turmaId).get();
        setTurma(turmaDoc.exists ? turmaDoc.data() : null);
      }
    };
    fetchTurma();
  }, [alunoId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Turma</Text>
      {turma ? (
        <View style={styles.turmaBox}>
          <Text>Nome: {turma.nome}</Text>
        </View>
      ) : (
        <Text>Nenhuma turma encontrada.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FAFBFC' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 16 },
  turmaBox: { backgroundColor: '#E2E8F0', padding: 16, borderRadius: 8 }
});