# HO SIN DO Melsungen – Website

Statische Seite im „Nora“-Designsystem (Awesmos-Vorlage): Schwarzrot (#0D0000 →
#C01818), Geist + Inter, Loader mit buchstabenweisem Schriftzug, Hero mit
cursor-gesteuertem Reveal-Canvas, magnetische Buttons, Clip-Path-Menü und
Laufband.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | **Das Ergebnis.** Eine einzige Datei, alle Bilder als Base64 eingebettet – im Browser öffnen oder hochladen. |
| `index.src.html` | Die Quelle mit `var(--i-…)`-Platzhaltern statt Bilddaten. Hier wird bearbeitet. |
| `build.py` | Baut daraus `index.html` und bettet jedes Bild genau einmal ein. |
| `assets/img/` | Die acht Motive als JPG. |
| `assets/ui/` | SVG-Elemente aus einer früheren Ausbaustufe. |

## Ändern

```bash
# index.src.html bearbeiten, dann:
python3 build.py
```

## Interaktionen

- **Reveal-Canvas:** Der Zeiger legt im Hero ein zweites Motiv frei; Radialmaske
  über `destination-in`, Radius 380px, Zustände waiting / entering / shrinking.
- **Magnetische Buttons:** folgen dem Zeiger (0.15s), federn beim Verlassen zurück.
- **Menü:** Clip-Path-Vorhang, 0.65s, Burger dreht zu einem Kreuz, Escape schließt.
- **Laufband:** 28s linear, verdoppelte Liste.
- **Zeitstrahl:** Schiene füllt sich beim Scrollen, Marke wandert mit.
- `prefers-reduced-motion` schaltet Loader, Canvas und alle Übergänge ab.

## Erklärfilm

Unter `film/` liegt ein 60-Sekunden-Erklärfilm („Erst fit werden?“) in 16:9, 9:16 und 1:1 samt
Quelle, Ton, Untertiteln und Prüfprotokoll – siehe `film/README.md`.
