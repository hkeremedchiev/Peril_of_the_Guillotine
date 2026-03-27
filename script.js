const introData = [
    // We start on the Blade, so the first transition is actually to the Dead King
    { img: 'king_is_dead.jpg', text: "The King is dead.", duration: 5500 },
    { img: 'ruined_city.jpg', text: "Paris has fallen into the hands of the mob.", duration: 4500 },
    { img: 'the_warrant.jpg', text: "And your name is on the list.", duration: 6000 }
];

let currentStep = 0;
const container = document.getElementById('intro-container');
const imgLayer = document.getElementById('image-layer');
const textLayer = document.getElementById('text-overlay');
const startBtn = document.getElementById('start-btn');

// Set the initial image immediately so it's not a black screen
imgLayer.style.backgroundImage = "url('intro_blade.jpg')";
imgLayer.style.opacity = "0.4"; // Dimmed until we start

function playSequence() {
    if (currentStep >= introData.length) {
        textLayer.innerHTML = "[ THE HUNT BEGINS ]";
        return;
    }

    const step = introData[currentStep];

    // Fade out previous state
    imgLayer.style.opacity = 0;
    textLayer.style.opacity = 0;

    setTimeout(() => {
        imgLayer.style.backgroundImage = `url('${step.img}')`;
        imgLayer.style.opacity = 1;
        
        setTimeout(() => {
            textLayer.innerText = step.text;
            textLayer.style.opacity = 1;
        }, 1200);

        currentStep++;
        setTimeout(playSequence, step.duration);
    }, 1000);
}

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Add a "clicked" state for a split second
    startBtn.style.letterSpacing = '10px';
    startBtn.style.opacity = '0';
    
    setTimeout(() => {
        startBtn.style.display = 'none';
        imgLayer.style.opacity = 1; 
        
        // Let the blade breathe for 1.5 seconds before the first text line
        setTimeout(playSequence, 1500);
    }, 600);
});