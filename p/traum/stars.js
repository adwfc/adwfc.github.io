(() => {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');

  const sheepImg = new Image();
  sheepImg.src = 'schaf-trigger.png';

  const galerieImg = new Image();
  galerieImg.src = 'galerie-trigger.png';

  let w, h;

  const sheepStar = {
    angle: Math.PI * 0.2,
    y: 0,
    radius: 64,
    screenX: null,
    screenY: null,
  };

  const galerieStar = {
    angle: Math.PI * 0.6,
    y: 0,
    radius: 64,
    screenX: null,
    screenY: null,
  };

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    sheepStar.y = galerieStar.y = h / 2;
  }

  resize();
  window.addEventListener('resize', resize);

  const stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      angle: Math.random() * Math.PI * 2,
      y: Math.random() * h,
      radius: 1 + Math.random() * 2,
      alpha: 0.3 + Math.random() * 0.5,
    });
  }

  let cameraAngle = 0;
  let velocity = 0;
  let zoomFactor = 1.0;

  function angleToScreenX(angleDiff, fov) {
    return (angleDiff + fov / 2) / fov * w;
  }

  function drawStars(starArray, fov) {
    for (const star of starArray) {
      let diff = star.angle - cameraAngle;
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;

      if (diff > -fov / 2 && diff < fov / 2) {
        const screenX = angleToScreenX(diff, fov);
        const screenY = star.y;

        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  }

  function drawSpecialStar(obj, img, fov) {
    let diff = obj.angle - cameraAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    if (diff > -fov / 2 && diff < fov / 2) {
      const screenX = angleToScreenX(diff, fov);
      const screenY = obj.y;

      obj.screenX = screenX;
      obj.screenY = screenY;

      const size = obj.radius * 2;
      ctx.drawImage(img, screenX - size / 2, screenY - size / 2, size, size);
    } else {
      obj.screenX = null;
      obj.screenY = null;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'white';

    const fovDeg = 90 / zoomFactor;
    const fov = (fovDeg * Math.PI) / 180;

    drawStars(stars, fov);
    drawSpecialStar(sheepStar, sheepImg, fov);
    drawSpecialStar(galerieStar, galerieImg, fov);
  }

  function animate() {
    if (Math.abs(velocity) > 0.0001) {
      cameraAngle -= velocity;
      cameraAngle = (cameraAngle + 2 * Math.PI) % (2 * Math.PI);
      velocity *= 0.98;
    }
    draw();
    requestAnimationFrame(animate);
  }

  animate();

  // Dragsteuerung
  let isDragging = false;
  let lastX = 0;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const sensitivity = 0.002;
    cameraAngle -= dx * sensitivity;
    velocity = dx * sensitivity;
  });

  canvas.addEventListener('mouseup', () => (isDragging = false));
  canvas.addEventListener('mouseleave', () => (isDragging = false));

  // Klickerkennung für beide Sterne
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    [ [sheepStar, 'openSheepLightbox'], [galerieStar, 'openLightbox'] ].forEach(([star, action]) => {
      if (!star.screenX || !star.screenY) return;
      const dx = x - star.screenX;
      const dy = y - star.screenY;
      if (Math.sqrt(dx * dx + dy * dy) <= star.radius + 5) {
        if (window[action]) window[action]();
      }
    });
  });
})();
      
