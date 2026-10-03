import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import {
  getServerUrl,
  setServerUrl,
  getIsDemoMode,
  setIsDemoMode,
  getApiKey,
  setApiKey,
} from '../services/api';
import { triggerHaptic } from '../services/sound';

export default function ServerConfigModal({ visible, onClose, onRefresh }) {
  const [url, setUrl] = useState(getServerUrl());
  const [key, setKey] = useState(getApiKey());
  const [demo, setDemo] = useState(getIsDemoMode());

  const handleSave = () => {
    triggerHaptic('light');
    setServerUrl(url);
    setApiKey(key);
    setIsDemoMode(demo);
    onClose();
    if (onRefresh) onRefresh();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="server-outline" size={22} color={COLORS.primary} />
              <Text style={styles.title}>ตั้งค่าการเชื่อมต่อฐานข้อมูล</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Demo Mode Toggle */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>โหมดจำลอง (Demo Mode)</Text>
              <Text style={styles.switchDesc}>ปิดสวิตช์นี้เพื่อดึงข้อมูลจริงจาก XAMPP Database</Text>
            </View>
            <Switch
              value={demo}
              onValueChange={(val) => {
                triggerHaptic('light');
                setDemo(val);
              }}
              trackColor={{ false: COLORS.surfaceBorder, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          {/* Real Hardware Server IP */}
          <View style={[styles.inputGroup, demo && styles.disabledInput]}>
            <Text style={styles.label}>
              URL เซิร์ฟเวอร์ XAMPP / Apache
            </Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="เช่น http://172.20.10.10/glasses"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!demo}
            />
            <Text style={styles.hint}>
              *บนมือถือใช้: http://172.20.10.10/glasses | บนเว็บใช้: http://localhost/glasses
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  switchDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  disabledInput: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.surfaceSubtle,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
