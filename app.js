const pages = [
  ["index.html", "MoneyTalk 首页"],
  ["#group-chat", "角色群聊"],
  ["#characters", "角色梗库"],
  ["#speaking-lab", "听说训练"],
  ["cost.html", "成本统计"],
  ["docs.html", "制作规范"]
];

const dataFiles = ["projects", "novels", "scripts", "shots", "characters", "scenes", "storyboards", "reviews", "costs"];
const state = { reviews: [], jsonStatus: "成功" };
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches;

function renderNav() {
  const host = document.getElementById("top-nav");
  if (!host) return;
  const current = location.pathname.split("/").pop() || "index.html";
  host.innerHTML = `<div class="top-nav"><div class="nav-wrap"><div class="brand">MoneyTalk Buddy</div><nav class="nav-links">${pages.map(([href, label]) => {
    const target = href.startsWith("#") ? (current === "index.html" ? href : `./index.html${href}`) : `./${href}`;
    const active = href === current || (href.startsWith("#") && current === "index.html");
    return `<a href="${target}" class="${active ? "active" : ""}">${label}</a>`;
  }).join("")}</nav></div></div>`;
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
  if (prefersReducedMotion) return;
  const targets = document.querySelectorAll(".version-banner, .page-title, .page-subtitle, .card, .table-wrap, table");
  targets.forEach((el, i) => el.classList.add("reveal", `delay-${Math.min(i % 5, 4)}`));
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
  if (status) status.innerHTML = `<li>页面主体：已显示</li><li>CSS：已加载</li><li>JS：已运行</li><li>JSON：${state.jsonStatus}</li><li>动效层：已启用</li>`;
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


const moneyTopics = [
  {
    id: "salary",
    label: "谈薪不怂",
    mission: ["听懂 3 个关于 salary 的关键词", "用 I would like to... 提出一个诉求", "用一个轻松梗化解紧张"],
    messages: [
      ["老板马总", "If you want a raise, show me the value first. Money does not grow on office plants.", "老板端着保温杯：先别激动，先讲 ROI。"],
      ["财迷小美", "I bring value, good vibes, and emergency snacks. Can we discuss a fair salary adjustment?", "把涨薪说得像报菜名，但很专业。"],
      ["气氛组阿强", "My wallet is so thin, it has started doing yoga.", "钱包练瑜伽：主打一个轻盈。"]
    ]
  },
  {
    id: "budget",
    label: "预算大作战",
    mission: ["说出 needs 与 wants 的区别", "用 I can cut down on... 做预算", "给朋友一个不说教的建议"],
    messages: [
      ["预算姐", "A budget is not a prison. It is a GPS for your money.", "预算不是牢笼，是导航。别把钱开进沟里。"],
      ["月光小王", "I only bought one coffee. The other six were emotional support.", "咖啡：我不是消费，我是精神股东。"],
      ["理财嘴替", "Try the 50-30-20 rule: needs, wants, and savings.", "规则很正经，执行靠气氛。"]
    ]
  },
  {
    id: "bargain",
    label: "砍价王者",
    mission: ["听懂 discount / final price", "礼貌提出 Can you do...?", "用一句幽默话收尾"],
    messages: [
      ["砍价王大爷", "Can you do twenty dollars? My budget is crying in English.", "预算已经哭出伦敦腔。"],
      ["摊主 Lisa", "That is a bold offer, but I respect the confidence.", "砍得狠，但气质拿捏了。"],
      ["围观阿强", "This negotiation has more drama than my group chat.", "这场面，比群聊退群还刺激。"]
    ]
  }
];

const moneyCharacters = [
  ["💼", "老板马总", "ROI 挂嘴边", "Show me the value first.", "负责制造谈薪压力，但会给用户结构化反馈。"],
  ["🧧", "财迷小美", "省钱也要体面", "Every yuan needs a mission.", "擅长把预算说成生活美学。"],
  ["🛒", "砍价王大爷", "不砍不舒服", "Can you make it friendlier?", "把 bargain 练成脱口秀。"],
  ["🎤", "气氛组阿强", "钱包薄但嘴甜", "My wallet needs a vacation.", "用梗降低开口焦虑。"],
  ["📈", "理财嘴替", "冷静但不扫兴", "Small habits compound.", "把投资、储蓄讲成人话。"],
  ["☕", "月光小王", "冲动消费本人", "It was on sale, so I saved money... kind of.", "负责贡献反面教材和真实共鸣。"]
];

const speakingDrills = [
  ["谈薪", "I would like to discuss a fair salary adjustment.", "我想聊聊合理的薪资调整。", "替换 fair salary adjustment 为 bonus / hourly rate。"],
  ["预算", "I need to cut down on impulse spending this month.", "这个月我需要减少冲动消费。", "补一句 because... 说出你的原因。"],
  ["AA", "Let's split the bill evenly, unless someone ordered lobster.", "我们平均分账吧，除非有人点了龙虾。", "用 unless 开一个玩笑。"],
  ["砍价", "Could you give me a small discount if I pay today?", "如果我今天付款，能给我一点折扣吗？", "把 small 改成 student / cash / friendly。"]
];

const improvPrompts = [
  "Your friend wants to borrow money again. What would you say politely?",
  "You found a great deal, but you do not need it. Talk yourself out of it.",
  "Ask your boss for a raise in one confident sentence.",
  "Explain your monthly budget like you are hosting a comedy show.",
  "Convince the group to choose a cheaper restaurant without sounding cheap."
];

function renderChat(topic) {
  const chatHosts = [document.getElementById("hero-chat"), document.getElementById("main-chat")].filter(Boolean);
  chatHosts.forEach((host) => {
    host.innerHTML = topic.messages.map(([name, english, joke], index) => `
      <article class="chat-bubble ${index % 2 ? "right" : "left"}">
        <b>${name}</b>
        <p>${english}</p>
        <small>${joke}</small>
      </article>
    `).join("");
  });
  const mission = document.getElementById("mission-list");
  if (mission) mission.innerHTML = topic.mission.map((item) => `<li>${item}</li>`).join("");
}

function speakText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function renderMoneyTalkHome() {
  const tabs = document.getElementById("topic-tabs");
  if (tabs) {
    tabs.innerHTML = moneyTopics.map((topic, index) => `<button class="mini-btn ${index === 0 ? "selected" : ""}" data-topic="${topic.id}">${topic.label}</button>`).join("");
    tabs.onclick = (event) => {
      const btn = event.target.closest("button[data-topic]");
      if (!btn) return;
      tabs.querySelectorAll("button").forEach((one) => one.classList.remove("selected"));
      btn.classList.add("selected");
      renderChat(moneyTopics.find((topic) => topic.id === btn.dataset.topic) || moneyTopics[0]);
    };
  }
  renderChat(moneyTopics[0]);

  const characters = document.getElementById("money-characters");
  if (characters) {
    characters.innerHTML = moneyCharacters.map(([emoji, name, hook, line, note]) => `
      <article class="card role-card">
        <div class="role-emoji">${emoji}</div>
        <h3>${name}</h3>
        <p><b>梗点：</b>${hook}</p>
        <p class="quote">“${line}”</p>
        <p class="muted">${note}</p>
        <button class="mini-btn speak-btn" data-say="${line}">听一句</button>
      </article>
    `).join("");
  }

  const drills = document.getElementById("drill-list");
  if (drills) {
    drills.innerHTML = speakingDrills.map(([tag, english, chinese, task]) => `
      <article class="drill-card">
        <span>${tag}</span>
        <h3>${english}</h3>
        <p>${chinese}</p>
        <small>${task}</small>
        <button class="mini-btn speak-btn" data-say="${english}">播放英文</button>
      </article>
    `).join("");
  }

  document.body.addEventListener("click", (event) => {
    const speakBtn = event.target.closest(".speak-btn[data-say]");
    if (speakBtn) speakText(speakBtn.dataset.say);
  });

  const randomPrompt = document.getElementById("random-prompt");
  const promptOutput = document.getElementById("prompt-output");
  if (randomPrompt && promptOutput) {
    randomPrompt.onclick = () => {
      const next = improvPrompts[Math.floor(Math.random() * improvPrompts.length)];
      promptOutput.textContent = next;
      speakText(next);
    };
  }
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
  "index.html": renderMoneyTalkHome,
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
  initCursorGlow();
  initCardTilt();
});
