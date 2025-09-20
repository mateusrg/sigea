import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Modal, useWindowDimensions, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, NoteIcon, SignOutIcon, UserCircleIcon, ClockCounterClockwiseIcon, ChartBarIcon, CalendarIcon, CalendarBlankIcon } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';

const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
const larguraSidebar = 220;

import { getAlunos } from '../../services/authService';

// Configurações de idioma do calendário
LocaleConfig.locales['pt-br'] = {
    monthNames: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function CalendarioAluno() {
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const hoje = (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    })();
    const [selectedDate, setSelectedDate] = useState(hoje);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    const [diasDeAula, setDiasDeAula] = useState({});
    const [turmaAluno, setTurmaAluno] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const userObj = JSON.parse(userData);
                    setUserName(userObj.nome || 'Aluno');
                }
            } catch {
                setUserName('Aluno');
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchTurmaEGerarAulas = async () => {
            setLoading(true);
            try {
                const userData = await AsyncStorage.getItem('user');
                if (!userData) return;

                const userObj = JSON.parse(userData);
                const alunos = await getAlunos();
                const alunoInfo = alunos.find(a => a.nome === userObj.nome);

                if (!alunoInfo) return;

                setUserName(userObj.nome || 'Aluno');
                const turma = alunoInfo.turma;
                const turno = alunoInfo.turno || 'manhã';

                setTurmaAluno(turma);

                let horario;
                if (turno === 'manhã') horario = '08:00 - 12:00';
                else if (turno === 'tarde') horario = '13:00 - 17:00';
                else horario = '18:00 - 22:00';

                const hoje = new Date();
                const ano = hoje.getFullYear();
                const mes = hoje.getMonth();

                const dias = {};
                const primeiroDia = new Date(ano, mes, 1);
                const ultimoDia = new Date(ano, mes + 1, 0);

                for (let dia = primeiroDia; dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
                    const diaSemana = dia.getDay();
                    if (diaSemana >= 1 && diaSemana <= 5) {
                        const diaStr = `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`;
                        dias[diaStr] = {
                            marked: true,
                            dotColor: colors.blue,
                            selectedColor: colors.blue,
                            curso: turma,
                            horario: horario
                        };
                    }
                }

                setDiasDeAula(dias);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTurmaEGerarAulas();
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

    const markedDates = {
        ...diasDeAula,
        [selectedDate]: {
            ...diasDeAula[selectedDate],
            selected: true,
            selectedColor: diasDeAula[selectedDate]?.dotColor || colors.blue,
            dotColor: colors.white,
        },
    };

    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const formatarData = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        const weekday = diasSemana[date.getDay()];
        const monthName = meses[date.getMonth()];

        return `${weekday}, ${day} de ${monthName} de ${year}`;
    };

    const getStatus = (date) => {
        const aula = diasDeAula[date];

        if (aula) {
            return {
                text: `${aula.curso} | ${aula.horario}`,
                color: colors.darkGray
            };
        }

        return {
            text: 'Não há eventos para esse dia',
            color: colors.darkGray
        };
    };

    let numColumns = 1;
    if (width >= 1200) numColumns = 3;
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
                                <SidebarButton label="Dashboard" icon={<HouseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('AlunoDashboard')} />
                                <SidebarButton label="Presenças" icon={<ClockCounterClockwiseIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('PresencaAlunoScreen')} />
                                <SidebarButton label="Notas" icon={<NoteIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('NotasAlunoScreen')} />
                                <SidebarButton label="Calendário" active icon={<CalendarBlankIcon size={22} weight="regular" color="#374151" />} onPress={() => navigation.navigate('CalendarioAlunoScreen')} />
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
                                        <Text style={styles.profileRole}>Aluno</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <ScrollView style={styles.scrollArea}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.pageTitle}>Calendário</Text>
                            </View>

                            {loading ? (
                                <View style={{ marginTop: 16, alignItems: 'center', paddingVertical: 20 }}>
                                    <ActivityIndicator size="large" color={colors.blue || '#000'} />
                                    <Text style={{ marginTop: 8, color: colors.blue || '#000', fontFamily: interFont, fontWeight: '500' }}>Carregando aulas...</Text>
                                </View>
                            ) : (turmaAluno !== null ? (
                                <View style={{ flex: 1, flexDirection: 'column', gap: 1 }}>
                                    <View style={{ flex: 1, marginBottom: 16 }}>
                                        {/* Calendário */}
                                        <Calendar
                                            current={hoje}
                                            style={styles.calendario}
                                            onDayPress={(day) => setSelectedDate(day.dateString)}
                                            markedDates={markedDates}
                                            theme={{
                                                selectedDayTextColor: colors.white,
                                                todayTextColor: colors.darkGray,
                                                arrowColor: colors.darkGray,
                                                textDayFontFamily: fontFamily.roboto.medium,
                                                textMonthFontFamily: fontFamily.roboto.bold,
                                                textDayHeaderFontFamily: fontFamily.roboto.regular,
                                                textDayFontSize: 16,
                                                textMonthFontSize: 18,
                                                textDayHeaderFontSize: 14,
                                            }}
                                            showSixWeeks={true}
                                        />
                                    </View>

                                    <View style={styles.statusBox}>
                                        <View style={{ flex: 0.4, backgroundColor: "#2563ea", padding: 20, borderRadius: 6, justifyContent: 'center', alignItems: 'flex-start' }}>
                                            <Text style={styles.statusDate}>{formatarData(selectedDate)}</Text>
                                        </View>
                                        <Text style={[styles.statusTexto, { color: getStatus(selectedDate).color }]}>
                                            {getStatus(selectedDate).text}
                                        </Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{
                                    marginTop: 16, alignItems: 'center', paddingVertical: 20, borderRadius: 8,
                                    backgroundColor: colors.white,
                                    elevation: 2,
                                    borderWidth: 1,
                                    borderColor: colors.lightGray,
                                    alignItems: 'center',
                                }}>
                                    <Text style={{ color: colors.darkGray || '#000', fontFamily: interFont, fontWeight: 'semibold' }}>
                                        Nenhum dado de aulas disponível.
                                    </Text>
                                </View>
                            )
                            )}
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
        backgroundColor: '#f9fafb',
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
    logoIcon: {
        width: 72,
        height: 72,
        marginRight: 8,
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
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    notificationBtn: {
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    notificationIcon: {
        fontSize: 22,
        color: '#374151',
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: '#ef4444',
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#fff',
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
        padding: 24,
        backgroundColor: '#f9fafb',
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
        paddingHorizontal: 0,
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
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    cardLabel: {
        color: '#1f2937',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cardValue: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
    calendario: {
        borderRadius: 8,
        elevation: 2,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGray
    },
    statusBox: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: colors.white,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.lightGray,
        alignItems: 'center',
        flexDirection: 'row'
    },
    statusDate: {
        fontSize: 18,
        fontFamily: fontFamily.roboto.bold,
        color: colors.white,
        textAlign: 'center'
    },
    statusTexto: {
        fontSize: 18,
        fontFamily: fontFamily.roboto.regular,
        textAlign: 'center',
        marginLeft: 20,
    },
});