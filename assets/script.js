// Element zur Debug-Ausgabe
const debugEl = document.getElementById('debug');

// Symbol-IDs für die Slotmaschine
const iconMap = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

// Größe der Symbole
const icon_width = 480;
const icon_height = 480;
const num_icons = 9;
const time_per_icon = 400;
const indexes = [0, 0, 0];

// Funktion zum Berechnen des aktuellen Symbol-Index basierend auf der Position
function getSymbolIndex(backgroundPositionY) {
    const normalizedPosition = Math.abs(backgroundPositionY % (num_icons * icon_height));
    return Math.round(normalizedPosition / icon_height) % num_icons;
}

// Funktion zum Zurücksetzen einer Walze auf Position 1
const resetReel = (reel) => {
    return new Promise((resolve) => {
        const style = getComputedStyle(reel);
        const currentPosition = parseFloat(style["background-position-y"]);
        const currentIndex = getSymbolIndex(currentPosition);
        
        // Berechne den kürzesten Weg zu Position 1 (Index 0)
        let targetPosition = 0;
        if (currentIndex !== 0) {
            reel.style.transition = `background-position-y 500ms cubic-bezier(.41,-0.01,.63,1.09)`;
            reel.style.backgroundPositionY = `${targetPosition}px`;
            
            setTimeout(() => {
                reel.style.transition = 'none';
                resolve();
            }, 500);
        } else {
            resolve();
        }
    });
};

// Funktion zum Drehen einer Walze
const roll = (reel, offset = 0, targetIndex = null) => {
    const finalIndex = targetIndex !== null ? targetIndex : Math.floor(Math.random() * num_icons);
    const delta = (offset + 2) * num_icons + finalIndex;
    
    return new Promise((resolve) => {
        const style = getComputedStyle(reel);
        const backgroundPositionY = parseFloat(style["background-position-y"]);
        const targetBackgroundPositionY = backgroundPositionY + delta * icon_height;
        const normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);
        
        setTimeout(() => {
            reel.style.transition = `background-position-y ${(15 + offset * 3) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
            reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;
        }, offset * 400);
        
        setTimeout(() => {
            reel.style.transition = 'none';
            reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
            const actualIndex = getSymbolIndex(normTargetBackgroundPositionY);
            resolve(actualIndex);
        }, (15 + offset * 3) * time_per_icon + offset * 400);
    });
};

// Funktion zum Starten des Drehens aller Walzen
async function rollAll() {
    // Popup ausblenden beim Start
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
    popup.style.visibility = 'hidden';
    popup.style.opacity = '0';
    
    const reelsList = document.querySelectorAll('.slots > .reel');
    
    // Zuerst alle Walzen auf Position 1 zurücksetzen
    await Promise.all([...reelsList].map(reel => resetReel(reel)));

    // Exakt 50% Gewinnchance
    const isWin = Math.random() < 0.5;
    let targetIndexes;

    if (isWin) {
        const winningNumber = Math.floor(Math.random() * num_icons);
        targetIndexes = [winningNumber, winningNumber, winningNumber];
    } else {
        let numbers;
        do {
            numbers = [
                Math.floor(Math.random() * num_icons),
                Math.floor(Math.random() * num_icons),
                Math.floor(Math.random() * num_icons)
            ];
        } while (numbers[0] === numbers[1] && numbers[1] === numbers[2]);
        targetIndexes = numbers;
    }

    // Startet das Drehen der Walzen
    Promise.all([...reelsList].map((reel, i) => roll(reel, i, targetIndexes[i]).then(result => {
        indexes[i] = result;
    })))
    .then(() => {
        const hasWon = indexes[0] === indexes[1] && indexes[1] === indexes[2];
        
        document.querySelector(".slots").classList.remove("win3");
        const lasVegasSvg = document.querySelector('img[src="bilder/text.svg"]');
        const startSvg = document.querySelector('img[src="bilder/start.svg"]');
        lasVegasSvg?.classList.remove("blink");
        startSvg?.classList.remove("blink");

        if (hasWon) {
            document.querySelector(".slots").classList.add("win3");
            lasVegasSvg?.classList.add("blink");
            startSvg?.classList.add("blink");
            
            setTimeout(() => {
                document.querySelector(".slots").classList.remove("win3");
                lasVegasSvg?.classList.remove("blink");
                startSvg?.classList.remove("blink");
            }, 3000);

            setTimeout(() => {
                const popup = document.getElementById('popup');
                popup.style.display = 'flex';
                popup.style.visibility = 'visible';
                popup.style.opacity = '1';
            }, 2000);
        }
    });
}

// Eventlistener für den Start-Button
document.querySelector('img[src="bilder/start.svg"]').addEventListener("click", rollAll);

// Schließt das Popup, wenn das Schließen-Symbol angeklickt wird
document.getElementById("closePopup").addEventListener("click", () => {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
    popup.style.visibility = 'hidden';
    popup.style.opacity = '0';
});

// Placeholder für Download-Button
document.getElementById("downloadButton").addEventListener("click", () => {
    alert("Download-Button wurde geklickt! (Hier kann eine Funktion hinzugefügt werden.)");
});

// Tooltip für das Text SVG anzeigen/verstecken
const svgImg = document.querySelector('img[src="bilder/text.svg"]');
const tooltip = document.getElementById('tooltip');

svgImg?.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';
});

svgImg?.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
});

// Wählt alle Walzen der Slotmaschine aus
const reels = document.querySelectorAll('.slots > .reel');
reels.forEach(reel => {
    reel.style.backgroundSize = `100% ${icon_height * num_icons}px`;
    reel.style.backgroundRepeat = 'repeat-y';
    reel.style.backgroundPositionY = `0px`;
    
    // Ermöglicht das Scrollen mit dem Mausrad
    reel.addEventListener('wheel', (event) => {
        event.preventDefault();
        let currentY = parseFloat(getComputedStyle(reel)["background-position-y"]) || 0;
        reel.style.transition = 'none';
        reel.style.backgroundPositionY = `${currentY + event.deltaY}px`;
    });
});

// Create and append toggle button
const toggleButton = document.createElement('button');
toggleButton.className = 'theme-toggle';
document.body.appendChild(toggleButton);

// Add click event listener for theme toggle
toggleButton.addEventListener('click', () => {
    // Toggle active class on button
    toggleButton.classList.toggle('active');
    
    // Toggle grayscale class on body
    document.body.classList.toggle('grayscale');
});

// Initial setup on window load
window.onload = () => {
    const lasVegasSvg = document.querySelector('img[src="bilder/text.svg"]');
    const startSvg = document.querySelector('img[src="bilder/start.svg"]');

    lasVegasSvg?.classList.add('initialGlow');
    startSvg?.classList.add('initialGlow');
    
    setTimeout(() => {
        lasVegasSvg?.classList.remove('initialGlow');
        startSvg?.classList.remove('initialGlow');
    }, 5000);
};