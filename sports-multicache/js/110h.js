/* =========================================
   OLYMPIA 8-BIT
   110 M VALLAS
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
   ELEMENTOS · SUPABASE / RANKING
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
   VALLAS
   ========================================= */

const HURDLE_DISTANCES = [
  13.72,
  22.86,
  32.00,
  41.14,
  50.28,
  59.42,
  68.56,
  77.70,
  86.84,
  95.98
];

const JUMP_WINDOW =
  2.8;

const JUMP_DURATION =
  430;

const HURDLE_PENALTY =
  1.25;

let nextHurdle =
  0;

let nextCpuHurdle =
  0;

let hurdleHits =
  0;

let jumping =
  false;

let jumpTimer =
  null;


/* =========================================
   RESULTADO · DATOS PARA RANKING
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
      2 + distance * (90 / 110)
    );

  element.style.left =
    percent + "%";

}


/* =========================================
   VALLAS · VISUAL
   ========================================= */

function setHurdlePositions() {

  document.querySelectorAll(".hurdle").forEach(
    hurdle => {

      const distance =
        Number(hurdle.dataset.distance);

      const percent =
        Math.min(92, 2 + distance * (90 / 110));

      hurdle.style.left =
        percent + "%";

    }
  );

}


function jump() {

  if (state !== "running") {
    return;
  }

  jumping = true;

  clearTimeout(jumpTimer);

  player.classList.add("jumping");

  message.textContent = "JUMP!";

  jumpTimer =
    setTimeout(() => {
      jumping = false;
      player.classList.remove("jumping");
    }, JUMP_DURATION);

}


function checkPlayerHurdles() {

  while (
    nextHurdle < HURDLE_DISTANCES.length &&
    playerDistance >= HURDLE_DISTANCES[nextHurdle]
  ) {

    const hurdle =
      HURDLE_DISTANCES[nextHurdle];

    const jumped =
      jumping;

    if (jumped) {
      message.textContent = "CLEAR!";
    } else {
      playerDistance =
        Math.max(0, playerDistance - HURDLE_PENALTY);

      hurdleHits++;

      message.textContent = "HIT!";

      setRunnerPosition(
        player,
        playerDistance
      );
    }

    nextHurdle++;
  }

}


function updateCpuHurdles(previousDistance) {

  while (
    nextCpuHurdle < HURDLE_DISTANCES.length &&
    cpuDistance >= HURDLE_DISTANCES[nextCpuHurdle]
  ) {

    cpu.classList.add("jumping");

    setTimeout(() => {
      cpu.classList.remove("jumping");
    }, JUMP_DURATION);

    nextCpuHurdle++;
  }

}


/* =========================================
   CPU
   ========================================= */

function resetCPU() {

  cpuDistance =
    0;

  nextCpuHurdle =
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
      110,
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


  const previousDistance =
    cpuDistance;

  cpuDistance +=
    cpuSpeed *
    variation;

  cpuDistance =
    Math.min(
      110,
      cpuDistance
    );

  updateCpuHurdles(
    previousDistance
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
     SALTO
     ====================================== */

  if (button === "C") {

    jump();

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


  const previousDistance =
    playerDistance;

  playerDistance +=
    step;


  playerDistance =
    Math.max(
      0,
      Math.min(
        110,
        playerDistance
      )
    );


  checkPlayerHurdles();


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
   SUPABASE · COMPROBAR CONEXIÓN
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
   SUPABASE · GUARDAR SCORE
   ========================================= */

async function saveScore() {

  if (scoreSaved) {

    return;

  }

  const supabase =
    getSupabase();

  if (!supabase) {

    alert("SUPABASE NO ESTÁ DISPONIBLE");

    return;

  }

  const nickname =
    nicknameInput
      ? nicknameInput.value.trim().toUpperCase()
      : "";

  if (!nickname) {

    if (nicknameInput) {

      nicknameInput.focus();

    }

    return;

  }

  if (nickname.length > 12) {

    if (nicknameInput) {

      nicknameInput.value =
        nickname.slice(0, 12);

      nicknameInput.focus();

    }

    return;

  }

  if (
    !Number.isFinite(finalScore) ||
    !Number.isFinite(finalElapsed)
  ) {

    return;

  }

  if (saveScoreButton) {

    saveScoreButton.disabled =
      true;

    saveScoreButton.textContent =
      "SAVING...";

  }

  const { error } =
    await supabase
      .from("scores")
      .insert({
        nickname: nickname,
        score: Math.round(finalScore),
        time_ms: Math.round(finalElapsed),
        event: "110h"
      });

  if (error) {

    console.error(
      "Error guardando score:",
      error
    );

    if (saveScoreButton) {

      saveScoreButton.disabled =
        false;

      saveScoreButton.textContent =
        "SAVE SCORE";

    }

    alert(
      "NO SE HA PODIDO GUARDAR LA PUNTUACIÓN"
    );

    return;

  }

  scoreSaved =
    true;

  if (saveScoreButton) {

    saveScoreButton.textContent =
      "SAVED!";

  }

  await loadRanking();

  if (rankingPanel) {

    rankingPanel.classList.remove(
      "hidden"
    );

  }

}


/* =========================================
   SUPABASE · CARGAR TOP 10
   ========================================= */

async function loadRanking() {

  if (!rankingList) {

    return;

  }

  const supabase =
    getSupabase();

  if (!supabase) {

    rankingList.textContent =
      "RANKING UNAVAILABLE";

    return;

  }

  rankingList.textContent =
    "LOADING...";

  const { data, error } =
    await supabase
      .from("scores")
      .select("nickname,score,time_ms,created_at")
      .eq("event", "110h")
      .order("score", {
        ascending: false
      })
      .order("time_ms", {
        ascending: true
      })
      .order("created_at", {
        ascending: true
      })
      .limit(10);

  if (error) {

    console.error(
      "Error cargando ranking:",
      error
    );

    rankingList.textContent =
      "RANKING UNAVAILABLE";

    return;

  }

  rankingList.replaceChildren();

  if (!data || data.length === 0) {

    rankingList.textContent =
      "NO SCORES YET";

    return;

  }

  data.forEach(
    (entry, index) => {

      const row =
        document.createElement("div");

      row.className =
        "ranking-row";

      const rank =
        document.createElement("span");

      rank.className =
        "ranking-rank";

      rank.textContent =
        String(index + 1);

      const name =
        document.createElement("span");

      name.className =
        "ranking-name";

      name.textContent =
        String(entry.nickname || "---")
          .slice(0, 12);

      const score =
        document.createElement("span");

      score.className =
        "ranking-score";

      score.textContent =
        String(Number(entry.score) || 0)
          .padStart(5, "0");

      const time =
        document.createElement("span");

      time.className =
        "ranking-time";

      time.textContent =
        formatTime(Number(entry.time_ms) || 0);

      row.append(
        rank,
        name,
        score,
        time
      );

      rankingList.appendChild(
        row
      );

    }
  );

}


/* =========================================
   RANKING · ABRIR
   ========================================= */

function openRanking() {

  if (!rankingPanel) {

    return;

  }

  rankingPanel.classList.remove(
    "hidden"
  );

  loadRanking();

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
        15000 -

        hurdleHits *
        3500

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
     DATOS DEL RANKING
     ====================================== */

  finalScore =
    score;

  finalElapsed =
    elapsed;

  finalPlace =
    place;

  scoreSaved =
    false;


  /* ======================================
     COORDENADAS
     ====================================== */

  if (coordinates) {

    if (place === 1) {

      coordinates.classList.remove(
        "hidden"
      );

    } else {

      coordinates.classList.add(
        "hidden"
      );

    }

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
    .querySelector(".race-hud")
    .classList.add(
      "hidden"
    );


  if (nicknamePanel) {

    nicknamePanel.classList.remove(
      "hidden"
    );

  }


  if (rankingButton) {

    rankingButton.classList.remove(
      "hidden"
    );

  }


  if (saveScoreButton) {

    saveScoreButton.disabled =
      false;

    saveScoreButton.textContent =
      "SAVE SCORE";

  }


  result.classList.remove(
    "hidden"
  );


  /*
   * El TOP 10 se muestra directamente en la pantalla final.
   */

  loadRanking();

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

  hurdleHits =
    0;

  nextHurdle =
    0;

  jumping =
    false;

  clearTimeout(jumpTimer);

  player.classList.remove("jumping");


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


  finalScore =
    0;

  finalElapsed =
    0;

  finalPlace =
    2;

  scoreSaved =
    false;


  if (coordinates) {

    coordinates.classList.add(
      "hidden"
    );

  }


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


  if (saveScoreButton) {

    saveScoreButton.disabled =
      false;

    saveScoreButton.textContent =
      "SAVE SCORE";

  }


  setRunnerPosition(
    player,
    0
  );


  resetCPU();

  setHurdlePositions();

}


/* =========================================
   CONTROLES
   ========================================= */

/*
 * Utilizamos el controlador compartido cuando está
 * disponible. Si no se ha cargado correctamente,
 * usamos los botones directamente como respaldo.
 */

if (
  window.ArcadeController &&
  typeof window.ArcadeController.on === "function"
) {

  ArcadeController.on(
    "A",
    () => press("A")
  );


  ArcadeController.on(
    "B",
    () => press("B")
  );


  ArcadeController.on(
    "C",
    () => press("C")
  );

} else {

  const buttonA =
    $("buttonA");

  const buttonB =
    $("buttonB");

  const buttonC =
    $("buttonC");


  if (buttonA) {

    buttonA.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        press("A");

      },
      { passive: false }
    );

  }


  if (buttonB) {

    buttonB.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        press("B");

      },
      { passive: false }
    );

  }

  if (buttonC) {

    buttonC.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        press("C");

      },
      { passive: false }
    );

  }


  /*
   * Teclado como respaldo para PC.
   */

  document.addEventListener(
    "keydown",
    event => {

      const key =
        event.key.toLowerCase();

      if (key === "a") {

        press("A");

      }

      if (key === "b") {

        press("B");

      }

      if (key === "c" || event.code === "Space") {

        event.preventDefault();

        press("C");

      }

    }
  );

}


/* =========================================
   RANKING · BOTONES
   ========================================= */

if (saveScoreButton) {

  saveScoreButton.addEventListener(
    "click",
    saveScore
  );

}


if (rankingButton) {

  rankingButton.addEventListener(
    "click",
    openRanking
  );

}


if (closeRanking) {

  closeRanking.addEventListener(
    "click",
    closeRankingPanel
  );

}


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
