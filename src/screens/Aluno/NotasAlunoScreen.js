import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, NoteIcon, SignOutIcon } from 'phosphor-react-native';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const larguraSidebar = 220;
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';

// Funções utilitárias
const formatGrade = (grade) => grade.toFixed(1).replace('.', ',');
const calculateAverage = (grades) => grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;

export default function NotasAluno({ setUserProfile }) {
  const [userName, setUserName] = useState('');
  const userGrades = [8.5, 9.0];
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Aluno');
        }
      } catch (error) {
        setUserName('Aluno');
        setUserGrades([]);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      // Reset the user profile in the parent component
      if (typeof setUserProfile === 'function') {
        setUserProfile(null);
      }
      // Don't try to navigate - let App.js handle the screen transition
    } catch (error) {
      console.error('Error during logout:', error);
      // Still try to reset user profile even if AsyncStorage fails
      if (typeof setUserProfile === 'function') {
        setUserProfile(null);
      }
    }
  };

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
                <SidebarButton
                  label="Dashboard"
                  icon={<HouseIcon size={22} weight="regular" color="#374151" />}
                  onPress={() => navigation.navigate('AlunoDashboard')}
                />
                <SidebarButton
                  label="Notas"
                  active
                  icon={<NoteIcon size={22} weight="regular" color="#374151" />}
                  onPress={() => navigation.navigate('NotasAlunoScreen')}
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

          {/* Main Content */}
          <View style={styles.main}>
            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Notas</Text>
              </View>

              <View style={styles.tableContainer}>
                <View style={styles.tableWrapper}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.studentNameColumn]}>Estudante</Text>
                    <Text style={[styles.tableHeaderCell, styles.gradeColumn]}>Nota 1</Text>
                    <Text style={[styles.tableHeaderCell, styles.gradeColumn]}>Nota 2</Text>
                    <Text style={[styles.tableHeaderCell, styles.gradeColumn]}>Média Final</Text>
                  </View>

                  <View style={[styles.tableRow, styles.tableRowBorder]}>
                    <Text style={[styles.tableCell, styles.tableCellBold, styles.studentNameColumn]}>
                      {userName}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellSecondary, styles.gradeColumn]}>
                      {formatGrade(userGrades[0])}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellSecondary, styles.gradeColumn]}>
                      {formatGrade(userGrades[1])}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellSecondary, styles.gradeColumn]}>
                      {formatGrade(calculateAverage(userGrades))}
                    </Text>
                  </View>
                </View>
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
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirmar Logout</Text>
                <Text style={styles.modalMessage}>Tem certeza que deseja sair?</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setLogoutModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmButton}
                    onPress={handleLogout}
                  >
                    <Text style={styles.modalConfirmText}>Sair</Text>
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f8fafc',
  },
  scrollArea: {
    flex: 1,
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
  selectorContainer: {
    maxWidth: 480,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerWrapper: {
    flex: 1,
    minWidth: 160,
  },
  picker: {
    height: 56,
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cfdfe7',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#0d171b',
    fontSize: 16,
    fontWeight: 'normal',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addColumnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  addColumnButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    color: '#0d171b',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 480,
    height: 40,
    backgroundColor: '#13a4ec',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
    minWidth: 0,
  },
  exportButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
  tableContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tableWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cfdfe7',
    backgroundColor: '#f8fafc',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
  },
  tableHeaderCell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#0d171b',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },
  studentNameColumn: {
    width: 400,
  },
  gradeColumn: {
    width: 400,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#cfdfe7',
  },
  tableCell: {
    fontFamily: interFont,
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    textAlignVertical: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  tableCellBold: {
    color: '#0d171b',
    fontWeight: 'normal',
    fontFamily: fontFamily.inter.medium,
  },
  tableCellSecondary: {
    color: '#4c809a',
  },
  gradeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfdfe7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
    minHeight: 32,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 84,
    maxWidth: 480,
    height: 40,
    backgroundColor: '#13a4ec',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  modalCancelButton: {
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#374151',
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});