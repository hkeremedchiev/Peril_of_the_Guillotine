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

        // Locate where you create the allocate button and add this listener:
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

// --- P-R-S System Stats ---
let stats = { prowess: 0, rhetoric: 0, subterfuge: 0 }; 
let pool = 12;

// Call this function when the "ALLOCATE SKILLS" button is clicked
function startSkillAllocation() {
    const textLayer = document.getElementById('text-overlay');
    textLayer.style.opacity = 0;

    setTimeout(() => {
        // Change the font size slightly to fit the document
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

            <div class="stat-row">
                <span>RHETORIC</span> 
                <div class="stat-controls">
                    <button class="stat-btn" onclick="updateStat('rhetoric', -1)">-</button>
                    <span style="min-width: 25px; display: inline-block; text-align: center;">${stats.rhetoric}</span>
                    <button class="stat-btn" onclick="updateStat('rhetoric', 1)">+</button>
                </div>
            </div>

            <div class="stat-row">
                <span>SUBTERFUGE</span> 
                <div class="stat-controls">
                    <button class="stat-btn" onclick="updateStat('subterfuge', -1)">-</button>
                    <span style="min-width: 25px; display: inline-block; text-align: center;">${stats.subterfuge}</span>
                    <button class="stat-btn" onclick="updateStat('subterfuge', 1)">+</button>
                </div>
            </div>

            <div id="pool-display" style="text-align: center; margin-top: 15px; font-weight: bold; color: #8b0000;">
                Points Remaining: ${pool}
            </div>

            <button id="confirm-identity" class="game-btn" 
                style="width: 100%; margin-top: 20px; font-size: 1rem; ${pool > 0 ? 'opacity: 0.3; cursor: not-allowed;' : ''}" 
                ${pool > 0 ? 'disabled' : ''} 
                onclick="confirmIdentity()">
                Confirm Identity
            </button>
        </div>
    `;
}

// These functions must be attached to the window so the HTML buttons can find them
window.updateStat = function(stat, change) {
    if (change > 0 && pool > 0) {
        stats[stat]++;
        pool--;
    } else if (change < 0 && stats[stat] > 0) {
        stats[stat]--;
        pool++;
    }
    renderSkillUI();
};

window.confirmIdentity = function() {
    alert("Identity Forged. The shadows of Paris await.");
    // This is where Chapter 1 Scene 1 will eventually trigger
};