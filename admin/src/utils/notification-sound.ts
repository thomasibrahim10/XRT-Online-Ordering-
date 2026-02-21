let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a two-tone chime using Web Audio API.
 * Works without any external audio files.
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.connect(gainNode);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const gainNode2 = ctx.createGain();
    gainNode2.connect(ctx.destination);
    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.setValueAtTime(0.3, now + 0.18);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, now + 0.18);
    osc2.connect(gainNode2);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.4);

    const gainNode3 = ctx.createGain();
    gainNode3.connect(ctx.destination);
    gainNode3.gain.setValueAtTime(0, now);
    gainNode3.gain.setValueAtTime(0.25, now + 0.42);
    gainNode3.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.51, now + 0.42);
    osc3.connect(gainNode3);
    osc3.start(now + 0.42);
    osc3.stop(now + 0.65);
  } catch {
    // Audio not supported or blocked by browser policy
  }
}
