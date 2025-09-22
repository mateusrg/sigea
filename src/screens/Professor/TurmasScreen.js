import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, GearIcon, SignOutIcon, BellIcon, UserIcon, UserCircleIcon, UsersIcon, ClockIcon, CaretDownIcon } from 'phosphor-react-native';
import { db } from '../../services/firebase';

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

const larguraSidebar = 220;

export default function TurmasScreen({ professorId, onSelectTurma, setUserProfile }) {
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Ordem Alfabética');
  const [showDropdown, setShowDropdown] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  let numColumns = 1;
  if (width >= 1200) numColumns = 3;
  else if (width >= 750) numColumns = 2;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || '');
          setCurrentUser(userObj);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setUserName('');
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.uid || currentUser.id;
      if (userId) {
        loadTurmasDoProf();
      } else {
        findUserByName();
      }
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
        const updatedUser = { ...currentUser, uid: userId };
        setCurrentUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        loadTurmasDoProf(userId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário pelo nome:', error);
      setLoading(false);
    }
  };

  const loadTurmasDoProf = async (overrideUserId = null) => {
    try {
      setLoading(true);
      const userId = overrideUserId || currentUser.uid || currentUser.id;
      const allTurmasSnapshot = await db.collection('turmas').get();
      const turmasDoProf = [];
      for (const turmaDoc of allTurmasSnapshot.docs) {
        const allProfessoresSnapshot = await db
          .collection('turmas')
          .doc(turmaDoc.id)
          .collection('professores')
          .get();
        const professoresSnapshot = await db
          .collection('turmas')
          .doc(turmaDoc.id)
          .collection('professores')
          .where('idProfessor', '==', userId)
          .get();
        
        if (!professoresSnapshot.empty) {
          const turmaData = turmaDoc.data();
          
          const alunosSnapshot = await db
            .collection('turmas')
            .doc(turmaDoc.id)
            .collection('alunos')
            .get();

          turmasDoProf.push({ 
            id: turmaDoc.id, 
            nome: turmaData.nome,
            turno: turmaData.turno,
            alunos: alunosSnapshot.size,
            periodo: turmaData.turno === 'Manhã' ? 'Manhã' : 
                    turmaData.turno === 'Tarde' ? 'Tarde' : 
                    turmaData.turno === 'Noite' ? 'Noite' : 'Manhã'
          });
        }
      }
      setTurmas(turmasDoProf);
    } catch (error) {
      console.error('Erro ao carregar turmas do professor:', error);
      setTurmas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTurmas = React.useMemo(() => {
    let filtered = [...turmas];
    
    switch (filtro) {
      case 'Manhã':
        filtered = filtered.filter(turma => turma.periodo === 'Manhã');
        break;
      case 'Tarde':
        filtered = filtered.filter(turma => turma.periodo === 'Tarde');
        break;
      case 'Noite':
        filtered = filtered.filter(turma => turma.periodo === 'Noite');
        break;
      default:
        filtered.sort((a, b) => a.nome.localeCompare(b.nome));
    }
    
    return filtered;
  }, [turmas, filtro]);

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
              <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('ProfessorDashboard')} />
              <SidebarButton label="Turmas" active icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('TurmasScreen')} />
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
            <View style={styles.titleRow}>
              <Text style={styles.pageTitle}>Minhas Turmas</Text>
              {!loading && (
                <View style={styles.selectWrapper}>
                  <TouchableOpacity 
                    style={styles.selectButton} 
                    onPress={() => setShowDropdown(!showDropdown)}
                    activeOpacity={1}
                  >
                    <Text style={styles.selectButtonText}>{filtro}</Text>
                    <CaretDownIcon 
                      size={16} 
                      color="#374151" 
                      weight="regular" 
                      style={{ 
                        transform: [{ rotate: showDropdown ? '180deg' : '0deg' }] 
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Carregando suas turmas...</Text>
              </View>
            ) : filteredTurmas.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhuma turma encontrada</Text>
                <Text style={styles.emptyStateText}>
                  Você não está cadastrado em nenhuma turma ainda.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredTurmas}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                key={numColumns}
                contentContainerStyle={styles.turmasGrid}
                renderItem={({ item }) => (
                  <TurmaCard 
                    turma={item} 
                    onPress={() => onSelectTurma && onSelectTurma(item)}
                    navigation={navigation}
                  />
                )}
                columnWrapperStyle={numColumns > 1 ? { gap: 24 } : undefined}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </ScrollView>
          
          {showDropdown && (
            <TouchableOpacity 
              style={styles.dropdownOverlay} 
              activeOpacity={1} 
              onPress={() => setShowDropdown(false)}
            >
              <View style={styles.dropdown}>
                {['Ordem Alfabética', 'Manhã', 'Tarde', 'Noite'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFiltro(option);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      filtro === option && styles.dropdownItemTextActive
                    ]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          )}
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

function TurmaCard({ turma, onPress, navigation }) {
  return (
    <View style={styles.turmaCard}>
      <View style={styles.turmaCardContent}>
        <Text style={styles.turmaCardTitle}>{turma.nome}</Text>
        <View style={styles.turmaCardInfo}>
          <View style={styles.turmaCardRow}>
            <UsersIcon size={16} color="#6b7280" weight="regular" />
            <Text style={styles.turmaCardText}>{turma.alunos} Aluno{turma.alunos != 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.turmaCardRow}>
            <ClockIcon size={16} color="#6b7280" weight="regular" />
            <Text style={styles.turmaCardText}>{turma.turno}</Text>
          </View>
        </View>
      </View>
      <View style={styles.turmaCardActions}>
        <TouchableOpacity 
          style={styles.turmaCardButton} 
          onPress={() => navigation.navigate('AulasTurmaScreen', { turmaId: turma.id, turmaNome: turma.nome })}
          activeOpacity={0.8}
        >
          <Text style={styles.turmaCardButtonText}>Acessar Turma</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: fontFamily.inter.bold || 'System',
  },
  selectWrapper: {
    position: 'relative',
    minWidth: 180,
  },
  selectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  selectButtonText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: fontFamily.inter.regular || 'System',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  dropdown: {
    position: 'absolute',
    top: 145,
    right: 32,
    width: 180,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 15,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: fontFamily.inter.regular || 'System',
  },
  dropdownItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  turmasGrid: {
    gap: 24,
  },
  turmaCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    justifyContent: 'space-between',
  },
  turmaCardContent: {
    marginBottom: 16,
  },
  turmaCardActions: {
    gap: 8,
  },
  turmaCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: fontFamily.inter.bold || 'System',
  },
  turmaCardInfo: {
    gap: 8,
  },
  turmaCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turmaCardText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
  },
  turmaCardButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  turmaCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.inter.semiBold || 'System',
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
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: fontFamily.inter.bold || 'System',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
    textAlign: 'center',
    lineHeight: 22,
  },
});