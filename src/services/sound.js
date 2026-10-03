import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

let webAudioCtx = null;

// Haptic feedback handlers (Fully supported in Expo Go on iOS & Android)
export const triggerHaptic = async (type = 'light') => {
  try {
    if (Platform.OS === 'web') return;
    if (type === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (type === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else if (type === 'heavy') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (err) {
    // Non-fatal if haptics aren't available on simulator
  }
};

// Play synthesized emergency SOS alert
export const playSosSound = async () => {
  try {
    // On Mobile (iOS / Android in Expo Go):
    // Trigger rapid emergency haptic vibration pattern
    await triggerHaptic('error');
    setTimeout(() => triggerHaptic('heavy'), 200);
    setTimeout(() => triggerHaptic('error'), 400);

    // On Web: use Web Audio API oscillator for crisp warning beeps
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!webAudioCtx) webAudioCtx = new AudioCtx();
      if (webAudioCtx.state === 'suspended') {
        await webAudioCtx.resume();
      }

      const now = webAudioCtx.currentTime;
      // Play 3 rapid alarm beeps (SOS pattern)
      [0, 0.15, 0.3].forEach((offset) => {
        const osc = webAudioCtx.createOscillator();
        const gain = webAudioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now + offset); // A5 alert tone
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        osc.connect(gain);
        gain.connect(webAudioCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });
    }
  } catch (err) {
    console.warn('Sound play error:', err);
  }
};
