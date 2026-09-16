/* =========================================
   OLYMPIA 8-BIT
   100 METROS
   ========================================= */

const $ = id =>
  document.getElementById(id);


/* =========================================
   ELEMENTOS
   ========================================= */

const timer =
  $("timer");

const distanceEl =
  $("distance");

const player =
  $("player");

const cpu1 =
  $("cpu1");

const cpu2 =
  $("cpu2");

const cpu3 =
  $("cpu3");

const positionEl =
  $("position");

const message =
  $("message");

const controls =
  document.querySelector(".nes-controls");

const result =
  $("result");

const finalTime =
  $("final-time");

const scoreEl =
  $("score");

const resultPosition =
  $("result-position");

const again =
  $("again");


/* =========================================
   ESTADO
   ========================================= */

let state = "ready";

let startTime = 0;

let lastPress = 0;

let lastButton = null;

let playerDistance = 0;

let cpuDistances = [0, 0, 0];

let cpuSpeeds = [0, 0, 0];

let timerInterval;

let cpuInterval;


/* =========================================
   RITMO
   ========================================= */

const PERFECT_MIN = 110;
const PERFECT_MAX = 210;

const TOO_FAST = 65;

const PLAYER_STEP = 2.15;


/* =========================================
   CPU
   ========================================= */

function resetCPU() {

  cpuDistances = [0, 0, 0];

  /*
   * Velocidad base de cada CPU.
   * Hay pequeñas variaciones aleatorias.
   */

  cpuSpeeds = [

    0.95 + Math.random() * 0.25,

    0.90 + Math.random() * 0.30,

    0.85 + Math.random() * 0.35

  ];

}


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
   POSICIÓN DEL CORREDOR
   ========================================= */

function setRunnerPosition(
  element,
  distance
) {

  const percent = Math.min(
    92,
    2 + distance * 0.90
  );

  element.style.left =
    percent + "%";

}


/* =========================================
   CLASIFICACIÓN
   ========================================= */

function getRanking() {

  const competitors = [

    {
      name: "CPU 1",
      distance: cpuDistances[0]
    },

    {
      name: "CPU 2",
      distance: cpuDistances[1]
    },

    {
      name: "CPU 3",
      distance: cpuDistances[2]
    },

    {
      name: "YOU",
      distance: playerDistance
    }

  ];


  competitors.sort(
    (a, b) =>
      b.distance - a.distance
  );


  return competitors;

}


/* =========================================
   ACTUALIZAR POSICIONES
   ========================================= */

function updatePosition() {

  const ranking =
    getRanking();


  const playerIndex =
    ranking.findIndex(
      x => x.name === "YOU"
    );


  const pos =
    playerIndex + 1;


  const suffix =

    pos === 1 ? "ST" :
    pos === 2 ? "ND" :
    pos === 3 ? "RD" :
    "TH";


  positionEl.textContent =
    pos + suffix;


  distanceEl.textContent =
    Math.min(
      100,
      Math.round(playerDistance)
    ) + " M";

}


/* =========================================
   MOVER CPU
   ========================================= */

function updateCPU() {

  if (
    state !== "running"
  ) {

    return;

  }


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    /*
     * Variación natural
     */

    const variation =
      0.75 +
      Math.random() * 0.5;


    cpuDistances[i] +=
      cpuSpeeds[i] *
      variation;


    cpuDistances[i] =
      Math.min(
        100,
        cpuDistances[i]
      );

  }


  setRunnerPosition(
    cpu1,
    cpuDistances[0]
  );

  setRunnerPosition(
    cpu2,
    cpuDistances[1]
  );

  setRunnerPosition(
    cpu3,
    cpuDistances[2]
  );


  updatePosition();


  /*
   * Si un CPU llega primero
   */

  if (
    Math.max(...cpuDistances) >= 100
  ) {

    finishRace();

  }

}


/* =========================================
   PULSACIÓN
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
   * MISMO BOTÓN
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
    now - lastPress;


  lastPress =
    now;


  lastButton =
    button;


  /*
   * RITMO
   */

  if (
    interval < TOO_FAST
  ) {

    playerDistance =
      Math.max(
        0,
        playerDistance - 0.5
      );


    message.textContent =
      "TOO FAST!";

  }

  else if (
    interval >= PERFECT_MIN &&
    interval <= PERFECT_MAX
  ) {

    playerDistance +=
      PLAYER_STEP;


    message.textContent =
      "GOOD!";

  }

  else {

    playerDistance +=
      PLAYER_STEP * 0.70;


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
   * PLAYER META
   */

  if (
    playerDistance >= 100
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


  /*
   * Tiempo
   */

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
   * Clasificación final
   */

  const ranking =
    getRanking();


  const playerIndex =
    ranking.findIndex(
      x => x.name === "YOU"
    );


  const place =
    playerIndex + 1;


  const suffix =

    place === 1 ? "ST" :
    place === 2 ? "ND" :
    place === 3 ? "RD" :
    "TH";


  resultPosition.textContent =
    place + suffix + " PLACE";


  /*
   * Puntuación
   */

  const score =
    Math.max(
      0,
      Math.round(
        100000 -
        (elapsed / 1000) * 7000 +
        playerDistance * 100
      )
    );


  scoreEl.textContent =
    "SCORE " +
    String(score)
      .padStart(5, "0");


  /*
   * Mensaje
   */

  if (
    place === 1
  ) {

    message.textContent =
      "GOLD!";

  }

  else if (
    place === 2
  ) {

    message.textContent =
      "SILVER!";

  }

  else if (
    place === 3
  ) {

    message.textContent =
      "BRONZE!";

  }

  else {

    message.textContent =
      "FINISH!";

  }


  controls.classList.add(
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


  playerDistance =
    0;


  lastButton =
    null;


  lastPress =
    0;


  timer.textContent =
    "00.00";


  distanceEl.textContent =
    "0 M";


  positionEl.textContent =
    "4TH";


  message.textContent =
    "READY!";


  result.classList.add(
    "hidden"
  );


  controls.classList.remove(
    "hidden"
  );


  setRunnerPosition(
    player,
    0
  );


  resetCPU();


  setRunnerPosition(
    cpu1,
    0
  );

  setRunnerPosition(
    cpu2,
    0
  );

  setRunnerPosition(
    cpu3,
    0
  );

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


reset();
