const pages = [
  ["index.html", "首页"],
  ["projects.html", "项目管理"],
  ["novel.html", "小说改编"],
  ["script.html", "剧本拆解"],
  ["shots.html", "镜头管理"],
  ["characters.html", "角色资产库"],
  ["scenes.html", "场景资产库"],
  ["storyboard.html", "分镜审核"],
  ["review.html", "导演审核"],
  ["cost.html", "成本统计"],
  ["docs.html", "制作规范"]
];

const dataFiles = ["projects", "novels", "scripts", "shots", "characters", "scenes", "storyboards", "reviews", "costs"];
const state = { reviews: [], jsonStatus: "成功", fxStatus: "循环未来感光照粒子 / 工业网格 / 纵深太空层已启用" };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches;

function renderNav() {
  const host = document.getElementById("top-nav");
  if (!host) return;
  const current = location.pathname.split("/").pop() || "index.html";
  host.innerHTML = `<div class="top-nav"><div class="nav-wrap"><div class="brand">金泰 AI 影视制片中台</div><nav class="nav-links">${pages.map(([href, label]) => `<a href="./${href}" class="${href === current ? "active" : ""}">${label}</a>`).join("")}</nav></div></div>`;
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`加载失败: ${path}`);
  return res.json();
}

function rowHtml(obj, cols) {
  return `<tr>${cols.map((c) => `<td>${obj[c] ?? "-"}</td>`).join("")}</tr>`;
}

function addRevealTargets() {
  const current = location.pathname.split("/").pop() || "index.html";
  const pageKey = current.replace(/\.html$/, "") || "index";
  document.body.classList.add(`page-fx-${pageKey}`);

  const sections = document.querySelectorAll("main > section, .version-banner");
  sections.forEach((section, i) => {
    section.classList.add("section-fx", `section-fx-${(i % 4) + 1}`);
  });

  const cards = document.querySelectorAll(".card");
  cards.forEach((card, i) => {
    card.classList.add(`card-fx-${(i % 6) + 1}`);
  });

  if (prefersReducedMotion) return;
  const targets = document.querySelectorAll(".version-banner, .page-title, .page-subtitle, .card, .table-wrap, table");
  targets.forEach((el, i) => el.classList.add("reveal", `delay-${Math.min(i % 5, 4)}`));
}

function initParticleEffects() {
  if (document.querySelector(".fx-ink-bg")) return;

  const motionScale = prefersReducedMotion ? 0.42 : 1;
  const bgCanvas = document.createElement("canvas");
  const trailCanvas = document.createElement("canvas");
  bgCanvas.className = "fx-canvas fx-ink-bg";
  trailCanvas.className = "fx-canvas fx-cursor-trail";
  bgCanvas.setAttribute("aria-hidden", "true");
  trailCanvas.setAttribute("aria-hidden", "true");
  document.body.classList.add("particle-fx-ready");
  document.body.prepend(trailCanvas);
  document.body.prepend(bgCanvas);

  const bg = bgCanvas.getContext("2d");
  const trail = trailCanvas.getContext("2d");
  if (!bg || !trail) {
    state.fxStatus = "粒子画布初始化失败";
    return;
  }

  const palette = [
    "rgba(212,175,55,",
    "rgba(104,223,255,",
    "rgba(181,92,255,",
    "rgba(255,107,154,",
    "rgba(110,255,191,"
  ];
  const inkBlots = [];
  const starParticles = [];
  const depthParticles = [];
  const beamParticles = [];
  const cursorParticles = [];
  const burstParticles = [];
  const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.35, active: false };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTrailTime = 0;
  let frameSkip = false;

  const setCanvasSize = (canvas) => {
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const buildBackgroundParticles = () => {
    inkBlots.length = 0;
    starParticles.length = 0;
    depthParticles.length = 0;
    beamParticles.length = 0;
    const blotCount = Math.min(54, Math.max(24, Math.floor(width / 34))) * motionScale;
    const sparkleCount = Math.min(180, Math.max(56, Math.floor((width * height) / 14500))) * motionScale;
    const depthCount = Math.min(150, Math.max(48, Math.floor((width * height) / 17000))) * motionScale;
    const beamCount = Math.min(34, Math.max(12, Math.floor(width / 58))) * motionScale;
    for (let i = 0; i < Math.ceil(blotCount); i += 1) {
      inkBlots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 90 + Math.random() * 250,
        vx: (Math.random() - 0.5) * 0.28 * motionScale,
        vy: (Math.random() - 0.5) * 0.22 * motionScale,
        hue: palette[i % palette.length],
        alpha: (0.075 + Math.random() * 0.16) * (prefersReducedMotion ? 0.78 : 1),
        phase: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < Math.ceil(sparkleCount); i += 1) {
      starParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.9 + Math.random() * 3.8,
        vx: (Math.random() - 0.5) * 0.28 * motionScale,
        vy: (Math.random() - 0.5) * 0.24 * motionScale,
        hue: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.22 + Math.random() * 0.54,
        phase: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < Math.ceil(depthCount); i += 1) {
      const z = 0.18 + Math.random() * 1.2;
      depthParticles.push({
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.4,
        z,
        speed: (0.0014 + Math.random() * 0.0042) * motionScale,
        r: 0.7 + Math.random() * 2.6,
        hue: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.2 + Math.random() * 0.58,
        phase: Math.random() * Math.PI * 2
      });
    }
    for (let i = 0; i < Math.ceil(beamCount); i += 1) {
      beamParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 70 + Math.random() * 230,
        vx: (0.38 + Math.random() * 1.15) * motionScale,
        vy: (Math.random() - 0.5) * 0.38 * motionScale,
        angle: -0.18 + Math.random() * 0.44,
        hue: palette[Math.floor(Math.random() * palette.length)],
        alpha: 0.05 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2
      });
    }
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    setCanvasSize(bgCanvas);
    setCanvasSize(trailCanvas);
    buildBackgroundParticles();
  };

  const spawnCursorParticles = (x, y, amount = 4) => {
    if (!isDesktop) return;
    const scaledAmount = Math.max(1, Math.round(amount * motionScale));
    for (let i = 0; i < scaledAmount; i += 1) {
      cursorParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2.3,
        vy: (Math.random() - 0.5) * 2.3,
        r: 2.4 + Math.random() * 6.2,
        life: 1,
        decay: (0.012 + Math.random() * 0.014) / Math.max(motionScale, 0.35),
        hue: palette[Math.floor(Math.random() * palette.length)]
      });
    }
    if (cursorParticles.length > 220) cursorParticles.splice(0, cursorParticles.length - 220);
  };

  const spawnBurst = (x, y, amount = 34) => {
    const scaledAmount = Math.max(12, Math.round(amount * motionScale));
    for (let i = 0; i < scaledAmount; i += 1) {
      const angle = (Math.PI * 2 * i) / scaledAmount + Math.random() * 0.28;
      const speed = (1.1 + Math.random() * 4.2) * motionScale;
      burstParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2.2 + Math.random() * 7.5,
        life: 1,
        decay: 0.016 + Math.random() * 0.018,
        hue: palette[Math.floor(Math.random() * palette.length)]
      });
    }
    if (burstParticles.length > 260) burstParticles.splice(0, burstParticles.length - 260);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    if (isDesktop && performance.now() - lastTrailTime > (prefersReducedMotion ? 70 : 18)) {
      spawnCursorParticles(pointer.x, pointer.y, 5);
      lastTrailTime = performance.now();
    }
  }, { passive: true });
  window.addEventListener("pointerdown", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    spawnBurst(pointer.x, pointer.y, isDesktop ? 42 : 28);
  }, { passive: true });
  window.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });

  resize();
  spawnBurst(width * 0.52, Math.max(120, height * 0.32), 28);

  const render = (time = 0) => {
    if (prefersReducedMotion) {
      frameSkip = !frameSkip;
      if (frameSkip) {
        requestAnimationFrame(render);
        return;
      }
    }

    bg.clearRect(0, 0, width, height);
    bg.globalCompositeOperation = "lighter";
    inkBlots.forEach((b, i) => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < -b.r) b.x = width + b.r;
      if (b.x > width + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = height + b.r;
      if (b.y > height + b.r) b.y = -b.r;
      const pulse = (prefersReducedMotion ? 1 : Math.sin(time * 0.00045 + b.phase) * 0.2 + 1);
      const r = b.r * pulse;
      const gradient = bg.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      gradient.addColorStop(0, `${b.hue}${b.alpha})`);
      gradient.addColorStop(0.44, `${b.hue}${b.alpha * 0.45})`);
      gradient.addColorStop(1, `${b.hue}0)`);
      bg.fillStyle = gradient;
      bg.beginPath();
      const wobble = prefersReducedMotion ? 0 : Math.sin(time * 0.0007 + i) * 13;
      bg.ellipse(b.x, b.y, r * (0.84 + (i % 3) * 0.08), r * (0.48 + (i % 4) * 0.06), b.phase + wobble * 0.01, 0, Math.PI * 2);
      bg.fill();
    });

    depthParticles.forEach((p) => {
      p.z += p.speed;
      if (p.z > 1.65) {
        p.z = 0.18;
        p.x = (Math.random() - 0.5) * width * 1.6;
        p.y = (Math.random() - 0.5) * height * 1.4;
      }
      const cx = width * 0.52;
      const cy = height * 0.48;
      const sx = cx + p.x * p.z;
      const sy = cy + p.y * p.z;
      const shimmer = prefersReducedMotion ? 0.72 : Math.sin(time * 0.0018 + p.phase) * 0.28 + 0.82;
      bg.fillStyle = `${p.hue}${Math.min(0.9, p.alpha * p.z * shimmer)})`;
      bg.beginPath();
      bg.arc(sx, sy, p.r * (0.55 + p.z * 1.7), 0, Math.PI * 2);
      bg.fill();
      if (!prefersReducedMotion && p.z > 0.7) {
        bg.strokeStyle = `${p.hue}${0.08 * p.z})`;
        bg.lineWidth = Math.min(2.2, p.z * 1.1);
        bg.beginPath();
        bg.moveTo(sx, sy);
        bg.lineTo(sx - p.x * 0.018 * p.z, sy - p.y * 0.018 * p.z);
        bg.stroke();
      }
    });

    beamParticles.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy + Math.sin(time * 0.001 + b.phase) * 0.08;
      if (b.x > width + b.len) {
        b.x = -b.len;
        b.y = Math.random() * height;
      }
      if (b.y < -80) b.y = height + 80;
      if (b.y > height + 80) b.y = -80;
      const pulse = prefersReducedMotion ? 0.72 : Math.sin(time * 0.002 + b.phase) * 0.32 + 0.78;
      bg.save();
      bg.translate(b.x, b.y);
      bg.rotate(b.angle);
      const beam = bg.createLinearGradient(-b.len * 0.5, 0, b.len * 0.5, 0);
      beam.addColorStop(0, `${b.hue}0)`);
      beam.addColorStop(0.5, `${b.hue}${b.alpha * pulse})`);
      beam.addColorStop(1, `${b.hue}0)`);
      bg.strokeStyle = beam;
      bg.lineWidth = 1.2 + pulse * 2.8;
      bg.beginPath();
      bg.moveTo(-b.len * 0.5, 0);
      bg.lineTo(b.len * 0.5, 0);
      bg.stroke();
      bg.restore();
    });

    starParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
      const shimmer = prefersReducedMotion ? 0.75 : Math.sin(time * 0.002 + p.phase) * 0.35 + 0.75;
      bg.fillStyle = `${p.hue}${p.alpha * shimmer})`;
      bg.beginPath();
      bg.arc(p.x, p.y, p.r * shimmer, 0, Math.PI * 2);
      bg.fill();
    });

    if (pointer.active && isDesktop) {
      const glow = bg.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 190);
      glow.addColorStop(0, "rgba(255,239,182,.24)");
      glow.addColorStop(0.5, "rgba(104,223,255,.1)");
      glow.addColorStop(1, "rgba(181,92,255,0)");
      bg.fillStyle = glow;
      bg.beginPath();
      bg.arc(pointer.x, pointer.y, 190, 0, Math.PI * 2);
      bg.fill();
    }

    trail.clearRect(0, 0, width, height);
    trail.globalCompositeOperation = "lighter";
    const renderGlowParticles = (particles) => {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012 * motionScale;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const gradient = trail.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
        gradient.addColorStop(0, `${p.hue}${0.44 * p.life})`);
        gradient.addColorStop(0.42, `${p.hue}${0.14 * p.life})`);
        gradient.addColorStop(1, `${p.hue}0)`);
        trail.fillStyle = gradient;
        trail.beginPath();
        trail.arc(p.x, p.y, p.r * (1 + (1 - p.life) * 2.6), 0, Math.PI * 2);
        trail.fill();
      }
    };
    renderGlowParticles(cursorParticles);
    renderGlowParticles(burstParticles);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}

function initCursorGlow() {
  if (prefersReducedMotion || !isDesktop) return;
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);
  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let x = tx;
  let y = ty;

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  }, { passive: true });

  const tick = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate(${x - 160}px, ${y - 160}px)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initCardTilt() {
  if (prefersReducedMotion || !isDesktop) return;
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.transform = `translateY(-4px) rotateX(${((0.5 - py) * 5).toFixed(2)}deg) rotateY(${((px - 0.5) * 6).toFixed(2)}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "translateY(0) rotateX(0deg) rotateY(0deg)";
    });
  });
}

function fallbackTable(hostId, cols, message) {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.innerHTML = `<tr><td colspan="${cols}" class="muted">${message}</td></tr>`;
}

async function withJsonFallback(loader, fallback) {
  try {
    return await loader();
  } catch (err) {
    state.jsonStatus = "失败";
    console.error(err);
    fallback(err);
    return null;
  }
}

async function renderHome() {
  const summary = await withJsonFallback(
    async () => Promise.all(dataFiles.map(async (n) => [n, (await fetchJson(`./data/${n}.json`)).length])),
    () => {
      document.getElementById("total-items").textContent = "0";
      document.getElementById("dataset-count").textContent = String(dataFiles.length);
      document.getElementById("project-count").textContent = "0";
      document.getElementById("review-count").textContent = "0";
      document.getElementById("home-summary").innerHTML = `<tr><td colspan="2" class="muted">JSON 加载失败，已显示回退内容。</td></tr>`;
    }
  );
  if (summary) {
    const total = summary.reduce((a, [, c]) => a + c, 0);
    document.getElementById("total-items").textContent = total;
    document.getElementById("dataset-count").textContent = summary.length;
    document.getElementById("project-count").textContent = summary.find(([n]) => n === "projects")?.[1] ?? 0;
    document.getElementById("review-count").textContent = summary.find(([n]) => n === "reviews")?.[1] ?? 0;
    document.getElementById("home-summary").innerHTML = summary.map(([n, c]) => `<tr><td>${n}.json</td><td>${c}</td></tr>`).join("");
  }
  const status = document.getElementById("system-status");
  if (status) status.innerHTML = `<li>页面主体：已显示</li><li>CSS：已加载</li><li>JS：已运行</li><li>JSON：${state.jsonStatus}</li><li>动效层：${state.fxStatus}</li>`;
}

async function renderProjects() {
  await withJsonFallback(async () => {
    const data = await fetchJson("./data/projects.json");
    document.getElementById("projects-body").innerHTML = data.map((d) => rowHtml(d, ["id", "name", "phase", "owner", "deadline", "status"])).join("");
  }, () => fallbackTable("projects-body", 6, "项目数据加载失败，已显示回退内容。"));
}

async function renderNovels() { await withJsonFallback(async () => { const data = await fetchJson("./data/novels.json"); document.getElementById("novels-body").innerHTML = data.map((d) => rowHtml(d, ["id", "title", "tone", "episodePlan", "coreConflict", "status"])).join(""); }, () => fallbackTable("novels-body", 6, "小说数据加载失败，已显示回退内容。")); }
async function renderScripts() { await withJsonFallback(async () => { const data = await fetchJson("./data/scripts.json"); document.getElementById("scripts-body").innerHTML = data.map((d) => rowHtml(d, ["id", "scene", "beat", "characters", "location", "status"])).join(""); }, () => fallbackTable("scripts-body", 6, "剧本数据加载失败，已显示回退内容。")); }

async function renderShots() {
  await withJsonFallback(async () => {
    const data = await fetchJson("./data/shots.json");
    const body = document.getElementById("shots-body");
    const paint = (filter = "全部") => {
      const filtered = filter === "全部" ? data : data.filter((s) => s.status === filter);
      body.innerHTML = filtered.map((d) => rowHtml(d, ["id", "scene", "type", "duration", "prompt", "status"])).join("");
    };
    document.querySelectorAll("[data-shot-filter]").forEach((btn) => (btn.onclick = () => paint(btn.dataset.shotFilter)));
    paint();
  }, () => fallbackTable("shots-body", 6, "镜头数据加载失败，已显示回退内容。"));
}

async function renderCardsPage(jsonPath, hostId, mapFn, fallbackText) {
  await withJsonFallback(async () => {
    const data = await fetchJson(jsonPath);
    document.getElementById(hostId).innerHTML = data.map(mapFn).join("");
  }, () => { document.getElementById(hostId).innerHTML = `<article class="card"><h3>数据加载失败</h3><p class="muted">${fallbackText}</p></article>`; });
}

async function renderStoryboard() { await withJsonFallback(async () => { const data = await fetchJson("./data/storyboards.json"); document.getElementById("storyboards-body").innerHTML = data.map((d) => rowHtml(d, ["id", "shot", "continuityCheck", "directorNote", "status"])).join(""); }, () => fallbackTable("storyboards-body", 5, "分镜数据加载失败，已显示回退内容。")); }

async function renderReview() {
  await withJsonFallback(async () => {
    state.reviews = await fetchJson("./data/reviews.json");
    const body = document.getElementById("reviews-body");
    const paint = () => (body.innerHTML = state.reviews.map((d) => `<tr><td>${d.id}</td><td>${d.item}</td><td>${d.director}</td><td>${d.comment}</td><td><span class="status-chip">${d.status}</span></td><td><div class="btn-row"><button class="mini-btn" data-id="${d.id}" data-status="通过">通过</button><button class="mini-btn" data-id="${d.id}" data-status="返工">返工</button><button class="mini-btn" data-id="${d.id}" data-status="废弃">废弃</button></div></td></tr>`).join(""));
    paint();
    body.onclick = (e) => { const btn = e.target.closest("button[data-id]"); if (!btn) return; const one = state.reviews.find((r) => r.id === btn.dataset.id); one.status = btn.dataset.status; paint(); };
  }, () => fallbackTable("reviews-body", 6, "审核数据加载失败，已显示回退内容。"));
}

async function renderCost() {
  await withJsonFallback(async () => {
    const data = await fetchJson("./data/costs.json");
    document.getElementById("costs-body").innerHTML = data.map((d) => rowHtml(d, ["item", "budget", "actual", "reworkRate", "risk"])).join("");
    const avg = data.reduce((s, x) => s + Number(String(x.reworkRate).replace("%", "")), 0) / data.length;
    const warn = document.getElementById("cost-warning");
    warn.textContent = `当前平均返工率：${avg.toFixed(1)}%`;
    warn.className = "warning";
    if (avg > 50) warn.classList.add("warn-red"); else if (avg > 30) warn.classList.add("warn-yellow");
  }, () => {
    fallbackTable("costs-body", 5, "成本数据加载失败，已显示回退内容。");
    const warn = document.getElementById("cost-warning");
    if (warn) warn.textContent = "成本预警暂不可用（JSON 加载失败）。";
  });
}

async function renderDocs() {
  await withJsonFallback(async () => {
    const docs = [
      ["连续性圣经模板", "./docs/continuity-bible-template.md"],
      ["小说到镜头流程", "./docs/novel-to-shot-workflow.md"],
      ["Cloud 到本地同步", "./docs/cloud-pr-sync-workflow.md"]
    ];
    const loadedDocs = await Promise.all(docs.map(async ([title, path]) => [title, await fetch(path).then((r) => r.text())]));
    document.getElementById("docs-summary").innerHTML = loadedDocs.map(([title, text]) => `<article class="card"><h3>${title}</h3><pre>${text.split("\n").slice(0, 12).join("\n")}</pre></article>`).join("");
  }, () => { document.getElementById("docs-summary").innerHTML = `<article class="card"><h3>文档预览不可用</h3><p class="muted">文档加载失败，已显示回退内容。</p></article>`; });
}

const workflowDetails = {
  "projects.html": {
    kicker: "制片总控台 · Pipeline",
    title: "从立项到交付的项目真实流转",
    summary: "把项目拆成可追踪的制片阶段：剧本、资产、镜头、审核与成本同时回写，制片人可以在同一页判断卡点。",
    image: ["项目看板", "里程碑", "#d4af37", "#68dfff"],
    steps: ["立项建档", "剧本排期", "资产锁定", "镜头生成", "审核交付"],
    panels: [
      ["输入", "项目 brief、预算上限、交付日期、主创名单"],
      ["处理", "按阶段同步负责人、截止日、风险等级与返工状态"],
      ["产出", "每日制片日报、逾期预警、跨部门待办列表"]
    ]
  },
  "novel.html": {
    kicker: "小说改编 · Story Pipeline",
    title: "原著文本到可拍剧集结构",
    summary: "将小说章节拆成核心冲突、人物动机和单集钩子，保留不可改动设定，再推送给剧本拆解。",
    image: ["文本解析", "冲突曲线", "#b55cff", "#d4af37"],
    steps: ["导入章节", "提取人物", "冲突归纳", "单集大纲", "锁定设定"],
    panels: [
      ["输入", "原著章节、人物小传、版权禁改条款"],
      ["处理", "提炼每集情绪峰值、反转点和必须保留台词"],
      ["产出", "剧集大纲、角色弧光、可拍场景候选池"]
    ]
  },
  "script.html": {
    kicker: "剧本拆解 · Production Breakdown",
    title: "场次、角色、地点与节拍拆成生产清单",
    summary: "每个节拍都绑定角色、地点、情绪和镜头需求，自动向资产库与镜头管理发出准备任务。",
    image: ["场次拆条", "节拍矩阵", "#68dfff", "#ff6b9a"],
    steps: ["场次编号", "节拍识别", "角色绑定", "场景绑定", "镜头需求"],
    panels: [
      ["输入", "单集剧本、对白、动作描述、场景标题"],
      ["处理", "拆分冲突节拍，标注出场角色、道具、情绪变化"],
      ["产出", "拍摄清单、资产需求单、镜头提示词草案"]
    ]
  },
  "shots.html": {
    kicker: "镜头管理 · Shot Pipeline",
    title: "提示词、景别、时长与生成状态闭环",
    summary: "从剧本节拍派生镜头，记录景别、运动、光线和生成状态，返工原因会回流到分镜审核。",
    image: ["镜头队列", "生成状态", "#d4af37", "#b55cff"],
    steps: ["镜头规划", "Prompt 组装", "批量生成", "质检标注", "返工入队"],
    panels: [
      ["输入", "场次节拍、角色连续性、场景灯光、镜头语言"],
      ["处理", "组合镜头提示词，按待生成/待审核/返工过滤队列"],
      ["产出", "可审核镜头包、返工提示词、通过镜头编号"]
    ]
  },
  "characters.html": {
    kicker: "角色资产 · Continuity Bible",
    title: "角色外观、服装与禁改规则锁定",
    summary: "角色卡不仅记录描述，还把不可变特征转成审核条件，避免生成镜头中出现换脸、换服装或伤痕丢失。",
    image: ["角色图谱", "连续性锁", "#ff6b9a", "#d4af37"],
    steps: ["角色建档", "外观锁定", "服装锁定", "伤痕追踪", "镜头校验"],
    panels: [
      ["输入", "角色小传、参考图、服装规则、剧情状态"],
      ["处理", "生成角色连续性检查项，并绑定每个出场镜头"],
      ["产出", "角色资产卡、禁改清单、跨集连续性备注"]
    ]
  },
  "scenes.html": {
    kicker: "场景资产 · Environment Bible",
    title: "空间、光源、道具与 LOGO 遮挡规则统一",
    summary: "每个场景沉淀为可复用资产：空间布局、光照方向、关键道具和禁改项都会参与镜头生成。",
    image: ["场景地图", "灯光配置", "#68dfff", "#d4af37"],
    steps: ["场景建档", "空间布局", "灯光方向", "道具锁定", "出镜校验"],
    panels: [
      ["输入", "场景设定、平面布局、灯光参考、道具清单"],
      ["处理", "把环境约束写入镜头提示词与分镜检查表"],
      ["产出", "场景资产卡、道具连续性、灯光一致性标准"]
    ]
  },
  "storyboard.html": {
    kicker: "分镜审核 · Continuity Gate",
    title: "用连续性规则校验每一条镜头",
    summary: "分镜审核把角色、场景、服装、节奏和导演备注合并判断，通过后进入导演终审，返工则回到镜头队列。",
    image: ["分镜墙", "连续性检测", "#b55cff", "#68dfff"],
    steps: ["镜头接收", "规则比对", "问题标注", "导演备注", "状态回写"],
    panels: [
      ["输入", "镜头编号、角色状态、场景资产、上一镜头关系"],
      ["处理", "检查服装、道具、景别、节奏和视觉连续性"],
      ["产出", "通过列表、返工原因、导演调整建议"]
    ]
  },
  "review.html": {
    kicker: "导演审核 · Decision Pipeline",
    title: "导演意见直接驱动通过、返工或废弃",
    summary: "导演可以对镜头、分镜和资产给出最终意见，页面按钮模拟真实审核状态回写。",
    image: ["导演监看", "决策回写", "#d4af37", "#ff6b9a"],
    steps: ["提交审核", "导演查看", "意见记录", "状态决策", "任务回流"],
    panels: [
      ["输入", "待审镜头包、分镜表、制作备注、返工历史"],
      ["处理", "选择通过/返工/废弃，并保留导演口径"],
      ["产出", "最终状态、返工任务、可交付镜头清单"]
    ]
  },
  "cost.html": {
    kicker: "成本统计 · Finance Pipeline",
    title: "预算、实际花费与返工率联动预警",
    summary: "成本页把生成、审核和返工数据汇总成风险指标，帮助制片及时调整排期和预算。",
    image: ["成本雷达", "风险预警", "#68dfff", "#d4af37"],
    steps: ["预算录入", "实际同步", "返工统计", "风险判断", "制片调整"],
    panels: [
      ["输入", "预算项、实际支出、返工率、供应商成本"],
      ["处理", "计算平均返工率，并按阈值输出黄色/红色预警"],
      ["产出", "成本风险表、超支原因、下一轮预算建议"]
    ]
  }
};

function workflowVisualSvg([title, subtitle, colorA, colorB]) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${title}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080b14"/><stop offset="1" stop-color="#15101e"/></linearGradient><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${colorA}"/><stop offset="1" stop-color="${colorB}"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="12"/></filter></defs><rect width="640" height="360" fill="url(#bg)"/><circle cx="118" cy="92" r="92" fill="${colorA}" opacity=".2" filter="url(#blur)"/><circle cx="516" cy="278" r="130" fill="${colorB}" opacity=".16" filter="url(#blur)"/><g opacity=".2" stroke="${colorB}">${Array.from({length: 14}, (_, i) => `<path d="M${i * 54 - 80} 360 L${i * 54 + 90} 0"/>`).join("")}</g><g fill="none" stroke="url(#g)" stroke-width="4"><rect x="72" y="88" width="128" height="82" rx="18"/><rect x="256" y="138" width="128" height="82" rx="18"/><rect x="440" y="88" width="128" height="82" rx="18"/><path d="M202 130 C232 104 234 194 256 176"/><path d="M386 176 C416 206 414 116 440 130"/></g><g fill="url(#g)"><circle cx="136" cy="129" r="12"/><circle cx="320" cy="179" r="12"/><circle cx="504" cy="129" r="12"/></g><text x="72" y="268" fill="#f5f3ee" font-size="38" font-family="Arial, sans-serif" font-weight="700">${title}</text><text x="72" y="310" fill="#d4af37" font-size="24" font-family="Arial, sans-serif">${subtitle}</text></svg>`)}`;
}

function renderWorkflowSection() {
  const current = location.pathname.split("/").pop() || "index.html";
  const detail = workflowDetails[current];
  const main = document.querySelector("main");
  if (!detail || !main || document.querySelector(".workflow-section")) return;
  const section = document.createElement("section");
  section.className = "workflow-section card";
  section.innerHTML = `
    <div class="workflow-copy">
      <p class="eyebrow">${detail.kicker}</p>
      <h2>${detail.title}</h2>
      <p>${detail.summary}</p>
    </div>
    <img class="workflow-hero-img" src="${workflowVisualSvg(detail.image)}" alt="${detail.image[0]}示意图" loading="lazy" />
    <ol class="pipeline-steps" aria-label="真实工作流 Pipeline">
      ${detail.steps.map((step, index) => `<li style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><b>${step}</b></li>`).join("")}
    </ol>
    <div class="workflow-panels">
      ${detail.panels.map(([label, text]) => `<article><h3>${label}</h3><p>${text}</p></article>`).join("")}
    </div>`;
  const anchor = main.querySelector("section.card, section.grid") || main.lastElementChild;
  if (anchor) anchor.insertAdjacentElement("afterend", section); else main.appendChild(section);
}

const pageHandlers = {
  "index.html": renderHome,
  "projects.html": renderProjects,
  "novel.html": renderNovels,
  "script.html": renderScripts,
  "shots.html": renderShots,
  "characters.html": () => renderCardsPage("./data/characters.json", "characters-grid", (c, i) => `<article class="card asset-card"><img class="asset-thumb" src="${workflowVisualSvg([c.name, "角色资产卡", i % 2 ? "#68dfff" : "#ff6b9a", "#d4af37"])}" alt="${c.name}角色参考图" loading="lazy" /><h3>${c.name}</h3><p><b>外貌：</b>${c.appearance}</p><p><b>服装：</b>${c.costume}</p><p><b>禁改规则：</b>${c.lockedRules}</p><p class="muted"><b>连续性备注：</b>${c.continuityNote}</p></article>`, "角色数据加载失败，已显示回退内容。"),
  "scenes.html": () => renderCardsPage("./data/scenes.json", "scenes-grid", (s, i) => `<article class="card asset-card"><img class="asset-thumb" src="${workflowVisualSvg([s.name, "场景资产卡", "#68dfff", i % 2 ? "#b55cff" : "#d4af37"])}" alt="${s.name}场景参考图" loading="lazy" /><h3>${s.name}</h3><p><b>空间布局：</b>${s.layout}</p><p><b>光源方向：</b>${s.lightDirection}</p><p><b>关键道具：</b>${s.keyProps}</p><p class="muted"><b>禁改规则：</b>${s.lockedRules}</p></article>`, "场景数据加载失败，已显示回退内容。"),
  "storyboard.html": renderStoryboard,
  "review.html": renderReview,
  "cost.html": renderCost,
  "docs.html": renderDocs
};

document.addEventListener("DOMContentLoaded", async () => {
  renderNav();
  const current = location.pathname.split("/").pop() || "index.html";
  const fn = pageHandlers[current];
  await withJsonFallback(async () => { if (fn) await fn(); }, () => {});
  renderWorkflowSection();
  addRevealTargets();
  initParticleEffects();
  initCursorGlow();
  initCardTilt();
});
