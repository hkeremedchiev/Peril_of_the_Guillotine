const IMG_PATH = "Pictures/";

// --- GLOBAL STATE ---
let stats = { prowess: 0, rhetoric: 0, subterfuge: 0 }; 
let pool = 12;
let playerResources = { health: 10, gold: 5, suspicion: 0 };
let currentSceneIndex = 0;

// --- DATABASE: ADD ALL SCENES HERE ---
const allScenes = [
    {
        title: "The Safehouse",
        img: "Ch1_Sc1.png",
        type: "Open",
        lockSkill: "", 
        intro: "The floorboards groaned under Monsieur’s boots—a sound that, only a month ago, he would never have noticed. Now, it sounded like a gunshot. He stood in the center of the attic, clutching a leather valise that contained the pathetic remains of a life once defined by gold leaf and silk. Outside, the rhythmic chant of the Marseillaise drifted up from the street, punctuated by the sharp crack of a patrol’s boots. The door behind him was barred, but the wood felt as thin as parchment. He had to move, or he had to vanish.",
        outro: "The attic door clicked shut behind him, leaving his old life in the dust. Monsieur descended the back stairs, blending into the early morning gray of the Rue Saint-Honoré, where the city was already waking up hungry.",
        tierA: { text: "Slip through like a draft of cold air. Find hidden coins. [+2 Gold]", effect: {gold: 2} },
        tierB: { text: "Panic spikes. Bolt for the stairs and catch your shoulder. [-1 Health]", effect: {health: -1} },
        tierC: { text: "An urchin watches the door. Buy his silence with gold. [-2 Gold]", effect: {gold: -2} }
    },
    {
        title: "The Bread Line",
        img: "Ch1_Sc2.png",
        type: "Lock",
        lockSkill: "rhetoric", 
        intro: "Monsieur found himself swept into a queue of hollow-cheeked citizens waiting for a ration of gray, sawdust-heavy bread. Beside him, a woman with eyes like flint studied the softness of his hands. To remain silent was to be suspicious; to speak was to risk the wrong accent.",
        outro: "Chewing on the hard crust of his survival, Monsieur kept his chin tucked into his collar. He avoided the main thoroughfares until the massive shadow of the Porte Saint-Martin blocked his path.",
        tierA: { text: "Mutter a dark joke about the 'sawdust seasoning'. They pull you into the crowd. [+1 Gold]", effect: {gold: 1} },
        tierB: { text: "Drop a coin into the mud as a 'clumsy' accident to deflect her gaze. [-1 Gold]", effect: {gold: -1} },
        tierC: { text: "A Sergeant smells the 'Versailles' on you. Slide your last purse into his hand. [-3 Gold]", effect: {gold: -3} }
    }
];

const imgLayer = document.getElementById('image-layer');
const textLayer = document.getElementById('text-overlay');
const startBtn = document.getElementById('start-btn');
const continueBtn = document.getElementById('continue-btn');
const startContainer = document.getElementById('start-prompt-container'); 

window.onload = () => {
    imgLayer.style.backgroundImage = `url('${IMG_PATH}intro_blade.jpg')`;
    imgLayer.style.opacity = "0.4";
    if (localStorage.getItem('monsieur_save')) continueBtn.style.display = 'inline-block';
};

// --- SYSTEM FUNCTIONS ---
function updateStatusUI() {
    const bar = document.getElementById('status-bar');
    if (startContainer.style.display === 'none') bar.style.display = 'flex';
    document.getElementById('val-health').innerText = playerResources.health;
    document.getElementById('val-gold').innerText = playerResources.gold;
    document.getElementById('val-suspicion').innerText = playerResources.suspicion;
    document.getElementById('val-prowess').innerText = stats.prowess;
    document.getElementById('val-rhetoric').innerText = stats.rhetoric;
    document.getElementById('val-subterfuge').innerText = stats.subterfuge;
}

function saveGame() {
    const gameState = { stats, resources: playerResources, index: currentSceneIndex };
    localStorage.setItem('monsieur_save', JSON.stringify(gameState));
}

function loadGame() {
    const savedData = localStorage.getItem('monsieur_save');
    if (savedData) {
        const data = JSON.parse(savedData);
        // If data.index is undefined (old save), default to 0
        currentSceneIndex = (typeof data.index === 'number') ? data.index : 0;
        stats = data.stats;
        playerResources = data.resources;
        
        startContainer.style.display = 'none';
        renderCurrentScene();
    }
}

// --- ENGINE ---
function isTierAvailable(scene, tierType) {
    const threshold = (tierType === 'A') ? 7 : 3;
    if (tierType === 'C') return true;
    if (scene.type === "Open") {
        return (stats.prowess >= threshold || stats.rhetoric >= threshold || stats.subterfuge >= threshold);
    } else {
        return (stats[scene.lockSkill.toLowerCase()] >= threshold);
    }
}

function renderCurrentScene() {
    saveGame();
    updateStatusUI();
    const scene = allScenes[currentSceneIndex];
    
    imgLayer.style.backgroundImage = `url('${IMG_PATH}${scene.img}')`;
    imgLayer.style.opacity = 1;

    const activeA = isTierAvailable(scene, 'A');
    const activeB = isTierAvailable(scene, 'B');

    textLayer.innerHTML = `
        <div id="scene-wrapper" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div id="narrative-box">
                <p id="main-text" style="font-size: 1.2rem; font-style: normal;">${scene.intro}</p>
            </div>
            <div class="options-container">
                <div class="tier-card">
                    <h4>TIER A ${scene.type === 'Lock' ? '['+scene.lockSkill.toUpperCase()+' 7+]' : ''}</h4>
                    <p>${scene.tierA.text}</p>
                    <button class="game-btn" ${!activeA ? 'disabled' : ''} onclick="resolveUniversalTier('A')">SELECT</button>
                </div>
                <div class="tier-card">
                    <h4>TIER B ${scene.type === 'Lock' ? '['+scene.lockSkill.toUpperCase()+' 3+]' : ''}</h4>
                    <p>${scene.tierB.text}</p>
                    <button class="game-btn" ${!activeB ? 'disabled' : ''} onclick="resolveUniversalTier('B')">SELECT</button>
                </div>
                <div class="tier-card">
                    <h4>TIER C</h4>
                    <p>${scene.tierC.text}</p>
                    <button class="game-btn" onclick="resolveUniversalTier('C')">SELECT</button>
                </div>
            </div>
        </div>`;
    textLayer.style.opacity = 1;
}

window.resolveUniversalTier = function(tierLetter) {
    const scene = allScenes[currentSceneIndex];
    const choice = scene[`tier${tierLetter}`];

    if (choice.effect.gold) playerResources.gold += choice.effect.gold;
    if (choice.effect.health) playerResources.health += choice.effect.health;
    if (choice.effect.suspicion) playerResources.suspicion += choice.effect.suspicion;

    updateStatusUI();
    document.getElementById('main-text').innerText = scene.outro;

    const nextTitle = allScenes[currentSceneIndex + 1] ? allScenes[currentSceneIndex + 1].title : "The End";
    document.querySelector('.options-container').innerHTML = `
        <button class="game-btn" onclick="advanceToNext()">Proceed to ${nextTitle}</button>
    `;
};

window.advanceToNext = function() {
    currentSceneIndex++;
    if (currentSceneIndex < allScenes.length) renderCurrentScene();
    else alert("You have escaped Paris... for now.");
};

// --- INITIAL NAVIGATION ---
startBtn.addEventListener('click', () => {
    startContainer.style.display = 'none';
    renderCurrentScene(); 
});
continueBtn.addEventListener('click', loadGame);

// Character creation and stat update functions remain same, 
// just ensure they call renderCurrentScene() at the end of Confirm Identity.
window.updateStat = (stat, change) => {
    if (change > 0 && pool > 0) { stats[stat]++; pool--; }
    else if (change < 0 && stats[stat] > 0) { stats[stat]--; pool++; }
    renderSkillUI(); // You'll need to keep your previous renderSkillUI function!
};