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
  $("ranking
