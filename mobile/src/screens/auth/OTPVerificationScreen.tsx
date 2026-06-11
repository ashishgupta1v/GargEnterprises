import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Platform, KeyboardAvoidingView,
  Alert, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NmCard from '../../components/NmCard';
import NmButton from '../../components/NmButton';

const DEVICE_ID_KEY = 'ge-device-install-id';

export default function OTPVerificationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { phone, role } = route.params || { phone: '', role: 'Owner' };
  
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const { verifyOtp, sendOtp, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  async function getDeviceFingerprint(): Promise<string> {
    let installId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!installId) {
      installId = Crypto.randomUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, installId);
    }
    const raw = `${installId}-${Platform.OS}-${Platform.Version}`;
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
  }

  const handleKeypadPress = (key: string) => {
    const newDigits = [...otpDigits];
    const firstEmptyIndex = newDigits.findIndex(d => d === '');
    
    if (key === 'delete') {
      const lastFilledIndex = newDigits.map(d => d !== '').lastIndexOf(true);
      if (lastFilledIndex >= 0) {
        newDigits[lastFilledIndex] = '';
        setOtpDigits(newDigits);
      }
    } else if (firstEmptyIndex !== -1) {
      newDigits[firstEmptyIndex] = key;
      setOtpDigits(newDigits);
    }
  };

  const handleVerify = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      Alert.alert('Required', 'Please enter the 6-digit OTP.');
      return;
    }

    try {
      clearError();
      const fingerprint = await getDeviceFingerprint();
      await verifyOtp(phone, fullOtp, role, fingerprint);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    try {
      setTimer(45);
      clearError();
      await sendOtp(phone, role);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <NmCard variant="sm" style={styles.backButtonCard}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryStart} />
          </NmCard>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>GargEnterprises</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>+91 {phone.slice(0,5)} {phone.slice(5)}</Text>
          </Text>
        </View>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {otpDigits.map((digit, index) => (
            <NmCard key={index} variant="md" inset style={styles.otpBox}>
              <Text style={styles.otpDigit}>{digit}</Text>
            </NmCard>
          ))}
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            Didn't receive code?{' '}
            {timer > 0 ? (
              <Text style={styles.timerActive}>Resend in 00:{timer < 10 ? `0${timer}` : timer}</Text>
            ) : (
              <Text onPress={handleResend} style={styles.timerResend}>Resend Code Now</Text>
            )}
          </Text>
        </View>

        {/* Verify Button */}
        <NmButton
          title={isLoading ? 'Verifying...' : 'Verify & Login'}
          onPress={handleVerify}
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
          fullWidth
        />
      </View>

      {/* Neumorphic Keypad */}
      <View style={styles.keypadContainer}>
        <View style={styles.keypadGrid}>
          {['1','2','3','4','5','6','7','8','9','','0','delete'].map((key, i) => (
            <View key={i} style={styles.keyContainer}>
              {key === '' ? null : (
                <TouchableOpacity onPress={() => handleKeypadPress(key)} activeOpacity={0.7} style={{flex: 1}}>
                  <NmCard variant="md" style={styles.keyCard}>
                    {key === 'delete' ? (
                      <Ionicons name="backspace" size={28} color={colors.danger} />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </NmCard>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.base },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40 },
  backButtonCard: { width: '100%', height: '100%', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { ...typography.titleLarge, color: colors.primaryStart },
  
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  header: { marginBottom: spacing.xxl },
  title: { ...typography.display, color: colors.primaryStart, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted },
  
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxl },
  otpBox: { width: 48, height: 64, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  otpDigit: { fontSize: 24, fontWeight: '700', color: colors.primaryStart },
  
  timerContainer: { alignItems: 'center', marginBottom: spacing.xxl },
  timerText: { ...typography.caption, color: colors.textMuted },
  timerActive: { color: colors.success, fontWeight: '700' },
  timerResend: { color: colors.primaryStart, fontWeight: '700', textDecorationLine: 'underline' },

  keypadContainer: { backgroundColor: colors.base, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.lg, borderTopLeftRadius: 32, borderTopRightRadius: 32, ...shadows.raise },
  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  keyContainer: { width: '30%', height: 64, marginBottom: spacing.md },
  keyCard: { flex: 1, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 24, fontWeight: '600', color: colors.textPrimary },
});
