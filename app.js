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

function renderNav() {
  const host = document.getElementById("top-nav");
  if (!host) return;
  const current = location.pathname.split("/").pop() || "index.html";
  host.innerHTML = `
    <div class="top-nav">
      <div class="nav-wrap">
        <div class="brand">金泰 AI 影视制片中台</div>
        <nav class="nav-links">
          ${pages.map(([href, label]) => `
            <a href="${href}" class="${href === current ? "active" : ""}">${label}</a>
          `).join("")}
        </nav>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderNav);
