const params = new URLSearchParams(window.location.search);

const challengeId = params.get("id") || "challenge01";

let challengeData = null;

// La hacemos global para poder acceder desde el botón
let game = null;

async function loadChallenge() {

    const response = await fetch(`challenges/${challengeId}.json`);

    challengeData = await response.json();

    document.getElementById("challengeTitle").textContent =
        challengeData.title;

    document.getElementById("instructions").textContent =
        challengeData.instructions;

    document.getElementById("goal").textContent =
        challengeData.goal;

    startGame();

}

function startGame() {

    const canvas = document.getElementById("gameCanvas");

    switch (challengeData.game) {

        case "snake":

            game = new SnakeGame(canvas, challengeData);

            // Hacerla accesible desde el botón HTML
            window.game = game;

            game.start();

            break;

    }

}

loadChallenge();
