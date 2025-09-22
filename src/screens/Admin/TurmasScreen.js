import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { TextInput as PaperTextInput, Button as PaperButton, Text as PaperText, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { Picker } from '@react-native-picker/picker';
import { HouseIcon, ChalkboardTeacherIcon, UserCircleIcon, SignOutIcon, ClipboardTextIcon, StackPlusIcon } from 'phosphor-react-native';
import { criarTurma, getTurmas, editarTurma, excluirTurma } from '../../services/authService';

const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

export default function Turmas() {
  const [userName, setUserName] = useState('');
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserName(userObj.nome || 'Administrador');
        }
      } catch {
        setUserName('Administrador');
      }
    };
    fetchUser();
  }, []);

  const [selectedFiltro, setSelectedFiltro] = useState('nome');
  const [filteredTurmas, setFilteredTurmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);
  const [valorIdEditar, setValorIdEditar] = useState('');
  const [valorNomeEditar, setValorNomeEditar] = useState('');
  const [valorTurnoEditar, setValorTurnoEditar] = useState('Manhã');
  const [valorIdExcluir, setValorIdExcluir] = useState('');
  const [valorNomeExcluir, setValorNomeExcluir] = useState('');
  const [valorTurnoExcluir, setValorTurnoExcluir] = useState('Manhã');
  const [modalTurmaVisible, setModalTurmaVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoTurno, setNovoTurno] = useState('Manhã');
  const [nomeError, setNomeError] = useState('');
  const [turnoError, setTurnoError] = useState('');

  const validateNome = (value) => {
    if (!value) return 'O nome da turma é obrigatório.';
    return '';
  };

  const validateTurno = (value) => {
    if (!value) return 'O turno é obrigatório.';
    return '';
  };

  const handleSalvarTurma = async () => {
    const nomeErr = validateNome(novoNome);
    const turnoErr = validateTurno(novoTurno);
    setNomeError(nomeErr);
    setTurnoError(turnoErr);

    if (nomeErr || turnoErr) return;

    try {
      const resultado = await criarTurma(novoNome, novoTurno);

      setNovoNome('');
      setNovoTurno('Manhã');
      setModalTurmaVisible(false);

      setFilteredTurmas([...filteredTurmas, { id: resultado.id, nome: novoNome, students: 0 }]);
    } catch (err) {
      console.error('Erro ao criar turma:', err);
      alert('Erro ao criar turma. Tente novamente.');
    }
  };

  const handleEditarTurma = async () => {
    try {
      await editarTurma(valorIdEditar, {
        nome: valorNomeEditar,
        turno: valorTurnoEditar
      });

      setFilteredTurmas((prev) =>
        prev.map((t) =>
          t.id === valorIdEditar
            ? { ...t, nome: valorNomeEditar, turno: valorTurnoEditar }
            : t
        )
      );

      setModalEditarVisible(false);
    } catch (err) {
      console.error('Erro ao editar turma:', err);
      alert('Erro ao editar turma. Tente novamente.');
    }
  };

  const handleExcluirTurma = async () => {
    try {
      await excluirTurma(valorIdExcluir);

      setFilteredTurmas((prev) => prev.filter((t) => t.id !== valorIdExcluir));

      setModalExcluirVisible(false);
    } catch (err) {
      console.error('Erro ao excluir turma:', err);
      alert('Erro ao excluir turma. Tente novamente.');
    }
  };

  useEffect(() => {
    const fetchTurmas = async () => {
      try {
        setLoading(true);
        const turmasDoFirebase = await getTurmas();
        setFilteredTurmas(turmasDoFirebase);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTurmas();
  }, []);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  let numColumns = 1;
  if (width >= 1600) numColumns = 4;
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
                <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("AdminDashboard")} />
                <SidebarButton label="Turmas" active icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("TurmasScreen")} />
                <SidebarButton label="Professores" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("ProfessoresScreen")} />
                <SidebarButton label="Alunos" icon={<UserCircleIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("AlunosScreen")} />
              </View>
            </View>
            <View style={styles.sidebarBottom}>
              <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} onPress={() => setLogoutModalVisible(true)} />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <View style={styles.header}>
              <View style={styles.headerRight}>
                <View style={styles.profileRow}>
                  <UserCircleIcon size={32} color={colors.darkGray} weight="regular" style={styles.profileImg} />
                  <View>
                    <Text style={styles.profileName}>{userName}</Text>
                    <Text style={styles.profileRole}>Administrador</Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Turmas</Text>
                <TouchableOpacity
                  style={styles.criarButton}
                  onPress={() => setModalTurmaVisible(true)}
                >
                  <StackPlusIcon size={20} color="#fff" weight="bold" style={{ marginRight: 14 }} />
                  <Text style={styles.criarButtonText}>Inserir Nova Turma</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.upcomingContainer}>
                <View style={styles.pickerContainer}>
                  <Text style={{
                    fontFamily: interFont,
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#1f2937',
                    letterSpacing: 0.2,
                  }}>Ordenar por:</Text>
                  <Picker
                    selectedValue={selectedFiltro}
                    onValueChange={setSelectedFiltro}
                    style={styles.picker}
                    dropdownIconColor="#6b7280"
                  >
                    <Picker.Item label="Nome da Turma" value="nome" />
                    <Picker.Item label="Número de Alunos" value="alunos" />
                  </Picker>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Turma</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.5, marginLeft: 10 }]}>Alunos</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right', marginRight: 30 }]}>Ações</Text>
                </View>
                <FlatList
                  data={filteredTurmas}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCellBold} numberOfLines={1} ellipsizeMode="tail">{item.nome}</Text>
                      <Text style={styles.tableCell}>{item.students}</Text>
                      <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                          onPress={() => { setModalEditarVisible(true); setValorIdEditar(item.id); setValorNomeEditar(item.nome); setValorTurnoEditar(item.turno); }}
                        >
                          <Text style={styles.actionButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                          onPress={() => { setModalExcluirVisible(true); setValorIdExcluir(item.id); setValorNomeExcluir(item.nome); setValorTurnoExcluir(item.turno); }}
                        >
                          <Text style={styles.actionButtonText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
                {loading && (
                  <View style={{ marginTop: 16, alignItems: 'center', paddingVertical: 20 }}>
                    <ActivityIndicator size="large" color={colors.blue || '#000'} />
                    <Text style={{ marginTop: 8, color: colors.blue || '#000', fontFamily: interFont, fontWeight: '500' }}>Carregando turmas...</Text>
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
          {/* Modal Nova Turma */}
          <Modal
            visible={modalTurmaVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalTurmaVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Nova Turma</Text>

                <View style={styles.entornoInput}>
                  <PaperTextInput
                    label={<PaperText style={{ color: colors.mediumGray }}>Nome da Turma</PaperText>}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                    textColor="black"
                    maxLength={15}
                    theme={{
                      roundness: 10,
                      colors: {
                        primary: colors.blue,
                        outline: nomeError ? colors.red : colors.blue,
                        text: colors.black,
                      },
                    }}
                    style={styles.input}
                    value={novoNome}
                    onChangeText={(text) => {
                      setNovoNome(text);
                      if (nomeError) setNomeError('');
                    }}
                    onBlur={() => setNomeError(validateNome(novoNome))}
                    error={!!nomeError}
                    onSubmitEditing={handleSalvarTurma}
                  />
                  <HelperText type="error" visible={!!nomeError} style={styles.helperText}>
                    {nomeError}
                  </HelperText>
                </View>

                <Picker
                  selectedValue={novoTurno}
                  onValueChange={setNovoTurno}
                  style={styles.modalPicker}
                >
                  <Picker.Item label="Manhã" value="Manhã" />
                  <Picker.Item label="Tarde" value="Tarde" />
                  <Picker.Item label="Noite" value="Noite" />
                </Picker>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalTurmaVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleSalvarTurma}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Modal Excluir Turma */}
          <Modal
            visible={modalExcluirVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalExcluirVisible(false)}
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
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Confirmar Exclusão</Text>
                <Text style={{ fontSize: 15, color: '#374151', marginBottom: 24, textAlign: 'center' }}>Tem certeza que deseja excluir esta turma?</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalExcluirVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#ef4444', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleExcluirTurma}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Modal Editar Turma */}
          <Modal
            visible={modalEditarVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalEditarVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Editar Turma</Text>

                <View style={styles.entornoInput}>
                  <PaperTextInput
                    label={<PaperText style={{ color: colors.mediumGray }}>Nome da Turma</PaperText>}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                    textColor="black"
                    maxLength={15}
                    theme={{
                      roundness: 10,
                      colors: {
                        primary: colors.blue,
                        outline: nomeError ? colors.red : colors.blue,
                        text: colors.black,
                      },
                    }}
                    style={styles.input}
                    value={valorNomeEditar}
                    onChangeText={(text) => {
                      setValorNomeEditar(text);
                      if (nomeError) setNomeError('');
                    }}
                    onBlur={() => setNomeError(validateNome(valorNomeEditar))}
                    error={!!nomeError}
                    onSubmitEditing={handleSalvarTurma}
                  />
                  <HelperText type="error" visible={!!nomeError} style={styles.helperText}>
                    {nomeError}
                  </HelperText>
                </View>

                <Picker
                  selectedValue={valorTurnoEditar}
                  onValueChange={setValorTurnoEditar}
                  style={styles.modalPicker}
                >
                  <Picker.Item label="Manhã" value="Manhã" />
                  <Picker.Item label="Tarde" value="Tarde" />
                  <Picker.Item label="Noite" value="Noite" />
                </Picker>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalEditarVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleEditarTurma}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
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

function DashboardCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%'
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
    marginBottom: 24
  },
  logoText: {
    fontFamily: fontFamily.poppins.medium,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.variantGray
  },
  sidebarNav: {
    flexDirection: 'column',
    gap: 8
  },
  sidebarBottom: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16
  },
  sidebarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 4
  },
  sidebarBtnActive: {
    backgroundColor: '#f3f4f6'
  },
  sidebarBtnIcon: {
    fontSize: 18,
    color: '#374151'
  },
  sidebarBtnIconActive: {
    color: '#137fec'
  },
  sidebarBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  },
  sidebarBtnTextActive: {
    color: '#137fec',
    fontWeight: 'bold'
  },
  main: {
    flex: 1,
    paddingLeft: larguraSidebar,
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8
  },
  profileName: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 15
  },
  profileRole: {
    color: '#6b7280',
    fontSize: 13
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
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
    paddingHorizontal: 0
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
    gap: 8
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  cardValue: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: 'bold'
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
    textAlign: 'left',
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
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  criarButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    width: 250,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  criarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    minWidth: 200,
    height: "auto",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  picker: {
    height: 48,
    color: '#374151',
    fontSize: 15,
    paddingHorizontal: 12,
    fontFamily: fontFamily.inter.medium,
    marginLeft: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: 350,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12
  },
  modalPicker: {
    height: 48,
    color: colors.black,
    fontSize: 16,
    paddingHorizontal: 15,
    fontFamily: fontFamily.inter.medium,
    borderRadius: 10,
    backgroundColor: colors.inputBg,
    marginBottom: 20,
    marginTop: 5
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  entornoInput: {
    height: 80,
  },
  helperText: {
    fontFamily: fontFamily.poppins.medium,
    fontSize: 10,
    color: colors.red,
    marginTop: -20,
  },
  input: {
    borderRadius: 1000,
    backgroundColor: colors.inputBg,
    marginBottom: 20,
    fontSize: 16,
    color: colors.black,
    paddingRight: 15,
  },
});