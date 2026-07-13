// =======================
// Idioma
// =======================

let currentLanguage =
    localStorage.getItem("language") ||
    navigator.language.substring(0,2);

if(!["ca","es","en"].includes(currentLanguage))
    currentLanguage="en";

// Traducciones de la interfaz
const ui = {

    ca:{
        score:"Puntuació",
        goal:"Objectiu",
        retry:"Torna-ho a provar",
        copy:"Copiar coordenades",
        level:"🏆 REPTE SUPERAT",
        gameOver:"FI DE LA PARTIDA"
    },

    es:{
        score:"Puntuación",
        goal:"Objetivo",
        retry:"Vuelve a intentarlo",
        copy:"Copiar coordenadas",
        level:"🏆 NIVEL SUPERADO",
        gameOver:"GAME OVER"
    },

    en:{
        score:"Score",
        goal:"Goal",
        retry:"Try again",
        copy:"Copy coordinates",
        level:"🏆 LEVEL COMPLETE",
        gameOver:"GAME OVER"
    }

};

function setLanguage(lang){

    currentLanguage = lang;

    localStorage.setItem("language", lang);

    updateTexts();

}

// Función global para traducir textos
function t(key){
    return ui[currentLanguage][key] || key;
}

// =======================

const params = new URLSearchParams(window.location.search);

const challengeId = params.get("id") || "challenge01";

let challengeData = null;

let game = null;

// =======================

async function loadChallenge(){

    const response = await fetch(`challenges/${challengeId}.json`);

    challengeData = await response.json();

    updateTexts();

    startGame();

}

// =======================

function updateTexts(){

    if(!challengeData) return;

    // Título

    if(typeof challengeData.title === "object"){

        document.getElementById("challengeTitle").textContent =
            challengeData.title[currentLanguage];

    }else{

        document.getElementById("challengeTitle").textContent =
            challengeData.title;

    }

    // Instrucciones

    if(typeof challengeData.instructions === "object"){

        document.getElementById("instructions").textContent =
            challengeData.instructions[currentLanguage];

    }else{

        document.getElementById("instructions").textContent =
            challengeData.instructions;

    }

    // Objetivo

    document.getElementById("goal").textContent =
        challengeData.goal;

    // Traducciones de la interfaz

    document.getElementById("scoreLabel").textContent = t("score");
    document.getElementById("goalLabel").textContent = t("goal");
    document.getElementById("retryLabel").textContent = t("retry");
    document.getElementById("copyLabel").textContent = t("copy");
    document.getElementById("levelCompleteLabel").textContent = t("level");

}

// =======================

function startGame(){

    const canvas = document.getElementById("gameCanvas");

    switch(challengeData.game){

        case "snake":

            game = new SnakeGame(canvas, challengeData);

            window.game = game;

            game.start();

            break;

    }

}

loadChallenge();
