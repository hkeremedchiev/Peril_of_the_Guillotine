const IMG_PATH = "Pictures/";

// --- GLOBAL STATE ---
let stats = { prowess: 0, rhetoric: 0, subterfuge: 0 }; 
let pool = 12;
let playerResources = { health: 10, gold: 5, suspicion: 0 };
let currentStep = 0;

const introData = [
    { img: 'king_is_dead.jpg', text: "The King is dead.", duration: 5500 },
    { img: 'ruined_city.jpg', text: "Paris has fallen into the hands of the mob.", duration: 5000 },
    { img: 'the_warrant.jpg', text: "And your name is on the list.", duration: 6000 }
];

const imgLayer = document.getElementById('image-layer');
const textLayer = document.getElementById('text-overlay');
const startBtn = document.getElementById('start-btn');
const continueBtn = document.getElementById('continue-btn');
const startContainer = document.getElementById('start-prompt-container'); 

// --- INITIALIZATION ---
window.onload = () => {
    imgLayer.style.backgroundImage = `url('${IMG_PATH}intro_blade.jpg')`;
    imgLayer.style.opacity = "0.4";
    
    // Show continue button only if a save exists
    if (localStorage.getItem('monsieur_save')) {
        continueBtn.style.display = 'inline-block';
    }
};

// --- SAVE / LOAD SYSTEM ---
function saveGame(sceneFunctionName) {
    const gameState = {
        stats: stats,
        resources: playerResources,
        currentScene: sceneFunctionName
    };
    localStorage.setItem('monsieur_save', JSON.stringify(gameState));
    console.log("Progress Saved at: " + sceneFunctionName);
}

function loadGame() {
    const savedData = localStorage.getItem('monsieur_save');
    if (savedData) {
        const gameState = JSON.parse(savedData);
        stats = gameState.stats;
        playerResources = gameState.resources;
        
        startContainer.style.display = 'none';
        // Execute the function name stored in the save
        window[gameState.currentScene](); 
    }
}

// --- BUTTON LISTENERS ---
startBtn.addEventListener('click', () => {
    startContainer.style.opacity = '0';
    setTimeout(() => {
        startContainer.style.display = 'none';
        playSequence();
    }, 800);
});

continueBtn.addEventListener('click', loadGame);

// --- CORE ENGINE ---
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
    setTimeout(() => {
        imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch1_Sc10.png')`;
        imgLayer.style.opacity = 0.5;
        textLayer.style.fontSize = "1.3rem"; 
        textLayer.innerHTML = `
        <div class="intermission-content">
            <p>The year 1793 has no room for Lords.</p>
            <p>You are Monsieur. Your titles are ash. One night to vanish, or to die.</p>
            <button id="btn-allocate" class="game-btn">Allocate Skills</button>
        </div>`;
        textLayer.style.opacity = 1;
        document.getElementById('btn-allocate').addEventListener('click', startSkillAllocation);
    }, 2000);
}

// --- CHARACTER CREATION ---
function startSkillAllocation() {
    textLayer.style.opacity = 0;
    setTimeout(() => {
        textLayer.style.fontSize = "1.1rem"; 
        renderSkillUI();
        textLayer.style.opacity = 1;
    }, 1000);
}

function renderSkillUI() {
    textLayer.innerHTML = `
        <div class="passport-container">
            <h2 style="text-align: center;">LAISSEZ-PASSER</h2>
            <div class="stat-row"><span>PROWESS</span> <div class="stat-controls">
                <button class="stat-btn" onclick="updateStat('prowess', -1)">-</button>
                <span>${stats.prowess}</span>
                <button class="stat-btn" onclick="updateStat('prowess', 1)">+</button>
            </div></div>
            <div class="stat-row"><span>RHETORIC</span> <div class="stat-controls">
                <button class="stat-btn" onclick="updateStat('rhetoric', -1)">-</button>
                <span>${stats.rhetoric}</span>
                <button class="stat-btn" onclick="updateStat('rhetoric', 1)">+</button>
            </div></div>
            <div class="stat-row"><span>SUBTERFUGE</span> <div class="stat-controls">
                <button class="stat-btn" onclick="updateStat('subterfuge', -1)">-</button>
                <span>${stats.subterfuge}</span>
                <button class="stat-btn" onclick="updateStat('subterfuge', 1)">+</button>
            </div></div>
            <p style="text-align: center;">Points: ${pool}</p>
            <button class="game-btn" style="width: 100%; ${pool > 0 ? 'opacity: 0.3;' : ''}" 
                ${pool > 0 ? 'disabled' : ''} onclick="renderSafehouse()">Confirm Identity</button>
        </div>`;
}

window.updateStat = (stat, change) => {
    if (change > 0 && pool > 0) { stats[stat]++; pool--; }
    else if (change < 0 && stats[stat] > 0) { stats[stat]--; pool++; }
    renderSkillUI();
};

// --- SCENE 1: THE SAFEHOUSE ---
function isTierAvailable(sceneType, lockSkill, tierType) {
    const threshold = (tierType === 'A') ? 7 : 3;
    if (tierType === 'C') return true;
    if (sceneType === "Open") {
        return (stats.prowess >= threshold || stats.rhetoric >= threshold || stats.subterfuge >= threshold);
    } else {
        return (stats[lockSkill.toLowerCase()] >= threshold);
    }
}

window.renderSafehouse = function() {
    // Save here so 'Continue' brings you back to the start of this scene
    saveGame('renderSafehouse');

    imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch1_Sc1.png')`;
    imgLayer.style.opacity = 1;

    const scene = {
        type: "Open",
        lockSkill: "", 
        intro: "The floorboards groaned under Monsieur’s boots...",
        outro: "The attic door clicked shut behind him...",
        tierA: "Slip through like a draft of cold air. [+2 Gold]",
        tierB: "Panic spikes. Catch your shoulder. [-1 Health]",
        tierC: "Pay the urchin for silence. [-2 Gold]"
    };

    const activeA = isTierAvailable(scene.type, scene.lockSkill, 'A');
    const activeB = isTierAvailable(scene.type, scene.lockSkill, 'B');

    textLayer.innerHTML = `
        <div id="scene-wrapper" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div id="narrative-box" style="background: rgba(0,0,0,0.8); padding: 25px; max-width: 900px; border-left: 4px solid #8b0000; text-align: left;">
                <p id="main-text" style="font-size: 1.2rem; font-style: normal;">${scene.intro}</p>
            </div>
            <div class="options-container">
                <div class="tier-card"><h4>TIER A</h4><p>${scene.tierA}</p>
                    <button class="game-btn" ${!activeA ? 'disabled' : ''} onclick="resolveTier('A', \`${scene.outro}\`, {gold: 2})">SELECT</button>
                </div>
                <div class="tier-card"><h4>TIER B</h4><p>${scene.tierB}</p>
                    <button class="game-btn" ${!activeB ? 'disabled' : ''} onclick="resolveTier('B', \`${scene.outro}\`, {health: -1})">SELECT</button>
                </div>
                <div class="tier-card"><h4>TIER C</h4><p>${scene.tierC}</p>
                    <button class="game-btn" onclick="resolveTier('C', \`${scene.outro}\`, {gold: -2})">SELECT</button>
                </div>
            </div>
        </div>`;
    textLayer.style.opacity = 1;
};

window.resolveTier = function(tier, outro, effects) {
    if (effects.gold) playerResources.gold += effects.gold;
    if (effects.health) playerResources.health += effects.health;
    
    document.getElementById('main-text').innerText = outro;
    document.querySelector('.options-container').innerHTML = `
        <button class="game-btn" onclick="alert('Proceeding...')">Leave the Safehouse</button>
    `;
};