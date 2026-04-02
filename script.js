const IMG_PATH = "Pictures/";
const SPEECH_PATH = "Speach/"; 

const introAudio = new Audio(); 
// --- GLOBAL STATE ---
let stats = { prowess: 0, rhetoric: 0, subterfuge: 0 }; 
let pool = 12;
let playerResources = { health: 10, gold: 5, suspicion: 0 };
let currentSceneIndex = 0;
let hasMap = false; // Maître Valmont’s Map


// Add to Global State
const voicePlayer = new Audio();
const VO_PATH = "Speach/"; 

/**
 * Global function to play VO with a specific naming convention
 * @param {string} fileName - e.g., "Ch1_Sc1_Intro"
 */
function playVO(fileName) {
    voicePlayer.pause(); // Stop any current speech
    voicePlayer.src = `${VO_PATH}${fileName}.mp3`;
    voicePlayer.play().catch(e => console.log("VO file not found or blocked:", fileName));
}

// Difficulty thresholds per Chapter
const thresholds = {
    1: { A: 7, B: 3 }, // Paris
    2: { A: 8, B: 4 }, // The Wilds
    3: { A: 9, B: 5 }  // The Coast
};
// --- DATABASE: ADD ALL SCENES HERE ---
const allScenes = [
    // SCENE 1: THE SAFEHOUSE
    {
        title: "The Safehouse",
        img: "Ch1_Sc1.png",
        type: "Open",
        lockSkill: "", 
        intro: "The floorboards groaned under Monsieur’s boots—a sound that, only a month ago, he would never have noticed. Now, it sounded like a gunshot. He stood in the center of the attic, clutching a leather valise that contained the pathetic remains of a life once defined by gold leaf and silk. Outside, the rhythmic chant of the Marseillaise drifted up from the street, punctuated by the sharp crack of a patrol’s boots. The door behind him was barred, but the wood felt as thin as parchment. He had to move, or he had to vanish.",
        outro: "The attic door clicked shut behind him, leaving his old life in the dust. Monsieur descended the back stairs, blending into the early morning gray of the Rue Saint-Honoré, where the city was already waking up hungry.",
        tierA: { text: "Slip through like a draft of cold air. Find hidden coins. [+2 Gold]", effect: {gold: 2} },
        tierB: { text: "Panic spikes. Bolt for the stairs and catch your shoulder. [-1 Health]", effect: {health: -1} },
        tierC: { text: "A street urchin watches the door. Buy his silence. [-2 Gold]", effect: {gold: -2} }
    },

    // SCENE 2: THE BREAD LINE
    {
        title: "The Bread Line",
        img: "Ch1_Sc2.png",
        type: "Locked",
        lockSkill: "Rhetoric",
        intro: "Monsieur found himself swept into a queue of hollow-cheeked citizens waiting for a ration of gray, sawdust-heavy bread. The air was thick with the scent of unwashed wool and sour wine. Beside him, a woman with eyes like flint studied the softness of his hands. To remain silent was to be suspicious; to speak was to risk the wrong accent. He smoothed his coat, trying to mimic the weary slump of the desperate, and prepared his tongue for the most dangerous lie of his life.",
        outro: "Chewing on the hard crust of his survival, Monsieur kept his chin tucked into his collar. He avoided the main thoroughfares, sticking to the damp capillaries of the city until the silent shadow of the Porte Saint-Martin blocked his path.",
        tierA: { text: "Lean into the hunger. Mutter a dark joke. [+1 Gold]", effect: {gold: 1} },
        tierB: { text: "Keep your head down. Drop a coin to distract the woman. [-1 Gold]", effect: {gold: -1} },
        tierC: { text: "A Sergeant smells the 'Versailles' on you. Bribe him to vanish. [-3 Gold]", effect: {gold: -3} }
    },

    // SCENE 3: THE SENTRY
    {
        title: "The Sentry",
        img: "Ch1_Sc3.png",
        type: "Locked",
        lockSkill: "Prowess",
        intro: "The archway loomed ahead, a throat of cold stone guarded by a single flickering lantern. Beneath it stood a National Guardsman, his musket leaning lazily against his shoulder. There was no gold for a bribe and no words for a plea; there was only the distance between Monsieur's hiding spot and the guard’s throat. The moonlight caught the silver of a discarded blade in the mud. Monsieur reached for it.",
        outro: "Adrenaline turned his blood to ice now he has dealt with the threat the guard posed. He didn't look back; he couldn't. The notary’s office was three blocks away, a sanctuary of paper in a city of steel.",
        tierA: { text: "Move with a predator’s grace. Silent strike. [-5 Suspicion]", effect: {suspicion: -5} },
        tierB: { text: "The guard turns. You drive the blade home but take a heavy blow. [-2 Health]", effect: {health: -2} },
        tierC: { text: "The Dash: You realize you aren't a killer. Bolt through the archway. [-4 Health]", effect: {health: -4} }
    },

    // SCENE 4: THE NOTARY (MAP SCENE)
    {
        title: "The Notary",
        img: "Ch1_Sc4.png",
        type: "Locked",
        lockSkill: "Subterfuge",
        intro: "The office of Maître Valmont was a tomb of bureaucracy. Monsieur slipped through the window, his movements frantic. He knew the forged transit permits were here. He moved through the wreckage with the grace of a thief, his fingers dancing over hidden drawers, listening for the tread of the midnight patrol on the cobbles outside.",
        outro: "With the forged permits tucked against his chest—a paper shield against the guillotine—Monsieur slipped back into the night. But the silence of the side streets was short-lived; a low, rhythmic roar began to shake the windows of the district.",
        tierA: { text: "Find the hidden catch. Discover the Surveyor’s Map. [Map Acquired: +1 Bonus Ch 2]", effect: {gold: 0} }, // Map logic handled in code
        tierB: { text: "Find the papers, but shatter an inkwell. Shouts go up. [+15 Suspicion]", effect: {suspicion: 15} },
        tierC: { text: "The Smash: Splinter the mahogany with a poker. Escape wounded. [-3 Health]", effect: {health: -3} }
    },

    // SCENE 5: THE RIOT
    {
        title: "The Riot",
        img: "Ch1_Sc5.png",
        type: "Open",
        lockSkill: "",
        intro: "The street erupted in a cacophony of breaking glass and splintering wood. A mob, fueled by cheap brandy and three centuries of resentment, poured into the square. Monsieur was caught in the current, pulled toward a bonfire where an effigy of the King was already turning to ash. Faces smeared with soot and coal-dust pressed against his. He was a grain of sand in a storm of iron. To fight was suicide; to run was impossible. He had to blend into the madness, or be consumed by it.",
        outro: "Monsieur cast one final, haunted look at the embers of the bonfire before slipping into a narrow passage behind a tanner’s shop. The roar of the mob faded into a dull, rhythmic thrumming, replaced by the damp, heavy scent of the Seine. He followed the slope of the land downward, his boots slick with refuse, until the jagged silhouettes of the masts appeared against the moonlit fog.",
        tierA: { text: "Lead the chant. Snatch a pike and belt the Marseillaise. [Success]", effect: {} },
        tierB: { text: "The Struggle: Pushed into the soot and elbowed in the ribs. [-2 Health]", effect: {health: -2} },
        tierC: { text: "Fling a handful of silver to distract the Sans-culottes. [-2 Gold]", effect: {gold: -2} }
    },

    // SCENE 6: THE WHARF
    {
        title: "The Wharf",
        img: "Ch1_Sc6.png",
        type: "Locked",
        lockSkill: "Prowess",
        intro: "The stench of rotting fish and stale water rose to meet him as he reached the Quai de la Rapée. The Seine was a black ribbon beneath the moon, choked with skeletal barges and the debris of a city in upheaval. A single, heavy-set dockworker stood guard over the only skiff tethered to the iron ring. He was a man of thick neck and calloused hands, a sentinel of the river who looked at Monsieur’s fine coat with a hunger that had nothing to do with politics.",
        outro: "Leaving the hardened sailor behind, Monsieur scrambled into the shadows of the warehouse district. The river was behind him, but the heart of the Section—the most radicalized quarter of the city—lay directly in his path.",
        tierA: { text: "Show the 'silver blade.' Look like a man with nothing to lose. [+1 Gold]", effect: {gold: 1} },
        tierB: { text: "A messy fight in the fish-guts. You win, but fingers are broken. [-3 Health]", effect: {health: -3} },
        tierC: { text: "The Dive: Guards appear. Dive into the freezing Seine. [-5 Health]", effect: {health: -5} }
    },

    // SCENE 7: THE TAVERN
    {
        title: "The Tavern",
        img: "Ch1_Sc7.png",
        type: "Open",
        lockSkill: "",
        intro: "The Le Chien Enragé was a low-ceilinged den of smoke and sedition, the air thick with the smell of spilled ale and unwashed bodies. Monsieur stepped into the heat, his eyes stinging. Somewhere in this crowded room sat a man with a red carnation pinned to a filthy lapel—his only link to a world outside these walls. Monsieur took a seat at a corner table, hiding his trembling hands beneath the scarred wood, and signaled for a drink. He had to look like a man with nowhere else to go.",
        outro: "The barkeep slammed another chipped mug of sour wine onto the table, and for a moment, Monsieur was just another shadow in the gloom. He settled into the noise, his eyes scanning the flickering lantern-light for the red flower, waiting for the moment to move.",
        tierA: { text: "Join a rowdy toast. The barkeep provides salted herring. [+3 Health]", effect: {health: 3} },
        tierB: { text: "Sit too stiff. A drunk loudly wonders about the 'gentleman.' Bribe him. [+10 Suspicion]", effect: {suspicion: 10} },
        tierC: { text: "Shout for a round of ale for every man in the bar. [-2 Gold]", effect: {gold: -2} }
    },

    // SCENE 8: THE MOUCHARD
    {
        title: "The Mouchard",
        img: "Ch1_Sc8.png",
        type: "Locked",
        lockSkill: "Subterfuge",
        intro: "He spotted his contact at the far end of the bar, but Monsieur’s blood ran cold before he could stand. Seated barely three feet from the target was a 'Mouchard'—a police spy recognizable by his too-attentive silence and the way he toyed with a lead-weighted cane. The spy’s eyes were darting, searching for the very slip-up Monsieur was about to make. To approach the contact now was to walk straight into the Conciergerie. Monsieur had to remove this predator from the board without a single drop of blood being spilled.",
        outro: "As the spy grumbled and finally left the tavern, cursing and looking frantically in all directions.—Monsieur breathed a silent prayer of thanks. The path to the red carnation was clear, but the clock on the tavern wall was ticking toward the final hour of the night.",
        tierA: { text: "Snag a bottle and 'clumsily' tip it into the spy's lap. [Success]", effect: {} },
        tierB: { text: "Lead him away with a whispered rumor. He memorizes your face. [+25 Suspicion]", effect: {suspicion: 25} },
        tierC: { text: "The Chaos: Upend the table onto him and escape through the kitchen. [+40 Suspicion]", effect: {suspicion: 40} }
    },

    // SCENE 9: THE CODE
    {
        title: "The Code",
        img: "Ch1_Sc9.png",
        type: "Locked",
        lockSkill: "Rhetoric",
        intro: "Monsieur slid onto the bench beside the man with the carnation. Neither looked at the other. The room was loud, but their world had shrunk to a few inches of table-space. 'The wind blows cold from the East,' Monsieur whispered, the first half of a password that felt like a death sentence on his tongue. He needed the man to believe he was who he claimed to be, and more importantly, he needed the specific coordinates of the escape. One wrong word, one slip into the 'refined' vowels of Versailles, and the contact would vanish into the smoke.",
        outro: "The contact leaned in, his voice a ghost of a rasp: 'The black coach. Midnight. The Porte Saint-Martin. Mention the Notary’s name.' Monsieur felt a slip of paper pressed into his palm. He stood up without a word, his destination finally clear: the Great Gate and the road beyond.",
        tierA: { text: "Flawless delivery. He shares his traveling rations. [+2 Health]", effect: {health: 2} },
        tierB: { text: "Stumble over the phrase. Convince him with a heavy bribe. [-2 Gold]", effect: {gold: -2} },
        tierC: { text: "The Threat: Press the blade against his ribs. He talks. [+30 Suspicion]", effect: {suspicion: 30} }
    },

    // SCENE 10: THE FINALE (PARIS EXIT)
    {
        title: "The Finale",
        img: "Ch1_Sc10.png",
        type: "Open",
        lockSkill: "",
        intro: "The Porte Saint-Martin was a fortress of wood and iron, illuminated by the orange glare of massive braziers. A heavy black coach sat idling near the barrier, its horses stamping their hooves in the freezing mist. Monsieur reached the carriage door, his fingers clutching the forged permits from Maître Valmont’s office. A guard stepped forward, his lantern swinging high to illuminate Monsieur’s face. The permits had to hold. The lie had to be perfect. Behind him lay the guillotine; ahead, the dark, silent promise of the open road.",
        outro: "The wheel-rims bit into the soft mud as the coach lurched forward, passing through the shadow of the gate and into the terrifying, infinite silence of the woods. Paris was a smudge of orange fire on the horizon. Monsieur leaned back against the moth-eaten velvet of the seat, his eyes closing as the first breath of rural air—cold, clean, and lonely—filled his lungs.",
        tierA: { text: "Hand over permits with an arrogant yawn. [Success]", effect: {} },
        tierB: { text: "The Interrogation: Shaken and bruised by a long 'pat down.' [-3 Health]", effect: {health: -3} },
        tierC: { text: "The bribe and a lethal threat. He lets you pass but alerts the cavalry. [+35 Suspicion]", effect: {suspicion: 35} }
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
    const chapterNum = getChapter();
    const sceneNum = currentSceneIndex + 1;
    playVO(`Ch${chapterNum}_Sc${sceneNum}_Intro`);
    const activeA = isTierAvailable(scene, 'A');
    const activeB = isTierAvailable(scene, 'B');

    textLayer.innerHTML = `
        <div id="scene-wrapper" style="display: flex; flex-direction: column; width: 100%;">
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
    const chapterNum = getChapter();
    const sceneNum = currentSceneIndex + 1;
    playVO(`Ch${chapterNum}_Sc${sceneNum}_Outro`);
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
    // 1. Apply the mechanical bonuses immediately in the background
    playerResources.health = Math.min(10, playerResources.health + 4);
    playerResources.suspicion = Math.max(-50, playerResources.suspicion - 20);
    intermissionPoints = 3;

    // 2. Start Phase 1: The Narrative Bridge
    renderIntermissionNarrative();
};

function renderIntermissionNarrative() {
    updateStatusUI();
    // Suggestion: A new background showing a carriage in the muddy woods
    imgLayer.style.backgroundImage = `url('${IMG_PATH}Ch2_Bridge.png')`; 
    imgLayer.style.opacity = "0.4";

    // Play the Intermission VO if you have it
    playVO("Intermission_Bridge"); 

    textLayer.innerHTML = `
        <div id="narrative-box">
            <h2 style="text-align: center; color: #8b0000;">BEYOND THE WALLS</h2>
            <p>The rhythmic clop-clack of the horses’ hooves on the paving stones has softened into the wet thud of rural mud. Inside the coach, the air is freezing, smelling of old leather and the damp wool of Monsieur’s coat. Through the cracked window, the silhouette of the Paris walls has finally sunk below the horizon, replaced by the skeletal reach of winter oaks.</p>
            <p>He is no longer a citizen of the Section; he is a ghost in the machine of the Republic. For the first time in days, his pulse slows. He closes his eyes, letting the exhaustion of the flight settle into his bones like lead.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <button class="game-btn" onclick="renderIntermissionBonus()">Refine Resolve</button>
            </div>
        </div>
    `;
    textLayer.style.opacity = "1";
}

function renderIntermissionBonus() {
    // Phase 2: The Skill Point screen
    textLayer.innerHTML = `
        <div id="narrative-box">
            <h2 style="text-align: center; color: #8b0000;">THE FUGITIVE'S REFLECTION</h2>
            <p style="text-align: center; font-style: italic;">Monsieur has survived the capital. The road to the coast will require new strengths.</p>
            
            <p style="text-align: center; color: #51cf66;">+4 Health | -20 Suspicion Applied</p>
            <hr style="border: 0; border-top: 1px solid #444; margin: 20px 0;">
            
            <h3 style="text-align: center;">Distribute 3 Skill Points</h3>
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
                    onclick="advanceToNext()">Enter the Wilds</button>
            </div>
        </div>
    `;
}

function wrapButtons(html) {
    return `<div class="button-stack" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">${html}</div>`;
}