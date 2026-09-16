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

const PERFECT_MIN =
  105;

const PERFECT_MAX =
  190;

const TOO_FAST =
  60;


/*
 * Distancia que avanza el jugador
 * con una pulsación perfecta.
 */

const PLAYER_STEP =
  2.25;


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
   RESET CPU
   ========================================= */

function resetCPU() {

  cpuDistance =
    0;


  /*
   * La CPU debe ser competitiva,
   * pero no imposible.
   *
   * La velocidad se genera
   * ligeramente diferente
   * cada carrera.
   */

  cpuSpeed =
    0.95 +
    Math.random() * 0.18;


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
   * Variación para que no sea
   * completamente mecánica.
   */

  const variation =
    0.82 +
    Math.random() * 0.35;


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
   * CPU llega primero
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
   PULSACIÓN A / B
   ========================================= */

function press(button) {

  if (
    state === "finished"
  ) {

    return;

  }


  /*
   * PRIMERA PULSACIÓN
   */

  if (
    state === "ready"
  ) {

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


  /*
   * NO REPETIR BOTÓN
   */

  if (
    button === lastButton
  ) {

    message.textContent =
      "ALTERNATE!";

    return;

  }


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


  /*
   * DEMASIADO RÁPIDO
   */

  if (
    interval < TOO_FAST
  ) {

    playerDistance =
      Math.max(
        0,
        playerDistance - 0.4
      );


    message.textContent =
      "TOO FAST!";

  }


  /*
   * RITMO PERFECTO
   */

  else if (
    interval >= PERFECT_MIN &&
    interval <= PERFECT_MAX
  ) {

    playerDistance +=
      PLAYER_STEP;


    goodPresses++;


    message.textContent =
      "GOOD!";

  }


  /*
   * RITMO INCORRECTO
   */

  else {

    playerDistance +=
      PLAYER_STEP * 0.68;


    message.textContent =

      interval < PERFECT_MIN
        ? "SLOW DOWN!"
        : "FASTER!";

  }


  playerDistance =
    Math.min(
      100,
      playerDistance
    );


  setRunnerPosition(
    player,
    playerDistance
  );


  updatePosition();


  /*
   * META
   */

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
    formatTime(elapsed);


  timer.textContent =
    time;


  finalTime.textContent =
    time;


  /*
   * Determinar clasificación
   */

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


  /*
   * Puntuación
   */

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

        (elapsed / 1000) *
        7000 +

        rhythm *
        10000

      )
    );


  scoreEl.textContent =
    "SCORE " +
    String(score)
      .padStart(5, "0");


  /*
   * Ocultar elementos
   * durante el resultado
   */

  controls.classList.add(
    "hidden"
  );


  message.classList.add(
    "hidden"
  );


  document
    .querySelector(".race-hud")
    .classList.add("hidden");


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
   BOTÓN REPETIR
   ========================================= */

again.addEventListener(
  "click",
  reset
);


/* =========================================
   INICIO
   ========================================= */

reset();
