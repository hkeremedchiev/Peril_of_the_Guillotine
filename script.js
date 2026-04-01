const IMG_PATH = "Pictures/";

const introData = [
    { img: 'king_is_dead.jpg', text: "The King is dead.", duration: 5500 },
    { img: 'ruined_city.jpg', text: "Paris has fallen into the hands of the mob.", duration: 5000 },
    { img: 'the_warrant.jpg', text: "And your name is on the list.", duration: 6000 }
];

let currentStep = 0;
const imgLayer = document.getElementById('image-layer');
const textLayer = document.getElementById('text-overlay');
const startBtn = document.getElementById('start-btn');
const startContainer = document.getElementById('start-prompt-container'); 

// Set initial image
imgLayer.style.backgroundImage = `url('${IMG_PATH}intro_blade.jpg')`;
imgLayer.style.opacity = "0.4"; 

function playSequence() {
    if (currentStep >= introData.length) {
        renderWorldOfTerror();
        return;
    }

    const step = introData[currentStep];
    imgLayer.style.opacity = 0;
    textLayer.style.opacity = 0;

    setTimeout(() => {
        imgLayer.style.backgroundImage = `url('${IMG_PATH}${step.img}')`;
        imgLayer.style.opacity = 1;
        
        setTimeout(() => {
            textLayer.innerText = step.text;
            textLayer.style.opacity = 1;
        }, 1200);

        currentStep++;
        setTimeout(playSequence, step.duration);
    }, 1000);
}

function renderWorldOfTerror() {
    imgLayer.style.opacity = 0;
    textLayer.style.opacity = 0;

    setTimeout(() => {
        // FIXED: Added IMG_PATH here so the background isn't white
        imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch1_Sc10.png')`;
        imgLayer.style.opacity = 0.5;

        // Apply style changes for the block text
        textLayer.style.fontSize = "1.3rem"; 
        textLayer.style.fontStyle = "normal";
        
        textLayer.innerHTML = `
        <div class="intermission-content">
            <p>The year of our Lord 1793 has no room for Lords.</p>
            <p>You are Monsieur. Your aristocratic titles are ash. You have one night to vanish, or to die.</p>
            <button id="btn-allocate" class="game-btn">Allocate Skills</button>
        </div>
        `;
        textLayer.style.opacity = 1;

        document.getElementById('btn-allocate').addEventListener('click', () => {
            alert("Skill system initializing...");
        });
    }, 2000);
}

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startContainer.style.transition = 'opacity 0.8s ease';
    startContainer.style.opacity = '0';
    setTimeout(() => {
        startContainer.style.display = 'none';
        playSequence();
    }, 800);
});