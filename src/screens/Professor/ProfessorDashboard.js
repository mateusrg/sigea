import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, GearIcon, SignOutIcon, BellIcon, UserIcon, UserCircleIcon, CheckCircleIcon } from 'phosphor-react-native';

const upcomingClasses = [
  { class: 'Ciências 201', time: '10:30', status: 'Agendado' },
  { class: 'História 301', time: '13:00', status: 'Agendado' },
  { class: 'Inglês 101', time: '14:30', status: 'Agendado' },
];

const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

export default function ProfessorDashboard() {
  const [userName, setUserName] = useState('');
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  let numColumns = 1;
  if (width >= 1600) numColumns = 4;
  else if (width >= 750) numColumns = 2;

  const dashboardCards = [
    { label: "Total de Aulas", value: "712" },
    { label: "Total de Estudantes", value: "120" },
    { label: "Próxima Aula", value: "Matemática 101 - 9:00" },
    {
      label: "Chamada do Dia",
      value: (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#16a34a', fontWeight: 'bold', fontSize: 24 }}>Feita</Text>
          <CheckCircleIcon size={22} color="#16a34a" weight="regular" style={{ marginLeft: 6 }} />
        </View>
      ),
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || '');
        }
      } catch (error) {
        setUserName('');
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
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
              <SidebarButton label="Dashboard" active icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('ProfessorDashboard')} />
              <SidebarButton label="Aulas" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('TurmasScreen')} />
              <SidebarButton label="Chamada" icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('PresencaScreen')} />
              <SidebarButton label="Notas" icon={<NoteIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('NotasScreen')} />
            </View>
          </View>
          <View style={styles.sidebarBottom}>
            <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} onPress={() => setLogoutModalVisible(true)} />
          </View>
        </View>
        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bem-vindo(a), {userName.split(' ')[0]}!</Text>
            <View style={styles.headerRight}>
              <View style={styles.profileRow}>
                <UserCircleIcon size={32} color={colors.darkGray} weight="regular" style={styles.profileImg} />
                <View>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profileRole}>Professor</Text>
                </View>
              </View>
            </View>
          </View>
          <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
            <FlatList
              data={dashboardCards}
              keyExtractor={(_, idx) => idx.toString()}
              numColumns={numColumns}
              key={numColumns}
              contentContainerStyle={styles.cardsRow}
              renderItem={({ item }) => (
                <DashboardCard label={item.label} value={item.value} />
              )}
              columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
            <View style={styles.upcomingContainer}>
              <Text style={styles.upcomingTitle}>Próximas Aulas</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Aula</Text>
                <Text style={styles.tableHeaderCell}>Horário</Text>
                <Text style={styles.tableHeaderCell}>Status</Text>
              </View>
              <FlatList
                data={upcomingClasses}
                keyExtractor={(item) => item.class}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCellBold} numberOfLines={1} ellipsizeMode="tail">{item.class}</Text>
                    <Text style={styles.tableCell}>{item.time}</Text>
                    <View style={{ alignItems: 'flex-start', flex: 1, marginLeft: -24 }}>
                      <View style={[styles.statusBadge, { alignSelf: 'flex-start', minWidth: undefined }]}>
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </View>
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
                  onPress={() => {
                    setLogoutModalVisible(false);
                    AsyncStorage.removeItem('user');
                    AsyncStorage.removeItem('token');
                    if (typeof setUserProfile === 'function') setUserProfile(null);
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
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
      {typeof value === 'string' ? (
        <Text style={styles.cardValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
      ) : (
        value
      )}
    </View>
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
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: 'bold',
  },
  upcomingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  upcomingTitle: {
    fontFamily: interFont,
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    letterSpacing: 0.2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: interFont,
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'left',
    paddingRight: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    minHeight: 48,
  },
  tableCellBold: {
    flex: 1,
    fontFamily: fontFamily.inter.medium,
    fontSize: 15,
    color: '#1f2937',
    letterSpacing: 0.1,
    textAlign: 'left',
    paddingRight: 8,
  },
  tableCell: {
    flex: 1,
    fontFamily: interFont,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'left',
    paddingRight: 8,
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
    minWidth: undefined,
  },
  statusBadgeText: {
    fontFamily: interFont,
    color: '#1e40af',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
