/* =========================================
   100 METROS
   ========================================= */


/* =========================================
   ELEMENTOS
   ========================================= */

const $ =
  id => document.getElementById(id);


const timer =
  $("timer");

const dist =
  $("distance");

const runner =
  $("runner");

const msg =
  $("message");

const result =
  $("result");

const finalTime =
  $("final-time");

const scoreEl =
  $("score");

const controls =
  $("controls");

const again =
  $("again");

const fill =
  $("pace-fill");

const paceText =
  $("pace-text");


/* =========================================
   ESTADO
   ========================================= */

let state =
  "ready";

let last =
  null;

let start =
  0;

let lastPress =
  0;

let distance =
  0;

let good =
  0;

let total =
  0;

let intervalId;


/* =========================================
   AJUSTES DEL RITMO
   ========================================= */

const OPT_MIN =
  110;

const OPT_MAX =
  210;

const TOO_FAST =
  65;

const STEP =
  1.85;


/* =========================================
   FORMATO DEL TIEMPO
   ========================================= */

function fmt(ms) {

  return (
    ms / 1000
  )
    .toFixed(2)
    .padStart(5, "0");

}


/* =========================================
   RESET
   ========================================= */

function reset() {

  state =
    "ready";

  last =
    null;

  start =
    0;

  lastPress =
    0;

  distance =
    0;

  good =
    0;

  total =
    0;


  clearInterval(
    intervalId
  );


  timer.textContent =
    "00.00";

  dist.textContent =
    "0 M";


  runner.style.left =
    "3%";


  msg.textContent =
    "READY?";


  result.classList.add(
    "hidden"
  );


  controls.classList.remove(
    "hidden"
  );


  fill.style.width =
    "0%";


  paceText.textContent =
    "PRESS A TO START";

}


/* =========================================
   FINAL DE LA CARRERA
   ========================================= */

function finish() {

  state =
    "finished";


  clearInterval(
    intervalId
  );


  const ms =
    performance.now() -
    start;


  timer.textContent =
    fmt(ms);


  finalTime.textContent =
    fmt(ms);


  const score =
    Math.max(
      0,

      Math.round(

        100000 -

        (ms / 1000) *
        7000 +

        good * 100

      )
    );


  scoreEl.textContent =
    "SCORE " +

    String(score)
      .padStart(5, "0");


  msg.textContent =
    "FINISH!";


  controls.classList.add(
    "hidden"
  );


  result.classList.remove(
    "hidden"
  );


  paceText.textContent =
    "RHYTHM " +

    Math.round(

      good /
      Math.max(1, total) *
      100

    ) +

    "%";

}


/* =========================================
   PULSACIÓN A / B
   ========================================= */

function press(button) {


  /*
   * Si ya hemos terminado,
   * no hacemos nada.
   */

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


    /*
     * La carrera siempre empieza
     * pulsando A.
     */

    if (
      button !== "A"
    ) {

      msg.textContent =
        "START WITH A!";

      return;

    }


    state =
      "running";


    start =
      performance.now();


    lastPress =
      start;


    last =
      "A";


    msg.textContent =
      "RUN!";


    paceText.textContent =
      "ALTERNATE A / B";


    intervalId =
      setInterval(
        () => {

          timer.textContent =
            fmt(
              performance.now() -
              start
            );

        },
        20
      );


    return;

  }


  /*
   * NO SE PUEDE PULSAR
   * DOS VECES EL MISMO BOTÓN
   */

  if (
    button === last
  ) {

    msg.textContent =
      "ALTERNATE!";

    return;

  }


  /*
   * CALCULAR INTERVALO
   */

  const now =
    performance.now();


  const dt =
    now -
    lastPress;


  lastPress =
    now;


  last =
    button;


  total++;


  /*
   * DEMASIADO RÁPIDO
   */

  if (
    dt < TOO_FAST
  ) {

    distance =
      Math.max(
        0,
        distance - 0.8
      );


    msg.textContent =
      "TOO FAST!";


    paceText.textContent =
      "KEEP YOUR RHYTHM";

  }


  /*
   * RITMO PERFECTO
   */

  else if (
    dt >= OPT_MIN &&
    dt <= OPT_MAX
  ) {

    distance +=
      STEP;


    good++;


    msg.textContent =
      "GOOD!";


    paceText.textContent =
      "PERFECT PACE";

  }


  /*
   * RITMO INCORRECTO
   */

  else {

    distance +=
      STEP * 0.72;


    msg.textContent =

      dt < OPT_MIN
        ? "SLOW DOWN!"
        : "FASTER!";


    paceText.textContent =
      "FIND THE RHYTHM";

  }


  /*
   * BARRA DE RITMO
   */

  fill.style.width =

    Math.min(
      100,

      good /
      Math.max(1, total) *
      100

    ) + "%";


  /*
   * POSICIÓN DEL CORREDOR
   */

  runner.style.left =

    Math.min(

      92,

      3 +
      distance / 100 *
      89

    ) + "%";


  /*
   * DISTANCIA
   */

  dist.textContent =

    Math.min(

      100,

      Math.round(distance)

    ) + " M";


  /*
   * META
   */

  if (
    distance >= 100
  ) {

    finish();

  }

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
   INICIALIZAR
   ========================================= */

reset();
