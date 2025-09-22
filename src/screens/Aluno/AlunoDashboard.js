import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Modal, useWindowDimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocaleConfig } from 'react-native-calendars';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, NoteIcon, SignOutIcon, UserCircleIcon, ClockCounterClockwiseIcon, ChartBarIcon, CalendarIcon, CalendarBlankIcon } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
const larguraSidebar = 220;

import { getAlunos } from '../../services/authService';

export default function AlunoDashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const hoje = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const [selectedDate, setSelectedDate] = useState(hoje);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [turma, setTurma] = useState('Carregando...');

  useEffect(() => {
    const fetchUserAndTurma = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Aluno');

          const alunos = await getAlunos();
          const alunoInfo = alunos.find(a => a.nome === userObj.nome);
          setTurma(alunoInfo?.turma || 'Sem turma');
        }
      } catch (err) {
        console.log(err);
        setUserName('Aluno');
        setTurma('Sem turma');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndTurma();
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

  const dashboardCards = [
    { label: "Histórico de Presenças", value: "Veja suas presenças e faltas", icon: ClockCounterClockwiseIcon, iconColor: "#7242df", backColor: "#edeaff", function: () => navigation.navigate('PresencaAlunoScreen') },
    { label: "Minhas Notas", value: "Consulte seu desempenho", icon: ChartBarIcon, iconColor: "#009466", backColor: "#d0fae4", function: () => navigation.navigate('NotasAlunoScreen') },
    { label: "Calendário", value: "Próximas aulas e eventos", icon: CalendarIcon, iconColor: "#d97501", backColor: "#fbf4c9", function: () => navigation.navigate('CalendarioAlunoScreen') },
  ];

  let numColumns = 1;
  if (width >= 1200) numColumns = 3;
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
                <SidebarButton label="Dashboard" active icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('AlunoDashboard')} />
                <SidebarButton label="Presenças" icon={<ClockCounterClockwiseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('PresencaAlunoScreen')} />
                <SidebarButton label="Notas" icon={<NoteIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('NotasAlunoScreen')} />
                <SidebarButton label="Calendário" icon={<CalendarBlankIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('CalendarioAlunoScreen')} />
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
                    <Text style={styles.profileRole}>Aluno</Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <TouchableOpacity style={[styles.card, { backgroundColor: "#2563ea", alignItems: 'flex-start', marginBottom: 16, padding: 40, gap: 4, cursor: "default" }]} activeOpacity={1}>
                <Text style={{ fontSize: 14, color: colors.white, fontWeight: "thin", opacity: 0.8 }}>Você está matriculado em:</Text>
                <Text style={{ fontSize: 40, fontWeight: "bold", color: colors.white }}>{turma}</Text>
              </TouchableOpacity>

              <FlatList
                data={dashboardCards}
                keyExtractor={(_, idx) => idx.toString()}
                numColumns={numColumns}
                key={numColumns}
                contentContainerStyle={styles.cardsRow}
                renderItem={({ item }) => (
                  <TouchableOpacity key={item.label} style={styles.card} onPress={item.function}>
                    <item.icon size={32} color={item.iconColor} weight="bold" style={{ backgroundColor: item.backColor, padding: 8, borderRadius: 50, marginBottom: 8 }} />
                    <Text style={styles.cardLabel}>{item.label}</Text>
                    <Text style={styles.cardValue}>{item.value}</Text>
                  </TouchableOpacity>
                )}
                columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
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
    marginBottom: 24,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  logoIcon: {
    width: 72,
    height: 72,
    marginRight: 8,
  },
  logoText: {
    fontFamily: fontFamily.poppins.medium,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.variantGray,
  },
  sidebarNav: {
    flexDirection: 'column',
    gap: 8,
  },
  sidebarBottom: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
  },
  sidebarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  sidebarBtnActive: {
    backgroundColor: '#f3f4f6',
  },
  sidebarBtnIcon: {
    fontSize: 18,
    color: '#374151',
  },
  sidebarBtnIconActive: {
    color: '#137fec',
  },
  sidebarBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  sidebarBtnTextActive: {
    color: '#137fec',
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    paddingLeft: larguraSidebar,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  notificationIcon: {
    fontSize: 22,
    color: '#374151',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  profileName: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 15,
  },
  profileRole: {
    color: '#6b7280',
    fontSize: 13,
  },
  scrollArea: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
    maxHeight: 622
  },
  cardsRow: {
    marginBottom: 8,
    paddingBottom: 0,
    paddingHorizontal: 0,
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
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  cardLabel: {
    color: '#1f2937',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardValue: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
});