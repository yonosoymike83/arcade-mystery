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
   ELEMENTOS · SUPABASE
   ========================================= */

const coordinates =
  $("coordinates");

const rankingButton =
  $("ranking-button");

const nicknamePanel =
  $("nickname-panel");

const nicknameInput =
  $("nickname");

const saveScoreButton =
  $("save-score");

const rankingPanel =
  $("ranking-panel");

const rankingList =
  $("ranking-list");

const closeRanking =
  $("close-ranking");


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
   RESULTADO
   ========================================= */

let finalScore =
  0;

let finalElapsed =
  0;

let finalPlace =
  2;

let scoreSaved =
  false;


/* =========================================
   CONFIGURACIÓN
   ========================================= */

const IDEAL_INTERVAL =
  140;

const PERFECT_RANGE =
  20;

const TOO_FAST =
  65;

const MAX_STEP =
  2.65;

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

  if (!element) {
    return;
  }

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

  if (positionEl) {

    positionEl.textContent =
      playerDistance >= cpuDistance
        ? "1ST"
        : "2ND";

  }

  if (distanceEl) {

    distanceEl.textContent =
      Math.min(
        100,
        Math.round(playerDistance)
      ) + " M";

  }

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

  if (timer) {

    timer.textContent =
      formatTime(
        performance.now() -
        startTime
      );

  }

}


/* =========================================
   CALIDAD DEL RITMO
   ========================================= */

function getRhythmQuality(
  interval
) {

  if (
    interval < TOO_FAST
  ) {

    return 0;

  }

  const difference =
    Math.abs(
      interval -
      IDEAL_INTERVAL
    );

  if (
    difference >= 130
  ) {

    return 0.08;

  }

  const normalized =
    difference /
    130;

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

    if (
      button !== "A"
    ) {

      if (message) {

        message.textContent =
          "PRESS A!";

      }

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

    if (message) {

      message.textContent =
        "RUN!";

    }

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

    if (message) {

      message.textContent =
        "ALTERNATE!";

    }

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


  let step =
    MIN_STEP +
    (
      MAX_STEP -
      MIN_STEP
    ) *
    quality;


  /* ======================================
     PERFECTO
     ====================================== */

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


  /* ======================================
     DEMASIADO RÁPIDO
     ====================================== */

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

  if (message) {

    message.textContent =
      rhythmMessage(
        interval,
        quality
      );

  }


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
   SUPABASE
   ========================================= */

function getSupabase() {

  if (
    window.OlympiaSupabase &&
    typeof window.OlympiaSupabase.from === "function"
  ) {

    return window.OlympiaSupabase;

  }

  return null;

}


/* =========================================
   ESCAPAR HTML
   ========================================= */

function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================
   GUARDAR SCORE
   ========================================= */

async function saveScore() {

  if (
    scoreSaved
  ) {

    return;

  }


  const supabase =
    getSupabase();

  if (!supabase) {

    alert(
      "SUPABASE NO ESTÁ DISPONIBLE"
    );

    return;

  }


  /*
   * Estos elementos existen únicamente
   * en la pantalla final.
   */

  const input =
    $("finish-nickname");

  const button =
    $("finish-save-score");


  const nickname =
    input
      ? input.value
          .trim()
          .toUpperCase()
      : "";


  if (!nickname) {

    if (input) {

      input.focus();

    }

    return;

  }


  if (
    nickname.length > 12
  ) {

    if (input) {

      input.value =
        nickname.slice(
          0,
          12
        );

      input.focus();

    }

    return;

  }


  if (
    !Number.isFinite(
      finalScore
    ) ||
    !Number.isFinite(
      finalElapsed
    )
  ) {

    return;

  }


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "SAVING...";

  }


  const { error } =
    await supabase
      .from("scores")
      .insert({

        nickname:
          nickname
