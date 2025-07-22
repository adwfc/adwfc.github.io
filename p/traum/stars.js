(() => {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
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

  const sheepAngle = Math.PI / 4; // Position des Schaf-Symbols im 3D-Raum
  const sheepImage = new Image();
  sheepImage.src = 'schaf.png';
  const sheepSize = 80;

  const degreeStep = 100;

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

  function drawDegreeMarkers(fov) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const totalDegrees = 360;
    for (let deg = 0; deg < totalDegrees; deg += degreeStep) {
      const angleRad = deg * Math.PI / 180;
      let diff = angleRad - cameraAngle;
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;

      if (diff > -fov / 2 && diff < fov / 2) {
        const x = angleToScreenX(diff, fov);
        ctx.fillText(deg + '°', x, 20);
      }
    }
  }

  function drawSheep(fov) {
    let diff = sheepAngle - cameraAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    if (diff > -fov / 2 && diff < fov / 2) {
      const x = angleToScreenX(diff, fov);
      const y = h / 2 + verticalOffset;

      ctx.drawImage(sheepImage, x - sheepSize / 2, y - sheepSize / 2, sheepSize, sheepSize);

      sheepScreenX = x;
      sheepScreenY = y;
      sheepVisible = true;
    } else {
      sheepVisible = false;
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

  let sheepScreenX = 0;
  let sheepScreenY = 0;
  let sheepVisible = false;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'white';

    const fovDegBase = 90;
    const fovDeg = fovDegBase / zoomFactor;
    const fov = fovDeg * Math.PI / 180;

    drawStars(bgStars, fov);
    drawStars(stars, fov);

    drawDegreeMarkers(fov);

    drawSheep(fov);
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

    const bounceLimit = 20;
    const returnSpeed = 0.8;

    if (verticalOffset > bounceLimit) {
      verticalOffset -= returnSpeed;
      if (verticalOffset < bounceLimit) verticalOffset = bounceLimit;
      verticalVelocity = 0;
    } else if (verticalOffset < -bounceLimit) {
      verticalOffset += returnSpeed;
      if (verticalOffset > -bounceLimit) verticalOffset = -bounceLimit;
      verticalVelocity = 0;
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

  function pointerUp(e) {
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

  canvas.addEventListener('click', function (e) {
    if (!sheepVisible) return;

    const dx = e.clientX - sheepScreenX;
    const dy = e.clientY - sheepScreenY;
    if (Math.sqrt(dx * dx + dy * dy) < sheepSize / 2) {
      const thumbnail = document.getElementById('sheepThumbnail');
      if (thumbnail) thumbnail.click();
    }
  });
})();
