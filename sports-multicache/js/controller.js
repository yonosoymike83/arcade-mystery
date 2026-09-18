/* =========================================================
   OLYMPIA 8-BIT · ARCADE CONTROLLER
   Controlador compartido para los juegos
   ========================================================= */


/* =========================================================
   EVENTOS
   ========================================================= */

const listeners = {
  A: [],
  B: [],
  C: []
};


/* =========================================================
   REGISTRAR EVENTO
   ========================================================= */

function on(button, callback) {

  if (!listeners[button]) {
    return;
  }

  listeners[button].push(callback);
}


/* =========================================================
   LANZAR EVENTO
   ========================================================= */

function emit(button, event) {

  if (!listeners[button]) {
    return;
  }

  listeners[button].forEach(
    callback => callback(event)
  );

}


/* =========================================================
   VINCULAR BOTÓN DE PANTALLA
   ========================================================= */

function bindButton(elementId, button) {

  const element =
    document.getElementById(elementId);

  if (!element) {
    return;
  }


  element.addEventListener(
    "pointerdown",
    event => {

      event.preventDefault();

      emit(
        button,
        event
      );

    },
    {
      passive: false
    }
  );

}


/* =========================================================
   BOTONES A / B / C
   ========================================================= */

bindButton(
  "buttonA",
  "A"
);

bindButton(
  "buttonB",
  "B"
);

bindButton(
  "buttonC",
  "C"
);


/* =========================================================
   TECLADO
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    const key =
      event.key.toLowerCase();


    /* -------------------------
       TECLA A
       ------------------------- */

    if (key === "a") {

      emit(
        "A",
        event
      );

    }


    /* -------------------------
       TECLA B
       ------------------------- */

    if (key === "b") {

      emit(
        "B",
        event
      );

    }


    /* -------------------------
       TECLA C / ESPACIO
       ------------------------- */

    if (
      key === "c" ||
      event.code === "Space"
    ) {

      emit(
        "C",
        event
      );

    }

  }
);


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.ArcadeController = {

  on

};
