// src/screens/Aluno/AlunoDashboard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../styles/colors';
import { fontFamily } from '../../styles/fontFamily';

export default function AlunoDashboard() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon name="account-circle" size={55} color={colors.white} />
            <View>
              <Text style={styles.title}>Nome do Aluno</Text>
              <Text style={styles.subTitle}>Nome do Aluno</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: colors.offWhite },
  header: { width: '100%', padding: 20, backgroundColor: colors.blue, alignItems: 'center', flexDirection: 'row', gap: 15 },
  title: { fontSize: 22, fontFamily: fontFamily.roboto.bold, color: colors.white, textAlign: 'center' },
  subTitle: { fontSize: 22, fontFamily: fontFamily.roboto.light, color: colors.white, textAlign: 'center' }
});