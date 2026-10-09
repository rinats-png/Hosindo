# Entscheidungen – Promo 9:16

Angewendet: **/website2video** mit dem Master-Stack (/autodirect /realassets /oneidea /visualise
/productui /kinetic /minimalmotion /safearea /beatmatch /buildit). Die Bibliothek kam ohne konkreten
Auftrag; das naheliegende Ziel im Repo ist die HO-SIN-DO-Website.

| Variable | Wahl |
|---|---|
| Video | Promo aus der Website, 26 s, 9:16 (Reels/TikTok/Shorts) |
| Produkt | HO SIN DO Karateverein Melsungen e.V. – die neu gebaute Website ist die „Produkt-UI“ |
| Publikum | Erwachsene und Eltern in und um Melsungen, die Kampfsport für sich oder ihre Kinder erwägen |
| Ziel | Lust aufs erste Training; sie wissen danach, wann und wo |
| Assets | Echte Screenshots der Website in Telefonbreite (`capture.mjs`) und das Hero-Foto der Website |

- **Erzählung:** Hook → für wen → Website (Match Cut vom Foto ins Telefon) → drei Features (Sparten, Woche, Trainer) → Ergebnis in Zahlen → CTA. Der CTA spiegelt das Eröffnungsbild.
- **Echte UI statt Nachbau:** Alle Telefon- und Panel-Inhalte sind Screenshots der gebauten Website bei 430 px Breite und DPR 2,5. Nichts davon ist nachgezeichnet.
- **Schriften in den Screenshots:** Google Fonts sind im Container gesperrt; `capture.mjs` beantwortet die Anfrage mit den lokalen Geist/Inter-Dateien, damit die Website in ihren Originalschriften erscheint.
- **Takt:** 120 BPM. Alle Szenenwechsel liegen auf Takt-Einsen (0, 2, 4, 8, 12, 16, 18, 22 s), Wörter auf Schlägen oder Halbschlägen.
- **Sicherheitszone:** Text liegt zwischen y 285 und 1635 (zentriertes 4:5); geprüft mit `render.mjs check`.
- **Kurze Texte:** Größte Zeile 3 Wörter, eine Botschaft pro Szene.
- **Zahlen nur belegt:** 50 Jahre (Gründung 1976), über 1.000 Schüler, 59 deutsche Meistertitel, 9. Dan – Quellen in `../film/SOURCES.md` (WLZ-Artikel, hosindo.de).
- **Kein „kostenlos“ im Video-Text:** Das Probetraining ist als kostenlos nicht belegt. Achtung: Die Website selbst sagt es im Trainingsabschnitt, und der Screenshot zeigt diesen Satz klein im Telefon.
- **Wasserzeichen weggeschnitten:** Das Hero-Foto ist KI-generiert und trägt unten links „AI生成“. Der Ausschnitt ist auf 85 % horizontal gesetzt, sodass 170 px links abgeschnitten werden; das Zeichen reicht bis ~144 px. Vorher/Nachher: `review/fix_wasserzeichen_*.png`.
- **Lautheit −14 LUFS:** Social-Norm statt −16 LUFS wie beim Erklärfilm. Normalisiert mit −2,0 dBTP Reserve, weil der AAC-Encoder mit −1,5 dBTP-Ziel auf −1,3 dBTP überschoss (`review/verify_before_tp_fix.json`).
- **Erster Zähl-Ton schwach:** Der Ton bei „50“ (18,25 s) geht im Ausklang des Impacts bei 18,0 s unter (+1,3 dB). Belassen, weil der Impact den Szenenwechsel trägt und die Zahl im Bild steht.
