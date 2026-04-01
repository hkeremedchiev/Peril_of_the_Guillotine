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

// Stats and Resources
let stats = { prowess: 0, rhetoric: 0, subterfuge: 0 }; 
let pool = 12;
let playerResources = { health: 10, gold: 5, suspicion: 0 };

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
        imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch1_Sc10.png')`;
        imgLayer.style.opacity = 0.5;

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

        document.getElementById('btn-allocate').addEventListener('click', startSkillAllocation);
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

// --- CHARACTER CREATION ---
function startSkillAllocation() {
    const textLayer = document.getElementById('text-overlay');
    textLayer.style.opacity = 0;

    setTimeout(() => {
        textLayer.style.fontSize = "1.1rem"; 
        renderSkillUI();
        textLayer.style.opacity = 1;
    }, 1000);
}

function renderSkillUI() {
    const textLayer = document.getElementById('text-overlay');
    textLayer.innerHTML = `
        <div class="passport-container">
            <h2 style="text-align: center; margin-bottom: 5px; letter-spacing: 3px;">LAISSEZ-PASSER</h2>
            <p style="font-style: italic; text-align: center; font-size: 0.9rem; margin-bottom: 20px; color: #444;">
                Forge your identity, Citizen. The Committee is watching.
            </p>
            <div class="stat-row">
                <span>PROWESS</span> 
                <div class="stat-controls">
                    <button class="stat-btn" onclick="updateStat('prowess', -1)">-</button>
                    <span style="min-width: 25px; display: inline-block; text-align: center;">${stats.prowess}</span>
                    <button class="stat-btn" onclick="updateStat('prowess', 1)">+</button>
                </div>
            </div>
            <div class="stat-row"><span>RHETORIC</span><div class="stat-controls">
                <button class="stat-btn" onclick="updateStat('rhetoric', -1)">-</button>
                <span style="min-width: 25px;">${stats.rhetoric}</span>
                <button class="stat-btn" onclick="updateStat('rhetoric', 1)">+</button>
            </div></div>
            <div class="stat-row"><span>SUBTERFUGE</span><div class="stat-controls">
                <button class="stat-btn" onclick="updateStat('subterfuge', -1)">-</button>
                <span style="min-width: 25px;">${stats.subterfuge}</span>
                <button class="stat-btn" onclick="updateStat('subterfuge', 1)">+</button>
            </div></div>
            <div id="pool-display" style="text-align: center; margin-top: 15px; font-weight: bold; color: #8b0000;">
                Points Remaining: ${pool}
            </div>
            <button id="confirm-identity" class="game-btn" 
                style="width: 100%; margin-top: 20px; font-size: 1rem; ${pool > 0 ? 'opacity: 0.3;' : ''}" 
                ${pool > 0 ? 'disabled' : ''} onclick="renderSafehouse()">
                Confirm Identity
            </button>
        </div>
    `;
}

window.updateStat = function(stat, change) {
    if (change > 0 && pool > 0) { stats[stat]++; pool--; }
    else if (change < 0 && stats[stat] > 0) { stats[stat]--; pool++; }
    renderSkillUI();
};

// --- CHAPTER 1 ENGINE ---

// Skill Check Helper
function isTierAvailable(sceneType, lockSkill, tierType) {
    const threshold = (tierType === 'A') ? 7 : 3;
    if (tierType === 'C') return true;

    if (sceneType === "Open") {
        return (stats.prowess >= threshold || stats.rhetoric >= threshold || stats.subterfuge >= threshold);
    } else {
        return (stats[lockSkill.toLowerCase()] >= threshold);
    }
}

function renderSafehouse() {
    const textLayer = document.getElementById('text-overlay');
    const imgLayer = document.getElementById('image-layer');

    imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch1_Sc1.png')`;
    imgLayer.style.opacity = 1;

    const scene = {
        type: "Open",
        lockSkill: "", 
        intro: "The floorboards groaned under Monsieur’s boots—a sound that, only a month ago, he would never have noticed. Now, it sounded like a gunshot. He stood in the center of the attic, clutching a leather valise that contained the pathetic remains of a life once defined by gold leaf and silk. Outside, the rhythmic chant of the Marseillaise drifted up from the street, punctuated by the sharp crack of a patrol’s boots. The door behind him was barred, but the wood felt as thin as parchment. He had to move, or he had to vanish.",
        outro: "The attic door clicked shut behind him, leaving his old life in the dust. Monsieur descended the back stairs, blending into the early morning gray of the Rue Saint-Honoré, where the city was already waking up hungry.",
        tierA: "You wait for the precise moment the patrol’s rhythmic boots pass the alley entrance. You slip through the door and down the back stairs like a draft of cold air. You find a small stash of coins hidden in a loose floorboard near the exit. [+2 Gold]",
        tierB: "Panic spikes as a floorboard groans too loudly. You bolt for the stairs, catching your shoulder on the splintered doorframe in your rush. The pain is a sharp reminder that the city is no longer your home. [-1 Health]",
        tierC: "A young street urchin is sitting on the bottom step, watching the door. His eyes widen—he knows a 'Monsieur' when he sees one. You press two gold livres into his palm to buy his silence before he can whistle for the patrol. [-2 Gold]"
    };

    const activeA = isTierAvailable(scene.type, scene.lockSkill, 'A');
    const activeB = isTierAvailable(scene.type, scene.lockSkill, 'B');

    textLayer.style.bottom = "5%";
    textLayer.innerHTML = `
        <div id="scene-wrapper" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <div id="narrative-box" style="background: rgba(0,0,0,0.8); padding: 25px; border-radius: 5px; max-width: 900px; margin-bottom: 20px; border-left: 4px solid #8b0000; text-align: left;">
                <p id="main-text" style="font-size: 1.2rem; line-height: 1.5; font-style: normal; margin: 0;">${scene.intro}</p>
            </div>
            <div class="options-container">
                <div class="tier-card">
                    <h4>TIER A</h4>
                    <p>${scene.tierA}</p>
                    <button class="game-btn" ${!activeA ? 'disabled' : ''} onclick="resolveTier('A', \`${scene.outro}\`, {gold: 2})">SELECT</button>
                </div>
                <div class="tier-card">
                    <h4>TIER B</h4>
                    <p>${scene.tierB}</p>
                    <button class="game-btn" ${!activeB ? 'disabled' : ''} onclick="resolveTier('B', \`${scene.outro}\`, {health: -1})">SELECT</button>
                </div>
                <div class="tier-card">
                    <h4>TIER C</h4>
                    <p>${scene.tierC}</p>
                    <button class="game-btn" onclick="resolveTier('C', \`${scene.outro}\`, {gold: -2})">SELECT</button>
                </div>
            </div>
        </div>
    `;
    textLayer.style.opacity = 1;
}

window.resolveTier = function(tier, outro, effects) {
    if (effects.gold) playerResources.gold += effects.gold;
    if (effects.health) playerResources.health += effects.health;
    
    document.getElementById('main-text').innerText = outro;
    document.querySelector('.options-container').innerHTML = `
        <button class="game-btn" onclick="alert('Moving to Scene 2: The Bread Line...')">Leave the Safehouse</button>
    `;
};