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
          nickname,

        score:
          Math.round(
            finalScore
          ),

        time_ms:
          Math.round(
            finalElapsed
          ),

        event:
          "100m"

      });


  if (error) {

    console.error(
      "Error guardando score:",
      error
    );


    if (button) {

      button.disabled =
        false;

      button.textContent =
        "SAVE SCORE";

    }


    alert(
      "NO SE HA PODIDO GUARDAR LA PUNTUACIÓN"
    );

    return;

  }


  scoreSaved =
    true;


  if (button) {

    button.textContent =
      "SAVED!";

  }


  /*
   * Actualizamos inmediatamente
   * el TOP 10.
   */

  await loadRanking();

}


/* =========================================
   CARGAR TOP 10
   ========================================= */

async function loadRanking() {

  /*
   * En la pantalla final utilizamos
   * finish-ranking-list.
   *
   * El ranking antiguo queda como
   * compatibilidad.
   */

  const list =
    $("finish-ranking-list") ||
    rankingList;


  if (!list) {

    return;

  }


  const supabase =
    getSupabase();


  if (!supabase) {

    list.textContent =
      "RANKING UNAVAILABLE";

    return;

  }


  list.innerHTML =
    `
      <div class="ranking-loading">
        LOADING...
      </div>
    `;


  const { data, error } =
    await supabase
      .from("scores")
      .select(
        "nickname,score,time_ms,created_at"
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
      "Error cargando ranking:",
      error
    );

    list.textContent =
      "RANKING UNAVAILABLE";

    return;

  }


  list.replaceChildren();


  if (
    !data ||
    data.length === 0
  ) {

    list.innerHTML =
      `
        <div class="ranking-empty">
          NO SCORES YET
        </div>
      `;

    return;

  }


  data.forEach(
    (
      entry,
      index
    ) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "ranking-row" +
        (
          index === 0
            ? " first-place"
            : ""
        );


      /* ===============================
         POSICIÓN
         =============================== */

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


      /* ===============================
         NOMBRE
         =============================== */

      const name =
        document.createElement(
          "span"
        );

      name.className =
        "rank-name";

      name.textContent =
        String(
          entry.nickname ||
          "---"
        )
          .slice(
            0,
            12
          );


      /* ===============================
         TIEMPO
         =============================== */

      const time =
        document.createElement(
          "span"
        );

      time.className =
        "rank-time";

      time.textContent =
        formatTime(
          Number(
            entry.time_ms
          ) || 0
        );


      /* ===============================
         SCORE
         =============================== */

      const score =
        document.createElement(
          "span"
        );

      score.className =
        "rank-score";

      score.textContent =
        String(
          Number(
            entry.score
          ) || 0
        );


      row.append(
        rank,
        name,
        time,
        score
      );


      list.appendChild(
        row
      );

    }
  );

}


/* =========================================
   RANKING ANTIGUO
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


function closeRankingPanel() {

  if (rankingPanel) {

    rankingPanel.classList.add(
      "hidden"
    );

  }

}


/* =========================================
   FINAL DE LA CARRERA
   ========================================= */

function finishRace() {

  if (
    state !== "running"
  ) {

    return;

  }


  state =
    "finished";


  const gameScreen =
    document.querySelector(
      ".game-screen"
    );


  if (gameScreen) {

    gameScreen.classList.add(
      "finished"
    );

  }


  clearInterval(
    timerInterval
  );

  clearInterval(
    cpuInterval
  );


  /* ======================================
     TIEMPO
     ====================================== */

  const elapsed =
    performance.now() -
    startTime;


  const time =
    formatTime(
      elapsed
    );


  if (timer) {

    timer.textContent =
      time;

  }


  /* ======================================
     CLASIFICACIÓN
     ====================================== */

  const place =
    playerDistance >= cpuDistance
      ? 1
      : 2;


  if (resultPosition) {

    resultPosition.textContent =
      place === 1
        ? "1ST PLACE"
        : "2ND PLACE";

  }


  if (positionEl) {

    positionEl.textContent =
      place === 1
        ? "1ST"
        : "2ND";

  }


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


  if (scoreEl) {

    scoreEl.textContent =
      "SCORE " +
      String(score)
        .padStart(
          5,
          "0"
        );

  }


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

  let coordinateText =
    "N 41° XX.XXX\nE 002° XX.XXX";


if (coordinates) {

  const value =
    coordinates.querySelector(
      ".coordinates-value"
    );

  if (value) {

    coordinateText =
      value.textContent.trim();

  }

}


  /* ======================================
     OCULTAR HUD
     ====================================== */

  if (controls) {

    controls.classList.add(
      "hidden"
    );

  }


  if (message) {

    message.classList.add(
      "hidden"
    );

  }


  const hud =
    document.querySelector(
      ".race-hud"
    );


  if (hud) {

    hud.classList.add(
      "hidden"
    );

  }


  /* ======================================
     PANTALLA FINAL
     ====================================== */

  result.innerHTML = `

    <div class="finish-screen">

      <!-- =================================
           IZQUIERDA
           ================================= -->

      <div class="finish-left">

        <div class="finish-title">
          FINISH!
        </div>

        <div class="finish-place">
          ${
            place === 1
              ? "1ST PLACE"
              : "2ND PLACE"
          }
        </div>


        <div class="finish-time-label">
          TIME
        </div>

        <div class="finish-time">
          ${time}
        </div>


        <div class="finish-score-label">
          SCORE
        </div>

        <div class="finish-score">
          SCORE ${
            String(score)
              .padStart(
                5,
                "0"
              )
          }
        </div>


      ${place === 1 ? `
        <div class="coordinates-title">
          COORDINATES
        </div>

        <div class="coordinates-value">
          ${escapeHTML(coordinateText).replace(/\n/g, "<br>")}
        </div>
      ` : ""}


        <!-- ==============================
             GUARDAR SCORE
             ============================== -->

        <div class="save-title">
          SAVE YOUR SCORE
        </div>


        <input
          id="finish-nickname"
          class="nickname-input"
          type="text"
          maxlength="12"
          placeholder="NICKNAME"
          autocomplete="off"
        >


        <!-- ÚNICO BOTÓN SAVE SCORE -->

        <button
          id="finish-save-score"
          class="save-score-button"
          type="button"
        >
          SAVE SCORE
        </button>


        <!-- RUN AGAIN -->

        <button
          id="finish-again"
          class="run-again-button"
          type="button"
        >
          RUN AGAIN
        </button>


        <!-- BACK -->

        <button
          id="finish-back-events"
          class="back-events-button"
          type="button"
        >
          BACK TO EVENTS
        </button>

      </div>


      <!-- =================================
           DERECHA · TOP 10
           ================================= -->

      <div class="finish-right">

        <div class="top10-header">

          <span class="laurel">
            ❮
          </span>

          <span class="top10-title">
            TOP 10
          </span>

          <span class="laurel">
            ❯
          </span>

        </div>


        <div class="ranking-table">

          <!-- CABECERA -->

          <div class="ranking-head">

            <span>
              #
            </span>

            <span>
              NICKNAME
            </span>

            <span>
              TIME
            </span>

            <span>
              SCORE
            </span>

          </div>


          <!-- LISTA -->

          <div id="finish-ranking-list">

            <div class="ranking-loading">
              LOADING...
            </div>

          </div>

        </div>

      </div>

    </div>

  `;


  /* ======================================
     MOSTRAR RESULTADO
     ====================================== */

  result.classList.remove(
    "hidden"
  );


  /* ======================================
     BOTÓN SAVE
     ====================================== */

  const finishSave =
    $("finish-save-score");


  if (finishSave) {

    finishSave.addEventListener(
      "click",
      saveScore
    );

  }


  /* ======================================
     ENTER EN NICKNAME
     ====================================== */

  const finishNickname =
    $("finish-nickname");


  if (finishNickname) {

    finishNickname.addEventListener(
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


  /* ======================================
     RUN AGAIN
     ====================================== */

  const finishAgain =
    $("finish-again");


  if (finishAgain) {

    finishAgain.addEventListener(
      "click",
      reset
    );

  }


  /* ======================================
     BACK TO EVENTS
     ====================================== */

  const finishBack =
    $("finish-back-events");


  if (finishBack) {

    finishBack.addEventListener(
      "click",
      () => {

        window.location.href =
          "index.html";

      }
    );

  }


  /* ======================================
     CARGAR TOP 10
     ====================================== */

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


  const gameScreen =
    document.querySelector(
      ".game-screen"
    );


  if (gameScreen) {

    gameScreen.classList.remove(
      "finished"
    );

  }


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


  if (timer) {

    timer.textContent =
      "00.00";

  }


  if (distanceEl) {

    distanceEl.textContent =
      "0 M";

  }


  if (positionEl) {

    positionEl.textContent =
      "2ND";

  }


  if (message) {

    message.textContent =
      "READY!";

    message.classList.remove(
      "hidden"
    );

  }


  const hud =
    document.querySelector(
      ".race-hud"
    );


  if (hud) {

    hud.classList.remove(
      "hidden"
    );

  }


  if (controls) {

    controls.classList.remove(
      "hidden"
    );

  }


  if (result) {

    result.classList.add(
      "hidden"
    );

  }


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

}


/* =========================================
   CONTROLES
   ========================================= */

/*
 * Utilizamos ArcadeController cuando
 * está disponible.
 */

if (
  window.ArcadeController &&
  typeof window.ArcadeController.on ===
    "function"
) {

  ArcadeController.on(
    "A",
    () => press("A")
  );


  ArcadeController.on(
    "B",
    () => press("B")
  );


} else {

  const buttonA =
    $("buttonA");

  const buttonB =
    $("buttonB");


  /* ======================================
     BOTÓN A
     ====================================== */

  if (buttonA) {

    buttonA.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        press("A");

      },
      {
        passive: false
      }
    );

  }


  /* ======================================
     BOTÓN B
     ====================================== */

  if (buttonB) {

    buttonB.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        press("B");

      },
      {
        passive: false
      }
    );

  }


  /* ======================================
     TECLADO PC
     ====================================== */

  document.addEventListener(
    "keydown",
    event => {

      const key =
        event.key.toLowerCase();


      if (
        key === "a"
      ) {

        press("A");

      }


      if (
        key === "b"
      ) {

        press("B");

      }

    }
  );

}


/* =========================================
   RANKING ANTIGUO
   ========================================= */

/*
 * Estos botones solamente se mantienen
 * por compatibilidad con el HTML anterior.
 *
 * La pantalla final NO utiliza estos
 * botones para guardar.
 */

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
   BOTÓN AGAIN ANTIGUO
   ========================================= */

if (again) {

  again.addEventListener(
    "click",
    reset
  );

}


/* =========================================
   INICIO
   ========================================= */

reset();
