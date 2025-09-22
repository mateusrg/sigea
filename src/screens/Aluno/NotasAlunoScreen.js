import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Modal, useWindowDimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, NoteIcon, SignOutIcon, UserCircleIcon, ClockCounterClockwiseIcon, ChartBarIcon, CalendarIcon, CalendarBlankIcon } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
const larguraSidebar = 220;

import { getNotasAluno, getAlunoIdPorNome } from '../../services/authService';

export default function NotasAluno({ setUserProfile }) {
  const [userName, setUserName] = useState('');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  const [notasData, setNotasData] = useState([]);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('user');
        if (!userData) return;

        const userObj = JSON.parse(userData);
        setUserName(userObj.nome || 'Aluno');

        const idAluno = await getAlunoIdPorNome(userObj.nome);
        if (!idAluno) {
          setNotasData([]);
          return;
        }

        const notasDoBanco = await getNotasAluno(idAluno);
        if (!notasDoBanco || notasDoBanco.length === 0) {
          setNotasData([]);
          return;
        }

        const notasFormatadas = notasDoBanco.map(n => {
          const hasValor = n.valor !== null && n.valor !== undefined && String(n.valor).trim() !== '';
          const rawValor = hasValor ? parseFloat(String(n.valor).replace(',', '.')) : null;
          return {
            notas: `Nota ${n.nota}`,
            valor: hasValor ? String(n.valor).replace('.', ',') : '-',
            status: hasValor ? 'Enviada' : 'Aguardando',
            rawValor
          };
        });

        const todasTemValor = notasFormatadas.length > 0 && notasFormatadas.every(n => n.rawValor !== null);
        let media = '-';
        let mediaStatus = 'Aguardando';
        if (todasTemValor) {
          const soma = notasFormatadas.reduce((acc, n) => acc + n.rawValor, 0);
          media = (soma / notasFormatadas.length).toFixed(1).replace('.', ',');
          mediaStatus = 'Enviada';
        }

        const listaFinal = [
          ...notasFormatadas,
          { notas: 'Média Final', valor: media, status: mediaStatus }
        ];

        setNotasData(listaFinal);
      } catch (err) {
        console.error('Erro ao buscar notas:', err);
        setNotasData([{ notas: 'Erro ao carregar notas', valor: '-', status: 'Aguardando' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Aluno');
        }
      } catch {
        setUserName('Aluno');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      if (typeof setUserProfile === 'function') {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      if (typeof setUserProfile === 'function') {
        setUserProfile(null);
      }
    }
  };

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
                <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('AlunoDashboard')} />
                <SidebarButton label="Presenças" icon={<ClockCounterClockwiseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('PresencaAlunoScreen')} />
                <SidebarButton label="Notas" active icon={<NoteIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('NotasAlunoScreen')} />
                <SidebarButton label="Calendário" icon={<CalendarBlankIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('CalendarioAlunoScreen')} />
              </View>
            </View>
            <View style={styles.sidebarBottom}>
              <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} onPress={() => setLogoutModalVisible(true)} />
            </View>
          </View>

          {/* Conteúdo Principal */}
          <View style={styles.main}>
            <View style={styles.header}>
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

            <ScrollView style={styles.scrollArea}>
              <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Notas</Text>
              </View>

              <View style={styles.upcomingContainer}>
                <Text style={styles.upcomingTitle}>{userName}</Text>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Notas</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.5, textAlign: 'center' }]}>Valor</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'center' }]}>Status</Text>
                </View>
                <FlatList
                  data={notasData}
                  keyExtractor={(item) => item.notas}
                  renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCellBold} numberOfLines={1} ellipsizeMode="tail">{item.notas}</Text>
                      <Text style={styles.tableCell}>{item.valor}</Text>
                      <View style={{ alignItems: 'center', flex: 2 }}>
                        <View style={[styles.statusBadge, { alignSelf: 'center', minWidth: undefined, backgroundColor: item.status === 'Aguardando' ? '#fef9c3' : '#dbeafe' }]}>
                          <Text style={[styles.statusBadgeText, { color: item.status === 'Aguardando' ? '#ca8a04' : '#1e40af' }]}>{item.status}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
                {loading && (
                  <View style={{ marginTop: 16, alignItems: 'center', paddingVertical: 20 }}>
                    <ActivityIndicator size="large" color={colors.blue || '#000'} />
                    <Text style={{ marginTop: 8, color: colors.blue || '#000', fontFamily: interFont, fontWeight: '500' }}>Carregando notas...</Text>
                  </View>
                )}
                {notasData.length === 0 && !loading && (
                  <View style={{ marginTop: 16, alignItems: 'center', paddingVertical: 20 }}>
                    <Text style={{ color: colors.darkGray || '#000', fontFamily: interFont, fontWeight: 'semibold' }}>Nenhum dado de notas disponível.</Text>
                  </View>
                )}
              </View>
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
    justifyContent: 'flex-end',
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
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
    flex: 0.5,
    fontFamily: interFont,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
    paddingRight: 8,
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
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