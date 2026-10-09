#!/usr/bin/env python3
"""Messbare Prüfungen an den fertigen Dateien.
   python3 verify.py <video.mp4> [...]   → Blitze, Lautheit, Ton-Onsets an den Cues
   Benötigt FFMPEG (Pfad zu ffmpeg) und numpy."""
import json, os, subprocess, sys, re
import numpy as np

FF = os.environ.get("FFMPEG", "ffmpeg")
HERE = os.path.dirname(os.path.abspath(__file__))

def cues():
    src = open(os.path.join(HERE, "timeline.js"), encoding="utf-8").read()
    return [(float(t), k) for t, k in re.findall(r'\{ t: ([\d.]+),\s+type: "(\w+)"', src)]

def probe(path):
    out = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    v = re.search(r"Video: (\w+).*?, (\w+)\(.*?(\d+)x(\d+).*?, ([\d.]+) fps", out)
    a = re.search(r"Audio: (\w+).*?, (\d+) Hz, (\w+)", out)
    d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", out)
    return {"codec": v.group(1) if v else None, "pix": v.group(2) if v else None,
            "size": f"{v.group(3)}x{v.group(4)}" if v else None, "fps": float(v.group(5)) if v else None,
            "audio": f"{a.group(1)} {a.group(2)} Hz {a.group(3)}" if a else None,
            "duration": int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3)) if d else None}

def flashes(path):
    """WCAG 2.3.1: ein Blitz = gegenläufiges Paar von Leuchtdichteänderungen ≥ 10 %,
       auf ≥ 25 % der Fläche. Gezählt wird pro 1-s-Fenster."""
    w, h = 96, 54
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-vf", f"scale={w}:{h}:flags=area,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32) / 255
    lin = np.where(fr <= 0.04045, fr / 12.92, ((fr + 0.055) / 1.055) ** 2.4)
    d = np.diff(lin, axis=0)
    big = np.abs(d) >= 0.10
    area = big.mean(axis=(1, 2))
    events = np.nonzero(area >= 0.25)[0]
    per_sec = {}
    for e in events:
        per_sec[int(e // 60)] = per_sec.get(int(e // 60), 0) + 1
    return {"frames": int(fr.shape[0]), "max_changed_area": round(float(area.max()), 4),
            "transitions_over_threshold": int(len(events)),
            "worst_second_count": max(per_sec.values()) if per_sec else 0}

def loudness(path):
    err = subprocess.run([FF, "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true",
                          "-f", "null", "-"], capture_output=True, text=True).stderr
    s = err[err.rfind("Summary"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1))
    p = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))
    return {"integrated_lufs": i, "true_peak_dbtp": p, "ok": abs(i + 16) <= 1.0 and p <= -1.5}

def onsets(path):
    """Ton nur hören: Hüllkurve der Höhen (> 2 kHz trennt Klicks/Motiv vom Bett) an jedem Cue."""
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", "48000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    hop = 480
    n = len(x) // hop
    rms = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    res = []
    for t, k in cues():
        i = int(round(t * 100))
        before = np.median(db[max(0, i - 40): i - 3])
        after = db[i: i + 15].max()
        peak_at = (i + int(np.argmax(db[i - 5: i + 15])) - 5) / 100
        res.append({"cue": k, "t": t, "rise_db": round(float(after - before), 1),
                    "peak_at": round(peak_at, 2), "offset_ms": round((peak_at - t) * 1000)})
    return res

if __name__ == "__main__":
    report = {}
    for p in sys.argv[1:]:
        r = {"probe": probe(p), "flashes": flashes(p)}
        if r["probe"]["audio"]:
            r["loudness"] = loudness(p)
        report[os.path.basename(p)] = r
    if sys.argv[1:]:
        first = sys.argv[1]
        if probe(first)["audio"]:
            report["onsets(" + os.path.basename(first) + ")"] = onsets(first)
    print(json.dumps(report, indent=1, ensure_ascii=False))
