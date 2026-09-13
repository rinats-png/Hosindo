#!/usr/bin/env python3
"""Baut index.html aus index.src.html: alle Bilder aus assets/img werden als
Base64-Data-URI in CSS-Variablen eingebettet, jedes Bild genau einmal.
So ist index.html eine einzige, überall lauffähige Datei."""
import base64, pathlib, re

root = pathlib.Path(__file__).parent
src = (root / "index.src.html").read_text(encoding="utf-8")

names = sorted(set(re.findall(r"--i-([a-z0-9\-]+)", src)))
decls = []
for n in names:
    raw = (root / "assets" / "img" / (n + ".jpg")).read_bytes()
    decls.append('--i-%s:url("data:image/jpeg;base64,%s")'
                 % (n, base64.b64encode(raw).decode("ascii")))
out = src.replace("/*__IMG_VARS__*/", ":root{" + ";".join(decls) + "}")
assert "__IMG_" not in out, "unaufgelöster Bild-Platzhalter"
(root / "index.html").write_text(out, encoding="utf-8")
print("eingebettet:", len(names), "Bilder ->", ", ".join(names))
print("index.html:", (root / "index.html").stat().st_size // 1024, "KB")
