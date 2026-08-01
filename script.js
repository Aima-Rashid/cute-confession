const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H;
function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

/* ---------- MATRIX RAIN ---------- */
const chars = "01アイウエオカキクケコサシスセソABCDEFGHIJKLMN".split("");
const heart = "♥";
const fontSize = 16;
let columns, drops, columnWord;
const words = ["FAIRY", "LIPSERVICE"];
let burstTriggered = false;
let burstPulseTimer = 0;
let freezeTimer = 0;
const FREEZE_FRAMES = 9;
const PULSE_FRAMES = 18;
let pulseScale = 1;
let confetti = [];
let glitter = [];

function spawnConfetti(count){
  for(let i=0;i<count;i++){
    confetti.push({
      x: Math.random()*W,
      y: -20 - Math.random()*H*0.3,
      vx: (Math.random()-0.5)*2.4,
      vy: 2 + Math.random()*3,
      size: 6 + Math.random()*7,
      rot: Math.random()*Math.PI*2,
      vrot: (Math.random()-0.5)*0.25,
      hue: Math.random()*360,
      life: 220 + Math.random()*120,
      age: 0
    });
  }
}
function updateDrawConfetti(){
  for(let i=confetti.length-1; i>=0; i--){
    const c = confetti[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.025;
    c.rot += c.vrot;
    c.age++;
    const op = Math.max(0, 1 - c.age/c.life);
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);
    ctx.fillStyle = `hsla(${c.hue},85%,60%,${op})`;
    ctx.fillRect(-c.size/2, -c.size/4, c.size, c.size/2);
    ctx.restore();
    if(c.age > c.life || c.y > H + 30) confetti.splice(i,1);
  }
}

function spawnGlitter(count){
  for(let i=0;i<count;i++){
    glitter.push({
      x: Math.random()*W,
      y: Math.random()*H,
      size: 1.5 + Math.random()*2.5,
      phase: Math.random()*Math.PI*2,
      speed: 0.15 + Math.random()*0.25,
      hue: Math.random()*360,
      life: 260 + Math.random()*160,
      age: 0
    });
  }
}
function updateDrawGlitter(){
  for(let i=glitter.length-1; i>=0; i--){
    const g = glitter[i];
    g.age++;
    const flicker = (Math.sin(g.age*g.speed + g.phase) + 1) / 2;
    const lifeFade = Math.max(0, 1 - g.age/g.life);
    const op = flicker * lifeFade;
    if(op > 0.02){
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = `hsla(${g.hue},90%,75%,${op})`;
      ctx.fillStyle = `hsla(${g.hue},90%,80%,${op})`;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.size, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    if(g.age > g.life) glitter.splice(i,1);
  }
}

function initRain(){
  columns = Math.floor(W / fontSize);
  drops = new Array(columns).fill(0).map(()=> Math.random() * -50);
  columnWord = new Array(columns).fill(null).map(assignColumnWord);
}
function assignColumnWord(){
  return words[Math.floor(Math.random()*words.length)];
}
initRain();
window.addEventListener('resize', initRain);

function drawRain(introState, rainbowOn, freeze){
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0,0,W,H);
  ctx.font = (fontSize*pulseScale) + "px monospace";
  for(let i=0;i<columns;i++){
    const word = columnWord[i];
    const rowPos = Math.floor(drops[i]);
    const isHeart = Math.random() < 0.02;
    const ch = isHeart ? heart : word[((rowPos % word.length) + word.length) % word.length];
    const x = i*fontSize;
    const y = drops[i]*fontSize;
    if(y > 0 && y < H){
      let alphaMul = 1;
      if(introState){
        const revealY = introState.revealY;
        const fade = introState.fadeRange;
        if(y > revealY) alphaMul = 0;
        else if(y > revealY - fade) alphaMul = (revealY - y) / fade;
      }
      if(alphaMul > 0){
        let fillStyle;
        if(rainbowOn){
          const hue = (x*0.3 + y*0.5 + frameCount*3) % 360;
          fillStyle = `hsla(${hue},85%,62%,${0.85*alphaMul})`;
        } else {
          const shade = Math.random();
          let r,g,b,a;
          if(isHeart){
            r=255;g=77;b=120;a=0.9;
          } else if(shade < 0.08){
            r=255;g=180;b=200;a=0.95;
          } else {
            r=230;g=60;b=100;a=0.55;
          }
          fillStyle = `rgba(${r},${g},${b},${a*alphaMul})`;
        }
        ctx.fillStyle = fillStyle;
        ctx.fillText(ch, x, y);
      }
    }
    if(!freeze){
      if(y > H && Math.random() > 0.975){
        drops[i] = 0;
        columnWord[i] = assignColumnWord();
      }
      drops[i] += 0.55 + Math.random()*0.4;
    }
  }
}

function drawRevealFlash(revealY){
  const bandHeight = 50;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const grad = ctx.createLinearGradient(0, revealY-bandHeight/2, 0, revealY+bandHeight/2);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.5, "rgba(255,235,240,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, revealY-bandHeight/2, W, bandHeight);
  ctx.restore();
}

/* ---------- INTRO: REVEAL SWEEPS DOWN FROM THE TOP ---------- */
let introFrames = 130;

/* ---------- PARTICLE TEXT SYSTEM ---------- */
const off = document.createElement('canvas');
const offCtx = off.getContext('2d');

function sampleText(text, fontSizePx, step, yOffset){
  off.width = W;
  off.height = H;
  offCtx.clearRect(0,0,W,H);
  offCtx.fillStyle = "#fff";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  let size = fontSizePx;
  offCtx.font = `900 ${size}px 'Arial Black', sans-serif`;
  let width = offCtx.measureText(text).width;
  const maxWidth = W * 0.82;
  while(width > maxWidth && size > 16){
    size -= 4;
    offCtx.font = `900 ${size}px 'Arial Black', sans-serif`;
    width = offCtx.measureText(text).width;
  }
  offCtx.fillText(text, W/2, H/2 + yOffset);
  const imgData = offCtx.getImageData(0,0,W,H).data;
  const points = [];
  for(let y=0; y<H; y+=step){
    for(let x=0; x<W; x+=step){
      const idx = (y*W + x)*4;
      if(imgData[idx+3] > 128){
        points.push({x, y});
      }
    }
  }
  for(let i=points.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [points[i],points[j]] = [points[j],points[i]];
  }
  return points;
}

let particles = [];
let currentEase = 0.08;

function assignTargets(points, radiusRange, opVal){
  const n = points.length;
  while(particles.length < n){
    particles.push({
      x: W/2 + (Math.random()-0.5)*W*0.7,
      y: H/2 + (Math.random()-0.5)*H*0.7,
      tx:0, ty:0, r:1, op:1, seed: Math.random()*1000, active:false
    });
  }
  for(let i=0;i<particles.length;i++){
    if(i < n){
      particles[i].tx = points[i].x;
      particles[i].ty = points[i].y;
      particles[i].r = radiusRange[0] + Math.random()*(radiusRange[1]-radiusRange[0]);
      particles[i].op = opVal;
      particles[i].active = true;
    } else {
      particles[i].active = false;
    }
  }
}

function scatterActiveParticles(radiusRange, opVal){
  for(const p of particles){
    if(!p.active) continue;
    p.tx = Math.random()*W;
    p.ty = Math.random()*H;
    p.r = radiusRange[0] + Math.random()*(radiusRange[1]-radiusRange[0]);
    p.op = opVal;
  }
}

function updateParticles(t){
  for(const p of particles){
    if(!p.active) continue;
    const jitterX = Math.sin(t + p.seed) * 1.2;
    const jitterY = Math.cos(t*1.3 + p.seed) * 1.2;
    p.x += (p.tx + jitterX - p.x) * currentEase;
    p.y += (p.ty + jitterY - p.y) * currentEase;
  }
}

function drawOrnamentParticles(fadeMult){
  for(const p of particles){
    if(!p.active) continue;
    const op = p.op * fadeMult;
    const grad = ctx.createRadialGradient(p.x-p.r*0.3, p.y-p.r*0.3, p.r*0.1, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(255,255,255,${0.95*op})`);
    grad.addColorStop(0.55, `rgba(248,238,224,${0.75*op})`);
    grad.addColorStop(1, `rgba(248,238,224,0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }
}

/* ---------- SEQUENCE ---------- */
const STAGE = { INTRO:0, NUM3:1, NUM2:2, NUM1:3, SCATTER:4, PAUSE:5, FINAL:6, HOLD:7, FADEOUT:8 };
let stage = STAGE.INTRO;
let stageTimer = 0;
let frameCount = 0;

const finalWords = ["YOU", "ARE", "GAY!!"];
let finalWordIndex = 0;
const FINAL_WORD_HOLD = 60;

function showFinalWord(idx, ease){
  currentEase = ease;
  assignTargets(sampleText(finalWords[idx], 190, 6, -H*0.10), [2,3.4], 1);
}

function enterStage(s){
  stage = s;
  stageTimer = 0;
  if(s === STAGE.NUM3){
    currentEase = 0.06;
    assignTargets(sampleText("3", 340, 10, 0), [4,7], 1);
  } else if(s === STAGE.NUM2){
    currentEase = 0.06;
    assignTargets(sampleText("2", 340, 10, 0), [4,7], 1);
  } else if(s === STAGE.NUM1){
    currentEase = 0.06;
    assignTargets(sampleText("1", 340, 10, 0), [4,7], 1);
  } else if(s === STAGE.SCATTER){
    currentEase = 0.04;
    scatterActiveParticles([1,1.8], 0.4);
  } else if(s === STAGE.FINAL){
    finalWordIndex = 0;
    showFinalWord(0, 0.3);
  } else if(s === STAGE.HOLD){
    freezeTimer = FREEZE_FRAMES;
    burstTriggered = false;
  }
}

const STAGE_LEN = {
  [STAGE.NUM3]: 95,
  [STAGE.NUM2]: 95,
  [STAGE.NUM1]: 100,
  [STAGE.SCATTER]: 60,
  [STAGE.PAUSE]: 130,
  [STAGE.HOLD]: 200,
  [STAGE.FADEOUT]: 60
};

function loop(){
  const t = frameCount * 0.02;

  let fadeMult = 1;
  if(stage === STAGE.FADEOUT){
    fadeMult = Math.max(0, 1 - stageTimer / STAGE_LEN[STAGE.FADEOUT]);
  }

  if(stage === STAGE.HOLD && freezeTimer > 0){
    freezeTimer--;
    if(freezeTimer === 0){
      burstTriggered = true;
      burstPulseTimer = 0;
      spawnConfetti(180);
      spawnGlitter(150);
    }
  }
  const isFrozen = (stage === STAGE.HOLD && freezeTimer > 0);

  if(burstTriggered && burstPulseTimer < PULSE_FRAMES){
    burstPulseTimer++;
  }
  pulseScale = burstTriggered ? 1 + Math.sin(Math.min(burstPulseTimer/PULSE_FRAMES,1)*Math.PI)*0.5 : 1;

  if(stage === STAGE.INTRO){
    const progress = Math.min(1, frameCount / introFrames);
    const revealY = H * progress;
    drawRain({ revealY, fadeRange: 90 }, false, false);
    drawRevealFlash(revealY);
    if(progress >= 1) enterStage(STAGE.NUM3);
  } else {
    drawRain(null, burstTriggered, isFrozen);
    if(!isFrozen) updateParticles(t);
    drawOrnamentParticles(fadeMult);
    updateDrawConfetti();
    updateDrawGlitter();
    stageTimer++;

    if(stage === STAGE.NUM3 && stageTimer > STAGE_LEN[STAGE.NUM3]) enterStage(STAGE.NUM2);
    else if(stage === STAGE.NUM2 && stageTimer > STAGE_LEN[STAGE.NUM2]) enterStage(STAGE.NUM1);
    else if(stage === STAGE.NUM1 && stageTimer > STAGE_LEN[STAGE.NUM1]) enterStage(STAGE.SCATTER);
    else if(stage === STAGE.SCATTER && stageTimer > STAGE_LEN[STAGE.SCATTER]) enterStage(STAGE.PAUSE);
    else if(stage === STAGE.PAUSE && stageTimer > STAGE_LEN[STAGE.PAUSE]) enterStage(STAGE.FINAL);
    else if(stage === STAGE.FINAL && stageTimer > FINAL_WORD_HOLD){
      finalWordIndex++;
      if(finalWordIndex < finalWords.length){
        showFinalWord(finalWordIndex, 0.09);
        stageTimer = 0;
      } else {
        enterStage(STAGE.HOLD);
      }
    }
    else if(stage === STAGE.HOLD && stageTimer > STAGE_LEN[STAGE.HOLD]) enterStage(STAGE.FADEOUT);
    else if(stage === STAGE.FADEOUT && stageTimer > STAGE_LEN[STAGE.FADEOUT]) resetAll();
  }

  frameCount++;
  requestAnimationFrame(loop);
}

function resetAll(){
  particles.forEach(p=> p.active=false);
  frameCount = 0;
  stage = STAGE.INTRO;
  stageTimer = 0;
  burstTriggered = false;
  burstPulseTimer = 0;
  freezeTimer = 0;
  pulseScale = 1;
  confetti = [];
  glitter = [];
}

document.getElementById('restart').addEventListener('click', resetAll);
loop();
