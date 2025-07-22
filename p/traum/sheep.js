let animationFrame;
let running = false;

export function initSheep(containerElement) {
  containerElement.innerHTML = '';  // Vorherige Schafe entfernen

  const container = containerElement;
  const schaf = document.createElement('img');
  schaf.src = 'schaf.png';
  schaf.alt = 'Schaf';
  schaf.style.position = 'absolute';
  schaf.style.width = '5cm';
  schaf.style.transform = 'translate(-50%, -50%)';

  container.appendChild(schaf);

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const startX = containerWidth + 100;
  const endX = -100;
  const baseY = containerHeight / 2;
  const amplitude = containerHeight * 0.2;

  const duration = 5000;
  const pauseDuration = 1500;
  const totalDuration = duration + pauseDuration;

  const startTime = performance.now();
  running = true;

  function animate(time) {
    if (!running) return;

    const elapsed = time - startTime;
    if (elapsed >= totalDuration) {
      running = false;
      return;
    }

    let progress;
    if (elapsed < duration / 2) {
      progress = elapsed / duration;
    } else if (elapsed < duration / 2 + pauseDuration) {
      progress = 0.5;  // Pause in der Mitte
    } else {
      progress = (elapsed - pauseDuration) / duration;
    }

    const x = startX + (endX - startX) * progress;
    const y = baseY - Math.abs(Math.sin(progress * Math.PI * 2)) * amplitude;

    schaf.style.left = `${x}px`;
    schaf.style.top = `${y}px`;

    animationFrame = requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

export function stopSheep() {
  running = false;
  cancelAnimationFrame(animationFrame);
}
