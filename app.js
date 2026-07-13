// =======================
// Idioma
// =======================

let currentLanguage =
    localStorage.getItem("language") ||
    navigator.language.substring(0,2);

if(!["ca","es","en"].includes(currentLanguage))
    currentLanguage="en";

function setLanguage(lang){

    currentLanguage=lang;

    localStorage.setItem("language",lang);

    updateTexts();

}

// =======================

const params=new URLSearchParams(window.location.search);

const challengeId=params.get("id") || "challenge01";

let challengeData=null;

let game=null;

// =======================

async function loadChallenge(){

    const response=await fetch(`challenges/${challengeId}.json`);

    challengeData=await response.json();

    updateTexts();

    startGame();

}

// =======================

function updateTexts(){

    if(!challengeData) return;

    // Título

    if(typeof challengeData.title==="object"){

        document.getElementById("challengeTitle").textContent=
            challengeData.title[currentLanguage];

    }else{

        document.getElementById("challengeTitle").textContent=
            challengeData.title;

    }

    // Instrucciones

    if(typeof challengeData.instructions==="object"){

        document.getElementById("instructions").textContent=
            challengeData.instructions[currentLanguage];

    }else{

        document.getElementById("instructions").textContent=
            challengeData.instructions;

    }

    // Objetivo

    document.getElementById("goal").textContent=
        challengeData.goal;

}

// =======================

function startGame(){

    const canvas=document.getElementById("gameCanvas");

    switch(challengeData.game){

        case "snake":

            game=new SnakeGame(canvas,challengeData);

            window.game=game;

            game.start();

            break;

    }

}

loadChallenge();
