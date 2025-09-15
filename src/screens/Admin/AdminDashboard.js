import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, UserCircleIcon, SignOutIcon, ClipboardTextIcon } from 'phosphor-react-native';

const larguraSidebar = 220;

export default function AdminDashboard() {
  const [userName, setUserName] = useState('');

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
    { label: "Turma com mais alunos", value: "Turma 3 (25)" },
  ];

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
                <SidebarButton label="Dashboard" active icon={<HouseIcon size={22} weight="regular" color="#374151" />} />
                <SidebarButton label="Turmas" icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} />
                <SidebarButton label="Professores" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} />
                <SidebarButton label="Alunos" icon={<UserCircleIcon size={22} weight="regular" color="#374151" />} />
              </View>
            </View>
            <View style={styles.sidebarBottom}>
              <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bem-vindo(a), {userName.split(' ')[0]}!</Text>
              <View style={styles.headerRight}>
                <View style={styles.profileRow}>
                  <UserCircleIcon size={32} color={colors.darkGray} weight="regular" style={styles.profileImg} />
                  <View>
                    <Text style={styles.profileName}>{userName}</Text>
                    <Text style={styles.profileRole}>Administrador</Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <FlatList
                data={dashboardCards}
                keyExtractor={(_, idx) => idx.toString()}
                numColumns={2}
                contentContainerStyle={styles.cardsRow}
                renderItem={({ item }) => <DashboardCard label={item.label} value={item.value} />}
                columnWrapperStyle={{ gap: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SidebarButton({ label, icon, active }) {
  return (
    <TouchableOpacity style={[styles.sidebarBtn, active && styles.sidebarBtnActive]}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8
  },
  profileName: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 15
  },
  profileRole: {
    color: '#6b7280',
    fontSize: 13
  },
  scrollArea: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb'
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
});