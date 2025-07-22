// sheep.js

let animationFrameId;
let schafCount = 0;
let schafInterval;

export function initSheep(container) {
  if (!container) {
    console.error('Sheep container nicht gefunden');
    return;
  }

  const schafWidthPx = 94;

  const huegel = document.createElement('div');
  huegel.style.position = 'absolute';
  huegel.style.bottom = '0';
  huegel.style.left = '50%';
  huegel.style.transform = 'translateX(-50%)';
  huegel.style.width = '130vw';
  huegel.style.height = '80vh';
  huegel.style.background = 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)';
  huegel.style.borderRadius = '60vw 60vw 60vw 60vw';
  huegel.style.zIndex = '5';
  huegel.style.userSelect = 'none';
  huegel.style.pointerEvents = 'none';
  huegel.style.marginBottom = '-35vh';
  container.appendChild(huegel);

  const grasAnzahl = 120;

  function istImHalbkreis(x, y, w, h) {
    const cx = w / 2;
    const cy = h;
    const a = w / 2;
    const b = h;
    return (Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2)) <= 1 && y <= cy;
  }

  function erstelleGrasStueck(x, y) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '1.5px';
    div.style.height = `${6 + Math.random() * 4}px`;
    div.style.backgroundColor = '#1a3d11';
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    return div;
  }

  function verteileGras() {
    const w = huegel.clientWidth;
    const h = huegel.clientHeight;
    for (let i = 0; i < grasAnzahl; i++) {
      let x, y, versuche = 0;
      do {
        x = Math.random() * w;
        y = Math.random() * h;
        if (++versuche > 200) break;
      } while (!istImHalbkreis(x, y, w, h));

      huegel.appendChild(erstelleGrasStueck(x, y));
    }
  }

  verteileGras();

  function spawnSchaf() {
    schafCount++;

    const schaf = document.createElement('img');
    schaf.src = 'schaf.png';
    schaf.alt = 'Schaf';
    schaf.style.position = 'absolute';
    schaf.style.width = '5cm';
    schaf.style.transform = 'translate(-50%, -50%)';
    schaf.style.pointerEvents = 'none';
    schaf.style.zIndex = '10';

    const schafContainer = document.createElement('div');
    schafContainer.style.position = 'absolute';
    schafContainer.style.width = '5cm';
    schafContainer.style.pointerEvents = 'none';
    schafContainer.style.zIndex = '10';
    schafContainer.appendChild(schaf);
    container.appendChild(schafContainer);

    const startX = container.clientWidth + 100;
    const endX = -schafWidthPx / 2 - 100;
    const duration = 6000;
    const baseY = container.clientHeight * 0.5;
    const amplitude = container.clientHeight * 0.15;
    const startTime = performance.now();

    function animate(time) {
      const elapsed = time - startTime;
      if (elapsed >= duration) {
        schafContainer.remove();
        return;
      }
      const progress = elapsed / duration;
      const x = startX + (endX - startX) * progress;
      const y = baseY - Math.abs(Math.sin(progress * Math.PI * 2)) * amplitude;
      schafContainer.style.left = `${x}px`;
      schafContainer.style.top = `${y}px`;
      animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  schafInterval = setInterval(spawnSchaf, 5000);
  spawnSchaf();
}

export function stopSheep(container) {
  clearInterval(schafInterval);
  cancelAnimationFrame(animationFrameId);
  if (container) container.innerHTML = '';
}