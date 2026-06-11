import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, SafeAreaView, Dimensions, Animated, Easing } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';
import NmCard from '../../components/NmCard';

const { width, height } = Dimensions.get('window');

export default function BarcodeScannerScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Animation values
  const scanAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Looping beam animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: any) => {
    if (scanned) return;
    setScanned(true);
    // Trigger Slide Up Animation
    setShowResult(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  };

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowResult(false);
      setTimeout(() => setScanned(false), 1000);
    });
  };

  const handleAddRecord = () => {
    // Navigate back to Record Movement with scanned data
    handleDismiss();
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      {/* Top Bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.primaryStart} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GargEnterprises</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="person-circle" size={32} color={colors.primaryStart} />
        </TouchableOpacity>
      </SafeAreaView>

      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_e', 'upc_a', 'code128'],
        }}
      >
        <View style={styles.overlay}>
          {/* Top Mask */}
          <View style={styles.maskTop} />
          
          <View style={styles.maskCenterRow}>
            {/* Left Mask */}
            <View style={styles.maskSide} />
            
            {/* Scanner Bracket Area */}
            <View style={styles.scannerViewport}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Animated Beam */}
              <Animated.View
                style={[
                  styles.beam,
                  {
                    transform: [
                      {
                        translateY: scanAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 240, 0], // Assuming 250 viewport size
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.beamLine} />
                <LinearGradient
                  colors={['rgba(27, 82, 205, 0.4)', 'transparent']}
                  style={styles.beamGlow}
                />
              </Animated.View>
            </View>

            {/* Right Mask */}
            <View style={styles.maskSide} />
          </View>
          
          {/* Bottom Mask */}
          <View style={styles.maskBottom}>
            <Text style={styles.instructionTitle}>Align barcode within the brackets</Text>
            <Text style={styles.instructionSub}>Scanning for Premium Hardware...</Text>
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionCircle}>
                  <Ionicons name="flashlight" size={24} color={colors.white} />
                </View>
                <Text style={styles.actionLabel}>FLASH</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <View style={styles.actionCircle}>
                  <Ionicons name="keypad" size={24} color={colors.white} />
                </View>
                <Text style={styles.actionLabel}>MANUAL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>

      {/* Slide-Up Result Card */}
      {showResult && (
        <Animated.View style={[styles.resultSheet, { transform: [{ translateY: slideAnim }] }]}>
          <NmCard variant="lg" style={styles.resultCard}>
            <View style={styles.dragIndicator} />
            
            <View style={styles.resultHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.badges}>
                  <View style={styles.badgeGold}>
                    <Text style={styles.badgeGoldText}>HAFELE TIER</Text>
                  </View>
                  <View style={styles.badgeGreen}>
                    <Text style={styles.badgeGreenText}>IN STOCK</Text>
                  </View>
                </View>
                <Text style={styles.productName}>Soft-Close Cabinet Hinge</Text>
                <Text style={styles.productSku}>SKU: GE-HAF-9283-X</Text>
              </View>
              <NmCard variant="md" inset style={styles.productImageCard}>
                <Ionicons name="cube" size={40} color={colors.primaryStart} />
              </NmCard>
            </View>

            <View style={styles.detailsGrid}>
              <NmCard variant="md" inset style={styles.detailBox}>
                <Text style={styles.detailLabel}>LOCATION</Text>
                <Text style={styles.detailValue}>Aisle 4, Shelf B</Text>
              </NmCard>
              <NmCard variant="md" inset style={styles.detailBox}>
                <Text style={styles.detailLabel}>UNIT PRICE</Text>
                <Text style={styles.detailValue}>₹450.00</Text>
              </NmCard>
            </View>

            <View style={styles.sheetActions}>
              <NmCard variant="sm" style={styles.dismissWrapper}>
                <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
                  <Text style={styles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
              </NmCard>
              
              <TouchableOpacity style={[styles.addRecordBtn, shadows.primaryBtn]} onPress={handleAddRecord}>
                <LinearGradient colors={[colors.primaryStart, colors.primaryEnd]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.addRecordGradient}>
                  <Ionicons name="add-circle" size={24} color={colors.white} />
                  <Text style={styles.addRecordText}>Add to Record</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </NmCard>
        </Animated.View>
      )}
    </View>
  );
}

const overlayColor = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  topBar: { position: 'absolute', top: 0, width: '100%', zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.base, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, ...shadows.raise },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.titleLarge, color: colors.primaryStart },
  
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.base },
  permissionText: { textAlign: 'center', marginBottom: 20 },
  permissionBtn: { padding: 16, backgroundColor: colors.primaryStart, borderRadius: 8 },
  permissionBtnText: { color: colors.white, fontWeight: '600' },

  camera: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1 },
  
  maskTop: { flex: 1, backgroundColor: overlayColor },
  maskCenterRow: { flexDirection: 'row', height: 250 },
  maskSide: { flex: 1, backgroundColor: overlayColor },
  
  scannerViewport: { width: 250, height: 250, backgroundColor: 'transparent', position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: colors.primaryStart },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },

  beam: { position: 'absolute', width: '100%', height: 40, zIndex: 10 },
  beamLine: { height: 2, backgroundColor: colors.primaryStart, width: '100%', shadowColor: colors.primaryStart, shadowOpacity: 1, shadowRadius: 10, shadowOffset: {width: 0, height: 0} },
  beamGlow: { height: 38, width: '100%' },

  maskBottom: { flex: 1, backgroundColor: overlayColor, alignItems: 'center', paddingTop: spacing.xl },
  instructionTitle: { ...typography.titleSmall, color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  instructionSub: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: spacing.xs },
  
  actionRow: { position: 'absolute', bottom: 100, flexDirection: 'row', gap: spacing.xxxl },
  actionBtn: { alignItems: 'center', gap: spacing.sm },
  actionCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  actionLabel: { ...typography.overline, color: colors.white },

  resultSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 200 },
  resultCard: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  dragIndicator: { width: 48, height: 6, backgroundColor: colors.divider, borderRadius: 3, alignSelf: 'center', marginBottom: spacing.xl, opacity: 0.5 },
  
  resultHeader: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  badgeGold: { backgroundColor: '#F6D365', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 12 },
  badgeGoldText: { ...typography.overline, color: colors.textPrimary },
  badgeGreen: { backgroundColor: colors.baseDk, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 12 },
  badgeGreenText: { ...typography.overline, color: colors.success },
  productName: { ...typography.title, color: colors.textPrimary },
  productSku: { fontFamily: 'JetBrains Mono', color: colors.primaryStart, fontSize: 13, marginTop: 4 },
  productImageCard: { width: 80, height: 80, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center' },

  detailsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  detailBox: { flex: 1, borderRadius: borderRadius.md },
  detailLabel: { ...typography.overline, color: colors.textSubtle, marginBottom: spacing.xs },
  detailValue: { ...typography.titleSmall, color: colors.textPrimary },

  sheetActions: { flexDirection: 'row', gap: spacing.md },
  dismissWrapper: { flex: 1, height: 56, borderRadius: borderRadius.md },
  dismissBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dismissText: { ...typography.titleSmall, color: colors.primaryStart },
  addRecordBtn: { flex: 2, height: 56, borderRadius: borderRadius.md, overflow: 'hidden' },
  addRecordGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  addRecordText: { ...typography.titleSmall, color: colors.white },
});
