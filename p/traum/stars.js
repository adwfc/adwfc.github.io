(() => {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');

  const sheepImg = new Image();
  sheepImg.src = 'schaf-trigger.png';

  const galerieImg = new Image();
  galerieImg.src = 'galerie-trigger.png';

  let w, h;

  let sheepStar = {
    angle: -0.4,
    y: 0,
    radius: 64,
    alpha: 1.0,
    screenX: null,
    screenY: null
  };

  let galerieStar = {
    angle: 0.6,
    y: 0,
    radius: 64,
    alpha: 1.0,
    screenX: null,
    screenY: null
  };

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    sheepStar.y = h / 2;
    galerieStar.y = h / 2;
  }

  resize();
  window.addEventListener('resize', resize);

  const starCount = 100;
  const bgStarCount = 50;
  const maxStars = 600;
  const maxBgStars = 300;
  const stars = [];
  const bgStars = [];

  for (let i = 0; i < starCount; i++) {
    stars.push({
      angle: Math.random() * Math.PI * 2,
      y: Math.random() * h,
      radius: 2,
      alpha: 0.0,
      targetAlpha: 0.7
    });
  }

  for (let i = 0; i < bgStarCount; i++) {
    bgStars.push({
      angle: Math.random() * Math.PI * 2,
      y: Math.random() * h,
      radius: 0.7 + Math.random() * 0.5,
      alpha: 0.0,
      targetAlpha: 0.25 + Math.random() * 0.15
    });
  }

  let cameraAngle = 0;
  let velocity = 0;
  let zoomFactor = 1.0;
  let zoomVelocity = 0;
  let verticalOffset = 0;
  let verticalVelocity = 0;
  let isDragging = false;
  let lastDragX = 0;
  let lastDragY = 0;
  let lastDistance = null;

  function angleToScreenX(angleDiff, fov) {
    return (angleDiff + fov / 2) / fov * w;
  }

  function drawStars(starArray, fov) {
    starArray.forEach(star => {
      let diff = star.angle - cameraAngle;
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;

      if (diff > -fov / 2 && diff < fov / 2) {
        const screenX = angleToScreenX(diff, fov);
        const centerY = h / 2;
        const offsetY = (star.y - centerY) * zoomFactor + verticalOffset;
        const screenY = centerY + offsetY;

        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'white';

    const fovDeg = 90 / zoomFactor;
    const fov = fovDeg * Math.PI / 180;

    drawStars(bgStars, fov);
    drawStars(stars, fov);

    // Schaf-Stern
    drawIconStar(sheepStar, sheepImg, fov);

    // Galerie-Stern
    drawIconStar(galerieStar, galerieImg, fov);
  }

  function drawIconStar(starObj, image, fov) {
    let diff = starObj.angle - cameraAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    if (diff > -fov / 2 && diff < fov / 2) {
      const screenX = angleToScreenX(diff, fov);
      const screenY = h / 2 + verticalOffset;
      starObj.screenX = screenX;
      starObj.screenY = screenY;

      const size = starObj.radius * 2;
      ctx.drawImage(image, screenX - size / 2, screenY - size / 2, size, size);
    } else {
      starObj.screenX = null;
      starObj.screenY = null;
    }
  }

  function updateStarsForZoom() {
    const zoomRange = 3;
    const zoomProgress = (zoomFactor - 1) / zoomRange;
    const speedFactor = 1.5;

    const targetStarsCount = Math.floor(starCount + (maxStars - starCount) * Math.min(zoomProgress * speedFactor, 1));
    while (stars.length < targetStarsCount) {
      stars.push({
        angle: Math.random() * Math.PI * 2,
        y: Math.random() * h,
        radius: 2,
        alpha: 0.0,
        targetAlpha: 0.7
      });
    }

    for (let i = stars.length - 1; i >= targetStarsCount; i--) {
      if (stars[i].alpha > 0) {
        stars[i].alpha -= 0.05;
        if (stars[i].alpha < 0) stars[i].alpha = 0;
      } else {
        stars.splice(i, 1);
      }
    }

    const targetBgStarsCount = Math.floor(bgStarCount + (maxBgStars - bgStarCount) * Math.min(zoomProgress * speedFactor, 1));
    while (bgStars.length < targetBgStarsCount) {
      bgStars.push({
        angle: Math.random() * Math.PI * 2,
        y: Math.random() * h,
        radius: 0.7 + Math.random() * 0.5,
        alpha: 0.0,
        targetAlpha: 0.25 + Math.random() * 0.15
      });
    }

    for (let i = bgStars.length - 1; i >= targetBgStarsCount; i--) {
      if (bgStars[i].alpha > 0) {
        bgStars[i].alpha -= 0.05;
        if (bgStars[i].alpha < 0) bgStars[i].alpha = 0;
      } else {
        bgStars.splice(i, 1);
      }
    }

    stars.forEach(star => {
      if (star.alpha < star.targetAlpha) {
        star.alpha += 0.01;
        if (star.alpha > star.targetAlpha) star.alpha = star.targetAlpha;
      }
    });

    bgStars.forEach(star => {
      if (star.alpha < star.targetAlpha) {
        star.alpha += 0.01;
        if (star.alpha > star.targetAlpha) star.alpha = star.targetAlpha;
      }
    });
  }

  function animate() {
    if (!isDragging) {
      if (Math.abs(velocity) > 0.0001) {
        cameraAngle -= velocity;
        cameraAngle = (cameraAngle + 2 * Math.PI) % (2 * Math.PI);
        velocity *= 0.98;
      } else {
        velocity = 0;
      }

      if (Math.abs(zoomVelocity) > 0.0005) {
        zoomFactor += zoomVelocity;
        zoomFactor = Math.max(1.0, Math.min(4.0, zoomFactor));
        zoomVelocity *= 0.98;
      } else {
        zoomVelocity = 0;
      }
    } else {
      verticalOffset += verticalVelocity;
      verticalVelocity *= 0.9;
    }

    updateStarsForZoom();
    draw();
    requestAnimationFrame(animate);
  }

  animate();

  function getTouchDistance(e) {
    if (e.touches.length < 2) return null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function pointerDown(e) {
    if (e.touches && e.touches.length === 2) {
      lastDistance = getTouchDistance(e);
    } else {
      isDragging = true;
      velocity = 0;
      lastDragX = e.clientX || e.touches[0].clientX;
      lastDragY = e.clientY || e.touches[0].clientY;
    }
  }

  function pointerMove(e) {
    if (e.touches && e.touches.length === 2) {
      const distance = getTouchDistance(e);
      if (lastDistance != null) {
        const delta = distance - lastDistance;
        lastDistance = distance;
        const zoomSensitivity = 0.005;
        zoomFactor += delta * zoomSensitivity;
        zoomFactor = Math.max(1.0, Math.min(4.0, zoomFactor));
        zoomVelocity = delta * zoomSensitivity * 0.3;
      }
    } else if (isDragging) {
      const currentX = e.clientX || e.touches[0].clientX;
      const currentY = e.clientY || e.touches[0].clientY;
      const deltaX = currentX - lastDragX;
      const deltaY = currentY - lastDragY;
      lastDragX = currentX;
      lastDragY = currentY;

      const sensitivityX = 0.0015;
      cameraAngle -= deltaX * sensitivityX;
      cameraAngle = (cameraAngle + 2 * Math.PI) % (2 * Math.PI);
      velocity = deltaX * sensitivityX;

      if (zoomFactor <= 1.1 && Math.abs(deltaY) > 0) {
        const verticalSensitivity = 0.3;
        verticalVelocity += deltaY * verticalSensitivity;
      }
    }
  }

  function pointerUp() {
    isDragging = false;
    lastDistance = null;
    velocity *= 0.9;
    zoomVelocity *= 0.9;
  }

  canvas.addEventListener('touchstart', pointerDown, { passive: false });
  canvas.addEventListener('touchmove', pointerMove, { passive: false });
  canvas.addEventListener('touchend', pointerUp);
  canvas.addEventListener('touchcancel', pointerUp);
  canvas.addEventListener('mousedown', pointerDown);
  canvas.addEventListener('mousemove', pointerMove);
  canvas.addEventListener('mouseup', pointerUp);

  canvas.addEventListener('click', async e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const checkHit = (star) => {
      if (star.screenX == null || star.screenY == null) return false;
      const dx = x - star.screenX;
      const dy = y - star.screenY;
      return Math.sqrt(dx * dx + dy * dy) <= star.radius + 5;
    };

    if (checkHit(sheepStar)) {
      if (window.openLightbox) window.openLightbox(); // sheep
    } else if (checkHit(galerieStar)) {
      if (window.openGalerieLightbox) window.openGalerieLightbox(); // galerie
    }
  });
})();
        
