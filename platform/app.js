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

const pageHandlers = {
  "index.html": renderHome,
  "projects.html": renderProjects,
  "novel.html": renderNovels,
  "script.html": renderScripts,
  "shots.html": renderShots,
  "characters.html": () => renderCardsPage("./data/characters.json", "characters-grid", (c) => `<article class="card"><h3>${c.name}</h3><p><b>外貌：</b>${c.appearance}</p><p><b>服装：</b>${c.costume}</p><p><b>禁改规则：</b>${c.lockedRules}</p><p class="muted"><b>连续性备注：</b>${c.continuityNote}</p></article>`, "角色数据加载失败，已显示回退内容。"),
  "scenes.html": () => renderCardsPage("./data/scenes.json", "scenes-grid", (s) => `<article class="card"><h3>${s.name}</h3><p><b>空间布局：</b>${s.layout}</p><p><b>光源方向：</b>${s.lightDirection}</p><p><b>关键道具：</b>${s.keyProps}</p><p class="muted"><b>禁改规则：</b>${s.lockedRules}</p></article>`, "场景数据加载失败，已显示回退内容。"),
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
  addRevealTargets();
  initParticleEffects();
  initCursorGlow();
  initCardTilt();
});
