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
   SUPABASE / RANKING
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


/*
 * Cliente Supabase creado en supabase.js
 */

const supabaseClient =
  window.OlympiaSupabase;


/*
 * Datos del resultado actual.
 */

let finalScore =
  0;

let finalTimeMs =
  0;

let finalPlace =
  0;


/*
 * Evita guardar la misma carrera
 * más de una vez.
 */

let scoreSaved =
  false;


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
   RESULTADO · COORDENADAS
   ========================================= */

function showCoordinates() {

  if (!coordinates) {

    return;

  }


  /*
   * Las coordenadas reales se encuentran
   * actualmente en 100m.html.
   *
   * Solo las mostramos al quedar primero.
   */

  coordinates.classList.remove(
    "hidden"
  );

}


/* =========================================
   OCULTAR COORDENADAS
   ========================================= */

function hideCoordinates() {

  if (!coordinates) {

    return;

  }


  coordinates.classList.add(
    "hidden"
  );

}


/* =========================================
   RANKING · ABRIR
   ========================================= */

function openRankingForm() {

  if (!rankingButton) {

    return;

  }


  if (scoreSaved) {

    showRanking();

    return;

  }


  if (rankingPanel) {

    rankingPanel.classList.add(
      "hidden"
    );

  }


  if (nicknamePanel) {

    nicknamePanel.classList.remove(
      "hidden"
    );

  }


  if (nicknameInput) {

    nicknameInput.value = "";

    nicknameInput.focus();

  }

}


/* =========================================
   RANKING · GUARDAR
   ========================================= */

async function saveScore() {

  if (
    scoreSaved
  ) {

    showRanking();

    return;

  }


  if (
    !supabaseClient
  ) {

    showRankingMessage(
      "SUPABASE CONNECTION ERROR"
    );

    return;

  }


  let nickname =
    nicknameInput
      ? nicknameInput.value.trim()
      : "";


  /*
   * Convertimos a mayúsculas para mantener
   * la estética arcade.
   */

  nickname =
    nickname.toUpperCase();


  if (
    nickname.length < 1
  ) {

    showRankingMessage(
      "ENTER YOUR NICKNAME"
    );

    if (nicknameInput) {

      nicknameInput.focus();

    }

    return;

  }


  if (
    nickname.length > 12
  ) {

    nickname =
      nickname.substring(
        0,
        12
      );

  }


  if (saveScoreButton) {

    saveScoreButton.disabled =
      true;

    saveScoreButton.textContent =
      "SAVING...";

  }


  try {

    const {
      error
    } =
      await supabaseClient
        .from("scores")
        .insert({

          nickname:
            nickname,

          score:
            finalScore,

          time_ms:
            finalTimeMs,

          event:
            "100m"

        });


    if (error) {

      console.error(
        "Supabase save error:",
        error
      );

      showRankingMessage(
        "ERROR SAVING SCORE"
      );

      return;

    }


    scoreSaved =
      true;


    if (nicknamePanel) {

      nicknamePanel.classList.add(
        "hidden"
      );

    }


    await showRanking();

  }

  catch (error) {

    console.error(
      "Supabase error:",
      error
    );

    showRankingMessage(
      "CONNECTION ERROR"
    );

  }

  finally {

    if (saveScoreButton) {

      saveScoreButton.disabled =
        false;

      saveScoreButton.textContent =
        "SAVE SCORE";

    }

  }

}


/* =========================================
   RANKING · MENSAJE
   ========================================= */

function showRankingMessage(
  text
) {

  if (!rankingList) {

    return;

  }


  rankingList.innerHTML = "";


  const message =
    document.createElement(
      "div"
    );


  message.className =
    "ranking-message";


  message.textContent =
    text;


  rankingList.appendChild(
    message
  );

}


/* =========================================
   RANKING · CARGAR TOP 10
   ========================================= */

async function showRanking() {

  if (!rankingPanel) {

    return;

  }


  rankingPanel.classList.remove(
    "hidden"
  );


  if (nicknamePanel) {

    nicknamePanel.classList.add(
      "hidden"
    );

  }


  showRankingMessage(
    "LOADING..."
  );


  if (
    !supabaseClient
  ) {

    showRankingMessage(
      "SUPABASE CONNECTION ERROR"
    );

    return;

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("scores")
        .select(
          "nickname, score, time_ms, created_at"
        )
        .eq(
          "event",
          "100m"
        )
        .order(
          "score",
          {
            ascending: false
          }
        )
        .order(
          "time_ms",
          {
            ascending: true
          }
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        )
        .limit(10);


    if (error) {

      console.error(
        "Supabase ranking error:",
        error
      );

      showRankingMessage(
        "ERROR LOADING RANKING"
      );

      return;

    }


    renderRanking(
      data || []
    );

  }

  catch (error) {

    console.error(
      "Ranking error:",
      error
    );

    showRankingMessage(
      "CONNECTION ERROR"
    );

  }

}


/* =========================================
   RANKING · RENDER
   ========================================= */

function renderRanking(
  scores
) {

  if (!rankingList) {

    return;

  }


  rankingList.innerHTML =
    "";


  if (
    scores.length === 0
  ) {

    showRankingMessage(
      "NO SCORES YET"
    );

    return;

  }


  scores.forEach(
    (
      entry,
      index
    ) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "ranking-row";


      const rank =
        document.createElement(
          "span"
        );

      rank.className =
        "rank";

      rank.textContent =
        String(
          index + 1
        );


      const nick =
        document.createElement(
          "span"
        );

      nick.className =
        "nick";

      nick.textContent =
        String(
          entry.nickname || ""
        );


      const score =
        document.createElement(
          "span"
        );

      score.className =
        "score";

      score.textContent =
        String(
          Number(
            entry.score || 0
          )
        ).padStart(
          5,
          "0"
        );


      row.appendChild(
        rank
      );

      row.appendChild(
        nick
      );

      row.appendChild(
        score
      );


      rankingList.appendChild(
        row
      );

    }
  );

}


/* =========================================
   RANKING · CERRAR
   ========================================= */

function closeRankingPanel() {

  if (rankingPanel) {

    rankingPanel.classList.add(
      "hidden"
    );

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


  document
    .querySelector(
      ".game-screen"
    )
    .classList.add(
      "finished"
    );


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


  finalPlace =
    place;


  if (
    place === 1
  ) {

    resultPosition.textContent =
      "1ST PLACE";


    /*
     * Las coordenadas SOLO aparecen
     * si el jugador gana.
     */

    showCoordinates();

  } else {

    resultPosition.textContent =
      "2ND PLACE";


    /*
     * Segundo puesto:
     * no hay coordenadas.
     */

    hideCoordinates();

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


  finalScore =
    score;


  finalTimeMs =
    Math.round(
      elapsed
    );


  scoreSaved =
    false;


  scoreEl.textContent =
    "SCORE " +

    String(score)
      .padStart(
        5,
        "0"
      );


  /* ======================================
     LIMPIAR PANELES DE RANKING
     ====================================== */

  if (nicknamePanel) {

    nicknamePanel.classList.add(
      "hidden"
    );

  }


  if (rankingPanel) {

    rankingPanel.classList.add(
      "hidden"
    );

  }


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
    .querySelector(
      ".race-hud"
    )
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


  document
    .querySelector(
      ".game-screen"
    )
    .classList.remove(
      "finished"
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


  finalScore =
    0;


  finalTimeMs =
    0;


  finalPlace =
    0;


  scoreSaved =
    false;


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
    .querySelector(
      ".race-hud"
    )
    .classList.remove(
      "hidden"
    );


  controls.classList.remove(
    "hidden"
  );


  result.classList.add(
    "hidden"
  );


  if (nicknamePanel) {

    nicknamePanel.classList.add(
      "hidden"
    );

  }


  if (rankingPanel) {

    rankingPanel.classList.add(
      "hidden"
    );

  }


  if (nicknameInput) {

    nicknameInput.value =
      "";

  }


  hideCoordinates();


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
   RANKING
   ========================================= */

if (rankingButton) {

  rankingButton.addEventListener(
    "click",
    openRankingForm
  );

}


if (saveScoreButton) {

  saveScoreButton.addEventListener(
    "click",
    saveScore
  );

}


if (closeRanking) {

  closeRanking.addEventListener(
    "click",
    closeRankingPanel
  );

}


/*
 * Permitir guardar pulsando ENTER
 * dentro del campo de nickname.
 */

if (nicknameInput) {

  nicknameInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        saveScore();

      }

    }
  );

}


/* =========================================
   INICIO
   ========================================= */

reset();
