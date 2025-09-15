// src/screens/Professor/PresencaScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Image, ScrollView, Modal, useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../services/firebase';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, SignOutIcon, UserCircleIcon, BellIcon, BookmarkIcon } from 'phosphor-react-native';

const larguraSidebar = 220;

const sampleAlunos = [
  {
    id: '1',
    nome: 'Ana Silva'
  },
  {
    id: '2',
    nome: 'Carlos Santos'
  },
  {
    id: '3',
    nome: 'Beatriz Oliveira'
  },
  {
    id: '4',
    nome: 'João Pereira'
  },
];

const turmasDisponiveis = [
  'Matemática 101',
  'Ciências 201',
  'História 301',
  'Inglês 101',
  'Física 202',
  'Química 102'
];

export default function PresencaScreen({ turmaId }) {
  const [userName, setUserName] = useState('');
  const [alunos, setAlunos] = useState(sampleAlunos);
  const [presencas, setPresencas] = useState({ '1': true, '2': false });
  const [selectedTurma, setSelectedTurma] = useState('Matemática 101');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Professora Silva');
        } else {
          setUserName('Professora Silva');
        }
      } catch (error) {
        setUserName('Professora Silva');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (turmaId) {
      const unsubscribe = db.collection('alunos')
        .where('turmaId', '==', turmaId)
        .onSnapshot(snapshot => {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAlunos(list);
        });
      return unsubscribe;
    }
  }, [turmaId]);

  const registrarPresenca = async (alunoId, presente) => {
    try {
      if (turmaId) {
        await db.collection('presencas').add({
          alunoId,
          turmaId,
          presente,
          data: new Date().toISOString().slice(0, 10)
        });
      }
      setPresencas(prev => ({ ...prev, [alunoId]: presente }));
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const saveAttendance = () => {
    Alert.alert('Sucesso', 'Presença salva com sucesso!');
  };

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
              <SidebarButton 
                label="Dashboard" 
                icon={<HouseIcon size={22} weight="regular" color="#374151" />} 
                onPress={() => navigation.navigate('ProfessorDashboard')} 
              />
              <SidebarButton 
                label="Aulas" 
                icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} 
                onPress={() => navigation.navigate('TurmasScreen')} 
              />
              <SidebarButton 
                label="Chamada" 
                active 
                icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} 
                onPress={() => navigation.navigate('PresencaScreen')} 
              />
              <SidebarButton 
                label="Notas" 
                icon={<NoteIcon size={22} weight="regular" color="#374151" />} 
                onPress={() => navigation.navigate('NotasScreen')} 
              />
            </View>
          </View>
          <View style={styles.sidebarBottom}>
            <SidebarButton 
              label="Sair" 
              icon={<SignOutIcon size={22} weight="regular" color="#374151" />} 
              onPress={() => setLogoutModalVisible(true)} 
            />
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.header}>
            <View style={styles.headerRight}>
              <BellIcon size={22} color="#6b7280" weight="regular" style={styles.bellIcon} />
              <View style={styles.profileRow}>
                <UserCircleIcon size={40} color={colors.darkGray} weight="regular" style={styles.profileImg} />
                <View>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profileRole}>Professor</Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.pageTitle}>{selectedTurma}</Text>
                <Text style={styles.pageDate}>{getCurrentDate()}</Text>
              </View>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedTurma}
                  onValueChange={setSelectedTurma}
                  style={styles.picker}
                  dropdownIconColor="#6b7280"
                >
                  {turmasDisponiveis.map((turma) => (
                    <Picker.Item key={turma} label={turma} value={turma} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Nome do Estudante</Text>
                <Text style={[styles.tableHeaderText, styles.tableHeaderCenter]}>Status</Text>
              </View>
              
              <FlatList
                data={alunos}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const isPresent = presencas[item.id] === true;
                  const isAbsent = presencas[item.id] === false;
                  const rowStyle = isPresent ? styles.studentRowPresent : isAbsent ? styles.studentRowAbsent : styles.studentRow;
                  
                  return (
                    <View style={[styles.studentRow, rowStyle]}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.nome}</Text>
                      </View>
                      <View style={styles.attendanceButtons}>
                        <TouchableOpacity
                          style={[
                            styles.attendanceBtn,
                            isPresent ? styles.presentBtnActive : styles.presentBtn
                          ]}
                          onPress={() => registrarPresenca(item.id, true)}
                        >
                          <Text style={[
                            styles.attendanceBtnText,
                            isPresent ? styles.presentBtnTextActive : styles.presentBtnText
                          ]}>
                            Presente
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.attendanceBtn,
                            isAbsent ? styles.absentBtnActive : styles.absentBtn
                          ]}
                          onPress={() => registrarPresenca(item.id, false)}
                        >
                          <Text style={[
                            styles.attendanceBtnText,
                            isAbsent ? styles.absentBtnTextActive : styles.absentBtnText
                          ]}>
                            Falta
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
            <BookmarkIcon size={24} color="#fff" weight="regular" />
            <Text style={styles.saveButtonText}>Salvar Presença</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={logoutModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar Logout</Text>
              <Text style={styles.modalText}>Tem certeza que deseja sair?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setLogoutModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    setLogoutModalVisible(false);
                    AsyncStorage.removeItem('user');
                    AsyncStorage.removeItem('token');
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }}
                >
                  <Text style={styles.modalConfirmText}>Sair</Text>
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
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  bellIcon: {
    marginRight: 0,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 32,
    paddingBottom: 100,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: fontFamily.poppins.bold,
    marginBottom: 4,
  },
  pageDate: {
    fontSize: 18,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular,
  },
  pickerContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    minWidth: 200,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 48,
    color: '#374151',
    fontSize: 15,
    paddingHorizontal: 12,
    fontFamily: fontFamily.inter.medium,
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: fontFamily.inter.medium,
  },
  tableHeaderCenter: {
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    minHeight: 64,
  },
  studentRowPresent: {
    backgroundColor: '#e6fffa',
  },
  studentRowAbsent: {
    backgroundColor: '#fee2e2',
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: fontFamily.inter.medium,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  attendanceBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  presentBtn: {
    backgroundColor: '#e5e7eb',
  },
  presentBtnActive: {
    backgroundColor: '#22c55e',
  },
  absentBtn: {
    backgroundColor: '#e5e7eb',
  },
  absentBtnActive: {
    backgroundColor: '#ef4444',
  },
  attendanceBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: fontFamily.inter.semiBold,
  },
  presentBtnText: {
    color: '#374151',
  },
  presentBtnTextActive: {
    color: '#fff',
  },
  absentBtnText: {
    color: '#374151',
  },
  absentBtnTextActive: {
    color: '#fff',
  },
  saveButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFamily.inter.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 320
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: fontFamily.inter.bold,
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 24,
    fontFamily: fontFamily.inter.regular,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16
  },
  modalCancelBtn: {
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  modalCancelText: {
    color: '#374151',
    fontWeight: 'bold',
    fontFamily: fontFamily.inter.semiBold,
  },
  modalConfirmBtn: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: fontFamily.inter.semiBold,
  },
});