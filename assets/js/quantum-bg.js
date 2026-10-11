// Drifting tensor-network background (MPS chains + TTN trees) for the home page.
(function () {
  const canvas = document.getElementById("quantum-bg");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let color = "#b509ac";
  let networks = [];

  function readColor() {
    const c = getComputedStyle(document.documentElement).getPropertyValue("--global-theme-color").trim();
    if (c) color = c;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  // Build a network in local coordinates: nodes [{x,y}], bonds [[i,j]], legs [i] (open physical indices).
  function makeMPS() {
    const n = Math.floor(rand(4, 8));
    const gap = rand(38, 52);
    const nodes = [];
    const bonds = [];
    const legs = [];
    for (let i = 0; i < n; i++) {
      nodes.push({ x: (i - (n - 1) / 2) * gap, y: 0 });
      legs.push(i);
      if (i > 0) bonds.push([i - 1, i]);
    }
    return { nodes, bonds, legs, legDir: 1 };
  }

  function makeTTN() {
    const levels = 3;
    const nodes = [];
    const bonds = [];
    const legs = [];
    const dy = rand(34, 44);
    const spread = rand(110, 140);
    let prev = [];
    for (let l = 0; l < levels; l++) {
      const count = Math.pow(2, l);
      const row = [];
      for (let k = 0; k < count; k++) {
        const x = ((k + 0.5) / count - 0.5) * spread;
        nodes.push({ x, y: l * dy - dy });
        row.push(nodes.length - 1);
        if (l > 0) bonds.push([prev[Math.floor(k / 2)], nodes.length - 1]);
      }
      prev = row;
    }
    prev.forEach((i) => legs.push(i));
    return { nodes, bonds, legs, legDir: 1 };
  }

  function spawn() {
    const area = width * height;
    const count = Math.max(4, Math.min(11, Math.round(area / 140000)));
    networks = [];
    for (let i = 0; i < count; i++) {
      const net = Math.random() < 0.7 ? makeMPS() : makeTTN();
      net.x = rand(0, width);
      net.y = rand(0, height);
      net.vx = rand(-0.12, 0.12);
      net.vy = rand(-0.08, 0.08);
      net.angle = rand(-0.5, 0.5);
      net.spin = rand(-0.0006, 0.0006);
      net.scale = rand(0.75, 1.15);
      net.alpha = rand(0.35, 0.8);
      net.pulses = net.bonds.map(() => ({ t: Math.random(), speed: rand(0.002, 0.006), on: Math.random() < 0.5 }));
      networks.push(net);
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  }

  function toWorld(net, p) {
    const c = Math.cos(net.angle);
    const s = Math.sin(net.angle);
    return {
      x: net.x + (p.x * c - p.y * s) * net.scale,
      y: net.y + (p.x * s + p.y * c) * net.scale,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = "round";

    for (const net of networks) {
      const pts = net.nodes.map((p) => toWorld(net, p));
      const r = 5.5 * net.scale;

      // bonds
      ctx.globalAlpha = 0.28 * net.alpha;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const [a, b] of net.bonds) {
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
      }
      // physical legs (open indices)
      const c = Math.cos(net.angle + Math.PI / 2);
      const s = Math.sin(net.angle + Math.PI / 2);
      const L = 14 * net.scale;
      for (const i of net.legs) {
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i].x + c * L, pts[i].y + s * L);
      }
      ctx.stroke();

      // tensors
      ctx.globalAlpha = 0.22 * net.alpha;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.45 * net.alpha;
      ctx.lineWidth = 1;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // pulses travelling along bonds
      net.bonds.forEach(([a, b], k) => {
        const pulse = net.pulses[k];
        if (!pulse.on) return;
        const x = pts[a].x + (pts[b].x - pts[a].x) * pulse.t;
        const y = pts[a].y + (pts[b].y - pts[a].y) * pulse.t;
        const fade = Math.sin(Math.PI * pulse.t);
        ctx.globalAlpha = 0.7 * net.alpha * fade;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    const pad = 120;
    for (const net of networks) {
      net.x += net.vx;
      net.y += net.vy;
      net.angle += net.spin;
      if (net.x < -pad) net.x = width + pad;
      if (net.x > width + pad) net.x = -pad;
      if (net.y < -pad) net.y = height + pad;
      if (net.y > height + pad) net.y = -pad;
      for (const pulse of net.pulses) {
        pulse.t += pulse.speed;
        if (pulse.t >= 1) {
          pulse.t = 0;
          pulse.on = Math.random() < 0.5;
        }
      }
    }
  }

  let running = false;
  function loop() {
    if (!running) return;
    step();
    draw();
    requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion || running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  readColor();
  resize();
  draw();
  start();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      draw();
    }, 150);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
    } else {
      start();
    }
  });

  // Follow the light/dark toggle.
  new MutationObserver(() => {
    readColor();
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();
