// Home-page background: drifting tensor networks (MPS chains, TTN trees) and quantum-circuit fragments.
// Extras: shapes near the mouse cursor send a pulse along their bonds/wires, and now and then
// one bond flickers and thins, a nod to SVD truncation.
(function () {
  const canvas = document.getElementById("quantum-bg");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let width = 0;
  let height = 0;
  let color = "#b509ac";
  let shapes = [];
  const mouse = { x: -9999, y: -9999 };
  let nextTruncation = 0;

  function readColor() {
    const c = getComputedStyle(document.documentElement).getPropertyValue("--global-theme-color").trim();
    if (c) color = c;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  // ---------- shape builders (local coordinates) ----------

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
    return { kind: "network", nodes, bonds, legs };
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
        nodes.push({ x: ((k + 0.5) / count - 0.5) * spread, y: l * dy - dy });
        row.push(nodes.length - 1);
        if (l > 0) bonds.push([prev[Math.floor(k / 2)], nodes.length - 1]);
      }
      prev = row;
    }
    prev.forEach((i) => legs.push(i));
    return { kind: "network", nodes, bonds, legs };
  }

  // A few qubit wires with a handful of gates: H, CNOT, controlled-phase.
  function makeCircuit() {
    const q = Math.random() < 0.5 ? 2 : 3;
    const gap = 24;
    const len = rand(150, 200);
    const wires = [];
    for (let i = 0; i < q; i++) {
      const y = (i - (q - 1) / 2) * gap;
      wires.push({ x0: -len / 2, x1: len / 2, y });
    }
    const gates = [];
    const slots = 4;
    for (let s = 0; s < slots; s++) {
      const x = -len / 2 + ((s + 0.75) / slots) * len * 0.95;
      const r = Math.random();
      if (r < 0.4) {
        gates.push({ type: "H", x, w: Math.floor(Math.random() * q) });
      } else {
        const a = Math.floor(Math.random() * q);
        let b = Math.floor(Math.random() * (q - 1));
        if (b >= a) b++;
        gates.push({ type: r < 0.75 ? "CNOT" : "CP", x, c: a, t: b });
      }
    }
    return { kind: "circuit", wires, gates, gap };
  }

  function spawn() {
    const area = width * height;
    const count = Math.max(4, Math.min(11, Math.round(area / 140000)));
    shapes = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const s = r < 0.3 ? makeCircuit() : r < 0.8 ? makeMPS() : makeTTN();
      s.x = rand(0, width);
      s.y = rand(0, height);
      s.vx = rand(-0.12, 0.12);
      s.vy = rand(-0.08, 0.08);
      // circuits stay close to horizontal so they still read as circuits
      s.angle = s.kind === "circuit" ? rand(-0.15, 0.15) : rand(-0.5, 0.5);
      s.spin = s.kind === "circuit" ? 0 : rand(-0.0006, 0.0006);
      s.scale = rand(0.75, 1.15);
      s.alpha = rand(0.35, 0.8);
      s.excite = 0; // 0..1, raised by the mouse
      s.cooldown = 0;
      s.trunc = null; // { k, t } for networks
      const tracks = s.kind === "circuit" ? s.wires.length : s.bonds.length;
      s.pulses = Array.from({ length: tracks }, () => ({
        t: Math.random(),
        speed: rand(0.002, 0.006),
        on: Math.random() < 0.5,
      }));
      shapes.push(s);
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

  function toWorld(s, p) {
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    return {
      x: s.x + (p.x * c - p.y * sn) * s.scale,
      y: s.y + (p.x * sn + p.y * c) * s.scale,
    };
  }

  // ---------- drawing ----------

  function drawPulse(x, y, a) {
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawNetwork(s) {
    const pts = s.nodes.map((p) => toWorld(s, p));
    const r = 5.5 * s.scale;
    const glow = 1 + s.excite * 1.4;

    ctx.lineWidth = 1.2;
    s.bonds.forEach(([a, b], k) => {
      let alpha = 0.28 * s.alpha * glow;
      let lw = 1.2;
      if (s.trunc && s.trunc.k === k) {
        // brighten, then thin out, then recover
        const t = s.trunc.t;
        alpha *= 1 + 2.2 * Math.sin(Math.PI * Math.min(1, t * 2));
        lw = 1.2 - 0.9 * Math.sin(Math.PI * t);
      }
      ctx.globalAlpha = Math.min(alpha, 0.9);
      ctx.lineWidth = Math.max(lw, 0.25);
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    });

    // physical legs (open indices)
    ctx.globalAlpha = 0.28 * s.alpha * glow;
    ctx.lineWidth = 1.2;
    const c = Math.cos(s.angle + Math.PI / 2);
    const sn = Math.sin(s.angle + Math.PI / 2);
    const L = 14 * s.scale;
    ctx.beginPath();
    for (const i of s.legs) {
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i].x + c * L, pts[i].y + sn * L);
    }
    ctx.stroke();

    // tensors
    ctx.globalAlpha = 0.22 * s.alpha * glow;
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.45 * s.alpha * glow;
    ctx.lineWidth = 1;
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // pulses along bonds
    s.bonds.forEach(([a, b], k) => {
      const pulse = s.pulses[k];
      if (!pulse.on || pulse.t < 0) return;
      const x = pts[a].x + (pts[b].x - pts[a].x) * pulse.t;
      const y = pts[a].y + (pts[b].y - pts[a].y) * pulse.t;
      drawPulse(x, y, 0.7 * s.alpha * Math.sin(Math.PI * pulse.t));
    });
  }

  function drawCircuit(s) {
    const glow = 1 + s.excite * 1.4;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.scale(s.scale, s.scale);
    ctx.lineWidth = 1.1 / s.scale;

    // wires
    ctx.globalAlpha = 0.28 * s.alpha * glow;
    ctx.beginPath();
    for (const w of s.wires) {
      ctx.moveTo(w.x0, w.y);
      ctx.lineTo(w.x1, w.y);
    }
    ctx.stroke();

    // gates
    const box = 13;
    for (const g of s.gates) {
      if (g.type === "H") {
        const y = s.wires[g.w].y;
        ctx.globalAlpha = 0.18 * s.alpha * glow;
        ctx.fillRect(g.x - box / 2, y - box / 2, box, box);
        ctx.globalAlpha = 0.5 * s.alpha * glow;
        ctx.strokeRect(g.x - box / 2, y - box / 2, box, box);
        ctx.font = "600 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("H", g.x, y + 0.5);
      } else {
        const yc = s.wires[g.c].y;
        const yt = s.wires[g.t].y;
        ctx.globalAlpha = 0.4 * s.alpha * glow;
        ctx.beginPath();
        ctx.moveTo(g.x, yc);
        ctx.lineTo(g.x, yt);
        ctx.stroke();
        ctx.globalAlpha = 0.55 * s.alpha * glow;
        ctx.beginPath();
        ctx.arc(g.x, yc, 2.6, 0, Math.PI * 2);
        ctx.fill();
        if (g.type === "CNOT") {
          const R = 5.5;
          ctx.beginPath();
          ctx.arc(g.x, yt, R, 0, Math.PI * 2);
          ctx.moveTo(g.x - R, yt);
          ctx.lineTo(g.x + R, yt);
          ctx.moveTo(g.x, yt - R);
          ctx.lineTo(g.x, yt + R);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(g.x, yt, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // pulses travel left to right along the wires, like the circuit being run
    s.wires.forEach((w, k) => {
      const pulse = s.pulses[k];
      if (!pulse.on || pulse.t < 0) return;
      const x = w.x0 + (w.x1 - w.x0) * pulse.t;
      drawPulse(x, w.y, 0.7 * s.alpha * Math.sin(Math.PI * pulse.t));
    });
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = "round";
    for (const s of shapes) {
      if (s.kind === "circuit") drawCircuit(s);
      else drawNetwork(s);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- motion ----------

  function nearMouse(s) {
    const R = 110 * s.scale;
    const dx = mouse.x - s.x;
    const dy = mouse.y - s.y;
    return dx * dx + dy * dy < R * R;
  }

  function step(now) {
    const pad = 140;

    // occasional truncation flicker on one network bond
    if (now > nextTruncation) {
      const nets = shapes.filter((s) => s.kind === "network" && !s.trunc);
      if (nets.length) {
        const s = nets[Math.floor(Math.random() * nets.length)];
        s.trunc = { k: Math.floor(Math.random() * s.bonds.length), t: 0 };
      }
      nextTruncation = now + rand(5000, 8000);
    }

    for (const s of shapes) {
      s.x += s.vx;
      s.y += s.vy;
      s.angle += s.spin;
      if (s.x < -pad) s.x = width + pad;
      if (s.x > width + pad) s.x = -pad;
      if (s.y < -pad) s.y = height + pad;
      if (s.y > height + pad) s.y = -pad;

      // mouse: a short burst of pulses on the nearest shape
      if (s.cooldown > 0) s.cooldown--;
      if (canHover && s.cooldown === 0 && nearMouse(s)) {
        s.excite = 1;
        s.cooldown = 150; // ~2.5 s at 60 fps
        s.pulses.forEach((p, k) => {
          p.on = true;
          p.t = -k * 0.15; // staggered, so the pulse sweeps along the shape
          p.speed = 0.02;
        });
      }
      s.excite *= 0.97;

      if (s.trunc) {
        s.trunc.t += 1 / 75; // ~1.25 s
        if (s.trunc.t >= 1) s.trunc = null;
      }

      for (const p of s.pulses) {
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.on = Math.random() < 0.5;
          p.speed = rand(0.002, 0.006);
        }
      }
    }
  }

  let running = false;
  function loop(now) {
    if (!running) return;
    step(now);
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

  if (canHover) {
    window.addEventListener(
      "mousemove",
      (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

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
