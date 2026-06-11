/**
 * BarcodeScannerScreen — Neumorphic Scanner
 *
 * Dark camera view with neumorphic overlays.
 * Bottom result card slides up with product info.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, borderRadius, spacing, typography } from '../../theme';

export default function BarcodeScannerScreen() {
  const [scanned, setScanned] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Camera permission check
    setHasPermission(true); // Placeholder
  }, []);

  const handleScan = () => {
    setScanned(true);
    Alert.alert(
      'Barcode Scanned',
      'Product: Hindware Chimney 60cm\nSKU: HW-CH-60-AC',
      [{ text: 'Scan Again', onPress: () => setScanned(false) }],
    );
  };

  return (
    <View style={styles.screen}>
      {/* Camera placeholder */}
      <View style={styles.cameraView}>
        <View style={styles.scanFrame}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Scan line */}
          <View style={styles.scanLine} />
        </View>
        <Text style={styles.scanHint}>Point camera at barcode</Text>
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomCard, shadows.raiseLg]}>
        <Text style={typography.title}>Barcode Scanner</Text>
        <Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
          Scan product barcodes to quickly look up inventory
        </Text>

        <TouchableOpacity
          style={[styles.scanBtn, shadows.primaryBtn]}
          onPress={handleScan}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.primaryStart, colors.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanBtnGradient}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="scan" size={16} color={colors.white} />
              <Text style={styles.scanBtnText}>Tap to Scan</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manualBtn} activeOpacity={0.7}>
          <Text style={styles.manualBtnText}>Enter SKU Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#1A202C' },

  cameraView: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  scanFrame: {
    width: 250, height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute', width: 30, height: 30,
    borderColor: colors.primaryStart, borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    position: 'absolute', top: '50%', left: 10, right: 10,
    height: 2, backgroundColor: colors.primaryStart, opacity: 0.7,
  },
  scanHint: {
    marginTop: spacing.xxl, color: 'rgba(255,255,255,0.6)',
    fontSize: 14, fontWeight: '500',
  },

  bottomCard: {
    backgroundColor: colors.base,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xxl,
    paddingBottom: spacing.hero,
  },
  scanBtn: {
    height: 52,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  scanBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  manualBtn: { alignItems: 'center', paddingVertical: spacing.md },
  manualBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
