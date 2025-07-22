export function initSheep(containerSelector, huegelSelector) {
  const container = document.querySelector(containerSelector);
  const huegel = document.querySelector(huegelSelector);

  const schafWidthPx = 94; // ca. 5cm in px
  let schafCount = 0;

  function spawnSchaf() {
    schafCount++;

    const schaf = document.createElement('img');
    schaf.src = 'schaf.png';
    schaf.alt = 'Schaf';
    schaf.className = 'schaf';
    schaf.style.transform = 'translate(-50%, -50%)';

    const nummer = document.createElement('div');
    nummer.textContent = schafCount;
    nummer.style.position = 'absolute';
    nummer.style.color = '#43406d';
    nummer.style.fontWeight = 'bold';
    nummer.style.fontSize = '1.2rem';
    nummer.style.userSelect = 'none';
    nummer.style.pointerEvents = 'none';
    nummer.style.zIndex = '11';
    nummer.style.transform = 'translate(-50%, -50%)';
    nummer.style.width = '5cm';
    nummer.style.textAlign = 'center';
    nummer.style.top = 'calc(50% - 20px)';
    nummer.style.left = 'calc(50% - 130px)';

    const schafContainer = document.createElement('div');
    schafContainer.style.position = 'absolute';
    schafContainer.style.width = '5cm';
    schafContainer.style.height = 'auto';
    schafContainer.style.pointerEvents = 'none';
    schafContainer.style.zIndex = '10';

    schafContainer.appendChild(schaf);
    schafContainer.appendChild(nummer);
    container.appendChild(schafContainer);

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const startX = containerWidth + schafWidthPx / 2 + 100;
    const endX = -schafWidthPx / 2 - 100;

    const duration = 6000;
    const pauseDuration = 1500;
    const totalDuration = duration + pauseDuration;

    const amplitude = containerHeight * 0.15;
    const baseY = containerHeight * 0.5;

    schafContainer.style.left = `${startX}px`;
    schafContainer.style.top = `${baseY}px`;

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

  function istImHalbkreis(x, y, w, h) {
    const cx = w / 2;
    const cy = h;
    const a = w / 2;
    const b = h;
    const norm = Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2);
    return norm <= 1 && y <= cy;
  }

  function erstelleGrasStueck(x, y) {
    const div = document.createElement('div');
    div.className = 'gras-stueck';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    div.style.height = `${6 + Math.random() * 4}px`;
    div.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
    return div;
  }

  function verteileGras() {
    const w = huegel.clientWidth;
    const h = huegel.clientHeight;
    const grasAnzahl = 120;

    for (let i = 0; i < grasAnzahl; i++) {
      let x, y;
      let versuche = 0;
      do {
        x = Math.random() * w;
        y = Math.random() * h;
        versuche++;
        if (versuche > 200) break;
      } while (!istImHalbkreis(x, y, w, h));

      const grasStueck = erstelleGrasStueck(x, y);
      huegel.appendChild(grasStueck);
    }
  }

  function erstelleBlume(x, y) {
    const img = document.createElement('img');
    img.src = 'blume.png';
    img.alt = 'Blume';
    img.style.position = 'absolute';
    img.style.width = '30px';
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.pointerEvents = 'none';
    img.style.userSelect = 'none';
    img.style.zIndex = 6;
    return img;
  }

  function verteileBlumen() {
    const w = huegel.clientWidth;
    const h = huegel.clientHeight;
    const anzahlBlumen = 5;
    const sichtbarerBereich = h - (35 / 100 * window.innerHeight);

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

  // Initial
  verteileGras();
  verteileBlumen();
  spawnSchaf();
  setInterval(spawnSchaf, 5000);
}