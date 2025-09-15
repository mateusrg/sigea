import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, UserCircleIcon, SignOutIcon, ClipboardTextIcon } from 'phosphor-react-native';

const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

export default function Turmas() {
  const [userName, setUserName] = useState('');
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Administrador');
        }
      } catch {
        setUserName('Administrador');
      }
    };
    fetchUser();
  }, []);

  const dashboardCards = [
    { label: "Total de Turmas", value: "12" },
    { label: "Total de Professores", value: "8" },
    { label: "Total de Alunos", value: "120" },
    { label: "Alunos Ativos Hoje", value: "102" },
    { label: "Turma com mais alunos", value: "Turma 101 (25)" },
  ];

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const turmas = [
    { id: 1, name: 'Matemática 101', students: 25 },
    { id: 2, name: 'Ciências 201', students: 20 },
    { id: 3, name: 'História 301', students: 18 },
    { id: 4, name: 'Geografia 401', students: 22 },
    { id: 5, name: 'Física 501', students: 15 },
  ];

  let numColumns = 1;
  if (width >= 1600) numColumns = 4;
  else if (width >= 750) numColumns = 2;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <View style={styles.container}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View>
              <View style={styles.logoRow}>
                <Image
                  source={require('../../../assets/logo-simplificado.png')}
                  style={{ height: 40, width: 40 }}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>Eduteca</Text>
              </View>
              <View style={styles.sidebarNav}>
                <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("AdminDashboard")} />
                <SidebarButton label="Turmas" active icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("TurmasScreen")} />
                <SidebarButton label="Professores" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("ProfessoresScreen")} />
                <SidebarButton label="Alunos" icon={<UserCircleIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("AlunosScreen")} />
              </View>
            </View>
            <View style={styles.sidebarBottom}>
              <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} onPress={() => setLogoutModalVisible(true)} />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Turmas</Text>
              </View>

              <View style={styles.tableWrapper}>
                {/* Cabeçalho da tabela */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Turma</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'center' }]}>Alunos</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.5, textAlign: 'center' }]}>Ações</Text>
                </View>

                {/* Linhas da tabela */}
                {turmas.map((turma) => (
                  <View key={turma.id} style={[styles.tableRow, styles.tableRowBorder]}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{turma.name}</Text>
                    <Text style={[styles.tableCell, { flex: 2, textAlign: 'center' }]}>{turma.students}</Text>

                    <View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                        onPress={() => console.log('Editar', turma.id)}
                      >
                        <Text style={styles.actionButtonText}>Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                        onPress={() => console.log('Excluir', turma.id)}
                      >
                        <Text style={styles.actionButtonText}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              {/* Botão Criar Turma */}
              <TouchableOpacity
                style={styles.criarButton}
                onPress={() => console.log('Criar Turma')}
              >
                <Text style={styles.criarButtonText}>Criar Turma</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          {/* Logout Modal */}
          <Modal
            visible={logoutModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setLogoutModalVisible(false)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <View style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                width: 320
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Confirmar Logout</Text>
                <Text style={{ fontSize: 15, color: '#374151', marginBottom: 24 }}>Tem certeza que deseja sair?</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setLogoutModalVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#ef4444', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleLogout}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sair</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SidebarButton({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.sidebarBtn, active && styles.sidebarBtnActive]} onPress={onPress}>
      <View style={[styles.sidebarBtnIcon, active && styles.sidebarBtnIconActive]}>{icon}</View>
      <Text style={[styles.sidebarBtnText, active && styles.sidebarBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DashboardCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%'
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    height: '100vh',
    width: larguraSidebar,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 16,
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24
  },
  logoText: {
    fontFamily: fontFamily.poppins.medium,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.variantGray
  },
  sidebarNav: {
    flexDirection: 'column',
    gap: 8
  },
  sidebarBottom: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16
  },
  sidebarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 4
  },
  sidebarBtnActive: {
    backgroundColor: '#f3f4f6'
  },
  sidebarBtnIcon: {
    fontSize: 18,
    color: '#374151'
  },
  sidebarBtnIconActive: {
    color: '#137fec'
  },
  sidebarBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  },
  sidebarBtnTextActive: {
    color: '#137fec',
    fontWeight: 'bold'
  },
  main: {
    flex: 1,
    paddingLeft: larguraSidebar,
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pageTitle: {
    color: '#0d171b',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
    minWidth: 288,
  },
  cardsRow: {
    marginBottom: 8,
    paddingBottom: 0,
    paddingHorizontal: 0
  },
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 18,
    marginBottom: 8,
    gap: 8
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  cardValue: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: 'bold'
  },
  tableWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cfdfe7',
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#cfdfe7',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#0d171b',
  },
  tableCell: {
    fontSize: 14,
    color: '#374151',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  criarButton: {
    backgroundColor: '#10B981',
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  criarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});