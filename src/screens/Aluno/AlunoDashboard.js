import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../../styles/fontFamily';
import { colors } from '../../styles/colors';
import { HouseIcon, ChalkboardTeacherIcon, ClipboardTextIcon, NoteIcon, SignOutIcon, UserCircleIcon } from 'phosphor-react-native';

const interFont = fontFamily?.inter?.regular || fontFamily?.poppins?.regular || 'System';
const larguraSidebar = 220;

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

// Exemplo de datas com presença/falta
const fixedMarkedDates = {
  "2025-09-01": { marked: true, dotColor: "green" },
  "2025-09-02": { marked: true, dotColor: "red" },
  "2025-09-05": { marked: true, dotColor: "green" },
};

export default function AlunoDashboard() {
  const [userName, setUserName] = useState('');
  const hoje = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const [selectedDate, setSelectedDate] = useState(hoje);

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

  const markedDates = {
    ...fixedMarkedDates,
    [selectedDate]: {
      ...fixedMarkedDates[selectedDate],
      selected: true,
      selectedColor: fixedMarkedDates[selectedDate]?.dotColor || colors.blue,
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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    if (markedDates[date]?.selectedColor === 'green') {
      return { text: 'Presença', color: 'green' };
    }
    if (markedDates[date]?.selectedColor === 'red') {
      return { text: 'Falta', color: 'red' };
    }

    if (date < today) {
      return { text: 'Aguardando', color: colors.yellow };
    } else if (date === today) {
      return { text: 'Aguardando', color: colors.yellow };
    } else {
      return { text: 'Previsto', color: colors.darkGray };
    }
  };


  const dashboardCards = [
    { label: "Minha Turma", value: "Turma 101" },
    { label: "Próxima Aula", value: "Matemática - 10:00" },
    { label: "Total de Aulas", value: "32" },
    { label: "Aulas Assistidas", value: "28" },
  ];

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
                <SidebarButton label="Dashboard" active icon={<HouseIcon size={22} weight="regular" color="#374151" />} />
                <SidebarButton label="Aulas" icon={<ChalkboardTeacherIcon size={22} weight="regular" color="#374151" />} />
                <SidebarButton label="Notas" icon={<NoteIcon size={22} weight="regular" color="#374151" />} />
              </View>
            </View>
            <View style={styles.sidebarBottom}>
              <SidebarButton label="Sair" icon={<SignOutIcon size={22} weight="regular" color="#374151" />} />
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.main}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bem-vindo(a), {userName.split(' ')[0]}!</Text>
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

            <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 24 }}>
              <FlatList
                data={dashboardCards}
                keyExtractor={(_, idx) => idx.toString()}
                numColumns={2}
                contentContainerStyle={styles.cardsRow}
                renderItem={({ item }) => <DashboardCard label={item.label} value={item.value} />}
                columnWrapperStyle={{ gap: 16 }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
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

                <View style={{ flex: 0.4 }}>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusDate}>{formatarData(selectedDate)}</Text>
                    <Text style={[styles.statusTexto, { color: getStatus(selectedDate).color }]}>
                      {getStatus(selectedDate).text}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SidebarButton({ label, icon, active }) {
  return (
    <TouchableOpacity style={[styles.sidebarBtn, active && styles.sidebarBtnActive]}>
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
  },
  cardLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardValue: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: 'bold',
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
    alignItems: 'center'
  },
  statusDate: {
    fontSize: 18,
    fontFamily: fontFamily.roboto.medium,
    color: colors.darkGray,
    marginBottom: 18,
    textAlign: 'center'
  },
  statusTexto: {
    fontSize: 18,
    fontFamily: fontFamily.roboto.medium,
    textAlign: 'center'
  },
});