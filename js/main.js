/* =========================================================
   BODA — shared behaviour
   ========================================================= */

/* ---------- Mobile nav ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav){
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
});

/* =========================================================
   Generative canvas scenes (no external imagery)
   ========================================================= */
function fitCanvas(canvas){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

/* Flowing light-wave field — used in the homepage hero */
function sceneWaveField(canvas, opts = {}){
  let ctx = fitCanvas(canvas);
  let w = canvas.clientWidth, h = canvas.clientHeight;
  const lines = opts.lines || 46;
  const hue = opts.color || '255,255,255';
  let t = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(){
    ctx.clearRect(0,0,w,h);
    const grad = ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,'#050505');
    grad.addColorStop(1,'#0a0c08');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);

    for(let i=0;i<lines;i++){
      const py = (i/lines) * h * 1.3 - h*0.15;
      ctx.beginPath();
      for(let x=0;x<=w;x+=8){
        const n = Math.sin(x*0.006 + i*0.4 + t) * 26
                + Math.sin(x*0.013 - i*0.25 + t*1.4) * 14
                + Math.cos(i*0.6 + t*0.6) * 18;
        const y = py + n + Math.sin(x*0.002 + t*0.3)*40;
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      const alpha = 0.035 + 0.10 * Math.abs(Math.sin(i*0.35 + t*0.5));
      ctx.strokeStyle = `rgba(${hue},${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if(!reduced) t += 0.006;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { ctx = fitCanvas(canvas); w = canvas.clientWidth; h = canvas.clientHeight; });
}

/* Particle cloud — drifting points forming a soft mass */
function sceneParticleCloud(canvas, opts = {}){
  let ctx = fitCanvas(canvas);
  let w = canvas.clientWidth, h = canvas.clientHeight;
  const count = opts.count || 260;
  const particles = [];
  for(let i=0;i<count;i++){
    particles.push({
      a: Math.random()*Math.PI*2,
      r: Math.random()*0.4 + 0.6,
      cx: 0.5 + (Math.random()-0.5)*0.6,
      cy: 0.55 + (Math.random()-0.5)*0.35,
      rad: Math.random()*0.28 + 0.05,
      sp: Math.random()*0.4 + 0.2
    });
  }
  let t = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(){
    ctx.fillStyle = '#04050a';
    ctx.fillRect(0,0,w,h);
    particles.forEach(p=>{
      const x = (p.cx + Math.cos(p.a + t*p.sp)*p.rad) * w;
      const y = (p.cy + Math.sin(p.a + t*p.sp*1.3)*p.rad*0.6) * h;
      ctx.beginPath();
      ctx.arc(x,y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(220,230,255,0.55)';
      ctx.fill();
    });
    if(!reduced) t += 0.01;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { ctx = fitCanvas(canvas); w = canvas.clientWidth; h = canvas.clientHeight; });
}

/* Branching tree of light lines */
function sceneTree(canvas, opts = {}){
  let ctx = fitCanvas(canvas);
  let w = canvas.clientWidth, h = canvas.clientHeight;
  let t = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function branch(x,y,len,ang,depth,sway){
    if(depth===0 || len<4) return;
    const a = ang + Math.sin(t + depth)*sway;
    const x2 = x + Math.cos(a)*len;
    const y2 = y + Math.sin(a)*len;
    ctx.globalAlpha = 0.18 + depth*0.05;
    ctx.beginPath();
    ctx.moveTo(x,y); ctx.lineTo(x2,y2);
    ctx.stroke();
    branch(x2,y2,len*0.74, a - 0.5, depth-1, sway);
    branch(x2,y2,len*0.74, a + 0.5, depth-1, sway);
  }
  function draw(){
    ctx.fillStyle = '#070708';
    ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = '#f2f2f0';
    ctx.lineWidth = 1;
    branch(w*0.5, h*0.95, h*0.22, -Math.PI/2, 9, 0.10);
    if(!reduced) t += 0.01;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { ctx = fitCanvas(canvas); w = canvas.clientWidth; h = canvas.clientHeight; });
}

/* Vertical rain / falling streaks */
function sceneRain(canvas, opts = {}){
  let ctx = fitCanvas(canvas);
  let w = canvas.clientWidth, h = canvas.clientHeight;
  const count = opts.count || 90;
  const drops = [];
  for(let i=0;i<count;i++){
    drops.push({ x: Math.random()*w, y: Math.random()*h, len: Math.random()*60+20, sp: Math.random()*2+1, op: Math.random()*0.4+0.1 });
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(){
    ctx.fillStyle = 'rgba(6,8,14,1)';
    ctx.fillRect(0,0,w,h);
    drops.forEach(d=>{
      ctx.strokeStyle = `rgba(180,210,255,${d.op})`;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.len);
      ctx.stroke();
      if(!reduced){ d.y += d.sp; if(d.y > h) d.y = -d.len; }
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { ctx = fitCanvas(canvas); w = canvas.clientWidth; h = canvas.clientHeight; });
}

/* Concentric ripple / breathing rings */
function sceneRipple(canvas, opts = {}){
  let ctx = fitCanvas(canvas);
  let w = canvas.clientWidth, h = canvas.clientHeight;
  let t = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(){
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0,0,w,h);
    const cx = w*0.5, cy = h*0.55;
    for(let i=0;i<10;i++){
      const r = (i*26 + (t*30 % 26)) ;
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle = `rgba(255,255,255,${0.22 - i*0.02})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if(!reduced) t += 0.02;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { ctx = fitCanvas(canvas); w = canvas.clientWidth; h = canvas.clientHeight; });
}

/* Grid of pulsing dots */
function sceneDotGrid(canvas, opts = {}){
  let ctx = fitCanvas(canvas);
  let w = canvas.clientWidth, h = canvas.clientHeight;
  let t = 0;
  const gap = opts.gap || 16;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function draw(){
    ctx.fillStyle = '#070809';
    ctx.fillRect(0,0,w,h);
    for(let y=gap/2; y<h; y+=gap){
      for(let x=gap/2; x<w; x+=gap){
        const d = Math.hypot(x-w*0.5, y-h*0.5);
        const wave = Math.sin(d*0.05 - t)*0.5+0.5;
        ctx.beginPath();
        ctx.arc(x,y, 0.6 + wave*1.6, 0, Math.PI*2);
        ctx.fillStyle = `rgba(230,255,180,${0.08 + wave*0.25})`;
        ctx.fill();
      }
    }
    if(!reduced) t += 0.04;
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { ctx = fitCanvas(canvas); w = canvas.clientWidth; h = canvas.clientHeight; });
}

/* Auto-init canvases that declare data-scene */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('canvas[data-scene]').forEach(c => {
    const kind = c.dataset.scene;
    if(kind==='wave') sceneWaveField(c);
    else if(kind==='cloud') sceneParticleCloud(c);
    else if(kind==='tree') sceneTree(c);
    else if(kind==='rain') sceneRain(c);
    else if(kind==='ripple') sceneRipple(c);
    else if(kind==='dots') sceneDotGrid(c);
  });
});

/* =========================================================
   Hero slider (home)
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-dots span');
  const prev = document.querySelector('.hero-arrow.prev');
  const next = document.querySelector('.hero-arrow.next');
  if(!slides.length) return;
  let active = 0;
  const titles = [
    ['EXPERIENTIAL ART,', 'EXPANDING SENSES'],
    ['BEYOND THE FRAME,', 'INTO THE FIELD'],
    ['LIGHT AS MATTER,', 'SPACE AS SENSE'],
    ['EVERY SURFACE', 'BECOMES A WAVE']
  ];
  const titleEl = document.querySelector('.hero-title');
  function render(){
    slides.forEach((s,i)=> s.classList.toggle('active', i===active));
    if(titleEl && titles[active]){
      titleEl.innerHTML = `${titles[active][0]}<br>${titles[active][1].split(' ')[0]} <span class="accent">${titles[active][1].split(' ').slice(1).join(' ')}</span>`;
    }
  }
  function go(dir){ active = (active + dir + slides.length) % slides.length; render(); }
  prev && prev.addEventListener('click', ()=>go(-1));
  next && next.addEventListener('click', ()=>go(1));
  slides.forEach((s,i)=> s.addEventListener('click', ()=>{ active=i; render(); }));
  render();
  setInterval(()=>go(1), 7000);
});

/* =========================================================
   Art Shop filters
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('[data-cat]');
  if(!pills.length) return;
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(x=>x.classList.remove('active'));
    p.classList.add('active');
    const cat = p.dataset.filter;
    cards.forEach(c => {
      c.style.display = (cat==='all' || c.dataset.cat===cat) ? '' : 'none';
    });
  }));
});

/* =========================================================
   Ticket page — calendar + quantity + totals
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('calGrid');
  if(!grid) return;

  // June 2025 — Sun(0)..Sat(6); week starts Monday per wireframe
  const year = 2025, month = 5; // June (0-indexed)
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const offset = (firstDay + 6) % 7; // convert so Monday=0

  // price class lookup matching wireframe pattern
  const priceMap = {
    6:'p-37',7:'p-39',8:'p-39',
    9:'p-35',10:'p-35',11:'p-35',12:'p-35',13:'p-35',14:'p-35',15:'p-35',
    16:'p-37',17:'p-37',18:'p-37',19:'p-36',20:'p-37',21:'p-37',22:'p-37',
    23:'p-35',24:'p-35',25:'p-35',26:'p-36',27:'p-35',28:'p-35',29:'p-35',
    30:'p-35',
    1:'p-35',2:'p-35',3:'p-35',4:'p-35',5:'p-35'
  };
  const soldOut = [19,26];
  const almostSoldOut = [6,7,14];

  for(let i=0;i<offset;i++){
    const e = document.createElement('div');
    e.className='day empty';
    grid.appendChild(e);
  }
  for(let d=1; d<=daysInMonth; d++){
    const cell = document.createElement('div');
    cell.className = 'day ' + (priceMap[d] || 'p-35');
    cell.textContent = d;
    if(almostSoldOut.includes(d)){
      const flag = document.createElement('span');
      flag.className='flag';
      cell.appendChild(flag);
    }
    if(soldOut.includes(d)){
      cell.style.opacity = '0.45';
      cell.style.pointerEvents='none';
    } else {
      cell.addEventListener('click', () => {
        grid.querySelectorAll('.day').forEach(x=>x.classList.remove('selected'));
        cell.classList.add('selected');
      });
    }
    if(d===7) cell.classList.add('selected');
    grid.appendChild(cell);
  }

  // Quantity steppers
  const prices = { adult: 35000, teen: 26000, child: 14000, disabled: 17000 };
  const totalEl = document.getElementById('totalAmount');
  const adultLineEl = document.getElementById('adultLine');

  function recalc(){
    let total = 0, adultQty = 0;
    document.querySelectorAll('.qty-stepper').forEach(st=>{
      const key = st.dataset.key;
      const val = parseInt(st.querySelector('.val').textContent,10);
      total += prices[key] * val;
      const amt = st.closest('.qty-row').querySelector('.amt');
      if(key==='adult') adultQty = val;
    });
    totalEl.textContent = 'KRW ' + total.toLocaleString();
    adultLineEl.textContent = adultQty + '장 KRW ' + (adultQty*prices.adult).toLocaleString();
  }

  document.querySelectorAll('.qty-stepper').forEach(st=>{
    const valEl = st.querySelector('.val');
    const max = 6;
    st.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', () => {
        let v = parseInt(valEl.textContent,10);
        if(btn.dataset.dir==='inc' && v<max) v++;
        if(btn.dataset.dir==='dec' && v>0) v--;
        valEl.textContent = v;
        recalc();
      });
    });
  });
  recalc();

  // calendar month label / nav (static demo)
  const monthLabel = document.getElementById('calMonth');
  if(monthLabel) monthLabel.textContent = '2025년 6월';
});
