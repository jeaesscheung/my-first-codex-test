const pages = [
  ["index.html", "喜人梗聊"],
  ["#group-chat", "喜人群聊"],
  ["#characters", "数字人角色"],
  ["#speaking-lab", "梗式口语"],
  ["#hot-radar", "热点雷达"],
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
  host.innerHTML = `<div class="top-nav"><div class="nav-wrap"><div class="brand">喜人梗聊 Digital Human</div><nav class="nav-links">${pages.map(([href, label]) => {
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


const xirenTopics = [
  {
    id: "show-brief",
    label: "节目安利局",
    mission: ["用 one sentence 介绍《喜人奇妙夜》", "说出你最喜欢 sketch comedy 的一个原因", "用 follow-up question 继续追问对方"],
    messages: [
      ["喜人数字人", "Think of it as a sketch-comedy party where teams turn everyday anxiety into punchlines.", "先给外国朋友一句好懂的节目安利。"],
      ["考古粉小麦", "It is not just random jokes; the best sketches build a tiny world and then break it beautifully.", "高级一点：不是乱搞笑，是先建世界再拆世界。"],
      ["路人嘴替", "I came for the celebrities, but I stayed for the teams and their weird little universes.", "流量艺人负责拉我进门，喜人小队负责让我住下。"]
    ]
  },
  {
    id: "season-two",
    label: "第二季热聊",
    mission: ["练习 recently / apparently / went viral", "把一个作品名转成英文介绍", "用 I love how... 表达审美"],
    messages: [
      ["热点雷达", "Season two feels louder, faster, and more internet-native, with jokes designed to be clipped and shared.", "更像短视频时代的喜剧：一秒一个可传播点。"],
      ["梗翻译官", "For a title like Skill Gobang, I would explain it as a silly strategy game that keeps escalating.", "作品名不用硬译，先讲清玩法和笑点结构。"],
      ["弹幕代表", "I love how a sketch can look chaotic, but the timing is actually very precise.", "看似抽象，节奏很细。"]
    ]
  },
  {
    id: "celebrity-talk",
    label: "流量艺人reaction",
    mission: ["用 star power / chemistry / reaction 描述嘉宾", "练习既夸艺人又回到作品本身", "提出一个不尴尬的追问"],
    messages: [
      ["吃瓜但礼貌", "A famous guest brings attention, but the sketch still has to earn the laugh.", "流量能开门，包袱要自己站住。"],
      ["喜人数字人", "When observers like Ma Dong, Hu Xianxu, Li Dan, Zhang Ruoyun or Da Zhangwei react, their comments become part of the viewing fun.", "把观察员 reaction 也纳入聊天素材。"],
      ["口语教练", "Try asking: What did their reaction add to the sketch for you?", "别只说 handsome / funny，追问具体贡献。"]
    ]
  },
  {
    id: "meme-remix",
    label: "梗改英语",
    mission: ["把抽象梗说成 absurd humor", "用 It gives me... 表达体感", "用一句英文接梗，不复述原台词"],
    messages: [
      ["抽象翻译机", "This gives me 'everyone is losing it, but somehow the logic still works' energy.", "中文的“抽象但合理”，可以这样聊。"],
      ["小品拆解员", "The joke works because the characters treat a ridiculous situation like a serious emergency.", "喜剧常用公式：荒唐处境 + 一本正经。"],
      ["路人嘴替", "My brain says no, but my laugh says replay it.", "适合刷到离谱片段时接一句。"]
    ]
  }
];

const xirenCharacters = [
  ["🎭", "喜人数字人", "全能陪聊", "Give me the sketch, and I will turn the joke into casual English.", "负责把节目、小队、笑点和热搜话题变成可开口的英语闲聊。"],
  ["📼", "考古粉小麦", "懂前后文", "The callback is the real dessert.", "负责回顾旧作品、人物关系和观众记忆点。"],
  ["🔥", "热点雷达", "紧跟平台讨论", "This is exactly why the clip went viral.", "负责把热搜、弹幕、短视频传播点变成话题问题。"],
  ["🌍", "梗翻译官", "不硬翻", "Do not translate the words; translate the funny.", "负责把中文梗改写成外国朋友听得懂的表达。"],
  ["💬", "路人嘴替", "真实reaction", "I did not expect to laugh, but here we are.", "负责提供自然、不端着的口语反应。"],
  ["🎙️", "口语教练", "逼你多说一句", "Nice. Now add one reason and one example.", "负责把你的短回答扩展成完整交流。"]
];

const speakingDrills = [
  ["安利节目", "It is a Chinese sketch-comedy show where teams turn social moods into hilarious scenes.", "这是一档中国小品/Sketch 喜剧节目，小队把社会情绪变成好笑场景。", "替换 social moods：work stress / family pressure / internet culture。"],
  ["评价小品", "The setup is absurd, but the emotions are surprisingly real.", "设定很荒诞，但情绪意外真实。", "补一句具体例子：for example..."],
  ["聊嘉宾", "The celebrity reactions make the show easier to enter, but the performers carry the sketch.", "明星反应让节目更好入坑，但真正撑住小品的是演员。", "用 however / while 做平衡表达。"],
  ["解释热梗", "It went viral because the line is short, repeatable, and weirdly accurate.", "它火是因为短、好复读，而且离谱地准确。", "把 line 改成 facial expression / twist / character。"],
  ["接抽象梗", "I do not fully understand it, but I fully support the chaos.", "我不一定完全懂，但我完全支持这个混乱。", "适合接抽象片段，语气轻松。"],
  ["表达偏爱", "I prefer sketches with strong characters, quick reversals, and a tiny bit of madness.", "我更喜欢人物强、反转快、还有一点疯的小品。", "说出你自己的三项偏好。"]
];

const improvPrompts = [
  "Recommend one Xiren sketch to a foreign friend in 20 seconds.",
  "Explain why a chaotic meme can still be smart comedy.",
  "Compare celebrity traffic with performer chemistry in one balanced opinion.",
  "Turn a Chinese internet buzzword like 'abstract' into natural English.",
  "React to a sketch ending that shocked you, but do it in casual English.",
  "Ask me a follow-up question about my favorite comedy team."
];

const voiceStorageKey = "xiren.selectedEnglishVoice";

function getSavedVoiceURI() {
  try {
    return localStorage.getItem(voiceStorageKey) || "";
  } catch (error) {
    return "";
  }
}

function saveVoiceURI(uri) {
  try {
    if (uri) localStorage.setItem(voiceStorageKey, uri);
    else localStorage.removeItem(voiceStorageKey);
  } catch (error) {
    console.warn("Voice preference could not be saved.", error);
  }
}

const voiceState = { englishVoices: [], selectedURI: getSavedVoiceURI() };

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  })[char]);
}

function voiceLabel(voice) {
  const localTag = voice.localService ? "system" : "network";
  return `${voice.name} · ${voice.lang} · ${localTag}`;
}

function getEnglishVoices() {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((voice) => /^en([_-]|$)/i.test(voice.lang))
    .sort((a, b) => {
      const aUS = a.lang.toLowerCase() === "en-us" ? 0 : 1;
      const bUS = b.lang.toLowerCase() === "en-us" ? 0 : 1;
      return aUS - bUS || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
    });
}

function findVoice(uri) {
  return voiceState.englishVoices.find((voice) => voice.voiceURI === uri);
}

function getDefaultEnglishVoice() {
  return voiceState.englishVoices.find((voice) => voice.lang.toLowerCase() === "en-us") || null;
}

function getActiveVoice() {
  return findVoice(voiceState.selectedURI) || getDefaultEnglishVoice();
}

function updateVoiceStatus() {
  document.querySelectorAll("[data-voice-status]").forEach((status) => {
    const selectedVoice = findVoice(voiceState.selectedURI);
    const fallbackVoice = getDefaultEnglishVoice();
    if (selectedVoice) {
      status.textContent = `Saved: ${selectedVoice.name}`;
    } else if (fallbackVoice) {
      status.textContent = `Default: ${fallbackVoice.name} (${fallbackVoice.lang})`;
    } else {
      status.textContent = "Default: en-US";
    }
  });
}

function renderVoicePickers() {
  const pickers = document.querySelectorAll("[data-voice-picker]");
  if (!pickers.length) return;

  voiceState.englishVoices = getEnglishVoices();
  if (voiceState.selectedURI && !findVoice(voiceState.selectedURI)) {
    voiceState.selectedURI = "";
    saveVoiceURI("");
  }

  const defaultVoice = getDefaultEnglishVoice();
  const options = [
    `<option value="">Default en-US${defaultVoice ? ` · ${defaultVoice.name}` : ""}</option>`,
    ...voiceState.englishVoices.map((voice) => `<option value="${escapeHtml(voice.voiceURI)}">${escapeHtml(voiceLabel(voice))}</option>`)
  ];

  pickers.forEach((picker) => {
    picker.innerHTML = voiceState.englishVoices.length
      ? options.join("")
      : '<option value="">No English voices found yet</option>';
    picker.value = voiceState.selectedURI;
    picker.disabled = !voiceState.englishVoices.length;
    picker.onchange = () => {
      voiceState.selectedURI = picker.value;
      saveVoiceURI(voiceState.selectedURI);
      renderVoicePickers();
    };
  });
  updateVoiceStatus();
}

function initVoicePicker() {
  renderVoicePickers();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = renderVoicePickers;
  }
}

function renderChat(topic) {
  const chatHosts = [document.getElementById("hero-chat"), document.getElementById("main-chat")].filter(Boolean);
  chatHosts.forEach((host) => {
    host.innerHTML = topic.messages.map(([name, english, joke], index) => `
      <article class="chat-bubble ${index % 2 ? "right" : "left"}">
        <b>${name}</b>
        <button class="line-play speak-btn" data-say="${english}" aria-label="播放这句英文">▶</button>
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
  const activeVoice = getActiveVoice();
  utterance.lang = activeVoice?.lang || "en-US";
  utterance.voice = activeVoice;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function renderXirenHome() {
  initVoicePicker();

  const tabs = document.getElementById("topic-tabs");
  if (tabs) {
    tabs.innerHTML = xirenTopics.map((topic, index) => `<button class="mini-btn ${index === 0 ? "selected" : ""}" data-topic="${topic.id}">${topic.label}</button>`).join("");
    tabs.onclick = (event) => {
      const btn = event.target.closest("button[data-topic]");
      if (!btn) return;
      tabs.querySelectorAll("button").forEach((one) => one.classList.remove("selected"));
      btn.classList.add("selected");
      renderChat(xirenTopics.find((topic) => topic.id === btn.dataset.topic) || xirenTopics[0]);
    };
  }
  renderChat(xirenTopics[0]);

  const characters = document.getElementById("xiren-characters");
  if (characters) {
    characters.innerHTML = xirenCharacters.map(([emoji, name, hook, line, note]) => `
      <article class="card role-card">
        <div class="role-emoji">${emoji}</div>
        <h3>${name}</h3>
        <p><b>人设：</b>${hook}</p>
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
  "index.html": renderXirenHome,
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
