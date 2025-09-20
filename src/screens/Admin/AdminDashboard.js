import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, UserCircleIcon, SignOutIcon, ClipboardTextIcon } from 'phosphor-react-native';

const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

import { getDashboardCounts, getTurmaComMaisAlunos, getAlunosAtivosHoje } from '../../services/authService';

export default function AdminDashboard() {
  const [userName, setUserName] = useState('');
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [dashboardCards, setDashboardCards] = useState([]);
  const [turma, setTurma] = useState({ nome: '', alunos: 0 });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true); // inicia loading
      try {
        const counts = await getDashboardCounts();
        const turmaMaisAlunos = await getTurmaComMaisAlunos();
        const ativosHoje = await getAlunosAtivosHoje();

        setDashboardCards([
          { label: "Total de Turmas", value: counts.totalTurmas },
          { label: "Total de Professores", value: counts.totalProfessores },
          { label: "Total de Alunos", value: counts.totalAlunos },
          { label: "Alunos Ativos Hoje", value: ativosHoje },
        ]);

        setTurma(turmaMaisAlunos);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false); // termina loading
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

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
                <SidebarButton label="Dashboard" active icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("AdminDashboard")} />
                <SidebarButton label="Turmas" icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("TurmasScreen")} />
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
              {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                  <ActivityIndicator size="large" color="#2563ea" />
                  <Text style={{ marginTop: 12, color: '#374151', fontSize: 16 }}>Carregando dados...</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={dashboardCards}
                    keyExtractor={(_, idx) => idx.toString()}
                    numColumns={numColumns}
                    key={numColumns}
                    contentContainerStyle={styles.cardsRow}
                    renderItem={({ item }) => <DashboardCard label={item.label} value={item.value} />}
                    columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                  />

                  <TouchableOpacity style={[styles.card, { backgroundColor: "#2563ea", alignItems: 'flex-start', justifyContent: 'center', padding: 40, gap: 4, cursor: "default", marginTop: -24 }]} activeOpacity={1}>
                    <Text style={{ fontSize: 14, color: colors.white, fontWeight: "thin", opacity: 0.8 }}>Turma com mais alunos:</Text>
                    <Text style={{ fontSize: 40, fontWeight: "bold", color: colors.white }}>{turma.nome} ({turma.alunos} alunos)</Text>
                  </TouchableOpacity>
                </>
              )}
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