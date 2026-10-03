import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../services/sound';

export default function SosBanner({ events = [], onAcknowledge }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (events.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [events.length]);

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      <View style={styles.headerRow}>
        <View style={styles.alertIconCircle}>
          <Ionicons name="warning" size={22} color={COLORS.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>มีสัญญาณ SOS ที่ยังไม่ได้รับทราบ!</Text>
          <Text style={styles.subtitle}>
            ตรวจพบเหตุการณ์ฉุกเฉินจากแว่นตา กรุณาตรวจสอบทันที
          </Text>
        </View>
      </View>

      <View style={styles.eventsList}>
        {events.map((ev) => (
          <View key={ev.id} style={styles.eventItem}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTime}>{ev.time}</Text>
              <Text style={styles.eventMsg}>{ev.message || 'สัญญาณขอความช่วยเหลือ'}</Text>
            </View>
            <TouchableOpacity
              style={styles.ackBtn}
              onPress={() => {
                triggerHaptic('heavy');
                onAcknowledge(ev.id);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={17} color={COLORS.white} />
              <Text style={styles.ackBtnText}>รับทราบ</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
  },
  subtitle: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
    fontWeight: '500',
  },
  eventsList: {
    gap: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  eventInfo: {
    flex: 1,
    paddingRight: 8,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  eventMsg: {
    fontSize: 13,
    color: '#7F1D1D',
    marginTop: 2,
    fontWeight: '600',
  },
  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.danger,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 9,
  },
  ackBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
