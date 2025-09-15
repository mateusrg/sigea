import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, SignOutIcon, UserCircleIcon, DownloadSimpleIcon } from 'phosphor-react-native';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const larguraSidebar = 220;

const initialGradeData = [
  { id: 1, studentName: 'Adão Smith', grades: [8.5, 9.0] },
  { id: 2, studentName: 'Emília Durkheim', grades: [7.0, 7.5] },
  { id: 3, studentName: 'João Pedro', grades: [9.0, 9.5] },
  { id: 4, studentName: 'Maria Eduarda', grades: [6.5, 7.0] },
  { id: 5, studentName: 'Bernardo Silveira', grades: [8.0, 8.5] },
];

const formatGrade = (grade) => {
  return grade.toFixed(1).replace('.', ',');
};

const calculateAverage = (grades) => {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, grade) => acc + grade, 0);
  return sum / grades.length;
};

export default function NotasScreen() {
  const [userName, setUserName] = useState('');
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [gradeData, setGradeData] = useState(initialGradeData);
  const [numberOfColumns, setNumberOfColumns] = useState(2);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Ms. Eleanor');
        }
      } catch (error) {
        setUserName('Ms. Eleanor');
      }
    };
    fetchUser();
  }, []);

  const handleExportGrades = () => {
    Alert.alert('Export', 'Funcionalidade de exportar notas será implementada.');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      Alert.alert('Salvo', 'Alterações salvas com sucesso!');
    }
    setIsEditing(!isEditing);
  };

  const handleGradeChange = (studentId, gradeIndex, newValue) => {
    const sanitizedValue = newValue.replace(/[^0-9,\.]/g, '');
    
    if (sanitizedValue === '') {
      updateGrade(studentId, gradeIndex, 0);
      return;
    }

    const normalizedValue = sanitizedValue.replace(',', '.');
    const numericValue = parseFloat(normalizedValue);

    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10) {
      updateGrade(studentId, gradeIndex, numericValue);
    }
  };

  const updateGrade = (studentId, gradeIndex, newGrade) => {
    setGradeData(prevData => 
      prevData.map(student => {
        if (student.id === studentId) {
          const updatedGrades = [...student.grades];
          updatedGrades[gradeIndex] = newGrade;
          return { ...student, grades: updatedGrades };
        }
        return student;
      })
    );
  };

  const addNewGradeColumn = () => {
    const newColumnIndex = numberOfColumns;
    setNumberOfColumns(prev => prev + 1);
    
    setGradeData(prevData => 
      prevData.map(student => ({
        ...student,
        grades: [...student.grades, 0]
      }))
    );
  };

  const handleSaveChanges = () => {
    Alert.alert('Salvo', 'Alterações salvas com sucesso!');
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
                icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} 
                onPress={() => navigation.navigate('PresencaScreen')} 
              />
              <SidebarButton 
                label="Notas" 
                active
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
          <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.headerContainer}>
              <Text style={styles.pageTitle}>Notas</Text>
            </View>
            
            <View style={styles.selectorContainer}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedClass}
                  onValueChange={(itemValue) => setSelectedClass(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione uma turma..." value="" />
                  <Picker.Item label="Matemática 101" value="math101" />
                  <Picker.Item label="Ciências 201" value="science201" />
                  <Picker.Item label="História 301" value="history301" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.tableContainer}>
              <View style={styles.tableWrapper}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.studentNameColumn]}>Estudante</Text>
                  {Array.from({ length: numberOfColumns }, (_, index) => (
                    <Text key={index} style={[styles.tableHeaderCell, styles.gradeColumn]}>
                      Nota {index + 1}
                    </Text>
                  ))}
                  <Text style={[styles.tableHeaderCell, styles.gradeColumn]}>Média Final</Text>
                </View>
                
                {gradeData.map((student, index) => (
                  <View key={student.id} style={[styles.tableRow, styles.tableRowBorder]}>
                    <Text style={[styles.tableCell, styles.tableCellBold, styles.studentNameColumn]}>
                      {student.studentName}
                    </Text>
                    {student.grades.map((grade, gradeIndex) => (
                      <GradeCell
                        key={gradeIndex}
                        value={grade}
                        isEditing={isEditing}
                        onChangeText={handleGradeChange}
                        studentId={student.id}
                        gradeIndex={gradeIndex}
                      />
                    ))}
                    <Text style={[styles.tableCell, styles.tableCellSecondary, styles.gradeColumn]}>
                      {formatGrade(calculateAverage(student.grades))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.actionsContainer}>
              {isEditing && (
                <TouchableOpacity style={styles.addColumnButton} onPress={addNewGradeColumn}>
                  <Text style={styles.addColumnButtonText}>+ Nova Coluna</Text>
                </TouchableOpacity>
              )}
              <View style={styles.rightActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleEditToggle}>
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Salvar Alterações' : 'Editar Notas'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
        
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

function GradeCell({ value, isEditing, onChangeText, studentId, gradeIndex }) {
  if (isEditing) {
    return (
      <TextInput
        style={[styles.tableCell, styles.tableCellSecondary, styles.gradeColumn, styles.gradeInput]}
        value={formatGrade(value)}
        onChangeText={(text) => onChangeText(studentId, gradeIndex, text)}
        keyboardType="numeric"
        placeholder="0,0"
        maxLength={4}
      />
    );
  }

  return (
    <Text style={[styles.tableCell, styles.tableCellSecondary, styles.gradeColumn]}>
      {formatGrade(value)}
    </Text>
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