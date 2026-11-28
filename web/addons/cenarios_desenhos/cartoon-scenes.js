const asset = name => new URL(name, import.meta.url).href;
const bikiniAsset = name => asset(`cenario_fenda_do_bikini_${name}.png`);

export const CARTOON_SCENES = {
  fenda_do_bikini: {label: 'Fenda do Bikini', background: asset('cenario_fenda_do_bikini.png'), fill: '#277fa9'},
  arandele: {label: 'Arandele', background: asset('cenario_arandele.png'), fill: '#7faa52'}
};

// Trim each pose from the irregular source sheets and keep its pivot at the feet.
const idle = [[17,0,29,33],[51,0,29,34],[86,0,29,34],[122,0,29,35],[156,0,29,35],[190,0,29,35],[230,1,29,35],[269,2,29,34],[304,3,29,33]];
const walk = [[0,7,31,37],[38,8,28,38],[74,10,24,36],[107,10,26,35],[144,12,28,35],[181,11,29,37],[218,10,27,38],[256,12,25,36],[291,14,25,35],[325,13,27,37]];
const lively = [[12,6,37,36],[54,6,38,35],[98,7,36,34],[142,6,29,36],[176,6,26,37],[208,6,26,36],[243,7,25,35],[275,8,27,34],[307,8,31,36]];
const gestures = [lively[0],lively[1],lively[2],lively[1]];
const jelly = [[21,413,224,271],[266,413,212,271],[492,413,230,271],[736,413,248,271],
  [995,413,230,271],[1231,413,208,271],[1468,413,207,271],[1676,413,232,271],[1936,413,213,271]];
const garry = [[45,132,325,252],[488,135,334,249],[932,135,355,249],[1369,114,394,270],
  [39,578,361,252],[488,578,331,252],[932,578,319,252],[1378,575,319,255]];

const actions = {
  walk: {weight: .50, speed: 14, frameMs: 125, sheet: 'bob_walk', poses: walk},
  idle: {weight: .25, speed: 0, frameMs: 210, sheet: 'bob_idle', poses: idle},
  gesture: {weight: .15, speed: 0, frameMs: 190, sheet: 'bob_walk2', poses: gestures},
  lively: {weight: .10, speed: 20, frameMs: 105, sheet: 'bob_walk2', poses: lively}
};

function chooseAction() {
  let chance = Math.random();
  for (const action of Object.values(actions)) {
    chance -= action.weight;
    if (chance < 0) return action;
  }
  return actions.lively;
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
  let frame, lastTick, lastPaint = -Infinity, elapsed = 0, actionAge = 0, actionDuration = 2300;
  let x = 217, direction = 1, action = actions.walk, speech;

  function drawPose(name, rect, x, floor, scale, direction = 1) {
    const image = images[name];
    if (!ctx || !image.complete || !image.naturalWidth) return;
    const [sx, sy, sw, sh] = rect;
    const width = Math.round(sw * scale), height = Math.round(sh * scale);
    ctx.save();
    ctx.translate(Math.round(x), Math.round(floor));
    ctx.scale(direction, 1);
    ctx.drawImage(image, sx, sy, sw, sh, -Math.floor(width / 2), -height, width, height);
    ctx.restore();
  }

  function paint() {
    if (!ctx) return;
    const time = motion.matches ? 0 : elapsed;
    ctx.clearRect(0, 0, 320, 320);
    ctx.imageSmoothingEnabled = false;
    const jellyPose = jelly[Math.floor(time / 175) % jelly.length];
    drawPose('agua_viva', jellyPose, 56 + 17 * Math.sin(time / 2300), 146 + 9 * Math.sin(time / 870), .105);
    drawPose('agua_viva', jelly[(Math.floor(time / 195) + 4) % jelly.length],
      267 + 19 * Math.sin(time / 2500), 92 + 13 * Math.sin(time / 1100), .082, -1);

    const path = time / 1000 % 20;
    const garryPose = garry[Math.floor(time / 180) % garry.length];
    drawPose('garry', garryPose,
      76 + 6 * Math.min(path, 20 - path), 262, .095, path < 10 ? 1 : -1);

    const current = motion.matches ? actions.idle : speech ? actions.gesture : action;
    const age = motion.matches ? 0 : speech ? elapsed - speech.start : actionAge;
    const pose = current.poses[Math.floor(age / current.frameMs) % current.poses.length];
    const bounce = !motion.matches && speech ? 3 * Math.abs(Math.sin(age / 140)) : 0;
    drawPose(current.sheet, pose, x, 250 - bounce, 1, current.speed ? direction : 1);
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
    if (!speech) {
      actionAge += delta;
      if (actionAge >= actionDuration) {
        action = chooseAction();
        actionAge = 0;
        actionDuration = 1900 + Math.random() * 600;
        if (action.speed) direction = Math.random() < .5 ? -1 : 1;
      }
      if ((x <= 174 && direction < 0) || (x >= 274 && direction > 0)) direction *= -1;
      x = Math.max(174, Math.min(274, x + direction * action.speed * delta / 1000));
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
