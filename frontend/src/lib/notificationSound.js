let audioContext;
let ringtoneTimer;

const getContext = () => {
  if (typeof window === "undefined") return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext ||= new AudioContext();
  return audioContext;
};

// Browsers require a user gesture before audio can start. This deliberately
// primes the context on the first interaction and otherwise fails silently.
export const enableNotificationSound = () => {
  const context = getContext();
  if (context?.state === "suspended") context.resume().catch(() => {});
};

const tone = (frequency, duration, volume = 0.035, delay = 0) => {
  const context = getContext();
  if (!context || context.state !== "running") return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
};

export const playMessageSound = () => {
  tone(880, 0.09, 0.025);
  tone(1175, 0.12, 0.02, 0.11);
};

const ring = () => {
  tone(640, 0.24, 0.045);
  tone(780, 0.24, 0.04, 0.28);
};

export const startRingtone = () => {
  if (ringtoneTimer) return;
  ring();
  ringtoneTimer = window.setInterval(ring, 1500);
};

export const stopRingtone = () => {
  if (ringtoneTimer) window.clearInterval(ringtoneTimer);
  ringtoneTimer = undefined;
};
