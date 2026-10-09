/* TIMELINE – die einzige Quelle für jeden Beat, jede Bewegung und jeden Ton.
   Alle Werte sind semantisch (Fortschritt, Index, Präsenz), nicht in Pixeln:
   stage.html übersetzt sie pro Format in Geometrie.
   Keyframe: [Zeit in s, Wert, Easing] – das Easing gilt für den Weg VOM vorigen Keyframe hierher.
   Tempo: 96 BPM → Schlag = 0,625 s, Takt = 2,5 s. */
(function (root) {
  const BEAT = 60 / 96;

  const TIMELINE = {
    duration: 60,
    fps: 60,
    bpm: 96,
    beat: BEAT,

    /* Zwei Zeilen pro Beat: Anker (≤ 24 Zeichen) und Stütze (≤ 46 Zeichen). */
    beats: [
      { id: "Q",  act: "Frage",   start: 0.40,  end: 5.00,  l1: "Erst fit werden?",      l2: "Das denken viele vor dem Anfang." },
      { id: "M1", act: "Modell",  start: 5.95,  end: 10.00, l1: "Weiß ist der Anfang.",  l2: "Jeder steigt beim weißen Gurt ein." },
      { id: "M2", act: "Modell",  start: 10.30, end: 15.00, l1: "Jeder Gurt, eine Form.", l2: "Technik, Form, Selbstverteidigung." },
      { id: "M3", act: "Modell",  start: 15.30, end: 20.00, l1: "Prüfung, dann weiter.", l2: "Wenn alles sitzt, folgt der nächste Gurt." },
      { id: "P1", act: "Beleg",   start: 21.50, end: 26.20, l1: "Mo und Mi, ab 18 Uhr.", l2: "So sieht die Ho Sin Do-Woche aus." },
      { id: "P2", act: "Beleg",   start: 26.50, end: 37.30, l1: "Jedes Training zählt.", l2: "Technik, Form – und Fitness wächst mit." },
      { id: "P3", act: "Beleg",   start: 39.00, end: 42.40, l1: "Gelber Gurt.",          l2: "Niemand musste vorher fit sein." },
      { id: "T1", act: "Wende",   start: 43.90, end: 47.40, l1: "Anderes Alter …",       l2: "Kinder zuerst, dann Jugendliche & Erwachsene." },
      { id: "T2", act: "Wende",   start: 48.00, end: 52.00, l1: "… gleicher Weg.",       l2: "Weiß, Form für Form, Prüfung für Prüfung." },
      { id: "PO", act: "Auflösung", start: 53.30, end: 60.00, l1: "Einfach anfangen.",   l2: "Mo oder Mi ab 18 Uhr · Dreuxallee 28" }
    ],

    /* Präsenz-Spuren (0…1) blenden; alle anderen Spuren bewegen. Die Liste steuert auch
       die Reduced-Motion-Fassung: Präsenz blendet kurz, Bewegung springt. */
    presence: ["gate", "ring", "dot", "blocks", "fitness", "exam", "week",
               "rowLabels", "dotB", "ghost", "strike", "brand", "beltsIn"],

    tracks: {
      /* Gurtweg zeichnet sich von Weiß nach Schwarz ein – Reihenfolge ist Bedeutung. */
      beltsIn:   [[0.20, 0], [2.10, 1, "lin"]],

      /* Der Irrtum: ein Tor vor dem weißen Gurt. Fällt auf Schlag 4, verschwindet nach unten. */
      gate:      [[1.90, 0], [2.50, 1, "out"], [5.40, 1], [6.20, 0, "io"]],
      gateY:     [[1.90, -1], [2.50, 0, "out"], [5.40, 0], [6.20, 1, "io"]],

      /* Markierung „hier stehst du“ – Ring und Punkt. */
      ring:      [[5.90, 0], [6.50, 1, "out"], [42.50, 1], [43.00, 0, "lin"], [53.20, 0], [53.80, 1, "out"]],
      ringPos:   [[38.60, 0], [39.375, 1, "io"], [42.60, 1], [43.40, 0, "io"]],
      dot:       [[6.30, 0], [6.90, 1, "out"]],
      dotBelt:   [[38.60, 0], [39.375, 1, "io"], [42.60, 1], [43.40, 0, "io"],
                  [47.50, 0], [50.60, 8, "io"], [52.00, 8], [53.20, 0, "io"]],

      /* Bausteine eines Gurts. */
      blocks:    [[10.20, 0], [11.20, 1, "out"], [42.50, 1], [43.00, 0, "lin"]],

      /* Prüfung zwischen zwei Gurten. */
      exam:      [[15.20, 0], [15.80, 1, "out"], [40.40, 1], [41.00, 0, "lin"]],
      examOpen:  [[37.90, 0], [38.40, 1, "out"], [40.60, 1], [41.10, 0, "io"]],
      examPos:   [[0, 0]],

      /* Kamera: 0 = Gurtweg groß, 1 = Gurtweg + Woche, 2 = zwei Wege, 3 = wie 0. */
      cam:       [[20.20, 0], [21.40, 1, "io"], [42.60, 1], [43.80, 2, "io"], [52.00, 2], [53.20, 3, "io"]],

      /* Die echte Trainingswoche. */
      week:      [[21.00, 0], [21.90, 1, "out"], [42.50, 1], [43.00, 0, "lin"]],
      dotWeek:   [[26.90, 0], [27.50, 1, "io"], [37.30, 1], [37.90, 0, "io"]],
      dotDay:    [[27.50, 0], [29.40, 0], [30.00, 2, "io"], [31.90, 2], [32.50, 0, "io"], [34.40, 0], [35.00, 2, "io"]],

      /* Jede Ankunft im Training füllt die Bausteine – Ursache, dann Wirkung. */
      fillG:     [[27.55, 0], [28.35, .35, "out"], [30.05, .35], [30.85, .60, "out"],
                  [32.55, .60], [33.35, .85, "out"], [35.05, .85], [35.85, 1, "out"], [40.40, 1], [41.20, 0, "io"]],
      fillH:     [[27.55, 0], [28.35, .25, "out"], [30.05, .25], [30.85, .50, "out"],
                  [32.55, .50], [33.35, .80, "out"], [35.05, .80], [35.85, 1, "out"], [40.40, 1], [41.20, 0, "io"]],
      fillS:     [[27.55, 0], [28.35, .20, "out"], [30.05, .20], [30.85, .45, "out"],
                  [32.55, .45], [33.35, .75, "out"], [35.05, .75], [35.85, 1, "out"], [40.40, 1], [41.20, 0, "io"]],

      /* Fitness: startet niedrig, wächst mit – und setzt sich nach der Prüfung NICHT zurück. */
      fitness:   [[26.40, 0], [27.00, 1, "out"], [42.50, 1], [43.00, 0, "lin"]],
      fitLevel:  [[27.55, .08], [28.35, .16, "out"], [30.05, .16], [30.85, .26, "out"],
                  [32.55, .26], [33.35, .36, "out"], [35.05, .36], [35.85, .45, "out"]],

      /* Wende: ein zweiter Weg löst sich vom ersten und kehrt in ihn zurück. */
      rowB:      [[43.00, 0], [44.20, 1, "io"], [50.80, 1], [51.80, 0, "io"]],
      rowLabels: [[44.00, 0], [44.60, 1, "out"], [50.60, 1], [51.00, 0, "lin"]],
      dotB:      [[43.60, 0], [44.20, 1, "out"], [50.80, 1], [51.80, 0, "io"]],

      /* Auflösung: das Tor von Bild 1 kehrt als Umriss zurück und wird durchgestrichen. */
      ghost:     [[53.40, 0], [54.00, 1, "out"]],
      strike:    [[54.20, 0], [54.80, 1, "out"]],
      brand:     [[55.00, 0], [55.60, 1, "out"]]
    },

    /* Töne – auf dem Schlagraster, nur wo eine Handlung Bedeutung trägt. */
    cues: [
      { t: 2.500,  type: "thud",   why: "Das Tor des Irrtums landet" },
      { t: 5.625,  type: "lift",   why: "Das Tor verschwindet" },
      { t: 6.250,  type: "motif",  why: "Weiß ist der Anfang" },
      { t: 27.500, type: "tick",   why: "Training Montag" },
      { t: 30.000, type: "tick",   why: "Training Mittwoch" },
      { t: 32.500, type: "tick",   why: "Training Montag" },
      { t: 35.000, type: "tick",   why: "Training Mittwoch" },
      { t: 38.125, type: "open",   why: "Prüfung öffnet sich" },
      { t: 39.375, type: "motif",  why: "Gelber Gurt erreicht" },
      { t: 48.125, type: "motif",  why: "Gleicher Weg" },
      { t: 53.125, type: "motifEnd", why: "Auflösung" }
    ]
  };

  root.TIMELINE = TIMELINE;
})(typeof window !== "undefined" ? window : globalThis);
