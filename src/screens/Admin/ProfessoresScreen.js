import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { TextInput as PaperTextInput, Button as PaperButton, Text as PaperText, HelperText } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { Picker } from '@react-native-picker/picker';
import { HouseIcon, ChalkboardTeacherIcon, UserCircleIcon, SignOutIcon, ClipboardTextIcon, StackPlusIcon, PlusCircleIcon, MinusCircleIcon } from 'phosphor-react-native';

import { getProfessores, criarProfessor, editarProfessor, excluirProfessor, nomeProfessorExiste, adicionarProfessorNaTurma, removerProfessorDaTurma, getTurmas } from '../../services/authService';

const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
const larguraSidebar = 220;

import { useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Modal } from 'react-native';

export default function Professores({ setUserProfile }) {
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
  const [filteredProfessores, setFilteredProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [modalExcluirVisible, setModalExcluirVisible] = useState(false);
  const [valorIdEditar, setValorIdEditar] = useState('');
  const [valorNomeEditar, setValorNomeEditar] = useState('');
  const [valorIdExcluir, setValorIdExcluir] = useState('');
  const [modalProfessorVisible, setModalProfessorVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  const [modalDesignarVisible, setModalDesignarVisible] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [professorTurmas, setProfessorTurmas] = useState([]);

  const [professores, setProfessores] = useState([]);

  const validateNome = (value) => {
    if (!value) return 'O nome do professor é obrigatório.';
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'O email do professor é obrigatório.';
    return '';
  };

  const validateSenha = (value) => {
    if (!value) return 'A senha do professor é obrigatória.';
    return '';
  };

  useEffect(() => {
    const fetchProfessores = async () => {
      try {
        setLoading(true);
        const professoresDoBanco = await getProfessores();
        setProfessores(professoresDoBanco);
        setFilteredProfessores(professoresDoBanco);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessores();
  }, []);

  useEffect(() => {
    const sorted = [...filteredProfessores];
    if (selectedFiltro === 'nome') {
      sorted.sort((a, b) => {
        const nomeA = a?.nome || "";
        const nomeB = b?.nome || "";
        return nomeA.localeCompare(nomeB);
      });
    } else if (selectedFiltro === 'turmas') {
      sorted.sort((a, b) => (b.turmas || 0) - (a.turmas || 0));
    }
    setFilteredProfessores(sorted);
  }, [selectedFiltro, professores]);

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

  const handleSalvarProfessor = async () => {
    const nomeErr = validateNome(novoNome);
    const emailErr = validateEmail(novoEmail);
    const senhaErr = validateSenha(novaSenha);
    setNomeError(nomeErr);
    setEmailError(emailErr);
    setSenhaError(senhaErr);

    if (nomeErr || emailErr || senhaErr) return;

    const nomeExiste = await nomeProfessorExiste(novoNome);
    if (nomeExiste) {
      setNomeError('Já existe um professor com este nome.');
      return;
    }

    try {
      const resultado = await criarProfessor(novoNome, novoEmail, novaSenha);

      setFilteredProfessores([
        ...filteredProfessores,
        { id: resultado.id, nome: novoNome, turmas: 0, email: novoEmail }
      ]);

      setNovoNome('');
      setNovoEmail('');
      setNovaSenha('');
      setModalProfessorVisible(false);
    } catch (err) {
      console.error('Erro ao criar professor:', err);
      if (err.code === 'auth/email-already-in-use') {
        setEmailError('Este e-mail já está em uso por outro professor.');
      } else {
        setEmailError('Erro ao criar professor. Tente novamente.');
      }
    }
  };

  const handleEditarProfessor = async () => {
    try {
      await editarProfessor(valorIdEditar, valorNomeEditar);

      setFilteredProfessores((prev) =>
        prev.map((t) =>
          t.id === valorIdEditar
            ? { ...t, nome: valorNomeEditar }
            : t
        )
      );

      setModalEditarVisible(false);
    } catch (err) {
      console.error('Erro ao editar professor:', err);
      alert('Erro ao editar professor. Tente novamente.');
    }
  };

  const handleExcluirProfessor = async () => {
    try {
      await excluirProfessor(valorIdExcluir);

      setFilteredProfessores((prev) => prev.filter((t) => t.id !== valorIdExcluir));

      setModalExcluirVisible(false);
    } catch (err) {
      console.error('Erro ao excluir professor:', err);
      alert('Erro ao excluir professor. Tente novamente.');
    }
  };

  const abrirModalDesignar = async (professor) => {
    setProfessorSelecionado(professor);

    try {
      const turmasDoBanco = await getTurmas();
      setTurmas(turmasDoBanco);

      const turmasDesignadas = turmasDoBanco
        .filter(turma => turma.professores?.includes(professor.id))
        .map(turma => turma.id);

      setProfessorTurmas(turmasDesignadas);
      setModalDesignarVisible(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDesignacaoTurma = async (idTurma) => {
    try {
      let novoProfessorTurmas;
      if (professorTurmas.includes(idTurma)) {
        await removerProfessorDaTurma(idTurma, professorSelecionado.id);
        novoProfessorTurmas = professorTurmas.filter(t => t !== idTurma);
      } else {
        await adicionarProfessorNaTurma(idTurma, professorSelecionado.id);
        novoProfessorTurmas = [...professorTurmas, idTurma];
      }

      setProfessorTurmas(novoProfessorTurmas);

      setFilteredProfessores(prev =>
        prev.map(prof =>
          prof.id === professorSelecionado.id
            ? { ...prof, turmas: novoProfessorTurmas.length }
            : prof
        )
      );
    } catch (err) {
      console.error(err);
    }
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
                <SidebarButton label="Turmas" icon={<ClipboardTextIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("TurmasScreen")} />
                <SidebarButton label="Professores" active icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("ProfessoresScreen")} />
                <SidebarButton label="Alunos" icon={<UserCircleIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate("AlunosScreen")} />
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
                    <Text style={styles.profileRole}>Administrador</Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Professores</Text>
                <TouchableOpacity
                  style={styles.criarButton}
                  onPress={() => {
                    setModalProfessorVisible(true);
                    setNovoNome('');
                    setNovoEmail('');
                    setNovaSenha('');
                  }}
                >
                  <StackPlusIcon size={20} color="#fff" weight="bold" style={{ marginRight: 14 }} />
                  <Text style={styles.criarButtonText}>Inserir Novo Professor</Text>
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
                    <Picker.Item label="Nome do Professor" value="nome" />
                    <Picker.Item label="Número de Turmas" value="turmas" />
                  </Picker>
                </View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Professor</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.5, marginLeft: 10 }]}>Número de Turmas</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right', marginRight: 105 }]}>Ações</Text>
                </View>
                <FlatList
                  data={filteredProfessores}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCellBold} numberOfLines={1} ellipsizeMode="tail">{item.nome}</Text>
                      <Text style={styles.tableCell}>{item.turmas}</Text>
                      <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
                          onPress={() => {
                            setValorIdEditar(item.id);
                            setValorNomeEditar(item.nome);
                            setModalEditarVisible(true);
                          }}
                        >
                          <Text style={styles.actionButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                          onPress={() => {
                            setValorIdExcluir(item.id);
                            setModalExcluirVisible(true);
                          }}
                        >
                          <Text style={styles.actionButtonText}>Excluir</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.yellow }]}
                          onPress={() => abrirModalDesignar(item)}
                        >
                          <Text style={styles.actionButtonText}>Designar para Turma</Text>
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
                    <Text style={{ marginTop: 8, color: colors.blue || '#000', fontFamily: interFont, fontWeight: '500' }}>Carregando professores...</Text>
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
          {/* Modal Novo Professor */}
          <Modal
            visible={modalProfessorVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalProfessorVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Novo Professor</Text>

                <View style={styles.entornoInput}>
                  <PaperTextInput
                    label={<PaperText style={{ color: colors.mediumGray }}>Nome do Professor</PaperText>}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                    textColor="black"
                    maxLength={30}
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
                    onSubmitEditing={handleSalvarProfessor}
                  />
                  <HelperText type="error" visible={!!nomeError} style={styles.helperText}>
                    {nomeError}
                  </HelperText>
                </View>

                <View style={styles.entornoInput}>
                  <PaperTextInput
                    label={<PaperText style={{ color: colors.mediumGray }}>Email do Professor</PaperText>}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                    textColor="black"
                    maxLength={50}
                    theme={{
                      roundness: 10,
                      colors: {
                        primary: colors.blue,
                        outline: emailError ? colors.red : colors.blue,
                        text: colors.black,
                      },
                    }}
                    style={styles.input}
                    value={novoEmail}
                    onChangeText={(text) => {
                      setNovoEmail(text);
                      if (emailError) setEmailError('');
                    }}
                    onBlur={() => setEmailError(validateEmail(novoEmail))}
                    error={!!emailError}
                    onSubmitEditing={handleSalvarProfessor}
                  />
                  <HelperText type="error" visible={!!emailError} style={styles.helperText}>
                    {emailError}
                  </HelperText>
                </View>

                <View style={styles.entornoInput}>
                  <PaperTextInput
                    label={<PaperText style={{ color: colors.mediumGray }}>Senha do Professor</PaperText>}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                    textColor="black"
                    maxLength={20}
                    theme={{
                      roundness: 10,
                      colors: {
                        primary: colors.blue,
                        outline: senhaError ? colors.red : colors.blue,
                        text: colors.black,
                      },
                    }}
                    style={styles.input}
                    value={novaSenha}
                    onChangeText={(text) => {
                      setNovaSenha(text);
                      if (senhaError) setSenhaError('');
                    }}
                    onBlur={() => setSenhaError(validateSenha(novaSenha))}
                    error={!!senhaError}
                    onSubmitEditing={handleSalvarProfessor}
                  />
                  <HelperText type="error" visible={!!senhaError} style={styles.helperText}>
                    {senhaError}
                  </HelperText>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalProfessorVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleSalvarProfessor}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Modal Excluir Professor */}
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
                <Text style={{ fontSize: 15, color: '#374151', marginBottom: 24, textAlign: 'center' }}>Tem certeza que deseja excluir este professor?</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalExcluirVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#ef4444', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleExcluirProfessor}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Modal Editar Professor */}
          <Modal
            visible={modalEditarVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalEditarVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Editar Professor</Text>

                <View style={styles.entornoInput}>
                  <PaperTextInput
                    label={<PaperText style={{ color: colors.mediumGray }}>Nome do Professor</PaperText>}
                    mode="outlined"
                    keyboardType="default"
                    autoCapitalize="words"
                    textColor="black"
                    maxLength={30}
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
                    onSubmitEditing={handleEditarProfessor}
                  />
                  <HelperText type="error" visible={!!nomeError} style={styles.helperText}>
                    {nomeError}
                  </HelperText>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalEditarVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={handleEditarProfessor}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          {/* Modal Designar Turma */}
          <Modal
            visible={modalDesignarVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalDesignarVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Designar {professorSelecionado?.nome} para Turma</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {turmas.map((turma) => {
                    const jaDesignado = professorTurmas.includes(turma.id);
                    return (
                      <View key={turma.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ fontSize: 16 }}>{turma.nome}</Text>
                        <TouchableOpacity onPress={() => toggleDesignacaoTurma(turma.id)}>
                          {jaDesignado ? (
                            <MinusCircleIcon size={24} color="#ef4444" />
                          ) : (
                            <PlusCircleIcon size={24} color="#10B981" />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5e7eb', padding: 10, borderRadius: 8, minWidth: 80, alignItems: 'center' }}
                    onPress={() => setModalDesignarVisible(false)}
                  >
                    <Text style={{ color: '#374151', fontWeight: 'bold' }}>Fechar</Text>
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