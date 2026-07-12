const params = new URLSearchParams(window.location.search);

const challengeId = params.get("id") || "challenge01";

let challengeData = null;

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

            const snake = new SnakeGame(canvas, challengeData);

            snake.start();

            break;

    }

}

loadChallenge();
