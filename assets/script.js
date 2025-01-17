const debugEl = document.getElementById('debug'),
  iconMap = ["font2", "money2", "font1", "poster1", "poster3", "font3", "poster2", "money1", "money3"],
  icon_width = 180,
  icon_height = 180,
  num_icons = 9,
  time_per_icon = 100,
  indexes = [0, 0, 0];

/** Dreht eine Rolle */
const roll = (reel, offset = 0, target = null) => {
  let delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);
  const style = getComputedStyle(reel),
    backgroundPositionY = parseFloat(style["background-position-y"]);
  
  if (target) {
    const currentIndex = backgroundPositionY / icon_height;
    delta = target - currentIndex + (offset + 2) * num_icons;
  }

  return new Promise((resolve) => {
    const targetBackgroundPositionY = backgroundPositionY + delta * icon_height;
    const normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    setTimeout(() => {
      reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
      reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;
    }, offset * 150);

    setTimeout(() => {
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

/** Dreht alle Rollen */
function rollAll() {
  const reelsList = document.querySelectorAll('.slots > .reel');
  reelsList.forEach(reel => reel.classList.remove('clickable'));

  const targets = window.timesRolled && window.timesRolled % 3 === 0 ? [6, 6, 6] : null;
  if (!window.timesRolled) window.timesRolled = 0;
  window.timesRolled++;

  debugEl.textContent = targets ? 'rolling (Gewinn rigged!) ...' : 'rolling...';

  Promise
    .all([...reelsList].map((reel, i) => roll(reel, i, targets ? targets[i] : null)))
    .then((deltas) => {
      deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
      debugEl.textContent = indexes.map((i) => iconMap[i]).join(' - ');

      if (indexes[0] === indexes[1] && indexes[1] === indexes[2]) {
        const slotsElement = document.querySelector(".slots");
        const overlay = document.createElement("div");
        overlay.className = "winning-overlay";

        slotsElement.appendChild(overlay);

        overlay.addEventListener("click", () => {
          const winningSymbol = iconMap[indexes[0]];
          window.location.href = `winner.html?symbol=${winningSymbol}`;
        });

        slotsElement.classList.add("win3");
        setTimeout(() => slotsElement.classList.remove("win3"), 3000);
      }
    });
}

document.getElementById('startButton').addEventListener('click', rollAll);
