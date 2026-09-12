# HO SIN DO Melsungen – Website-Neuaufbau

Neuaufbau von www.hosindo.de im Design-System des kimi-Starters: Oswald + Space
Grotesk, Eis-Weiß / Tinte-Schwarz / Cyan-Akzent, Klammer-Ecken, gestufte Plates,
animiertes Konturfeld und Zielflaggen-Übergänge zwischen den Blöcken.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | **Das Ergebnis.** Eine einzige Datei, alle Bilder sind als Base64 eingebettet – einfach im Browser öffnen oder irgendwo hochladen. |
| `index.src.html` | Die Quelle mit `var(--i-…)`-Platzhaltern statt Bilddaten. Hier wird bearbeitet. |
| `build.py` | Baut aus der Quelle `index.html`, bettet jedes Bild genau einmal ein. |
| `assets/img/` | Die acht Motive als JPG. |
| `assets/ui/` | SVG-Elemente aus dem Template. |

## Ändern

```bash
# index.src.html bearbeiten, dann:
python3 build.py
```

## Inhalt

Alle Bereiche der alten Seite als eine Seite mit Ankernavigation: Verein,
Sparten, Trainingszeiten, DO-Werte, Geschichte, Trainingselemente, Rangfolge,
Trainer, Verband, Vereinsleben, Kontakt, Impressum und Datenschutz.
