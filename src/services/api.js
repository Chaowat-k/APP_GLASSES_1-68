import { Platform } from 'react-native';

// Server Endpoint & Config
const getInitialUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}/glasses`;
  }
  return 'http://127.0.0.1/glasses';
};
let currentServerUrl = getInitialUrl();
let currentApiKey = 'change-app-key-2026'; // Pre-configured from config.php (no user password required)
let isDemoMode = false; // Directly connect to real MySQL/PHP database!

const modeText = {
  both: 'สั่นและเสียง',
  vibration: 'สั่น',
  sound: 'เสียง'
};

function formatTime(v) {
  if (!v) return '—';
  try {
    const d = new Date(v.replace(' ', 'T') + 'Z');
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return v;
  }
}

function formatCm(v) {
  if (v === null || v === undefined) return null;
  const num = Number(v);
  return isNaN(num) ? null : Math.round(num * 10) / 10;
}

export const getServerUrl = () => currentServerUrl;
export const setServerUrl = (url) => {
  currentServerUrl = url.trim().replace(/\/+$/, '');
};

export const getApiKey = () => currentApiKey;
export const setApiKey = (key) => {
  currentApiKey = key.trim();
};

export const getIsDemoMode = () => isDemoMode;
export const setIsDemoMode = (enabled) => {
  isDemoMode = enabled;
};

// Fetch real status from PHP/MySQL database
export const fetchStatus = async () => {
  if (isDemoMode) {
    return runSimulatedStep();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(`${currentServerUrl}/api.php?action=state`, {
      method: 'GET',
      headers: {
        'X-API-Key': currentApiKey,
        'Accept': 'application/json'
      },
      cache: 'no-store',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'API Error');
    }

    const r = data.latest;
    const settings = data.settings || {};

    let left = null, center = null, right = null;
    let risk = 'ยังไม่มีข้อมูล';
    let tilt = '—';
    let count = 0;
    let appliedThreshold = settings.threshold_cm || 100;
    let appliedMode = settings.mode || 'both';

    if (r) {
      left = formatCm(r.left_cm);
      center = formatCm(r.center_cm);
      right = formatCm(r.right_cm);
      appliedThreshold = r.applied_threshold || appliedThreshold;
      appliedMode = r.applied_mode || appliedMode;
      count = r.alert_count ?? 0;

      const age = Number(r.age_seconds);
      const stale = age > 10;

      const vals = [r.left_cm, r.center_cm, r.right_cm].filter(v => v !== null).map(Number);
      const near = vals.length ? Math.min(...vals) : Infinity;

      if (stale) {
        risk = 'ข้อมูลไม่อัปเดต';
      } else if (near <= Number(appliedThreshold)) {
        risk = 'อยู่ในระยะเตือน';
      } else if (vals.length < 3) {
        risk = 'อ่านระยะไม่ครบ';
      } else {
        risk = 'ปลอดภัย';
      }

      // Pitch / Tilt
      const p = Number(r.pitch_deg);
      if (Number(r.imu_ok) && r.pitch_deg !== null && !isNaN(p)) {
        const tiltLabel = p > 20 ? 'เงย' : p < -20 ? 'ก้ม' : 'แนวระนาบปกติ';
        tilt = `${tiltLabel} (${p.toFixed(1)}°)`;
      } else {
        tilt = 'MPU-6050 ขัดข้อง / ไม่ส่งค่า';
      }
    }

    // Map history (up to 60 items)
    const history = (data.history || []).map((row, idx) => ({
      id: row.id || `hist-${idx}`,
      time: formatTime(row.received_at),
      left: formatCm(row.left_cm),
      center: formatCm(row.center_cm),
      right: formatCm(row.right_cm),
      count: row.alert_count
    }));

    // Map unacknowledged SOS events
    const unacknowledgedSos = (data.sos || []).map(s => ({
      id: s.id,
      time: formatTime(s.received_at),
      message: `สัญญาณฉุกเฉิน SOS #${s.id}`
    }));

    // Map SOS history (20 items)
    const sosHistory = (data.sos_history || []).map(s => ({
      id: s.id,
      time: formatTime(s.received_at),
      message: `SOS #${s.id}`,
      acknowledged: Boolean(s.acknowledged_at)
    }));

    return {
      success: true,
      online: true,
      isDemo: false,
      data: {
        left,
        center,
        right,
        risk,
        tilt,
        count,
        appliedThreshold,
        appliedMode,
        unacknowledgedSos,
        history,
        sosHistory,
        serverTime: r ? r.received_at : null
      }
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      online: false,
      isDemo: false,
      error: error.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
      data: {
        left: null,
        center: null,
        right: null,
        risk: 'ไม่ได้เชื่อมต่อ',
        tilt: '—',
        count: '—',
        appliedThreshold: 100,
        appliedMode: 'both',
        unacknowledgedSos: [],
        history: [],
        sosHistory: []
      }
    };
  }
};

// Save Settings to database via api.php?action=settings
export const saveSettings = async (threshold, mode) => {
  if (isDemoMode) {
    return { success: true, message: 'บันทึกค่าสำเร็จ (โหมดจำลอง)' };
  }

  try {
    const response = await fetch(`${currentServerUrl}/api.php?action=settings`, {
      method: 'POST',
      headers: {
        'X-API-Key': currentApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        threshold_cm: Number(threshold),
        mode
      })
    });

    const res = await response.json();
    if (res.ok) {
      return { success: true, message: 'บันทึกค่าลงฐานข้อมูลแล้ว รอ ESP32 ซิงก์' };
    }
    throw new Error(res.error || 'บันทึกไม่สำเร็จ');
  } catch (err) {
    return { success: false, message: err.message || 'ส่งข้อมูลล้มเหลว' };
  }
};

// Acknowledge SOS event via api.php?action=ack
export const acknowledgeSos = async (sosId) => {
  // Always update local simState as well so demo/offline works smoothly
  simState.unacknowledgedSos = simState.unacknowledgedSos.filter((s) => s.id !== sosId);
  simState.sosHistory = simState.sosHistory.map((s) =>
    s.id === sosId ? { ...s, acknowledged: true } : s
  );

  if (isDemoMode) {
    return { success: true };
  }

  try {
    const response = await fetch(`${currentServerUrl}/api.php?action=ack`, {
      method: 'POST',
      headers: {
        'X-API-Key': currentApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: Number(sosId) }),
    });
    const res = await response.json();
    return { success: Boolean(res.ok) };
  } catch (e) {
    return { success: true }; // Local acknowledged
  }
};


// Helper for Demo simulation if user explicitly switches to demo mode
let simSosCounter = 1;
const getDemoNowTime = () => {
  const d = new Date();
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Generate initial mock history points
const initialSimHistory = Array.from({ length: 25 }, (_, i) => {
  const time = new Date(Date.now() - (25 - i) * 2000).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return {
    id: `sim-hist-${i}`,
    time,
    left: Math.round(90 + Math.sin(i * 0.5) * 40 + Math.random() * 10),
    center: Math.round(140 + Math.cos(i * 0.4) * 50 + Math.random() * 15),
    right: Math.round(110 + Math.sin(i * 0.3) * 30 + Math.random() * 10),
    count: Math.floor(i / 5),
  };
});

let simState = {
  left: 120,
  center: 85,
  right: 140,
  count: 3,
  appliedThreshold: 100,
  appliedMode: 'both',
  unacknowledgedSos: [],
  history: initialSimHistory,
  sosHistory: [
    {
      id: 990,
      time: '19:45:10',
      message: 'สัญญาณขอความช่วยเหลือ SOS #990 (ระบบทดสอบ)',
      acknowledged: true,
    },
  ],
};

function runSimulatedStep() {
  // Drift sensor readings slightly
  simState.left = Math.max(30, Math.min(250, Math.round(simState.left + (Math.random() * 24 - 12))));
  simState.center = Math.max(25, Math.min(260, Math.round(simState.center + (Math.random() * 24 - 12))));
  simState.right = Math.max(35, Math.min(240, Math.round(simState.right + (Math.random() * 24 - 12))));

  // Append new history point periodically
  const newHistPoint = {
    id: `sim-hist-${Date.now()}`,
    time: getDemoNowTime(),
    left: simState.left,
    center: simState.center,
    right: simState.right,
    count: simState.count,
  };
  simState.history = [...simState.history.slice(-40), newHistPoint];

  const minDistance = Math.min(simState.left, simState.center, simState.right);
  let risk = 'ปลอดภัย';
  if (minDistance <= 40) {
    risk = 'อันตราย มีสิ่งกีดขวางใกล้มาก';
  } else if (minDistance <= simState.appliedThreshold) {
    risk = 'อยู่ในระยะเตือน มีสิ่งกีดขวางข้างหน้า';
  }

  return {
    success: true,
    online: true,
    isDemo: true,
    data: {
      left: simState.left,
      center: simState.center,
      right: simState.right,
      risk,
      tilt: 'แนวระนาบปกติ (1.2°)',
      count: simState.count,
      appliedThreshold: simState.appliedThreshold,
      appliedMode: simState.appliedMode,
      unacknowledgedSos: [...simState.unacknowledgedSos],
      history: [...simState.history],
      sosHistory: [...simState.sosHistory],
    },
  };
}

export const triggerSimulatedSos = (customMessage) => {
  const sosId = 1000 + simSosCounter++;
  const time = getDemoNowTime();
  const event = {
    id: sosId,
    time,
    message: customMessage || `สัญญาณฉุกเฉิน SOS #${sosId}`,
  };

  // Add to active unacknowledged list
  simState.unacknowledgedSos = [event, ...simState.unacknowledgedSos];
  // Add to SOS logs
  simState.sosHistory = [{ ...event, acknowledged: false }, ...simState.sosHistory];

  return event;
};

export const triggerSos = async (customMessage = 'แจ้งเหตุฉุกเฉิน SOS ผ่านแอพพลิเคชัน') => {
  const event = triggerSimulatedSos(customMessage);
  if (!isDemoMode) {
    try {
      await fetch(`${currentServerUrl}/api.php?action=trigger_sos`, {
        method: 'POST',
        headers: {
          'X-API-Key': currentApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: customMessage }),
      });
    } catch (e) {
      // Offline fallback
    }
  }
  return event;
};



