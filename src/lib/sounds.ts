// Pure Web Audio API Sound Effects Engine (AAA Web3 Gaming Grade)
// Zero external audio file dependencies - Ultra-smooth, lush, non-fatiguing audio synthesis

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function isSoundActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('rialo_sound_enabled') !== 'false';
}

/**
 * High-Tech Quantum Energy Charging Riser (Replaces harsh static noise)
 * Warm sub-pulse + ascending magnetic harmonic sweep
 */
export function playScratchSound() {
  if (!isSoundActive()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Warm ascending magnetic pulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.45);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.45);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);

    // 2. Soft crystalline harmonic resonance
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(440, now + 0.08);
    chime.frequency.exponentialRampToValueAtTime(740, now + 0.45);

    chimeGain.gain.setValueAtTime(0.0001, now + 0.08);
    chimeGain.gain.linearRampToValueAtTime(0.04, now + 0.25);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chime.start(now + 0.08);
    chime.stop(now + 0.5);
  } catch {}
}

/**
 * Ultra-Cool Cinematic Card Reveal Fanfare (Warm 808 Thump + Heavenly Crystalline Harmonic Chime)
 * Clean, pleasant, zero harshness, tuned specifically to card rarity
 */
export function playCardRevealSound(rarity: string = 'COMMON') {
  if (!isSoundActive()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const r = rarity.toUpperCase();

    // 1. Satisfying Sub-Bass Thump (Smooth 808 card impact on glass pedestal)
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(130, now);
    sub.frequency.exponentialRampToValueAtTime(42, now + 0.35);

    subGain.gain.setValueAtTime(0.24, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.45);

    // 2. Harmonically Rich Pure Sine Cascade (Soft, lush, angelic)
    let chordFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Common)
    if (r === 'RARE') {
      chordFreqs = [440.0, 554.37, 659.25, 880.0, 1108.73]; // A Maj 9 (Ethereal Teal)
    } else if (r === 'EPIC') {
      chordFreqs = [392.0, 587.33, 783.99, 987.77, 1174.66]; // G Lydian (Majestic Emerald)
    } else if (r === 'LEGENDARY') {
      chordFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C Maj 9/11 (Golden Supernova)
    } else if (r === 'MYTHIC') {
      chordFreqs = [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0, 2093.0]; // D Maj Astral (Transcendent Cosmic Choir)
    }

    // Staggered sine chime waterfall with gentle lowpass filter
    chordFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm lowpass filter to remove any high-pitch piercing
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);

      osc.type = 'sine'; // Pure sweet tone
      const delay = idx * 0.045;
      osc.frequency.setValueAtTime(freq, now + delay);

      const peakVol = r === 'MYTHIC' ? 0.085 : r === 'LEGENDARY' ? 0.075 : 0.065;

      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.exponentialRampToValueAtTime(peakVol, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + (r === 'MYTHIC' ? 1.8 : 1.3));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 1.9);
    });

    // 3. Delicate Cosmic Shimmer Waterfall (Micro-bell sparkle tail)
    const sparkles = [1318.51, 1567.98, 2093.0];
    sparkles.forEach((sFreq, sIdx) => {
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();
      const sFilter = ctx.createBiquadFilter();

      sFilter.type = 'bandpass';
      sFilter.frequency.setValueAtTime(sFreq, now);
      sFilter.Q.setValueAtTime(4.5, now);

      sOsc.type = 'sine';
      const sDelay = 0.16 + sIdx * 0.06;
      sOsc.frequency.setValueAtTime(sFreq, now + sDelay);

      sGain.gain.setValueAtTime(0.0001, now + sDelay);
      sGain.gain.exponentialRampToValueAtTime(0.03, now + sDelay + 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + sDelay + 0.8);

      sOsc.connect(sFilter);
      sFilter.connect(sGain);
      sGain.connect(ctx.destination);

      sOsc.start(now + sDelay);
      sOsc.stop(now + sDelay + 0.9);
    });
  } catch {}
}

/**
 * Deep cinematic sub-bass surge for opening sealed card packs
 */
export function playPackOpenSound() {
  if (!isSoundActive()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Sub-bass sweep
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(45, now + 0.45);

    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.55);

    // Warm power-up riser
    const riser = ctx.createOscillator();
    const riserGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    riser.type = 'sine';
    riser.frequency.setValueAtTime(220, now + 0.08);
    riser.frequency.exponentialRampToValueAtTime(660, now + 0.48);

    riserGain.gain.setValueAtTime(0.001, now + 0.08);
    riserGain.gain.linearRampToValueAtTime(0.12, now + 0.35);
    riserGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    riser.connect(filter);
    filter.connect(riserGain);
    riserGain.connect(ctx.destination);
    riser.start(now + 0.08);
    riser.stop(now + 0.6);
  } catch {}
}
