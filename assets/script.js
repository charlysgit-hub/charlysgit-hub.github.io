const debugEl = document.getElementById('debug');
const iconMap = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const icon_width = 480;
const icon_height = 480;
const num_icons = 9;
const time_per_icon = 400;
const indexes = [0, 0, 0];

const reels = document.querySelectorAll('.slots > .reel');
reels.forEach(reel => {
    reel.style.backgroundSize = `100% ${icon_height * num_icons}px`;
    reel.style.backgroundRepeat = 'repeat-y';
    reel.style.backgroundPositionY = `0px`;
    reel.addEventListener('wheel', (event) => {
        event.preventDefault();
        let currentY = parseFloat(getComputedStyle(reel)["background-position-y"]) || 0;
        reel.style.transition = 'none';
        reel.style.backgroundPositionY = `${currentY + event.deltaY}px`;
    });
});

const roll = (reel, offset = 0, forceWin = false) => {
    let delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);
    if (forceWin) {
        delta = (offset + 2) * num_icons;
    }
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
            resolve(delta % num_icons);
        }, (15 + offset * 3) * time_per_icon + offset * 400);
    });
};

function rollAll() {
    debugEl.textContent = 'rolling...';
    const reelsList = document.querySelectorAll('.slots > .reel');
    const forceWin = Math.random() < 0.9;  // Hohe Wahrscheinlichkeit für einen Gewinn
    Promise.all([...reelsList].map((reel, i) => roll(reel, i, forceWin)))
        .then((deltas) => {
            deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
            debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');
            if (indexes[0] === indexes[1] && indexes[1] === indexes[2]) {
                document.querySelector(".slots").classList.add("win3");
                setTimeout(() => {
                    document.querySelector(".slots").classList.remove("win3");
                    // Zeige das Popup an
                    const popup = document.getElementById('popup');
                    popup.classList.add('show');  // Popup sichtbar machen
                }, 2000);
            }
        });
}

document.getElementById("startButton").addEventListener("click", rollAll);

// Schließe das Popup, wenn das Schließen-Symbol angeklickt wird
document.getElementById("closePopup").addEventListener("click", () => {
    const popup = document.getElementById('popup');
    popup.classList.remove('show');  // Popup ausblenden
});

// Placeholder für den Download-Button
document.getElementById("downloadButton").addEventListener("click", () => {
    alert("Download-Button wurde geklickt! (Hier kann eine Funktion hinzugefügt werden.)");
});
