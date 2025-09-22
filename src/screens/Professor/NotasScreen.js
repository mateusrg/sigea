import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Alert, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, SignOutIcon, UserCircleIcon, DownloadSimpleIcon, TrashIcon } from 'phosphor-react-native';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../services/firebase';
import { doc, setDoc, getDoc, collection, getDocs, serverTimestamp, updateDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';

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

export default function NotasScreen({ setUserProfile }) {
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [gradeData, setGradeData] = useState([]);
  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [turmasDoProf, setTurmasDoProf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteColumnModalVisible, setDeleteColumnModalVisible] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);

  const calculateColumnWidths = () => {
    const totalWidth = width - larguraSidebar - 64;
    const studentNameWidth = Math.max(180, totalWidth * 0.25);
    
    const remainingWidth = totalWidth - studentNameWidth;
    const totalNotesColumns = numberOfColumns + 1;
    const gradeColumnWidth = Math.max(60, remainingWidth / totalNotesColumns);
    
    return {
      studentName: studentNameWidth,
      grade: gradeColumnWidth
    };
  };

  const columnWidths = calculateColumnWidths();

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
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTurmasDoProf();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedClass) {
      loadNotasTurma(selectedClass);
    }
  }, [selectedClass]);

  const loadTurmasDoProf = async () => {
    try {
      setLoading(true);
      
      const userId = currentUser?.uid || currentUser?.id;
      if (!userId) {
        await findUserByName();
        return;
      }      
      const allTurmasSnapshot = await db.collection('turmas').get();
      const turmasProf = [];

      for (const turmaDoc of allTurmasSnapshot.docs) {
        const professoresSnapshot = await db
          .collection('turmas')
          .doc(turmaDoc.id)
          .collection('professores')
          .where('idProfessor', '==', userId)
          .get();

        if (!professoresSnapshot.empty) {
          turmasProf.push({ id: turmaDoc.id, ...turmaDoc.data() });
        }
      }

      setTurmasDoProf(turmasProf);
    } catch (error) {
      console.error('Erro ao carregar turmas do professor:', error);
    } finally {
      setLoading(false);
    }
  };

  const findUserByName = async () => {
    try {
      const userQuery = await db.collection('users')
        .where('nome', '==', currentUser.nome)
        .where('papel', '==', currentUser.papel)
        .get();
      
      if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        
        setCurrentUser({ ...currentUser, uid: userId });
        
        const allTurmasSnapshot = await db.collection('turmas').get();
        const turmasProf = [];

        for (const turmaDoc of allTurmasSnapshot.docs) {
          const professoresSnapshot = await db
            .collection('turmas')
            .doc(turmaDoc.id)
            .collection('professores')
            .where('idProfessor', '==', userId)
            .get();

          if (!professoresSnapshot.empty) {
            turmasProf.push({ id: turmaDoc.id, ...turmaDoc.data() });
          }
        }

        setTurmasDoProf(turmasProf);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário pelo nome (NotasScreen):', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotasTurma = async (turmaId) => {
    try {
      setLoading(true);
      const alunosSnapshot = await db.collection('turmas').doc(turmaId).collection('alunos').get();
      const alunoIds = alunosSnapshot.docs.map(doc => doc.data().idAluno);
      
      if (alunoIds.length > 0) {
        const alunosData = [];
        for (const alunoId of alunoIds) {
          const userDoc = await db.collection('users').doc(alunoId).get();
          if (userDoc.exists) {
            alunosData.push({
              id: alunoId,
              nome: userDoc.data().nome
            });
          }
        }

        const notasSnapshot = await db.collection('turmas').doc(turmaId).collection('notas').get();
        const notasPorAluno = {};
        let maxNumeroNota = 0;

        notasSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const alunoId = data.idAluno;
          const numeroNota = data.nota;
          const valor = data.valor;

          if (!notasPorAluno[alunoId]) {
            notasPorAluno[alunoId] = {};
          }
          
          notasPorAluno[alunoId][numeroNota] = {
            valor: valor,
            docId: doc.id
          };
          maxNumeroNota = Math.max(maxNumeroNota, numeroNota);
        });

        const notasData = [];
        for (const aluno of alunosData) {
          const grades = [];
          const gradeDocIds = [];
          const notasAluno = notasPorAluno[aluno.id] || {};
          
          const numColunas = Math.max(2, maxNumeroNota);
          for (let i = 1; i <= numColunas; i++) {
            const notaInfo = notasAluno[i];
            grades.push(notaInfo ? notaInfo.valor : 0);
            gradeDocIds.push(notaInfo ? notaInfo.docId : null);
          }

          notasData.push({
            id: aluno.id,
            studentName: aluno.nome,
            grades: grades,
            gradeDocIds: gradeDocIds
          });
        }

        setGradeData(notasData);
        setNumberOfColumns(Math.max(2, maxNumeroNota));
      } else {
        setGradeData([]);
      }
    } catch (error) {
      console.error('Erro ao carregar notas da turma:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      await saveNotasToFirebase();
    }
    setIsEditing(!isEditing);
  };

  const saveNotasToFirebase = async () => {
    if (!selectedClass || gradeData.length === 0) return;

    try {
      setSaving(true);
      for (const student of gradeData) {
        for (let i = 0; i < student.grades.length; i++) {
          const numeroNota = i + 1;
          const valor = student.grades[i];
          const docId = student.gradeDocIds ? student.gradeDocIds[i] : null;
          
          const notaData = {
            idAluno: student.id,
            nota: numeroNota,
            valor: valor
          };
          
          if (docId) {
            const notaRef = doc(db, 'turmas', selectedClass, 'notas', docId);
            await updateDoc(notaRef, notaData);
          } else {
            const notasCollection = collection(db, 'turmas', selectedClass, 'notas');
            await addDoc(notasCollection, notaData);
          }
        }
      }
      await loadNotasTurma(selectedClass);
      
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = (studentId, gradeIndex, newNumericValue) => {
    setGradeData(prevData =>
      prevData.map(student => {
        if (student.id === studentId) {
          const updatedGrades = [...student.grades];
          updatedGrades[gradeIndex] = newNumericValue;
          return { ...student, grades: updatedGrades };
        }
        return student;
      })
    );
  };

  const handleKeyPress = () => {};
  const handleNumberInput = () => {};

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
    if (numberOfColumns >= 8) {
      return;
    }
    
    setNumberOfColumns(prev => prev + 1);
    
    setGradeData(prevData => 
      prevData.map(student => ({
        ...student,
        grades: [...student.grades, 0],
        gradeDocIds: [...(student.gradeDocIds || []), null]
      }))
    );
  };

  const removeGradeColumn = (columnIndex) => {
    if (numberOfColumns <= 2) {
      return;
    }

    setColumnToDelete(columnIndex);
    setDeleteColumnModalVisible(true);
  };

  const confirmDeleteColumn = async () => {
    if (columnToDelete === null) return;
    try {
      setSaving(true);
      for (const student of gradeData) {
        const docId = student.gradeDocIds ? student.gradeDocIds[columnToDelete] : null;
        if (docId) {
          const notaRef = doc(db, 'turmas', selectedClass, 'notas', docId);
          await deleteDoc(notaRef);
        }
      }

      setNumberOfColumns(prev => prev - 1);
      
      setGradeData(prevData => 
        prevData.map(student => ({
          ...student,
          grades: student.grades.filter((_, index) => index !== columnToDelete),
          gradeDocIds: (student.gradeDocIds || []).filter((_, index) => index !== columnToDelete)
        }))
      );
    } catch (error) {
      console.error('Erro ao excluir coluna:', error);
    } finally {
      setSaving(false);
      setDeleteColumnModalVisible(false);
      setColumnToDelete(null);
    }
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
                label="Turmas" 
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}></Text>
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
          <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24, padding: 32 }}>
            <View style={styles.pageHeader}>
              <View>
                <Text style={styles.pageTitle}>Notas</Text>
                <Text style={styles.pageDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              </View>
            </View>
            
            <View style={styles.selectorContainer}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedClass}
                  onValueChange={(itemValue) => setSelectedClass(itemValue)}
                  style={styles.picker}
                  enabled={!loading}
                >
                  <Picker.Item label="Selecione uma turma..." value="" />
                  {turmasDoProf.map(turma => (
                    <Picker.Item 
                      key={turma.id} 
                      label={`${turma.nome} - ${turma.turno}`} 
                      value={turma.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>
                  {selectedClass ? 'Carregando notas da turma...' : 'Carregando suas turmas...'}
                </Text>
              </View>
            ) : !selectedClass ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Selecione uma turma</Text>
                <Text style={styles.emptyStateText}>
                  Escolha uma turma no seletor acima para visualizar e editar as notas dos alunos.
                </Text>
              </View>
            ) : gradeData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhum aluno encontrado</Text>
                <Text style={styles.emptyStateText}>
                  Esta turma não possui alunos cadastrados ainda.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.tableContainer}>
                  <View style={styles.tableWrapper}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeaderCell, { width: columnWidths.studentName }]}>Estudante</Text>
                      {Array.from({ length: numberOfColumns }, (_, index) => (
                        <View key={index} style={[styles.tableHeaderContainer, { width: columnWidths.grade }]}>
                          <Text style={styles.tableHeaderText}>{width < 1190 ? `N${index + 1}` : `Nota ${index + 1}`}</Text>
                          {isEditing && numberOfColumns > 2 && (
                            <TouchableOpacity style={styles.deleteColumnButton} onPress={() => removeGradeColumn(index)} activeOpacity={0.7}>
                              <TrashIcon size={14} color="#dc2626" weight="regular" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                      <Text style={[styles.tableHeaderCell, { width: columnWidths.grade }]}>Média</Text>
                    </View>                {gradeData.map((student, index) => (
                  <View key={student.id} style={[styles.tableRow, styles.tableRowBorder]}>
                    <Text style={[styles.tableCell, styles.tableCellBold, { width: columnWidths.studentName }]}>
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
                        width={columnWidths.grade}
                      />
                    ))}
                    <Text style={[styles.tableCell, styles.tableCellSecondary, { width: columnWidths.grade }]}>
                      {formatGrade(calculateAverage(student.grades))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.actionsContainer}>
              {isEditing && (
                <TouchableOpacity 
                  style={[
                    styles.addColumnButton, 
                    numberOfColumns >= 8 && styles.addColumnButtonDisabled
                  ]} 
                  onPress={numberOfColumns >= 8 ? null : addNewGradeColumn}
                  disabled={numberOfColumns >= 8}
                >
                  <Text style={[
                    styles.addColumnButtonText,
                    numberOfColumns >= 8 && styles.addColumnButtonTextDisabled
                  ]}>
                    + Nova Coluna
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.rightActions}>
                <TouchableOpacity 
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                  onPress={handleEditToggle}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {isEditing ? 'Salvar Alterações' : 'Editar Notas'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
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
                  <Text style={styles.modalConfirmText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={deleteColumnModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteColumnModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
              <Text style={styles.modalMessage}>
                {columnToDelete !== null 
                  ? `Tem certeza que deseja excluir a nota ${columnToDelete + 1}? Esta ação não pode ser desfeita.`
                  : 'Tem certeza que deseja excluir esta coluna?'
                }
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setDeleteColumnModalVisible(false);
                    setColumnToDelete(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDeleteButton}
                  onPress={confirmDeleteColumn}
                >
                  <Text style={styles.modalDeleteText}>Excluir</Text>
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

function GradeCell({ value, isEditing, onChangeText, studentId, gradeIndex, width }) {
  let [displayValue, setDisplayValue] = React.useState(formatGrade(value));

  React.useEffect(() => {
    setDisplayValue(formatGrade(value));
  }, [value]);

  const handleInputChange = (text) => {
    if (/[^0-9,]/.test(displayValue) || /[^0-9,]/.test(text)) return;
    if (displayValue == '0,0' && ['00', '0,', ',0', '0', ''].includes(text)) return;
    if (displayValue && displayValue.split(',')[1] === '0' && displayValue != '0,0' && text.length == 2) {
      setDisplayValue('0,0');
      onChangeText(studentId, gradeIndex, 0.0);
      return;
    }
    if (text.length == 1) {
      setDisplayValue(text + ',0');
      onChangeText(studentId, gradeIndex, Number(text));
      return;
    }
    if (text.length == 4 && text != '10,0' && text[4] == '0') {
      text = text.slice(0, 3);
      displayValue = displayValue.slice(0, 3);
    }
    const oldCleanValue = displayValue.replace(',', '');
    const cleanText = text.replace(/[^0-9]/g, '');

    let newDisplayValue = displayValue;

    if (oldCleanValue.endsWith('0') && cleanText.length === oldCleanValue.length && cleanText.startsWith(oldCleanValue.slice(0, -1))) {
        const intPart = oldCleanValue.slice(0, -1);
        const newDecPart = cleanText.slice(-1);
        newDisplayValue = `${intPart},${newDecPart}`;
    } else {
        const digits = cleanText.padStart(1, '0');
        if (displayValue.split(',')[0] == 0) {
          newDisplayValue = `${digits[1],digits[2]}`;
        } else if (digits.length === 1) {
            newDisplayValue = `${digits},0`;
        } else if (digits.length === 2) {
            newDisplayValue = `${digits[0]},${digits[1]}`;
        } else if (digits.length >= 3) {
            if (digits.startsWith('100')) {
                newDisplayValue = '10,0';
            } else if (digits[1] == 0) {
              newDisplayValue = `${digits[0]},${digits[2]}`;
            } else {
                newDisplayValue = `${digits[0]},${digits[1]}`;
            }
        }
    }

    let newNumericValue = parseFloat(newDisplayValue.replace(',', '.'));

    if (newNumericValue > 10) {
        newDisplayValue = '10,0';
        newNumericValue = 10.0;
    }

    if (isNaN(newNumericValue) || newDisplayValue == "NaN") return;
    setDisplayValue(newDisplayValue);
    onChangeText(studentId, gradeIndex, newNumericValue);
  };

  if (isEditing) {
    return (
      <TextInput
        style={[styles.tableCell, styles.tableCellSecondary, styles.gradeInput, { width }]}
        value={displayValue}
        onChangeText={handleInputChange}
        keyboardType="numeric"
        placeholder="0,0"
        maxLength={4}
        selectTextOnFocus={true}
      />
    );
  }

  return (
    <Text style={[styles.tableCell, styles.tableCellSecondary, { width }]}>
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
    backgroundColor: '#f8f9fa',
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
    gap: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    height: 'calc(100vh - 80px)',
    backgroundColor: '#f8f9fa',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
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
  selectorContainer: {
    maxWidth: 480,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 24,
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
    marginTop: 24,
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
  addColumnButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  addColumnButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.15,
  },
  addColumnButtonTextDisabled: {
    color: '#d1d5db',
    
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
  tableContainer: {
    marginBottom: 16,
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
  tableHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  tableHeaderText: {
    color: '#0d171b',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    paddingLeft: 10,
  },
  deleteColumnButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#fee2e2',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 12,
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
    fontSize: 14,
  },
  tableCellSecondary: {
    paddingLeft: 18,
    fontSize: 14,
    justifyContent: 'flex-start',
    color: '#4c809a',
  },
  gradeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfdfe7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    textAlign: 'left',
    minHeight: 32,
    fontSize: 14,
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
  modalDeleteButton: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
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
    fontFamily: fontFamily.inter.regular,
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
    fontFamily: fontFamily.inter.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
});