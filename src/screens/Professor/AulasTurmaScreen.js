import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFamily } from '../../styles/fontFamily';
const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, SignOutIcon, UserCircleIcon, ArrowLeftIcon, UserIcon } from 'phosphor-react-native';
import { db } from '../../services/firebase';
import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const larguraSidebar = 220;

export default function AulasTurmaScreen({ route, setUserProfile }) {
  const { turmaId, turmaNome } = route.params;
  const [userName, setUserName] = useState('');
  const [professores, setProfessores] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmaInfo, setTurmaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

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
    if (turmaId) {
      loadTurmaData();
    }
  }, [turmaId]);

  const loadTurmaData = async () => {
    try {
      setLoading(true);
      const turmaDoc = await db.collection('turmas').doc(turmaId).get();
      if (turmaDoc.exists) {
        setTurmaInfo({ id: turmaDoc.id, ...turmaDoc.data() });
      }

      const professoresSnapshot = await db
        .collection('turmas')
        .doc(turmaId)
        .collection('professores')
        .get();

      const professorPromises = professoresSnapshot.docs.map(async (doc) => {
        const professorId = doc.data().idProfessor;
        const userDoc = await db.collection('users').doc(professorId).get();
        if (userDoc.exists) {
          return {
            id: professorId,
            nome: userDoc.data().nome,
            ...doc.data()
          };
        }
        return null;
      });

      const professoresData = await Promise.all(professorPromises);
      setProfessores(professoresData.filter(prof => prof !== null));

      const alunosSnapshot = await db
        .collection('turmas')
        .doc(turmaId)
        .collection('alunos')
        .get();

      const alunoPromises = alunosSnapshot.docs.map(async (doc) => {
        const alunoId = doc.data().idAluno;
        const userDoc = await db.collection('users').doc(alunoId).get();
        if (userDoc.exists) {
          return {
            id: alunoId,
            nome: userDoc.data().nome
          };
        }
        return null;
      });

      const alunosData = await Promise.all(alunoPromises);
      setAlunos(alunosData.filter(aluno => aluno !== null));
      
    } catch (error) {
      console.error('Erro ao carregar dados da turma:', error);
    } finally {
      setLoading(false);
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

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nenhum professor encontrado</Text>
      <Text style={styles.emptyStateText}>
        Esta turma não possui professores cadastrados ainda.
      </Text>
    </View>
  );

  if (loading) {
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
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando informações da turma...</Text>
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
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <ArrowLeftIcon size={20} color="#374151" weight="regular" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.turmaHeader}>
              <View>
                <Text style={styles.pageTitle}>{turmaNome}</Text>
                {turmaInfo && (
                  <Text style={styles.turmaSubtitle}>Turno: {turmaInfo.turno}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.chamadaButton}
                onPress={() => navigation.navigate('PresencaScreen', { 
                  turmaId: turmaId,
                  turmaNome: turmaNome 
                })}
                activeOpacity={0.8}
              >
                <ClipboardTextIcon size={20} color="#fff" weight="regular" />
                <Text style={styles.chamadaButtonText}>Fazer Chamada</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Professores da Turma</Text>
            
            {professores.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhum professor encontrado</Text>
                <Text style={styles.emptyStateText}>
                  Esta turma não possui professores cadastrados ainda.
                </Text>
              </View>
            ) : (
              <FlatList
                data={professores}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                key={`professores-${numColumns}`}
                contentContainerStyle={styles.professoresGrid}
                renderItem={({ item }) => (
                  <ProfessorCard 
                    professor={item} 
                  />
                )}
                columnWrapperStyle={numColumns > 1 ? { gap: 24 } : undefined}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}

            <Text style={[styles.sectionTitle, { marginTop: 48 }]}>Alunos da Turma</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Carregando alunos...</Text>
              </View>
            ) : alunos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>Nenhum aluno encontrado</Text>
                <Text style={styles.emptyStateText}>
                  Esta turma não possui alunos cadastrados ainda.
                </Text>
              </View>
            ) : (
              <FlatList
                data={alunos}
                keyExtractor={(item) => item.id}
                numColumns={numColumns}
                key={`alunos-${numColumns}`}
                contentContainerStyle={styles.alunosGrid}
                renderItem={({ item }) => (
                  <AlunoCard 
                    aluno={item} 
                  />
                )}
                columnWrapperStyle={numColumns > 1 ? { gap: 24 } : undefined}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
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

function ProfessorCard({ professor }) {
  return (
    <View style={styles.professorCard}>
      <View style={styles.professorCardContent}>
        <View style={styles.professorAvatar}>
          <UserIcon size={24} color="#6b7280" weight="regular" />
        </View>
        <Text style={styles.professorCardTitle}>{professor.nome}</Text>
        <Text style={styles.professorCardSubtitle}>Professor</Text>
      </View>
    </View>
  );
}

function AlunoCard({ aluno }) {
  return (
    <View style={styles.alunoCard}>
      <View style={styles.alunoCardContent}>
        <View style={styles.alunoAvatar}>
          <UserIcon size={24} color="#6b7280" weight="regular" />
        </View>
        <Text style={styles.alunoCardTitle}>{aluno.nome}</Text>
        <Text style={styles.alunoCardSubtitle}>Aluno</Text>
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
    marginBottom: 16,
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
  },
  backButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: fontFamily.inter.medium || 'System',
  },
  turmaHeader: {
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
    fontFamily: fontFamily.inter.bold || 'System',
    marginBottom: 8,
  },
  turmaSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: fontFamily.inter.bold || 'System',
    marginBottom: 24,
  },
  professoresGrid: {
    gap: 24,
  },
  professorCard: {
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
    alignItems: 'center',
  },
  professorCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  chamadaButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
  },
  chamadaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.inter.semiBold || 'System',
  },
  alunosGrid: {
    gap: 24,
  },
  alunoCard: {
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
    alignItems: 'center',
  },
  alunoCardContent: {
    alignItems: 'center',
    width: '100%',
  },
  alunoAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alunoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: fontFamily.inter.bold || 'System',
    textAlign: 'center',
  },
  alunoCardSubtitle: {
    fontSize: 14,
    color: '#0891b2',
    fontFamily: fontFamily.inter.regular || 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
  },
  professorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  professorCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    fontFamily: fontFamily.inter.bold || 'System',
    textAlign: 'center',
  },
  professorCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: fontFamily.inter.regular || 'System',
  },
  professorCardActions: {
    width: '100%',
  },
  professorCardButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  professorCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamily.inter.semiBold || 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
    fontFamily: fontFamily.inter.bold || 'System',
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 24,
    fontFamily: fontFamily.inter.regular || 'System',
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
    fontFamily: fontFamily.inter.semiBold || 'System',
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
    fontFamily: fontFamily.inter.semiBold || 'System',
  },
});