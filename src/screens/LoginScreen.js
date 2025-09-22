import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Image
} from 'react-native';
import { TextInput as PaperTextInput, Button as PaperButton, Text as PaperText, Dialog, Portal, HelperText, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fontFamily } from '../styles/fontFamily';
import { colors } from '../styles/colors';
import { login } from '../services/authService';

export default function LoginScreen({ navigation, setUserProfile }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [backendError, setBackendError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (value) => {
        if (!value) return 'O campo de email é obrigatório.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Por favor, insira um e-mail válido.';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'O campo de senha é obrigatório.';
        return '';
    };

    const handleLogin = async () => {
        setBackendError('');
        setLoading(true);
        const emailErr = validateEmail(email);
        const passwordErr = validatePassword(password);
        setEmailError(emailErr);
        setPasswordError(passwordErr);

        if (emailErr || passwordErr) {
            setLoading(false);
            return;
        }

        try {
            const result = await login(email, password);
            if (result.profile && result.profile.nome && result.profile.papel && result.token) {

                let papelString = 'aluno';
                if (result.profile.papel === 1) papelString = 'admin';
                else if (result.profile.papel === 2) papelString = 'professor';
                setUserProfile(papelString);

                // Salvar dados do usuário incluindo o uid
                const userData = { 
                    ...result.profile, 
                    uid: result.uid 
                };
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                await AsyncStorage.setItem('token', result.token);
            } else {
                setBackendError(result.message || 'Usuário ou senha inválidos.');
            }
        } catch (err) {
            const code = err.code || err?.error?.code;
            const message = err.message || err?.error?.message || '';
            if (code === 'auth/user-not-found') {
                setBackendError('E-mail não encontrado.');
                setLoading(false);
            } else if (code === 'auth/wrong-password') {
                setBackendError('Senha incorreta.');
                setLoading(false);
            } else if (code === 'auth/invalid-credential') {
                setBackendError('E-mail ou senha incorretos.');
                setLoading(false);
            } else if (
                message.toLowerCase().includes('network') ||
                message.toLowerCase().includes('connection') ||
                code === 'auth/network-request-failed'
            ) {
                setBackendError('Erro de conexão. Verifique sua internet.');
                setLoading(false);
            } else if (message) {
                setBackendError(message);
                setLoading(false);
            } else {
                setBackendError('Erro desconhecido. Tente novamente.');
                setLoading(false);
            }
        }
    };

    return (
        <View style={styles.contorno}>
            <Image
                source={require('../../assets/csd.png')}
                style={styles.csdImage}
                resizeMode="cover"
            />
            <Image
                source={require('../../assets/cie.png')}
                style={styles.cieImage}
                resizeMode="cover"
            />
            <View style={styles.container}>
                <PaperText style={styles.title}>Eduteca</PaperText>
                <PaperText style={styles.subtitle}>Seja bem-vindo de volta! Entre em sua conta</PaperText>
                <View style={styles.entornoInput}>
                    <PaperTextInput
                        label={<PaperText style={{ color: colors.mediumGray }}>Email</PaperText>}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textColor="black"
                        maxLength={255}
                        theme={{
                            roundness: 10,
                            colors: {
                                primary: colors.blue,
                                outline: emailError ? colors.red : colors.blue,
                                text: colors.black,
                            },
                        }}
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        onBlur={() => setEmailError(validateEmail(email))}
                        error={!!emailError}
                        onSubmitEditing={handleLogin}
                    />
                    <HelperText type="error" visible={!!emailError} style={styles.helperText}>
                        {emailError}
                    </HelperText>
                </View>
                <View style={styles.entornoInput}>
                    <PaperTextInput
                        label={<PaperText style={{ color: colors.mediumGray }}>Senha</PaperText>}
                        mode="outlined"
                        textColor="black"
                        secureTextEntry
                        maxLength={255}
                        theme={{
                            roundness: 10,
                            colors: {
                                primary: colors.blue,
                                outline: passwordError ? colors.red : colors.blue,
                                text: colors.black,
                            },
                        }}
                        style={[styles.input]}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (passwordError) setPasswordError('');
                        }}
                        onBlur={() => setPasswordError(validatePassword(password))}
                        error={!!passwordError}
                        onSubmitEditing={handleLogin}
                    />
                    <HelperText type="error" visible={!!passwordError || !!backendError} style={styles.helperText}>
                        {passwordError || backendError}
                    </HelperText>
                </View>
                <PaperButton
                    mode="elevated"
                    onPress={handleLogin}
                    style={[
                        styles.button,
                        loading && { backgroundColor: colors.darkGray }
                    ]}
                    labelStyle={{ color: '#fff', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}
                    disabled={loading}
                >
                    {loading
                        ? <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <ActivityIndicator animating={true} color={colors.white} size={24} />
                        </View>
                        : 'Entrar'
                    }
                </PaperButton>
            </View>

            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                    style={{ backgroundColor: colors.offWhite, alignSelf: 'center' }}
                >
                    <Dialog.Title>
                        <PaperText style={{
                            color: colors.black,
                            fontFamily: fontFamily.poppins.bold,
                            fontWeight: '700',
                            fontSize: 20,
                        }}>
                            Erro
                        </PaperText>
                    </Dialog.Title>
                    <Dialog.Content>
                        <PaperText style={{
                            color: colors.black,
                            fontFamily: fontFamily.poppins.medium,
                            fontWeight: '500',
                            fontSize: 16,
                            textAlign: 'center',
                        }}>
                            {dialogMessage}
                        </PaperText>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <PaperButton
                            onPress={() => setDialogVisible(false)}
                            labelStyle={{
                                color: colors.blue,
                                fontFamily: fontFamily.poppins.semiBold,
                                fontWeight: '600',
                                fontSize: 16,
                            }}
                        >Ok</PaperButton>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    entornoInput: {
        height: 80,
    },
    helperText: {
        fontFamily: fontFamily.poppins.medium,
        fontSize: 10,
        color: colors.red,
        marginTop: -20,
    },
    csdImage: {
        position: 'absolute',
        top: 0,
        right: 0
    },
    cieImage: {
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    contorno: {
        height: '100%',
        width: '100%',
        backgroundColor: colors.white
    },
    container: {
        width: '95%',
        maxWidth: 400,
        alignSelf: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    input: {
        borderRadius: 1000,
        backgroundColor: colors.inputBg,
        marginBottom: 20,
        fontSize: 16,
        color: colors.black,
        paddingRight: 15,
    },
    title: {
        fontFamily: fontFamily.poppins.bold,
        fontSize: 30,
        marginBottom: 26,
        textAlign: 'center',
        color: colors.blue,
        lineHeight: 40,
    },
    subtitle: {
        fontFamily: fontFamily.poppins.semiBold,
        alignSelf: 'center',
        width: 260,
        fontSize: 20,
        marginBottom: 65,
        textAlign: 'center',
        color: colors.black,
    },
    button: {
        shadowColor: colors.blue,
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowBlurrRadius: 10,
        alignSelf: 'stretch',
        justifyContent: 'center',
        height: 50,
        borderRadius: 10,
        backgroundColor: colors.blue,
        marginTop: 10,
        width: '100%',
        overflow: 'hidden',
    },
    link: {
        fontFamily: fontFamily.poppins.semiBold,
        marginTop: 35,
        color: colors.linkGray,
        textAlign: 'center',
    },
});