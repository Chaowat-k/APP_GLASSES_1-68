import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { triggerHaptic } from '../services/sound';

export default function SettingsCard({
  appliedThreshold = 100,
  appliedMode = 'both',
  onSaveSettings,
}) {
  const [threshold, setThreshold] = useState(String(appliedThreshold || 100));
  const [mode, setMode] = useState(appliedMode || 'both');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (appliedThreshold) setThreshold(String(appliedThreshold));
    if (appliedMode) setMode(appliedMode);
  }, [appliedThreshold, appliedMode]);

  const handleStep = (delta) => {
    triggerHaptic('light');
    const current = Number(threshold) || 100;
    const nextVal = Math.min(300, Math.max(20, current + delta));
    setThreshold(String(nextVal));
  };

  const handlePreset = (val) => {
    triggerHaptic('light');
    setThreshold(String(val));
  };

  const handleSave = async () => {
    const num = Number(threshold);
    if (isNaN(num) || num < 20 || num > 300) {
      triggerHaptic('error');
      setStatusMsg({ type: 'error', text: 'กรุณากรอกระยะระหว่าง 20 ถึง 300 ซม.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    triggerHaptic('light');

    try {
      const res = await onSaveSettings(num, mode);
      if (res.success) {
        triggerHaptic('heavy');
        setStatusMsg({ type: 'success', text: res.message || 'บันทึกค่าสำเร็จแล้ว' });
      } else {
        triggerHaptic('error');
        setStatusMsg({ type: 'error', text: res.message || 'บันทึกไม่สำเร็จ' });
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          <Text style={styles.title}>ตั้งค่าการแจ้งเตือน</Text>
        </View>
      </View>

      {/* Threshold Setting */}
      <View style={styles.section}>
        <Text style={styles.label}>ระยะเริ่มเตือนสิ่งกีดขวาง (20–300 ซม.)</Text>

        {/* Stepper Input */}
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => handleStep(-10)}
            activeOpacity={0.7}
          >
            <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.numericInput}
              keyboardType="number-pad"
              value={threshold}
              onChangeText={setThreshold}
              maxLength={3}
            />
            <Text style={styles.unitText}>ซม.</Text>
          </View>

          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => handleStep(10)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Quick Presets */}
        <View style={styles.presetsRow}>
          {[50, 100, 150, 200].map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetChip,
                Number(threshold) === preset && styles.presetChipActive,
              ]}
              onPress={() => handlePreset(preset)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  Number(threshold) === preset && styles.presetChipTextActive,
                ]}
              >
                {preset} ซม.
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Alert Mode Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>รูปแบบการแจ้งเตือน</Text>
        <View style={styles.modeRow}>
          {[
            { id: 'both', label: 'สั่นและเสียง', icon: 'notifications' },
            { id: 'vibration', label: 'เฉพาะสั่น', icon: 'phone-portrait-outline' },
            { id: 'sound', label: 'เฉพาะเสียง', icon: 'volume-high-outline' },
          ].map((item) => {
            const isSelected = mode === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.modeChip, isSelected && styles.modeChipSelected]}
                onPress={() => {
                  triggerHaptic('light');
                  setMode(item.id);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={isSelected ? COLORS.white : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.modeChipText,
                    isSelected && styles.modeChipTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
            <Text style={styles.saveButtonText}>บันทึกค่าไปยังแว่นตา</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Feedback Message */}
      {statusMsg && (
        <View
          style={[
            styles.feedbackBanner,
            statusMsg.type === 'error'
              ? styles.feedbackBannerError
              : styles.feedbackBannerSuccess,
          ]}
        >
          <Ionicons
            name={statusMsg.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
            size={16}
            color={statusMsg.type === 'error' ? COLORS.danger : COLORS.success}
          />
          <Text
            style={[
              styles.feedbackText,
              {
                color:
                  statusMsg.type === 'error' ? COLORS.danger : COLORS.success,
              },
            ]}
          >
            {statusMsg.text}
          </Text>
        </View>
      )}

      <Text style={styles.hint}>
        *ค่าจะมีผลเมื่อ ESP32 ติดต่อเซิร์ฟเวอร์สำเร็จ ตรวจช่อง “ค่าที่เครื่องใช้อยู่” เพื่อยืนยัน
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: 14,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    padding: 5,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  numericInput: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    minWidth: 60,
    padding: 0,
  },
  unitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  modeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeChipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  feedbackBannerSuccess: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  feedbackBannerError: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 10,
    lineHeight: 16,
  },
});
