/* Ton der Promo: 120 BPM, tempogebunden an TIMELINE.cues. Geseedetes Rauschen, keine Zufallszahlen. */
(function (root) {
  function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  async function renderAudio(SR) {
    const TL = root.TIMELINE, DUR = TL.duration, BEAT = 60 / TL.bpm, BAR = BEAT * 4;
    const ctx = new OfflineAudioContext(2, Math.round(SR * DUR), SR);
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const master = ctx.createGain(); master.gain.value = 1.0; master.connect(ctx.destination);
    /* Summenkompressor: zähmt die Transienten von Kick und Impacts, damit Lautheit ohne Clipping entsteht. */
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 6; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .18;
    const makeup = ctx.createGain(); makeup.gain.value = 1.6; comp.connect(makeup); makeup.connect(master);
    const bus = ctx.createGain(); bus.connect(comp);
    bus.gain.setValueAtTime(1, 0); bus.gain.setValueAtTime(1, DUR - 2.2); bus.gain.linearRampToValueAtTime(0, DUR - .05);
    const r = rng(2026), noise = ctx.createBuffer(1, SR * 2, SR), nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = r() * 2 - 1;

    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(0.0006, t + a + d); };
    function osc(type, f, t, a, peak, d, dest, fEnd) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
      if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + a + d * .6);
      const g = ctx.createGain(); env(g, t, a, peak, d); o.connect(g); g.connect(dest || bus);
      o.start(t); o.stop(t + a + d + .05);
    }
    function nz(t, dur, peak, type, f0, f1, q) {
      const s = ctx.createBufferSource(); s.buffer = noise;
      const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q || .8;
      f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + dur * .85);
      g.gain.linearRampToValueAtTime(0, t + dur); s.connect(f); f.connect(g); g.connect(bus);
      s.start(t, (t * 7.3) % 1, dur + .05);
    }

    /* Harmonie je Takt: Am – F – C – G */
    const CH = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]], ROOT = [33, 29, 36, 31];
    const padF = ctx.createBiquadFilter(); padF.type = "lowpass"; padF.frequency.value = 1800; padF.connect(bus);
    for (let b = 0; b * BAR < DUR; b++) {
      const t = b * BAR, c = CH[b % 4];
      c.forEach(m => [-6, 6].forEach(cent => {
        const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = cent;
        const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .25);
        g.gain.setValueAtTime(.012, t + BAR - .2); g.gain.linearRampToValueAtTime(0, t + BAR + .1);
        o.connect(g); g.connect(padF); o.start(t); o.stop(t + BAR + .15);
      }));
      /* Bass auf jedem Schlag ab Takt 2 */
      if (b >= 1) for (let q = 0; q < 4; q++) osc("triangle", hz(ROOT[b % 4] + 12), t + q * BEAT, .005, .12, .32);
      /* Kick auf jedem Schlag ab Takt 2, Hi-Hat auf den Offbeats ab Takt 3 */
      if (b >= 1) for (let q = 0; q < 4; q++) osc("sine", 120, t + q * BEAT, .002, .30, .28, bus, 42);
      if (b >= 2) for (let q = 0; q < 4; q++) nz(t + q * BEAT + BEAT / 2, .045, .05, "highpass", 7000);
    }
    const CUE = {
      riser(t)  { nz(t, 1.0, .10, "bandpass", 300, 4000, 1.2); },
      impact(t) { osc("sine", 90, t, .003, .32, .7, bus, 38); nz(t, .35, .07, "lowpass", 2400, 300); },
      swipe(t)  { nz(t - .25, .3, .06, "bandpass", 900, 3000, 1.5); },
      tap(t)    { osc("sine", 1568, t, .002, .10, .09); osc("sine", 2349, t, .002, .05, .06); },
      count(t)  { [76, 79, 84].forEach((m, i) => osc("triangle", hz(m), t + i * .1, .006, .08, .25)); },
      final(t)  { osc("sine", 70, t, .003, .32, 1.2, bus, 40); [69, 72, 76, 81].forEach((m, i) => osc("triangle", hz(m), t + i * BEAT / 2, .01, .09, 1.6)); }
    };
    TL.cues.forEach(c => CUE[c.type](c.t));
    return ctx.startRendering();
  }
  async function renderAudioPCM16(SR) {
    const buf = await renderAudio(SR || 48000), L = buf.getChannelData(0), R = buf.getChannelData(1);
    const out = new Int16Array(L.length * 2);
    for (let i = 0; i < L.length; i++) { out[2*i] = Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767)));
      out[2*i+1] = Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))); }
    const bytes = new Uint8Array(out.buffer); let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { sampleRate: buf.sampleRate, channels: 2, frames: L.length, b64: btoa(bin) };
  }
  root.renderAudioPCM16 = renderAudioPCM16;
})(window);
