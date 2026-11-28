const asset = name => new URL(name, import.meta.url).href;
const bikiniAsset = name => asset(`cenario_fenda_do_bikini_${name}.png`);

export const CARTOON_SCENES = {
  fenda_do_bikini: {label: 'Fenda do Bikini', background: asset('cenario_fenda_do_bikini.png'), fill: '#277fa9'},
  arandele: {label: 'Arandele', background: asset('cenario_arandele.png'), fill: '#7faa52'}
};

// Each Bob pose anchors the head horizontally and the lowest foot vertically.
// Centering the entire crop would shift his torso as his arms and legs swing.
const idle = [[17,0,29,33],[86,0,29,34],[122,0,29,35],[156,0,29,35],
  [190,0,29,35],[230,1,29,35],[269,2,29,34],[230,1,29,35],[86,0,29,34]];
const walk = [[0,7,31,37,17],[38,8,28,38,15],[74,10,24,36,11],[107,10,26,35,14],
  [144,12,28,35,16],[181,11,29,37,17],[218,10,27,38,14],[256,12,25,36,12],
  [291,14,25,35,12],[325,13,27,37,14]];
const gestures = [[12,6,37,36,18],[54,6,38,35,20],[98,7,36,34,17],[54,6,38,35,20]];
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
    const jellyPose = jelly[Math.floor(time / 175) % jelly.length];
    const drift = time / 6800;
    drawPose('agua_viva', jellyPose, 159 - 123 * Math.cos(drift),
      119 + 31 * Math.sin(drift) + 4 * Math.sin(time / 870), .105);
    drawPose('agua_viva', jelly[(Math.floor(time / 195) + 4) % jelly.length],
      159 + 121 * Math.cos(time / 8200), 67 + 33 * Math.sin(time / 8200) + 4 * Math.sin(time / 1100), .082);

    const bob = sandPosition(bobAngle, 105, 45);
    const snail = sandPosition(garryAngle, 83, 54);
    const garryPose = garry[Math.floor(time / 180) % garry.length];
    const current = motion.matches ? actions.idle : speech ? actions.gesture : action;
    const age = motion.matches ? 0 : speech ? elapsed - speech.start : actionAge;
    const pose = current.poses[Math.floor(age / current.frameMs) % current.poses.length];
    const actors = [
      {...bob, sheet: current.sheet, pose, scale: 1, shadow: 8},
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

  const images = Object.fromEntries(['bob_idle', 'bob_walk', 'bob_walk2', 'garry', 'agua_viva'].map(name => {
    const image = new Image();
    image.onload = paint;
    image.src = bikiniAsset(name);
    return [name, image];
  }));

  function tick(now) {
    const delta = Math.min(80, now - (lastTick ?? now));
    lastTick = now;
    elapsed += delta;
    garryAngle = followSand(garryAngle, delta / 1000, 13, 83, 54);
    if (!speech) {
      actionAge += delta;
      if (actionAge >= actionDuration) {
        action = chooseAction();
        actionAge = 0;
        const cycle = action.poses.length * action.frameMs;
        actionDuration = Math.max(1, Math.round(2200 / cycle)) * cycle;
      }
      bobAngle = followSand(bobAngle, delta / 1000, action.speed, 105, 45);
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
