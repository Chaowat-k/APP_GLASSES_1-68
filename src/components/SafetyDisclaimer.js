import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export default function SafetyDisclaimer() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>
          *จำนวนเข้าสู่ระยะเตือนนับตั้งแต่เปิดเครื่อง และจะรีเซ็ตเมื่ออุปกรณ์รีบูต
        </Text>
        <Text style={styles.disclaimer}>
          อุปกรณ์นี้เป็นต้นแบบสำหรับทดลองและสนับสนุนการมองเห็น ไม่ใช้แทนอุปกรณ์นำทางหลักหรือไม้เท้าช่วยนำทาง
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 24,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrapper: {
    marginTop: 2,
  },
  textWrapper: {
    flex: 1,
  },
  text: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },
});
