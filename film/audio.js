/* Prozeduraler Ton, tempogebunden an TIMELINE.bpm, gerendert in einem OfflineAudioContext.
   Deterministisch: kein Math.random, Rauschen aus einem geseedeten PRNG. */
(function (root) {
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  async function renderAudio(sampleRate) {
    const TL = root.TIMELINE;
    const SR = sampleRate || 48000;
    const DUR = TL.duration;
    const ctx = new OfflineAudioContext(2, Math.round(SR * DUR), SR);
    const BEAT = TL.beat, BAR = BEAT * 4;
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);

    const master = ctx.createGain(); master.gain.value = 2.3; master.connect(ctx.destination);

    /* Bett: sanfter Grundton-Teppich, ein- und ausgeblendet. */
    const bed = ctx.createGain(); bed.connect(master);
    bed.gain.setValueAtTime(0, 0);
    bed.gain.linearRampToValueAtTime(1, 1.5);
    bed.gain.setValueAtTime(1, DUR - 2.5);
    bed.gain.linearRampToValueAtTime(0, DUR - 0.05);

    const padLP = ctx.createBiquadFilter(); padLP.type = "lowpass"; padLP.frequency.value = 1400; padLP.Q.value = 0.3;
    padLP.connect(bed);

    /* Akkorde je zwei Takte: Am – F – C – G (MIDI). */
    const CHORDS = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]];
    const ROOTS  = [45, 41, 48, 43];
    const chordLen = BAR * 2;
    const nChords = Math.ceil(DUR / chordLen);
    for (let c = 0; c < nChords; c++) {
      const t0 = c * chordLen, t1 = Math.min(DUR, t0 + chordLen);
      CHORDS[c % 4].forEach((m, i) => {
        [-4, 4].forEach((cents, j) => {
          const o = ctx.createOscillator();
          o.type = j ? "triangle" : "sine";
          o.frequency.value = hz(m); o.detune.value = cents;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(0.035, t0 + 1.0);
          g.gain.setValueAtTime(0.035, Math.max(t0 + 1.0, t1 - 0.9));
          g.gain.linearRampToValueAtTime(0, t1 + 0.4);
          o.connect(g); g.connect(padLP);
          o.start(t0); o.stop(t1 + 0.5);
        });
      });
    }

    /* Puls auf Schlag 1 und 3, erst ab dem Modell-Akt (Takt 2). */
    for (let b = 2; b * BAR < DUR - 2.5; b++) {
      for (const beatIdx of [0, 2]) {
        const t = b * BAR + beatIdx * BEAT;
        const rootM = ROOTS[Math.floor(t / chordLen) % 4] + 12;
        const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = hz(rootM);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(beatIdx ? 0.10 : 0.16, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
        o.connect(g); g.connect(bed); o.start(t); o.stop(t + 0.6);
      }
    }

    /* Geräuschpuffer (geseedet) für Hub und Klick. */
    const rnd = mulberry32(1976);
    const noise = ctx.createBuffer(1, SR * 2, SR);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;

    const fx = ctx.createGain(); fx.gain.value = 1; fx.connect(master);

    function note(m, t, len, gain, type) {
      const o = ctx.createOscillator(); o.type = type || "triangle"; o.frequency.value = hz(m);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0005, t + len);
      o.connect(lp); lp.connect(g); g.connect(fx); o.start(t); o.stop(t + len + 0.05);
    }

    const CUE = {
      /* Das Motiv: A – C – E aufwärts, Achtel. Am Schluss mit dem A eine Oktave höher. */
      motif(t)    { [69, 72, 76].forEach((m, i) => note(m, t + i * BEAT / 2, 0.9, 0.12)); },
      motifEnd(t) { [69, 72, 76, 81].forEach((m, i) => note(m, t + i * BEAT / 2, i === 3 ? 2.2 : 0.9, 0.12)); },
      thud(t) {
        const o = ctx.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(78, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.3);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0008, t + 0.55);
        o.connect(g); g.connect(fx); o.start(t); o.stop(t + 0.6);
      },
      lift(t) {
        const s = ctx.createBufferSource(); s.buffer = noise;
        const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
        bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(2200, t + 0.55);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.2);
        g.gain.linearRampToValueAtTime(0, t + 0.6);
        s.connect(bp); bp.connect(g); g.connect(fx); s.start(t, 0.3, 0.7);
      },
      tick(t) { note(93, t, 0.12, 0.07, "sine"); note(100, t, 0.08, 0.035, "sine"); },
      open(t) { note(76, t, 0.7, 0.06, "sine"); note(83, t + 0.04, 0.7, 0.05, "sine"); }
    };
    for (const c of TL.cues) CUE[c.type](c.t);

    const buf = await ctx.startRendering();
    return buf;
  }

  /* Für den Export: PCM16 interleaved als Base64 (ein Aufruf über die CDP-Grenze). */
  async function renderAudioPCM16(sampleRate) {
    const buf = await renderAudio(sampleRate);
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    const out = new Int16Array(L.length * 2);
    for (let i = 0; i < L.length; i++) {
      out[2 * i]     = Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767)));
      out[2 * i + 1] = Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767)));
    }
    const bytes = new Uint8Array(out.buffer);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { sampleRate: buf.sampleRate, channels: 2, frames: L.length, b64: btoa(bin) };
  }

  root.renderAudio = renderAudio;
  root.renderAudioPCM16 = renderAudioPCM16;
})(typeof window !== "undefined" ? window : globalThis);
