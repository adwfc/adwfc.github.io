let schafCount = 0;
let intervalId;

export function initSheep(containerElement) {
  containerElement.innerHTML = '';  // Alles zurücksetzen

  const container = containerElement;

  // Hügel erstellen
  const huegel = document.createElement('div');
  huegel.className = 'huegel';
  container.appendChild(huegel);

  // Gras und Blumen generieren
  verteileGras(huegel);
  verteileBlumen(huegel);

  // Laufende Schafe starten
  spawnSchaf(container, huegel);
  intervalId = setInterval(() => spawnSchaf(container, huegel), 5000);
}

export function stopSheep() {
  clearInterval(intervalId);
}

function spawnSchaf(container, huegel) {
  schafCount++;

  const schaf = document.createElement('img');
  schaf.src = 'schaf.png';
  schaf.alt = 'Schaf';
  schaf.className = 'schaf';

  const nummer = document.createElement('div');
  nummer.textContent = schafCount;
  nummer.className = 'schaf-nummer';

  const schafContainer = document.createElement('div');
  schafContainer.className = 'schaf-container';
  schafContainer.appendChild(schaf);
  schafContainer.appendChild(nummer);
  container.appendChild(schafContainer);

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const startX = containerWidth + 100;
  const endX = -100;
  const baseY = containerHeight * 0.6;
  const amplitude = containerHeight * 0.15;

  const duration = 6000;
  const pauseDuration = 1500;
  const totalDuration = duration + pauseDuration;

  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    if (elapsed >= totalDuration) {
      schafContainer.remove();
      return;
    }

    let progress;
    if (elapsed < duration / 2) {
      progress = elapsed / duration;
    } else if (elapsed < duration / 2 + pauseDuration) {
      progress = 0.5;
    } else {
      progress = (elapsed - pauseDuration) / duration;
    }

    const x = startX + (endX - startX) * progress;
    const y = baseY - Math.abs(Math.sin(progress * Math.PI * 2)) * amplitude;

    schafContainer.style.left = `${x}px`;
    schafContainer.style.top = `${y}px`;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

function verteileGras(huegel) {
  const anzahl = 120;
  const w = huegel.clientWidth;
  const h = huegel.clientHeight;

  for (let i = 0; i < anzahl; i++) {
    let x, y, versuche = 0;
    do {
      x = Math.random() * w;
      y = Math.random() * h;
      versuche++;
      if (versuche > 200) break;
    } while (!istImHalbkreis(x, y, w, h));

    const gras = document.createElement('div');
    gras.className = 'gras-stueck';
    gras.style.left = `${x}px`;
    gras.style.top = `${y}px`;
    gras.style.height = `${6 + Math.random() * 4}px`;
    gras.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
    huegel.appendChild(gras);
  }
}

function verteileBlumen() {
  const w = huegel.clientWidth;
  const h = huegel.clientHeight;
  const anzahlBlumen = 5;

  const sichtbarerBereich = h * 0.65;  // Beschränkt auf obere 65% des Hügels

  for (let i = 0; i < anzahlBlumen; i++) {
    let x, y;
    let versuche = 0;
    do {
      x = Math.random() * w;
      y = Math.random() * sichtbarerBereich;
      versuche++;
      if (versuche > 200) break;
    } while (!istImHalbkreis(x, y, w, h));

    const blume = erstelleBlume(x, y);
    huegel.appendChild(blume);
  }
}

function istImHalbkreis(x, y, w, h) {
  const cx = w / 2;
  const cy = h;
  const a = w / 2;
  const b = h;
  const norm = Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2);
  return norm <= 1 && y <= cy;
}
