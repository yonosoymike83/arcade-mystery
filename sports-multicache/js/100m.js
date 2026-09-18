/* =========================================
   OLYMPIA 8-BIT
   100 METROS
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const $ = id =>
  document.getElementById(id);


const timer =
  $("timer");

const distanceEl =
  $("distance");

const positionEl =
  $("position");

const player =
  $("player-runner");

const cpu =
  $("cpu-runner");

const message =
  $("message");

const result =
  $("result");

const finalTime =
  $("final-time");

const resultPosition =
  $("result-position");

const scoreEl =
  $("score");

const controls =
  document.querySelector(".nes-controls");

const again =
  $("again");


/* =========================================
   ESTADO
   ========================================= */

let state =
  "ready";

let startTime =
  0;

let lastPress =
  0;

let lastButton =
  null;

let playerDistance =
  0;

let cpuDistance =
  0;

let cpuSpeed =
  0;

let timerInterval =
  null;

let cpuInterval =
  null;

let goodPresses =
  0;

let totalPresses =
  0;


/* =========================================
   CONFIGURACIÓN
   ========================================= */


/*
 * Ritmo ideal:
 *
 * aproximadamente 7 pulsaciones por segundo.
 *
 * El jugador debe intentar mantener
 * un ritmo constante.
 */

const IDEAL_INTERVAL =
  140;


/*
 * Zona en la que el ritmo se considera
 * prácticamente perfecto.
 */

const PERFECT_RANGE =
  20;


/*
 * Pulsaciones demasiado rápidas.
 */

const TOO_FAST =
  65;


/*
 * Distancia máxima por pulsación.
 */

const MAX_STEP =
  2.65;


/*
 * Distancia mínima cuando el ritmo
 * es bastante malo.
 */

const MIN_STEP =
  0.15;


/* =========================================
   TIEMPO
   ========================================= */

function formatTime(ms) {

  return (

    ms / 1000

  )
    .toFixed(2)
    .padStart(5, "0");

}


/* =========================================
   POSICIÓN VISUAL
   ========================================= */

function setRunnerPosition(
  element,
  distance
) {

  const percent =
    Math.min(
      92,
      2 + distance * 0.90
    );

  element.style.left =
    percent + "%";

}


/* =========================================
   CPU
   ========================================= */

function resetCPU() {

  cpuDistance =
    0;


  /*
   * CPU más rápida que antes.
   *
   * La variación hace que cada partida
   * sea ligeramente diferente.
   */

  cpuSpeed =
    1.30 +
    Math.random() * 0.14;


  setRunnerPosition(
    cpu,
    0
  );

}


/* =========================================
   POSICIÓN
   ========================================= */

function updatePosition() {

  if (
    playerDistance >=
    cpuDistance
  ) {

    positionEl.textContent =
      "1ST";

  } else {

    positionEl.textContent =
      "2ND";

  }


  distanceEl.textContent =

    Math.min(
      100,
      Math.round(
        playerDistance
      )
    ) +

    " M";

}


/* =========================================
   CPU
   ========================================= */

function updateCPU() {

  if (
    state !== "running"
  ) {

    return;

  }


  /*
   * Variación natural de la CPU.
   */

  const variation =
    0.82 +
    Math.random() * 0.30;


  cpuDistance +=
    cpuSpeed *
    variation;


  cpuDistance =
    Math.min(
      100,
      cpuDistance
    );


  setRunnerPosition(
    cpu,
    cpuDistance
  );


  updatePosition();


  /*
   * CPU llega primero.
   */

  if (
    cpuDistance >= 100
  ) {

    finishRace();

  }

}


/* =========================================
   CRONÓMETRO
   ========================================= */

function updateTimer() {

  if (
    state !== "running"
  ) {

    return;

  }


  timer.textContent =
    formatTime(
      performance.now() -
      startTime
    );

}


/* =========================================
   CALCULAR CALIDAD DEL RITMO
   ========================================= */

function getRhythmQuality(
  interval
) {

  /*
   * Si es demasiado rápido,
   * penalización fuerte.
   */

  if (
    interval < TOO_FAST
  ) {

    return 0;

  }


  /*
   * Distancia respecto al ritmo ideal.
   */

  const difference =
    Math.abs(
      interval -
      IDEAL_INTERVAL
    );


  /*
   * Fuera de una ventana razonable
   * todavía se puede avanzar,
   * pero muy poco.
   */

  if (
    difference >= 130
  ) {

    return 0.08;

  }


  /*
   * 0 = perfecto
   * 1 = límite de la zona
   */

  const normalized =
    difference /
    130;


  /*
   * Curva suave:
   *
   * cerca del ritmo ideal
   * se obtiene mucha más velocidad.
   */

  return Math.max(
    0.08,
    1 -
    Math.pow(
      normalized,
      1.7
    )
  );

}


/* =========================================
   MENSAJE DE RITMO
   ========================================= */

function rhythmMessage(
  interval,
  quality
) {

  if (
    interval < TOO_FAST
  ) {

    return "TOO FAST!";

  }


  if (
    Math.abs(
      interval -
      IDEAL_INTERVAL
    ) <= PERFECT_RANGE
  ) {

    return "PERFECT!";

  }


  if (
    quality > 0.72
  ) {

    return "GOOD!";

  }


  if (
    interval <
    IDEAL_INTERVAL
  ) {

    return "SLOW DOWN!";

  }


  return "FASTER!";

}


/* =========================================
   PULSACIÓN A / B
   ========================================= */

function press(button) {

  if (
    state === "finished"
  ) {

    return;

  }


  /* ======================================
     PRIMERA PULSACIÓN
     ====================================== */

  if (
    state === "ready"
  ) {

    /*
     * La carrera empieza con A.
     */

    if (
      button !== "A"
    ) {

      message.textContent =
        "PRESS A!";

      return;

    }


    state =
      "running";


    startTime =
      performance.now();


    lastPress =
      startTime;


    lastButton =
      "A";


    message.textContent =
      "RUN!";


    timerInterval =
      setInterval(
        updateTimer,
        20
      );


    cpuInterval =
      setInterval(
        updateCPU,
        100
      );


    return;

  }


  /* ======================================
     ALTERNANCIA
     ====================================== */

  if (
    button === lastButton
  ) {

    /*
     * Repetir A o B rompe el ritmo.
     */

    message.textContent =
      "ALTERNATE!";


    /*
     * Pequeña penalización.
     */

    playerDistance =
      Math.max(
        0,
        playerDistance - 0.25
      );


    setRunnerPosition(
      player,
      playerDistance
    );


    updatePosition();

    return;

  }


  /* ======================================
     INTERVALO
     ====================================== */

  const now =
    performance.now();


  const interval =
    now -
    lastPress;


  lastPress =
    now;


  lastButton =
    button;


  totalPresses++;


  /* ======================================
     CALIDAD
     ====================================== */

  const quality =
    getRhythmQuality(
      interval
    );


  /*
   * Convertimos la calidad
   * en distancia recorrida.
   */

  let step =
    MIN_STEP +
    (
      MAX_STEP -
      MIN_STEP
    ) *
    quality;


  /*
   * Perfecto:
   * pequeño bonus.
   */

  if (
    Math.abs(
      interval -
      IDEAL_INTERVAL
    ) <= PERFECT_RANGE
  ) {

    step *=
      1.08;

    goodPresses++;

  }


  /*
   * Demasiado rápido:
   * prácticamente no avanza.
   */

  if (
    interval < TOO_FAST
  ) {

    step =
      -0.35;

  }


  playerDistance +=
    step;


  playerDistance =
    Math.max(
      0,
      Math.min(
        100,
        playerDistance
      )
    );


  /* ======================================
     VISUAL
     ====================================== */

  setRunnerPosition(
    player,
    playerDistance
  );


  updatePosition();


  message.textContent =
    rhythmMessage(
      interval,
      quality
    );


  /* ======================================
     META
     ====================================== */

  if (
    playerDistance >= 100
  ) {

    finishRace();

  }

}


/* =========================================
   FINAL
   ========================================= */

function finishRace() {

  if (
    state !== "running"
  ) {

    return;

  }


  state =
    "finished";

  document.querySelector(".game-screen").classList.add("finished");
   
  clearInterval(
    timerInterval
  );

  clearInterval(
    cpuInterval
  );


  const elapsed =
    performance.now() -
    startTime;


  const time =
    formatTime(
      elapsed
    );


  timer.textContent =
    time;


  finalTime.textContent =
    time;


  /* ======================================
     CLASIFICACIÓN
     ====================================== */

  const place =
    playerDistance >= cpuDistance
      ? 1
      : 2;


  if (
    place === 1
  ) {

    resultPosition.textContent =
      "1ST PLACE";

  } else {

    resultPosition.textContent =
      "2ND PLACE";

  }


  positionEl.textContent =
    place === 1
      ? "1ST"
      : "2ND";


  /* ======================================
     PUNTUACIÓN
     ====================================== */

  const rhythm =
    totalPresses > 0

      ? goodPresses /
        totalPresses

      : 0;


  const score =
    Math.max(

      0,

      Math.round(

        100000 -

        (
          elapsed /
          1000
        ) *
        7000 +

        rhythm *
        15000

      )

    );


  scoreEl.textContent =
    "SCORE " +

    String(score)
      .padStart(
        5,
        "0"
      );


  /* ======================================
     RESULTADO
     ====================================== */

  controls.classList.add(
    "hidden"
  );


  message.classList.add(
    "hidden"
  );


  document
    .querySelector(".race-hud")
    .classList.add(
      "hidden"
    );


  result.classList.remove(
    "hidden"
  );

}


/* =========================================
   RESET
   ========================================= */

function reset() {

  state =
    "ready";


  clearInterval(
    timerInterval
  );

  clearInterval(
    cpuInterval
  );

  document.querySelector(".game-screen").classList.remove("finished");
   
  startTime =
    0;


  lastPress =
    0;


  lastButton =
    null;


  playerDistance =
    0;


  goodPresses =
    0;


  totalPresses =
    0;


  timer.textContent =
    "00.00";


  distanceEl.textContent =
    "0 M";


  positionEl.textContent =
    "2ND";


  message.textContent =
    "READY!";


  message.classList.remove(
    "hidden"
  );


  document
    .querySelector(".race-hud")
    .classList.remove(
      "hidden"
    );


  controls.classList.remove(
    "hidden"
  );


  result.classList.add(
    "hidden"
  );


  setRunnerPosition(
    player,
    0
  );


  resetCPU();

}


/* =========================================
   CONTROLES
   ========================================= */

ArcadeController.on(
  "A",
  () => press("A")
);


ArcadeController.on(
  "B",
  () => press("B")
);


/* =========================================
   REPETIR
   ========================================= */

again.addEventListener(
  "click",
  reset
);


/* =========================================
   INICIO
   ========================================= */

reset();
