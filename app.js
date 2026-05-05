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

const dataFiles = [
  "projects","novels","scripts","shots","characters","scenes","storyboards","reviews","costs"
];

const state = { reviews: [] };

function renderNav() {
  const host = document.getElementById("top-nav");
  if (!host) return;
  const current = location.pathname.split("/").pop() || "index.html";
  host.innerHTML = `<div class="top-nav"><div class="nav-wrap"><div class="brand">金泰 AI 影视制片中台</div><nav class="nav-links">${pages.map(([href,label]) => `<a href="./${href}" class="${href===current?"active":""}">${label}</a>`).join("")}</nav></div></div>`;
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`加载失败: ${path}`);
  return res.json();
}

function rowHtml(obj, cols) {
  return `<tr>${cols.map(c => `<td>${obj[c] ?? "-"}</td>`).join("")}</tr>`;
}

async function renderHome() {
  const summary = await Promise.all(dataFiles.map(async n => [n, (await fetchJson(`./data/${n}.json`)).length]));
  const total = summary.reduce((a, [,c]) => a + c, 0);
  document.getElementById("total-items").textContent = total;
  document.getElementById("dataset-count").textContent = summary.length;
  document.getElementById("project-count").textContent = summary.find(([n]) => n === "projects")[1];
  document.getElementById("review-count").textContent = summary.find(([n]) => n === "reviews")[1];
  document.getElementById("home-summary").innerHTML = summary.map(([n, c]) => `<tr><td>${n}.json</td><td>${c}</td></tr>`).join("");
}

async function renderProjects() {
  const data = await fetchJson("./data/projects.json");
  document.getElementById("projects-body").innerHTML = data.map(d => rowHtml(d, ["id","name","phase","owner","deadline","status"])) .join("");
}

async function renderNovels() {
  const data = await fetchJson("./data/novels.json");
  document.getElementById("novels-body").innerHTML = data.map(d => rowHtml(d, ["id","title","tone","episodePlan","coreConflict","status"])) .join("");
}

async function renderScripts() {
  const data = await fetchJson("./data/scripts.json");
  document.getElementById("scripts-body").innerHTML = data.map(d => rowHtml(d, ["id","scene","beat","characters","location","status"])) .join("");
}

async function renderShots() {
  const data = await fetchJson("./data/shots.json");
  const body = document.getElementById("shots-body");
  function paint(filter = "全部") {
    const filtered = filter === "全部" ? data : data.filter(s => s.status === filter);
    body.innerHTML = filtered.map(d => rowHtml(d, ["id","scene","type","duration","prompt","status"])) .join("");
  }
  document.querySelectorAll("[data-shot-filter]").forEach(btn => btn.onclick = () => paint(btn.dataset.shotFilter));
  paint();
}

async function renderCardsPage(jsonPath, hostId, mapFn) {
  const data = await fetchJson(jsonPath);
  document.getElementById(hostId).innerHTML = data.map(mapFn).join("");
}

async function renderStoryboard() {
  const data = await fetchJson("./data/storyboards.json");
  document.getElementById("storyboards-body").innerHTML = data.map(d => rowHtml(d, ["id","shot","continuityCheck","directorNote","status"])) .join("");
}

async function renderReview() {
  state.reviews = await fetchJson("./data/reviews.json");
  const body = document.getElementById("reviews-body");
  const paint = () => body.innerHTML = state.reviews.map(d => `<tr><td>${d.id}</td><td>${d.item}</td><td>${d.director}</td><td>${d.comment}</td><td><span class="status-chip">${d.status}</span></td><td><div class="btn-row"><button class="mini-btn" data-id="${d.id}" data-status="通过">通过</button><button class="mini-btn" data-id="${d.id}" data-status="返工">返工</button><button class="mini-btn" data-id="${d.id}" data-status="废弃">废弃</button></div></td></tr>`).join("");
  paint();
  body.onclick = (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const one = state.reviews.find(r => r.id === btn.dataset.id);
    one.status = btn.dataset.status;
    paint();
  };
}

async function renderCost() {
  const data = await fetchJson("./data/costs.json");
  document.getElementById("costs-body").innerHTML = data.map(d => rowHtml(d, ["item","budget","actual","reworkRate","risk"])) .join("");
  const avg = data.reduce((s, x) => s + Number(String(x.reworkRate).replace('%','')), 0) / data.length;
  const warn = document.getElementById("cost-warning");
  warn.textContent = `当前平均返工率：${avg.toFixed(1)}%`;
  warn.className = "warning";
  if (avg > 50) warn.classList.add("warn-red");
  else if (avg > 30) warn.classList.add("warn-yellow");
}

async function renderDocs() {
  const docs = await Promise.all([
    fetch("./docs/continuity-bible-template.md").then(r => r.text()),
    fetch("./docs/novel-to-shot-workflow.md").then(r => r.text())
  ]);
  document.getElementById("docs-summary").innerHTML = docs.map((t,i)=>`<article class="card"><h3>${i===0?"连续性圣经模板":"小说到镜头流程"}</h3><pre>${t.split('\n').slice(0,12).join('\n')}</pre></article>`).join("");
}

const pageHandlers = {
  "index.html": renderHome,
  "projects.html": renderProjects,
  "novel.html": renderNovels,
  "script.html": renderScripts,
  "shots.html": renderShots,
  "characters.html": () => renderCardsPage("./data/characters.json", "characters-grid", c => `<article class="card"><h3>${c.name}</h3><p><b>外貌：</b>${c.appearance}</p><p><b>服装：</b>${c.costume}</p><p><b>禁改规则：</b>${c.lockedRules}</p><p class="muted"><b>连续性备注：</b>${c.continuityNote}</p></article>`),
  "scenes.html": () => renderCardsPage("./data/scenes.json", "scenes-grid", s => `<article class="card"><h3>${s.name}</h3><p><b>空间布局：</b>${s.layout}</p><p><b>光源方向：</b>${s.lightDirection}</p><p><b>关键道具：</b>${s.keyProps}</p><p class="muted"><b>禁改规则：</b>${s.lockedRules}</p></article>`),
  "storyboard.html": renderStoryboard,
  "review.html": renderReview,
  "cost.html": renderCost,
  "docs.html": renderDocs
};

document.addEventListener("DOMContentLoaded", async () => {
  renderNav();
  const current = location.pathname.split("/").pop() || "index.html";
  const fn = pageHandlers[current];
  if (fn) await fn();
});
