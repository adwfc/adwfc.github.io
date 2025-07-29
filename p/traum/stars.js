(() => {
  const canvas = document.getElementById('starCanvas');
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  const fovDegBase = 90;

  const triggerImg1 = new Image();
  triggerImg1.src = 'schaf-trigger.png';
  const triggerRadius1 = 30;
  const triggerAngle1 = 0;
  const triggerYOffset1 = -40;

  const triggerImg2 = new Image();
  triggerImg2.src = 'galerie-trigger.png';
  const triggerRadius2 = 30;
  const triggerAngle2 = 0.5;
  const triggerOffsetX2 = 80;
  const triggerYOffset2 = 80;

  // Neuer Trigger 3
  const triggerImg3 = new Image();
  triggerImg3.src = 'kreise-trigger.png';
  const triggerRadius3 = 30;
  const triggerAngle3 = -0.5;
  const triggerOffsetX3 = -80;
  const triggerYOffset3 = 60;

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

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'white';

    const fovDeg = fovDegBase / zoomFactor;
    const fov = fovDeg * Math.PI / 180;

    drawStars(bgStars, fov);
    drawStars(stars, fov);

    // Trigger 1
    let diff1 = triggerAngle1 - cameraAngle;
    if (diff1 > Math.PI) diff1 -= 2 * Math.PI;
    if (diff1 < -Math.PI) diff1 += 2 * Math.PI;

    if (diff1 > -fov / 2 && diff1 < fov / 2) {
      const x1 = angleToScreenX(diff1, fov);
      const y1 = h / 2 + verticalOffset + triggerYOffset1;
      ctx.drawImage(triggerImg1, x1 - triggerRadius1, y1 - triggerRadius1, triggerRadius1 * 2, triggerRadius1 * 2);
    }

    // Trigger 2
    let diff2 = triggerAngle2 - cameraAngle;
    if (diff2 > Math.PI) diff2 -= 2 * Math.PI;
    if (diff2 < -Math.PI) diff2 += 2 * Math.PI;

    if (diff2 > -fov / 2 && diff2 < fov / 2) {
      const x2 = angleToScreenX(diff2, fov) + triggerOffsetX2;
      const y2 = h / 2 + verticalOffset + triggerYOffset2;
      ctx.drawImage(triggerImg2, x2 - triggerRadius2, y2 - triggerRadius2, triggerRadius2 * 2, triggerRadius2 * 2);
    }

    // Trigger 3
    let diff3 = triggerAngle3 - cameraAngle;
    if (diff3 > Math.PI) diff3 -= 2 * Math.PI;
    if (diff3 < -Math.PI) diff3 += 2 * Math.PI;

    if (diff3 > -fov / 2 && diff3 < fov / 2) {
      const x3 = angleToScreenX(diff3, fov) + triggerOffsetX3;
      const y3 = h / 2 + verticalOffset + triggerYOffset3;
      ctx.drawImage(triggerImg3, x3 - triggerRadius3, y3 - triggerRadius3, triggerRadius3 * 2, triggerRadius3 * 2);
    }
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

      if (zoomFactor <= 10 && Math.abs(deltaY) > 0) {
        const verticalSensitivity = 0.3;
        verticalVelocity += deltaY * verticalSensitivity;
      }
    }
  }

  function pointerUp(e) {
    isDragging = false;
    lastDistance = null;
    velocity *= 0.5;
    zoomVelocity *= 0.5;
  }

  canvas.addEventListener('mousedown', pointerDown);
  canvas.addEventListener('mousemove', pointerMove);
  canvas.addEventListener('mouseup', pointerUp);
  canvas.addEventListener('mouseleave', pointerUp);

  canvas.addEventListener('touchstart', pointerDown);
  canvas.addEventListener('touchmove', pointerMove);
  canvas.addEventListener('touchend', pointerUp);
  canvas.addEventListener('touchcancel', pointerUp);

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const fovDeg = fovDegBase / zoomFactor;
    const fov = fovDeg * Math.PI / 180;

    // Trigger 1
    let diff1 = triggerAngle1 - cameraAngle;
    if (diff1 > Math.PI) diff1 -= 2 * Math.PI;
    if (diff1 < -Math.PI) diff1 += 2 * Math.PI;

    if (diff1 > -fov / 2 && diff1 < fov / 2) {
      const x1 = angleToScreenX(diff1, fov);
      const y1 = h / 2 + verticalOffset + triggerYOffset1;
      const dx1 = clickX - x1;
      const dy1 = clickY - y1;

      if (dx1 * dx1 + dy1 * dy1 <= triggerRadius1 * triggerRadius1) {
        window.open('schaf.html', '_blank');
        return;
      }
    }

    // Trigger 2
    let diff2 = triggerAngle2 - cameraAngle;
    if (diff2 > Math.PI) diff2 -= 2 * Math.PI;
    if (diff2 < -Math.PI) diff2 += 2 * Math.PI;

    if (diff2 > -fov / 2 && diff2 < fov / 2) {
      const x2 = angleToScreenX(diff2, fov) + triggerOffsetX2;
      const y2 = h / 2 + verticalOffset + triggerYOffset2;
      const dx2 = clickX - x2;
      const dy2 = clickY - y2;

      if (dx2 * dx2 + dy2 * dy2 <= triggerRadius2 * triggerRadius2) {
        window.open('galerie.html', '_blank');
        return;
      }
    }

    // Trigger 3
    let diff3 = triggerAngle3 - cameraAngle;
    if (diff3 > Math.PI) diff3 -= 2 * Math.PI;
    if (diff3 < -Math.PI) diff3 += 2 * Math.PI;

    if (diff3 > -fov / 2 && diff3 < fov / 2) {
      const x3 = angleToScreenX(diff3, fov) + triggerOffsetX3;
      const y3 = h / 2 + verticalOffset + triggerYOffset3;
      const dx3 = clickX - x3;
      const dy3 = clickY - y3;

      if (dx3 * dx3 + dy3 * dy3 <= triggerRadius3 * triggerRadius3) {
        window.open('kreise.html', '_blank');
        return;
      }
    }
  });
})();
