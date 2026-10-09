# Entscheidungen

Eine Zeile pro Entscheidung. Wo das Briefing leer war, steht hier, was gewählt wurde und warum.

## Briefing (Platzhalter waren leer)

- **Thema:** Wie man bei HO SIN DO Melsungen anfängt – der Weg vom weißen Gurt an. Gewählt, weil das Repo genau diesen Verein trägt.
- **Publikum:** Erwachsene und Eltern in und um Melsungen, die glauben, man müsse für Kampfsport schon fit sein.
- **Ergebnis:** Sie können sagen „Man fängt beim weißen Gurt an, fit wird man unterwegs“ und wissen, wann und wo das erste Training ist.
- **Länge:** 60 s. Genug für fünf Akte, kurz genug für Social.
- **Sprache:** Deutsch, wie die Website.

## Idee

- **Ein Satz:** Bei Ho Sin Do musst du nicht erst fit werden – der weiße Gurt ist der Anfang, und der Weg ist für jedes Alter derselbe.
- **Die Frage in Worten des Publikums:** „Muss ich erst fit sein, bevor ich mit Ho Sin Do anfangen kann?“
- **Hook (der verbreitete Irrtum):** Vor dem Gurtweg steht ein Tor „erst fit werden“. Dieses Tor gibt es nicht.

## Gestaltung

- **Grund und Akzent:** Creme #F4F1E8 als warmer neutraler Grund, Rot #C01818 als einziger Akzent, Tinte #0D0000 – alles aus dem Nora-System der Website.
- **Schriften:** Geist für Anker-Zeilen, Inter für Stützzeilen und Labels. Beide als lokale WOFF2 im Repo, damit der Render ohne Netz identisch bleibt.
- **Keine Fotos:** Die acht Motive der Website sind KI-generiert und tragen ein sichtbares „AI生成“-Wasserzeichen; ein Erklärfilm über echte Abläufe zeigt deshalb Diagramme mit echten Daten statt dieser Bilder.
- **„Echte UI“:** Die Wochenkarten im Proof-Akt übernehmen Aufbau und Inhalt der Wochenkarten der Website.
- **Gurtrot ≠ Akzentrot:** Der rote Gurt ist #9E1B1B, damit das Akzentrot eindeutig „Du“ und Schlüsselmomente meint.
- **Ausrichtung:** 16:9 legt den Gurtweg als Reihe; 9:16 und 1:1 stellen ihn als Leiter, weil eine Reihe aus neun Gurten dort nicht lesbar breit wird.
- **Fitness-Balken ohne Skala:** Der Balken zeigt nur Richtung, keine Werte – keine erfundene Kennzahl.
- **Können setzt sich zurück, Fitness nicht:** Nach der Prüfung leeren sich die drei Technik-Balken für die neue Form, der Fitness-Balken bleibt – das ist die eigentliche Pointe.

## Text und Ton

- **Kein Sprecher:** Eine Stimme bräuchte bezahlte Sprachsynthese oder Aufnahmen; ohne Freigabe dafür trägt Text die Erzählung.
- **Zwei Zeilen pro Beat:** Ankerzeile (Geist, ≤ 24 Zeichen) und Stützzeile (Inter, ≤ 46 Zeichen), beide einzeilig in allen drei Formaten – damit gilt „höchstens zwei Zeilen“ auch hochkant.
- **Untertitel:** Weil es keine Stimme gibt, sind die eingebrannten Untertitel genau diese beiden Zeilen; `captions.srt` enthält dieselben Texte mit denselben Zeiten.
- **Ein Name pro Ding:** „Gurt“ für die Stufe, „Prüfung“ für den Übergang, „Fitness“/„fit“ für die Kondition, „Ho Sin Do“ für die Sparte.
- **Keine Kup-Anzahl:** Die genaue Zahl der Schülergrade ist nicht belegt; der Film zeigt die belegte Farbfolge ohne Zahl.
- **Kein „kostenlos“:** Ob das erste Training kostenlos ist, ist nicht belegt; der nächste Schritt nennt nur Tage, Uhrzeit und Ort.
- **Erwachsenen-Uhrzeit weggelassen:** Die Quellen nennen 19:00 und 19:30; belegt ist nur „Kinder zuerst, danach Jugendliche & Erwachsene“.
- **Tempo:** 96 BPM, ein Takt = 2,5 s, alle Akte liegen auf Taktgrenzen.
- **Motiv:** A–C–E aufwärts, kehrt bei „Weiß ist der Anfang“, beim gelben Gurt, bei „gleicher Weg“ und im Payoff (dann mit A eine Oktave höher) wieder.
- **Ziel-Lautheit:** −16 LUFS integriert, True Peak ≤ −1,5 dBTP. Der Mix ist so gepegelt, dass er roh bei −16,15 LUFS / −1,72 dBTP liegt; danach nur eine lineare Anhebung um 0,15 dB, kein Limiter.

## Verfahren

- **Storyboard und Timing:** Beide entstehen aus der seekbaren Bühne selbst – Storyboard als Standbilder je Beat, der Timing-Durchgang als Standbilder exakt an jedem Ton-Cue (`review/timing_cues_16x9.png`) statt eines separaten Animatic-Videos. So kann nichts auseinanderlaufen.
- **Reduced-Motion-Fassung:** Gleiche Beats und Texte; Bewegungen springen an ihren Startpunkt, nur Deckkraft blendet kurz.

## Nach dem Design-Review (Vorher/Nachher in `review/fixes/*_pair.png`)

- **Klartext statt Fachwort:** Balken heißen „Technik“ und „Form“ statt „Grundschule“ (liest sich als Schule) und „Hyong“ (Fachwort); so stimmen Bild und Text überein.
- **„Du“ auf dem Erwachsenenweg:** In der Wende trägt der obere Weg „Jugendliche & Erwachsene“ den Punkt „Du“, die Kinder laufen darunter mit – das Publikum sind Erwachsene und Eltern.
- **Prüfung verschwindet nach dem Bestehen:** Sie wandert nicht mehr zur nächsten Lücke, weil sie dabei den Schriftzug „Gelb“ durchstrich.
- **Fitness bis knapp unter die Hälfte:** Der Balken endet bei 45 %, damit er nicht wie ein gemessener Wert „fast fit nach einem Gurt“ wirkt.
- **Ein Durchstrich pro Zeile:** Im 16:9-Payoff steht „erst fit werden“ auf zwei Zeilen; ein einzelner Strich lag dazwischen und las sich als Unterstreichung.
- **Text vor dem Motiv:** „Weiß ist der Anfang.“ und „Gelber Gurt.“ blenden 0,3–0,4 s vor ihrem Motiv ein, damit der Ton auf lesbare Worte fällt.
- **Hochkant größer:** Gurtnamen und „Prüfung“ im Beleg-Akt von 22–24 auf 30 px, Balkenlabels im 1:1-Beleg von 24 auf 30 px.
- **Nicht übernommen:** Die Gruppen-Information „danach“ bleibt – sie ist die eine Variable, die sich in der Wende sichtbar ändert. Die kleine Gurtreihe im 16:9-Beleg bleibt, weil 16:9 nicht für Telefonbreite gebaut ist und dort ~84 px breite Gurte gut lesbar sind.
