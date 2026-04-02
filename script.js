const IMG_PATH = "Pictures/";
const SPEECH_PATH = "Speach/"; 

const introAudio = new Audio(); 
// --- GLOBAL STATE ---
let stats = { prowess: 0, rhetoric: 0, subterfuge: 0 }; 
let pool = 12;
let playerResources = { health: 10, gold: 5, suspicion: 0 };
let currentSceneIndex = 0;
let hasMap = false; // Maître Valmont’s Map

// Difficulty thresholds per Chapter
const thresholds = {
    1: { A: 7, B: 3 }, // Paris
    2: { A: 8, B: 4 }, // The Wilds
    3: { A: 9, B: 5 }  // The Coast
};
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

// --- INTRO SEQUENCE DATA ---
const introSteps = [
    { 
        img: "king_is_dead.jpg", 
        text: "Paris... 1793. The King is dead.", 
        audio: ["intro_1.mp3", "intro_2.mp3"] 
    },
    { 
        img: "ruined_city.jpg", 
        text: "Paris has fallen into the hands of the mob.", 
        audio: ["intro_3.mp3"] 
    },
    { 
        img: "the_warrant.jpg", 
        text: "And your name... is on the list.", 
        audio: ["intro_4.mp3"] 
    }
];
let currentIntroStep = 0;

function startCinematicIntro() {
    textLayer.style.opacity = "0";
    
    if (currentIntroStep < introSteps.length) {
        const step = introSteps[currentIntroStep];
        
        // 1. Swap Image & Text
        imgLayer.style.backgroundImage = `url('${IMG_PATH}${step.img}')`;
        imgLayer.style.opacity = "1";
        textLayer.innerHTML = `
            <div id="narrative-box" style="text-align: center; border: none; background: none;">
                <p style="font-size: 2rem; letter-spacing: 4px; font-style: italic;">${step.text}</p>
            </div>
        `;

        // 2. Fade text in, then start audio
        textLayer.style.opacity = "1";

        playStepAudio(step.audio, () => {
            // Wait 1 second after audio finishes before moving to next slide
            setTimeout(() => {
                currentIntroStep++;
                startCinematicIntro();
            }, 1000);
        });
    } else {
        showDetailedNarrative();
    }
}

function playStepAudio(files, callback) {
    let fileIndex = 0;

    function playNext() {
        if (fileIndex < files.length) {
            console.log("Playing speech:", files[fileIndex]); // Debugging
            introAudio.src = `${SPEECH_PATH}${files[fileIndex]}`;
            
            // Catch play errors (like browser block)
            introAudio.play().catch(e => console.error("Audio playback blocked:", e));
            
            introAudio.onended = () => {
                fileIndex++;
                playNext();
            };
        } else {
            callback(); 
        }
    }
    playNext();
}

function showDetailedNarrative() {
    textLayer.style.opacity = "0";
    imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch1_Sc10.png')`; // Masterpiece BG
    imgLayer.style.opacity = "0.3";

    setTimeout(() => {
        textLayer.innerHTML = `
            <div id="narrative-box">
                <h2 style="color: #8b0000; border-bottom: 1px solid #8b0000; padding-bottom: 10px;">The Republic of Virtue</h2>
                <p>The year is 1793. The Revolution has curdled into <strong>The Terror</strong>. The King is dead, the Church is dismantled, and a new calendar has wiped away the past.</p>
                <p>To the <em>Sans-culottes</em> patrolling the pikes, Monsieur’s clean fingernails and command of Latin are proof of aristocratic plotting. Under the 'Law of Suspects,' one is arrested not for what they have done, but for who they are.</p>
                <p><strong>He is known simply as 'Monsieur.'</strong> A former notary of the King's court, he is now a ghost in his own city. He has one night to navigate the barricades of Paris and vanish into the Picardy mud before the Revolutionary Tribunal knocks on his door.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <button class="game-btn" onclick="showCharacterCreation()">Assume the Identity of Monsieur</button>
                </div>
            </div>
        `;
        textLayer.style.opacity = "1";
    }, 1000);
}

// Update the listener
startBtn.addEventListener('click', () => {
    startContainer.style.display = 'none';
    startCinematicIntro(); // Launch the sequence
});

function showCharacterCreation() {
    renderSkillUI(); // This function will handle the point-buy screen
}

function renderSkillUI() {
    textLayer.innerHTML = `
        <div id="narrative-box" style="text-align: center;">
            <h3>DISTRIBUTE YOUR INFLUENCE (Points: ${pool})</h3>
            <div style="margin: 20px 0;">
                <p class="p-color">PROWESS: ${stats.prowess} 
                    <button onclick="updateStat('prowess', 1)">+</button>
                    <button onclick="updateStat('prowess', -1)">-</button>
                </p>
                <p class="r-color">RHETORIC: ${stats.rhetoric} 
                    <button onclick="updateStat('rhetoric', 1)">+</button>
                    <button onclick="updateStat('rhetoric', -1)">-</button>
                </p>
                <p class="s-color">SUBTERFUGE: ${stats.subterfuge} 
                    <button onclick="updateStat('subterfuge', 1)">+</button>
                    <button onclick="updateStat('subterfuge', -1)">-</button>
                </p>
            </div>
            <button class="game-btn" ${pool > 0 ? 'disabled' : ''} onclick="confirmIdentity()">Confirm Identity</button>
            <p style="font-size: 0.8rem;">(All 12 points must be spent to proceed)</p>
        </div>
    `;
}

function confirmIdentity() {
    // Now that stats are set, show the first intermission or jump to Scene 1
    renderCurrentScene();
}

// --- ENGINE ---
function getChapter() {
    if (currentSceneIndex < 10) return 1;
    if (currentSceneIndex < 20) return 2;
    return 3;
}

function isTierAvailable(scene, tierType) {
    if (tierType === 'C') return true;

    const chapter = getChapter();
    let target = (tierType === 'A') ? thresholds[chapter].A : thresholds[chapter].B;

    // APPLY MAP BONUS (Scenes 11, 16, 20)
    // Note: Use scene ID or index. Scene 11 is index 10, 16 is index 15, 20 is index 19.
    const mapScenes = [10, 15, 19]; 
    if (hasMap && mapScenes.includes(currentSceneIndex)) {
        target -= 1; // Effectively a +1 bonus to the player
    }

    if (scene.type === "Open") {
        return (stats.prowess >= target || stats.rhetoric >= target || stats.subterfuge >= target);
    } else {
        return (stats[scene.lockSkill.toLowerCase()] >= target);
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
    let effect = choice.effect;

    // 1. Handle Suspicion (Can be negative)
    if (effect.suspicion) playerResources.suspicion += effect.suspicion;

    // 2. Handle Gold & The -1 Health Debt Cap
    if (effect.gold) {
        if (effect.gold < 0) {
            let cost = Math.abs(effect.gold);
            if (playerResources.gold >= cost) {
                playerResources.gold -= cost;
            } else {
                playerResources.gold = 0;
                playerResources.health -= 1; // Capped debt penalty
            }
        } else {
            playerResources.gold += effect.gold;
        }
    }

    // 3. Handle Direct Health
    if (effect.health) playerResources.health += effect.health;

    // 4. LOGIC: Capture the Notary Map (Chapter 1, Scene 4, Tier A)
    // Scene 4 is index 3
    if (currentSceneIndex === 3 && tierLetter === 'A') {
        hasMap = true;
    }

    updateStatusUI();
    checkGameOver(); // Add this to stop the game if health <= 0 or sus >= 100

    document.getElementById('main-text').innerText = scene.outro;
    const nextTitle = allScenes[currentSceneIndex + 1] ? allScenes[currentSceneIndex + 1].title : "The End";
    
    // Check if next step is an Intermission
    let nextAction = (currentSceneIndex === 9 || currentSceneIndex === 19) ? "showIntermission()" : "advanceToNext()";

    document.querySelector('.options-container').innerHTML = `
        <button class="game-btn" onclick="${nextAction}">Proceed</button>
    `;
};

window.advanceToNext = function() {
    currentSceneIndex++;
    if (currentSceneIndex < allScenes.length) renderCurrentScene();
    else alert("You have escaped Paris... for now.");
};

// --- INITIAL NAVIGATION ---
startBtn.addEventListener('click', () => {
    startContainer.style.display = 'none'; // Hide menu
    currentIntroStep = 0; // Reset step
    startCinematicIntro(); // Start sequence
});

continueBtn.addEventListener('click', loadGame);


function checkGameOver() {
    if (playerResources.health <= 0 || playerResources.suspicion >= 100) {
        imgLayer.style.filter = "grayscale(1) brightness(0.5)";
        textLayer.innerHTML = `
            <div id="narrative-box">
                <h2>THE BLADE FALLS</h2>
                <p>${playerResources.health <= 0 ? "Exhaustion claimed Monsieur before the border." : "The Committee of Public Safety has found him."}</p>
                <button class="game-btn" onclick="location.reload()">Return to Paris</button>
            </div>
        `;
        return true;
    }
    return false;
}

// Character creation and stat update functions remain same, 
// just ensure they call renderCurrentScene() at the end of Confirm Identity.
window.updateStat = (stat, change) => {
    if (change > 0 && pool > 0) { stats[stat]++; pool--; }
    else if (change < 0 && stats[stat] > 0) { stats[stat]--; pool++; }
    renderSkillUI(); // You'll need to keep your previous renderSkillUI function!
};


window.showIntermission = function() {
    intermissionPoints = 3;
    playerResources.health = Math.min(10, playerResources.health + 4);
    playerResources.suspicion = Math.max(-50, playerResources.suspicion - 20);
    
    renderIntermissionUI();
};

function renderIntermissionUI() {
    updateStatusUI();
    
    // Placeholder for the new Chapter 2 transition image
    imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch2_Intermission_New.png')`; 
    imgLayer.style.opacity = "0.3"; 

    textLayer.innerHTML = `
        <div id="narrative-box">
            <h2 style="text-align: center; color: #8b0000;">THE GATES OF PARIS</h2>
            <p>Monsieur stood at the crest of the hill, looking back at the city. He had escaped the pikes of the sections, but the road to the coast promised no warmth. The Terror was spreading, and every road was choked with soldiers who saw a 'Monsieur' in every traveler with a quiet tongue.</p>
            
            <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;">
            <p style="text-align: center; font-style: italic;">Monsieur has learned from his flight. Distribute 3 points to sharpen his resolve.</p>
            
            <div class="stat-allocator">
                <div class="alloc-row">
                    <span class="p-color">PROWESS [${stats.prowess}]</span> 
                    <button class="game-btn-sm" onclick="applyInterPoint('prowess')">+</button>
                </div>
                <div class="alloc-row">
                    <span class="r-color">RHETORIC [${stats.rhetoric}]</span> 
                    <button class="game-btn-sm" onclick="applyInterPoint('rhetoric')">+</button>
                </div>
                <div class="alloc-row">
                    <span class="s-color">SUBTERFUGE [${stats.subterfuge}]</span> 
                    <button class="game-btn-sm" onclick="applyInterPoint('subterfuge')">+</button>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <p>Points Remaining: <strong>${intermissionPoints}</strong></p>
                <button class="game-btn" id="finish-inter-btn" 
                    ${intermissionPoints > 0 ? 'disabled' : ''} 
                    onclick="advanceToNext()">Continue the Escape</button>
            </div>
        </div>
    `;
    textLayer.style.opacity = "1";
}