import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity, Image, ScrollView, Modal, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { db } from '../../services/firebase';
import { doc, setDoc, getDoc, collection, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, SignOutIcon, UserCircleIcon, BookmarkIcon, ArrowLeftIcon, UsersIcon, ClockIcon, CaretLeftIcon, CaretRightIcon, TrashIcon, CalendarIcon } from 'phosphor-react-native';

const larguraSidebar = 220;

export default function PresencaScreen({ route, setUserProfile }) {
  const routeParams = route?.params;
  const fromTurmaSpecific = routeParams?.turmaId;

  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [turmasDoProf, setTurmasDoProf] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingChamada, setLoadingChamada] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chamadaExists, setChamadaExists] = useState(false);
  const [isNewChamada, setIsNewChamada] = useState(false);
  const [chamadaId, setChamadaId] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const originalPresencas = useRef({});
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

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
        console.error('Erro ao puxar informações do usuário:', error);
      }
    };
    fetchUser();
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10);
    setCurrentDate(dateString);
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (fromTurmaSpecific) {
        loadSpecificTurma();
      } else {
        loadTurmasDoProf();
      }
    }
  }, [currentUser, fromTurmaSpecific]);
  useEffect(() => {
    if (selectedTurma && alunos.length > 0 && selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      loadOrCreateChamada(selectedTurma.id, alunos, dateKey);
    }
  }, [selectedDate]);

  const loadSpecificTurma = async () => {
    try {
      setLoadingData(true);
      const turmaDoc = await db.collection('turmas').doc(routeParams.turmaId).get();
      if (turmaDoc.exists) {
        const turmaData = { id: turmaDoc.id, ...turmaDoc.data() };
        setSelectedTurma(turmaData);
        await loadChamadaData(routeParams.turmaId);
      }
    } catch (error) {
      console.error('Erro ao carregar turma específica:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadTurmasDoProf = async () => {
    try {
      setLoadingData(true);
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
      setLoadingData(false);
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
      console.error('Erro ao buscar usuário pelo nome (PresencaScreen):', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectTurma = async (turma) => {
    if (!hasChanges) {
      proceedWithTurmaSelection(turma);
    }
  };

  const proceedWithTurmaSelection = async (turma) => {
    setSelectedTurma(turma);
    setHasChanges(false);
    await loadChamadaData(turma.id);
  };

  const loadChamadaData = async (turmaId) => {
    try {
      setLoadingChamada(true);
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
        setAlunos(alunosData);
        await loadOrCreateChamada(turmaId, alunosData);
      } else {
        setAlunos([]);
        setPresencas({});
        originalPresencas.current = {};
      }
    } catch (error) {
      console.error('Erro ao carregar dados da chamada:', error);
    } finally {
      setLoadingChamada(false);
    }
  };

  const loadOrCreateChamada = async (turmaId, alunosData, dataEspecifica = null) => {
    try {
      const dateKey = dataEspecifica || selectedDate.toISOString().split('T')[0];
      
      const chamadaRef = doc(db, 'turmas', turmaId, 'chamadas', dateKey);
      const chamadaDoc = await getDoc(chamadaRef);

      if (chamadaDoc.exists()) {
        const chamadaData = chamadaDoc.data();
        const presencasExistentes = chamadaData.presencas || {};

        setPresencas(presencasExistentes);
        originalPresencas.current = { ...presencasExistentes };
        setChamadaId(dateKey);
        setChamadaExists(true);
        setIsNewChamada(false);
      } else {
        const presencasIniciais = {};
        alunosData.forEach(aluno => {
          presencasIniciais[aluno.id] = true;
        });

        setPresencas(presencasIniciais);
        originalPresencas.current = {};
        setChamadaId(null);
        setChamadaExists(false);
        setIsNewChamada(true);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('Erro ao carregar chamada:', error);
    }
  };

  const registrarPresenca = (alunoId, presente) => {
    setPresencas(prev => {
      const newPresencas = { ...prev, [alunoId]: presente };
      let currentChanged = false;

      if (isNewChamada) {
        currentChanged = true;
      } else {
        currentChanged = Object.keys(newPresencas).some(id => 
          newPresencas[id] !== originalPresencas.current[id]
        );
      }
      
      setHasChanges(currentChanged);
      
      return newPresencas;
    });
  };

  const changeDate = async (days) => {
    if (!(hasChanges && !isNewChamada)) {
      proceedDateChange(days);
    }
  };

  const proceedDateChange = async (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setHasChanges(false);
    
    if (selectedTurma && alunos.length > 0) {
      await loadOrCreateChamada(selectedTurma.id, alunos, newDate.toISOString().split('T')[0]);
    }
  };

  const deleteChamada = async () => {
    if (!selectedTurma || !chamadaExists) return;

    try {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const chamadaRef = doc(db, 'turmas', selectedTurma.id, 'chamadas', dateKey);
      
      await deleteDoc(chamadaRef);
      const presencasIniciais = {};
      alunos.forEach(aluno => {
        presencasIniciais[aluno.id] = true;
      });

      setPresencas(presencasIniciais);
      originalPresencas.current = {};
      setChamadaId(null);
      setChamadaExists(false);
      setIsNewChamada(true);
      setHasChanges(true);
      setDeleteModalVisible(false);      
    } catch (error) {
      console.error('Erro ao apagar chamada:', error);
    }
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (hasChanges) {
          setPendingNavigation('back');
          setConfirmModalVisible(true);
          return true;
        }
        return false;
      };

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!hasChanges) return;
        e.preventDefault();
        setPendingNavigation(e.data.action);
        setConfirmModalVisible(true);
      });

      return unsubscribe;
    }, [navigation, hasChanges])
  );

  const handleConfirmNavigation = () => {
    setConfirmModalVisible(false);
    setHasChanges(false);
    if (pendingNavigation === 'back') {
      navigation.goBack();
    } else if (pendingNavigation) {
      navigation.dispatch(pendingNavigation);
    }
  };

  const handleCancelNavigation = () => {
    setConfirmModalVisible(false);
    setPendingNavigation(null);
  };

  const handleSidebarNavigation = (screenName) => {
    if (hasChanges) {
      setPendingNavigation({ type: 'NAVIGATE', payload: { name: screenName } });
      setConfirmModalVisible(true);
    } else {
      navigation.navigate(screenName);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const saveAttendance = async () => {
    if (!selectedTurma || !Object.keys(presencas).length) return;

    try {
      setSavingData(true);
      const dateKey = selectedDate.toISOString().split('T')[0];
      const chamadaRef = doc(
        db, 
        'turmas', selectedTurma.id, 
        'chamadas', dateKey
      );
      
      await setDoc(chamadaRef, {
        data: dateKey,
        professorId: currentUser?.uid || currentUser?.nome || 'Professor',
        professorNome: currentUser?.nome || currentUser?.displayName || 'Professor',
        presencas: presencas,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }, { merge: true });

      originalPresencas.current = { ...presencas };
      setChamadaId(dateKey);
      setChamadaExists(true);
      setIsNewChamada(false);
      setHasChanges(false);
      
    } catch (error) {
      console.error('Erro ao salvar chamada:', error);
    } finally {
      setSavingData(false);
    }
  };

  const handleLogout = async () => {
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
  };

  const renderTurmaSelectionScreen = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Fazer Chamada</Text>
          <Text style={styles.pageDate}>{getCurrentDate()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Selecione uma turma</Text>
      
      {turmasDoProf.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Nenhuma turma encontrada</Text>
          <Text style={styles.emptyStateText}>
            Você não está cadastrado em nenhuma turma ainda.
          </Text>
        </View>
      ) : (
        <FlatList
          data={turmasDoProf}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.turmasGrid}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.turmaCard}
              onPress={() => handleSelectTurma(item)}
              activeOpacity={0.7}
            >
              <View style={styles.turmaCardContent}>
                <Text style={styles.turmaCardTitle}>{item.nome}</Text>
                <View style={styles.turmaCardInfo}>
                  <View style={styles.turmaCardRow}>
                    <ClockIcon size={16} color="#6b7280" weight="regular" />
                    <Text style={styles.turmaCardText}>{item.turno}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );

  const renderChamadaScreen = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <View style={styles.pageHeader}>
        <View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (fromTurmaSpecific) {
                navigation.goBack();
              } else {
                setSelectedTurma(null);
                setAlunos([]);
                setPresencas({});
                setHasChanges(false);
              }
            }}
            activeOpacity={0.7}
          >
            <ArrowLeftIcon size={20} color="#374151" weight="regular" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Chamada - {selectedTurma.nome}</Text>
          <View style={styles.dateControls}>
            <TouchableOpacity 
              style={styles.dateArrow}
              onPress={() => changeDate(-1)}
              activeOpacity={0.7}
            >
              <CaretLeftIcon size={24} color="#374151" weight="bold" />
            </TouchableOpacity>
            
            <View style={styles.dateDisplay}>
              <CalendarIcon size={20} color="#374151" weight="regular" />
              <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.dateArrow}
              onPress={() => changeDate(1)}
              activeOpacity={0.7}
            >
              <CaretRightIcon size={24} color="#374151" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loadingChamada ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Carregando chamada...</Text>
        </View>
      ) : alunos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Nenhum aluno encontrado</Text>
          <Text style={styles.emptyStateText}>
            Esta turma não possui alunos cadastrados ainda.
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Aluno</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderCenter]}>Presença</Text>
          </View>
          
          <FlatList
            data={alunos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[
                styles.studentRow,
                presencas[item.id] === true && styles.studentRowPresent,
                presencas[item.id] === false && styles.studentRowAbsent
              ]}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.nome}</Text>
                </View>
                
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceBtn,
                      styles.presentBtn,
                      presencas[item.id] === true && styles.presentBtnActive
                    ]}
                    onPress={() => registrarPresenca(item.id, true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.attendanceBtnText,
                      styles.presentBtnText,
                      presencas[item.id] === true && styles.presentBtnTextActive
                    ]}>
                      Presente
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.attendanceBtn,
                      styles.absentBtn,
                      presencas[item.id] === false && styles.absentBtnActive
                    ]}
                    onPress={() => registrarPresenca(item.id, false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.attendanceBtnText,
                      styles.absentBtnText,
                      presencas[item.id] === false && styles.absentBtnTextActive
                    ]}>
                      Ausente
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      {alunos.length > 0 && (
        <>
          {chamadaExists && (
            <TouchableOpacity 
              style={styles.deleteButtonFloat}
              onPress={() => setDeleteModalVisible(true)}
              activeOpacity={0.8}
            >
              <TrashIcon size={20} color="#fff" weight="regular" />
              <Text style={styles.deleteButtonFloatText}>Apagar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.saveButton, (!hasChanges || savingData) && styles.saveButtonDisabled]}
            onPress={saveAttendance}
            disabled={!hasChanges || savingData}
            activeOpacity={0.8}
          >
            {savingData ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <BookmarkIcon size={20} color="#fff" weight="regular" />
            )}
            <Text style={styles.saveButtonText}>
              {savingData ? 'Salvando...' : 'Salvar Chamada'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  if (loadingData) {
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
                <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('ProfessorDashboard')} />
                <SidebarButton label="Turmas" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('TurmasScreen')} />
                <SidebarButton label="Chamada" active icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('PresencaScreen')} />
                <SidebarButton label="Notas" icon={<NoteIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('NotasScreen')} />
              </View>
            </View>
            <View style={styles.sidebarBottom}>
              <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} onPress={() => setLogoutModalVisible(true)} />
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
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Carregando suas turmas...</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
              <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('ProfessorDashboard')} />
              <SidebarButton label="Turmas" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('TurmasScreen')} />
              <SidebarButton label="Chamada" active icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('PresencaScreen')} />
              <SidebarButton label="Notas" icon={<NoteIcon size={22} weight="regular" color="#374151" />} onPress={() => handleSidebarNavigation('NotasScreen')} />
            </View>
          </View>
          <View style={styles.sidebarBottom}>
            <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} onPress={() => setLogoutModalVisible(true)} />
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
          
          {selectedTurma ? renderChamadaScreen() : renderTurmaSelectionScreen()}
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
                  onPress={handleLogout}
                >
                  <Text style={styles.modalConfirmText}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Apagar Chamada</Text>
              <Text style={styles.modalText}>
                Tem certeza que deseja apagar a chamada desta data? Esta ação não pode ser desfeita.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={deleteChamada}
                >
                  <Text style={styles.modalDeleteText}>Apagar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={confirmModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Alterações não salvas</Text>
              <Text style={styles.modalText}>
                Você tem alterações não salvas na chamada. Deseja continuar sem salvar?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={handleCancelNavigation}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmNavigation}
                >
                  <Text style={styles.modalConfirmText}>Continuar</Text>
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
  scrollContent: {
    padding: 32,
    paddingBottom: 100,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: fontFamily.inter.bold || 'System',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fontFamily.inter.medium || 'System',
  },
  turmasGrid: {
    gap: 16,
  },
  turmaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  turmaCardContent: {
    gap: 8,
  },
  turmaCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: fontFamily.inter.bold || 'System',
  },
  turmaCardInfo: {
    gap: 4,
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
    flex: 2,
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
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFamily.inter.semiBold,
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
    textAlign: 'center',
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
  dateControls: {
    width: 580,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateArrow: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginHorizontal: 12,
  },
  dateDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minWidth: 300,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    fontFamily: fontFamily.inter.semiBold,
    textAlign: 'center',
    textTransform: 'capitalize',
    minWidth: 200,
  },
  statusBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFamily.inter.semiBold,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: fontFamily.inter.semiBold,
  },
  modalDeleteBtn: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  modalDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: fontFamily.inter.semiBold,
  },
  deleteButtonFloat: {
    position: 'absolute',
    bottom: 32,
    right: 240,
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  deleteButtonFloatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.inter.semiBold,
  },
});