const asset = name => new URL(name, import.meta.url).href;
const bikiniAsset = name => asset(`cenario_fenda_do_bikini_${name}.${name === 'bob_up_after_fall' ? 'gif' : 'png'}`);

export const CARTOON_SCENES = {
  fenda_do_bikini: {label: 'Fenda do Bikini', background: asset('cenario_fenda_do_bikini.png'), fill: '#277fa9'},
  arandele: {label: 'Arandele', background: asset('cenario_arandele.png'), fill: '#7faa52'}
};

// Each Bob pose anchors the head horizontally and the lowest foot vertically.
// Centering the entire crop would shift his torso as his arms and legs swing.
const standing = [17,0,29,33];
const idle = [standing,standing,standing,standing,standing,standing,
  [156,0,29,35],[190,0,29,35],standing];
const walk = [[0,7,31,37,17],[38,8,28,38,15],[74,10,24,36,11],[107,10,26,35,14],
  [144,12,28,35,16],[181,11,29,37,17],[218,10,27,38,14],[256,12,25,36,12],
  [291,14,25,35,12],[325,13,27,37,14]];
const gestures = [[12,6,37,36,18],[54,6,38,35,20],[98,7,36,34,17],[54,6,38,35,20]];
const braking = [[142,6,29,36,14],[243,7,25,35,12],[275,8,27,34,13]];
const fallen = [305,39,47,13,17];
const fall = [[18,18,41,35,19],[64,18,38,35,18],[107,20,39,33,18],
  [151,34,43,19,17],[199,34,40,19,17],[244,37,47,16,17],fallen,fallen,fallen];
const recovery = [[17,20,34,29,16],[56,20,35,29,16],[96,21,34,28,16],
  [135,21,34,28,15],[242,20,34,29,16],[281,21,31,28,14],[351,20,27,29,13]];
const jelly = [[21,409,224,289],[266,409,212,289],[492,409,230,289],[736,409,248,289],
  [995,409,230,289],[1231,409,208,289],[1468,409,207,289],[1676,409,232,289],[1936,409,213,289]];
const garry = [[45,132,325,252],[488,135,334,249],[932,135,355,249],[1369,114,394,270],
  [39,578,361,252],[488,578,331,252],[932,578,319,252],[1378,575,319,255]];

const actions = {
  walk: {weight: .50, speed: 14, frameMs: 125, sheet: 'bob_walk', poses: walk},
  idle: {weight: .25, speed: 0, frameMs: 210, sheet: 'bob_idle', poses: idle},
  gesture: {weight: .15, speed: 0, frameMs: 190, sheet: 'bob_walk2', poses: gestures},
  lively: {weight: .10, speed: 21, frameMs: 92, sheet: 'bob_walk', poses: walk}
};
const settle = {speed: 0, frameMs: 105, sheet: 'bob_walk2', poses: braking};
const stumble = {speed: 0, frameMs: 110, sheet: 'bob_fall', poses: fall};
const getUp = {speed: 0, frameMs: 105, sheet: 'bob_up_after_fall', poses: recovery};

function chooseAction() {
  let chance = Math.random();
  for (const action of Object.values(actions)) {
    chance -= action.weight;
    if (chance < 0) return action;
  }
  return actions.lively;
}

function followSand(angle, seconds, speed, radiusX, radiusY) {
  const tangent = Math.hypot(radiusX * Math.sin(angle), radiusY * Math.cos(angle));
  return (angle + seconds * speed / tangent) % (2 * Math.PI);
}

function sandPosition(angle, radiusX, radiusY) {
  return {
    x: 159 + radiusX * Math.cos(angle),
    floor: 229 + radiusY * Math.sin(angle),
    direction: Math.sin(angle) > 0 ? -1 : 1
  };
}

export function mountBikiniBottom(stage) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 320;
  canvas.className = 'v64-scene-frame';
  canvas.style.cssText = 'position:absolute;inset:0';
  canvas.setAttribute('aria-hidden', 'true');
  stage.append(canvas);
  const ctx = canvas.getContext('2d');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame, lastTick, lastPaint = -Infinity, elapsed = 0, actionAge = 0;
  let bobAngle = 0.93, garryAngle = 2.44, action = actions.walk;
  let actionDuration = 2 * walk.length * actions.walk.frameMs, speech;
  let afterSettle, approachSpeed = 0, nextFall = 19_000;

  function startAction(next, cycles = 1) {
    action = next;
    actionAge = 0;
    actionDuration = next.poses.length * next.frameMs * cycles;
  }

  function advanceAction() {
    if (action === settle) return startAction(afterSettle);
    if (action === stumble) return startAction(getUp);
    if (action === getUp) return startAction(actions.idle);

    const next = elapsed >= nextFall ? stumble : chooseAction();
    if (next === stumble) nextFall = elapsed + 36_000 + Math.random() * 14_000;
    if (action.speed && !next.speed) {
      afterSettle = next;
      approachSpeed = action.speed;
      return startAction(settle);
    }
    const cycle = next.poses.length * next.frameMs;
    startAction(next, Math.max(1, Math.round(2200 / cycle)));
  }

  function isRecovering() {
    return action === stumble || action === getUp;
  }

  function drawPose(name, rect, x, floor, scale, direction = 1) {
    const image = images[name];
    if (!ctx || !image.complete || !image.naturalWidth) return;
    const [sx, sy, sw, sh, pivotX = sw / 2] = rect;
    const width = Math.round(sw * scale), height = Math.round(sh * scale);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(floor));
    ctx.scale(direction, 1);
    ctx.drawImage(image, sx, sy, sw, sh, -Math.round(pivotX * scale), -height, width, height);
    ctx.restore();
  }

  function paint() {
    if (!ctx) return;
    const time = elapsed;
    ctx.clearRect(0, 0, 320, 320);
    ctx.imageSmoothingEnabled = false;
    const jellyPose = jelly[Math.floor(time / 300) % jelly.length];
    const drift = time / 19_000;
    drawPose('agua_viva', jellyPose, 159 - 123 * Math.cos(drift),
      76 + 18 * Math.sin(drift) + 3 * Math.sin(time / 2900), .105);
    drawPose('agua_viva', jelly[(Math.floor(time / 340) + 4) % jelly.length],
      159 + 121 * Math.cos(time / 23_000), 52 + 13 * Math.sin(time / 23_000) + 2 * Math.sin(time / 3500), .082);

    const bob = sandPosition(bobAngle, 105, 45);
    const snail = sandPosition(garryAngle, 83, 54);
    const garryPose = garry[Math.floor(time / 345) % garry.length];
    const talking = speech && !isRecovering();
    const current = motion.matches ? actions.idle : talking ? actions.gesture : action;
    const age = motion.matches ? 0 : talking ? elapsed - speech.start : actionAge;
    const pose = current.poses[Math.floor(age / current.frameMs) % current.poses.length];
    const actors = [
      {...bob, sheet: current.sheet, pose, scale: 1, shadow: current === stumble && age >= 330 ? 15 : 8},
      {...snail, sheet: 'garry', pose: garryPose, scale: .095, shadow: 12}
    ];
    actors.sort((a, b) => a.floor - b.floor);
    for (const actor of actors) {
      ctx.fillStyle = 'rgba(111, 66, 34, .19)';
      ctx.beginPath();
      ctx.ellipse(Math.round(actor.x), Math.round(actor.floor), actor.shadow, 2, 0, 0, 2 * Math.PI);
      ctx.fill();
      drawPose(actor.sheet, actor.pose, actor.x, actor.floor, actor.scale, actor.direction);
    }
  }

  const images = Object.fromEntries(['bob_idle', 'bob_walk', 'bob_walk2', 'bob_fall', 'bob_up_after_fall', 'garry', 'agua_viva'].map(name => {
    const image = new Image();
    image.onload = paint;
    image.src = bikiniAsset(name);
    return [name, image];
  }));

  function tick(now) {
    const delta = Math.min(80, now - (lastTick ?? now));
    lastTick = now;
    elapsed += delta;
    garryAngle = followSand(garryAngle, delta / 1000, 5, 83, 54);
    if (!speech || isRecovering()) {
      actionAge += delta;
      if (actionAge >= actionDuration) advanceAction();
      const speed = action === settle ? approachSpeed * (1 - actionAge / actionDuration) : action.speed;
      bobAngle = followSand(bobAngle, delta / 1000, speed, 105, 45);
    }
    if (now - lastPaint >= 32) {
      paint();
      lastPaint = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    lastTick = undefined;
    if (motion.matches) paint();
    else frame = requestAnimationFrame(tick);
  }

  motion.addEventListener('change', syncMotion);
  syncMotion();

  return {
    speak() {
      const line = {start: elapsed};
      speech = line;
      paint();
      return () => { if (speech === line) speech = undefined; };
    },
    destruir() {
      motion.removeEventListener('change', syncMotion);
      cancelAnimationFrame(frame);
      for (const image of Object.values(images)) image.onload = null;
      canvas.remove();
    }
  };
}
