import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, GearIcon, SignOutIcon, BellIcon, UserIcon, UserCircleIcon, CheckCircleIcon, XCircleIcon } from 'phosphor-react-native';
import { db } from '../../services/firebase';

const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

export default function ProfessorDashboard({ setUserProfile }) {
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalTurmas: 0,
    totalEstudantes: 0,
    proximaAula: 'Carregando...',
    chamadaStatus: { completed: 0, total: 0 }
  });
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  let numColumns = 1;
  if (width >= 1600) numColumns = 4;
  else if (width >= 750) numColumns = 2;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || '');
          setCurrentUser(userObj);
        }
      } catch (error) {
        setUserName('');
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const findUserByName = async () => {
    try {
      const userQuery = await db.collection('users')
        .where('nome', '==', currentUser.nome)
        .where('papel', '==', currentUser.papel)
        .get();
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        setCurrentUser(prev => ({ ...prev, uid: userId }));
        return userId;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar usuário pelo nome (ProfessorDashboard):', error);
      return null;
    }
  };

  const getTurnoPrioridade = (turno) => {
    const prioridades = { 'Manhã': 1, 'Tarde': 2, 'Noite': 3 };
    return prioridades[turno] || 999;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let userId = currentUser?.uid || currentUser?.id;
      if (!userId) {
        userId = await findUserByName();
        if (!userId) {
          setLoading(false);
          return;
        }
      }      
      const allTurmasSnapshot = await db.collection('turmas').get();
      const turmasProf = [];
      let totalEstudantes = 0;
      for (const turmaDoc of allTurmasSnapshot.docs) {
        const professoresSnapshot = await db
          .collection('turmas')
          .doc(turmaDoc.id)
          .collection('professores')
          .where('idProfessor', '==', userId)
          .get();

        if (!professoresSnapshot.empty) {
          const turmaData = { id: turmaDoc.id, ...turmaDoc.data() };
          turmasProf.push(turmaData);
          const alunosSnapshot = await db
            .collection('turmas')
            .doc(turmaDoc.id)
            .collection('alunos')
            .get();
          const alunosCount = alunosSnapshot.docs.length;
          totalEstudantes += alunosCount;
        }
      }

      const today = new Date().toISOString().split('T')[0];
      let chamadasFeitas = 0;
      const totalTurmas = turmasProf.length;
      const turmasSemChamada = [];

      for (const turma of turmasProf) {
        try {
          const chamadaDoc = await db
            .collection('turmas')
            .doc(turma.id)
            .collection('chamadas')
            .doc(today)
            .get();
          
          if (chamadaDoc.exists) {
            chamadasFeitas++;
          } else {
            turmasSemChamada.push(turma);
          }
        } catch (error) {
          console.error(`Erro ao verificar chamada para turma ${turma.nome}:`, error);
          turmasSemChamada.push(turma);
        }
      }

      let proximaAula = 'Nenhuma pendente';
      if (turmasSemChamada.length > 0) {
        const proximaTurma = turmasSemChamada.sort((a, b) => 
          getTurnoPrioridade(a.turno) - getTurnoPrioridade(b.turno)
        )[0];
        proximaAula = `${proximaTurma.nome} - ${proximaTurma.turno}`;
      }
      const upcomingClassesData = turmasSemChamada
        .sort((a, b) => getTurnoPrioridade(a.turno) - getTurnoPrioridade(b.turno))
        .slice(0, 5)
        .map((turma) => ({
          class: turma.nome,
          time: turma.turno,
          status: 'Pendente'
        }));

      const finalData = {
        totalTurmas: totalTurmas,
        totalEstudantes: totalEstudantes,
        proximaAula: proximaAula,
        chamadaStatus: { completed: chamadasFeitas, total: totalTurmas }
      };

      setDashboardData(finalData);
      setUpcomingClasses(upcomingClassesData);
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setDashboardData({
        totalTurmas: 0,
        totalEstudantes: 0,
        proximaAula: 'Erro ao carregar',
        chamadaStatus: { completed: 0, total: 0 }
      });
      setUpcomingClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    { label: "Total de Turmas", value: dashboardData.totalTurmas.toString() },
    { label: "Total de Estudantes", value: dashboardData.totalEstudantes.toString() },
    { label: "Próxima Aula", value: dashboardData.proximaAula },
    {
      label: "Chamada do Dia",
      value: (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ 
            color: dashboardData.chamadaStatus.completed === dashboardData.chamadaStatus.total && dashboardData.chamadaStatus.total > 0 
              ? '#16a34a' 
              : '#f59e0b', 
            fontWeight: 'bold', 
            fontSize: 24 
          }}>
            {dashboardData.chamadaStatus.completed}/{dashboardData.chamadaStatus.total}
          </Text>
          {dashboardData.chamadaStatus.completed === dashboardData.chamadaStatus.total && dashboardData.chamadaStatus.total > 0 ? (
            <CheckCircleIcon size={22} color="#16a34a" weight="regular" style={{ marginLeft: 6 }} />
          ) : (
            <XCircleIcon size={22} color="#f59e0b" weight="regular" style={{ marginLeft: 6 }} />
          )}
        </View>
      ),
    },
  ];

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
              <SidebarButton label="Turmas" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('TurmasScreen')} />
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
          <ScrollView style={styles.scrollArea}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Carregando dashboard...</Text>
              </View>
            ) : (
              <>
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
                  {upcomingClasses.length === 0 ? (
                    <View style={styles.emptyUpcoming}>
                      <Text style={styles.emptyUpcomingText}>
                        {dashboardData.chamadaStatus.completed === dashboardData.chamadaStatus.total && dashboardData.chamadaStatus.total > 0
                          ? 'Todas as chamadas do dia foram realizadas!'
                          : 'Nenhuma turma pendente'
                        }
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderCell}>Turma</Text>
                        <Text style={styles.tableHeaderCell}>  Turno</Text>
                        <Text style={styles.tableHeaderCell}>Status</Text>
                      </View>
                      <FlatList
                        data={upcomingClasses}
                        keyExtractor={(item, index) => `${item.class}-${index}`}
                        renderItem={({ item }) => (
                          <View style={styles.tableRow}>
                            <Text style={styles.tableCellBold} numberOfLines={1} ellipsizeMode="tail">{item.class}</Text>
                            <Text style={styles.tableCell}>{item.time}</Text>
                            <View style={{ alignItems: 'flex-start', flex: 1, marginLeft: -24 }}>
                              <View style={[styles.statusBadge, 
                                item.status === 'Pendente' ? styles.statusBadgePending : styles.statusBadgeScheduled, 
                                { alignSelf: 'flex-start', minWidth: undefined }
                              ]}>
                                <Text style={[styles.statusBadgeText, 
                                  item.status === 'Pendente' ? styles.statusBadgeTextPending : styles.statusBadgeTextScheduled
                                ]}>{item.status}</Text>
                              </View>
                            </View>
                          </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                      />
                    </>
                  )}
                </View>
              </>
            )}
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
                  onPress={async () => {
                    setLogoutModalVisible(false);
                    try {
                      await AsyncStorage.removeItem('user');
                      await AsyncStorage.removeItem('token');
                      if (typeof setUserProfile === 'function') {
                        setUserProfile(null);
                      }
                    } catch (error) {
                      console.error('Erro durante logout:', error);
                      if (typeof setUserProfile === 'function') {
                        setUserProfile(null);
                      }
                    }
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
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
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
    marginLeft: larguraSidebar,
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
    height: 'calc(100vh - 80px)',
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
  statusBadgeScheduled: {
    backgroundColor: '#dbeafe',
  },
  statusBadgePending: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontFamily: interFont,
    color: '#1e40af',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  statusBadgeTextScheduled: {
    color: '#1e40af',
  },
  statusBadgeTextPending: {
    color: '#d97706',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
  },
  emptyUpcoming: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyUpcomingText: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
    textAlign: 'center',
  },
});
