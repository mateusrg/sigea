import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, GearIcon, SignOutIcon, BellIcon, UserIcon, UserCircleIcon, UsersIcon, ClockIcon, CaretDownIcon } from 'phosphor-react-native';
import { db } from '../../services/firebase';

const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

const sampleTurmas = [
  { 
    id: '1', 
    nome: 'Matemática 101', 
    alunos: 35, 
    horario: '08:00 - 09:40',
    periodo: 'Manhã'
  },
  { 
    id: '2', 
    nome: 'Ciências 201', 
    alunos: 28, 
    horario: '10:30 - 12:10',
    periodo: 'Manhã'
  },
  { 
    id: '3', 
    nome: 'História 301', 
    alunos: 32, 
    horario: '13:00 - 14:40',
    periodo: 'Tarde'
  },
  { 
    id: '4', 
    nome: 'Inglês 101', 
    alunos: 25, 
    horario: '15:00 - 16:40',
    periodo: 'Tarde'
  },
  { 
    id: '5', 
    nome: 'Física 202', 
    alunos: 30, 
    horario: '19:00 - 20:40',
    periodo: 'Noite'
  },
  { 
    id: '6', 
    nome: 'Química 102', 
    alunos: 22, 
    horario: '21:00 - 22:40',
    periodo: 'Noite'
  },
];

export default function TurmasScreen({ professorId, onSelectTurma }) {
  const [userName, setUserName] = useState('');
  const [turmas, setTurmas] = useState(sampleTurmas);
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
        }
      } catch (error) {
        setUserName('');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (professorId) {
      const unsubscribe = db.collection('turmas')
        .where('professorId', '==', professorId)
        .onSnapshot(snapshot => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (list.length > 0) {
            setTurmas(list);
          }
        });
      return unsubscribe;
    }
  }, [professorId]);

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
              <SidebarButton label="Aulas" active icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('TurmasScreen')} />
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
            </View>
            
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
                />
              )}
              columnWrapperStyle={numColumns > 1 ? { gap: 24 } : undefined}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
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

function TurmaCard({ turma, onPress }) {
  return (
    <View style={styles.turmaCard}>
      <View style={styles.turmaCardContent}>
        <Text style={styles.turmaCardTitle}>{turma.nome}</Text>
        <View style={styles.turmaCardInfo}>
          <View style={styles.turmaCardRow}>
            <UsersIcon size={16} color="#6b7280" weight="regular" />
            <Text style={styles.turmaCardText}>{turma.alunos} Alunos</Text>
          </View>
          <View style={styles.turmaCardRow}>
            <ClockIcon size={16} color="#6b7280" weight="regular" />
            <Text style={styles.turmaCardText}>{turma.horario}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.turmaCardButton} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.turmaCardButtonText}>Acessar Turma</Text>
      </TouchableOpacity>
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
    flex: 1,
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
    marginTop: 8,
  },
  turmaCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.inter.semiBold || 'System',
  },
});