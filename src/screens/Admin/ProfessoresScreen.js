// src/screens/Admin/ProfessoresScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { db } from '../../services/firebase';

export default function ProfessoresScreen() {
  const [professores, setProfessores] = useState([]);
  const [novoNome, setNovoNome] = useState('');

  useEffect(() => {
    const unsubscribe = db.collection('professores').onSnapshot(snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfessores(list);
    });
    return unsubscribe;
  }, []);

  const cadastrarProfessor = async () => {
    if (!novoNome.trim()) return;
    try {
      await db.collection('professores').add({ nome: novoNome });
      setNovoNome('');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const excluirProfessor = async (id) => {
    try {
      await db.collection('professores').doc(id).delete();
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Professores</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nome do professor"
          value={novoNome}
          onChangeText={setNovoNome}
        />
        <Button title="Cadastrar" onPress={cadastrarProfessor} />
      </View>
      <FlatList
        data={professores}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.profRow}>
            <Text>{item.nome}</Text>
            <Button title="Excluir" color="#E53E3E" onPress={() => excluirProfessor(item.id)} />
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
  profRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#E2E8F0', padding: 8, borderRadius: 8 }
});