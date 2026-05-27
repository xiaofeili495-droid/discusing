const state = {
  currentView: "dashboard",
  round: 1,
  roundStage: "opening",
  activeRoleId: "eng",
  transcriptExpanded: false,
  editingRole: null,
  exportType: "markdown",
  exportSummary: true,
  exportRoles: true,
  preferences: {
    focus: "增长",
    tone: "直接",
    habit: "先问目标",
  },
  room: {
    title: "会员权益升级需求评审",
    topic: "会员中心新增分层权益体系是否值得上线",
  },
  files: [
    { name: "会员权益升级-PRD-v0.9.docx", type: "DOCX", label: "PRD", status: "已解析" },
    { name: "Q2-会员增长背景.md", type: "MD", label: "背景", status: "已解析" },
    { name: "0318-需求评审会议纪要.txt", type: "TXT", label: "会议记录", status: "识别到 4 位说话人" },
  ],
  transcriptSegments: [
    {
      speaker: "产品经理-阿宁",
      summary: "目标是提升会员体系的长期感知和次月留存，担心当前会员体系缺少明确的等级价值。",
    },
    {
      speaker: "研发负责人-赵工",
      summary: "如果权益规则超过两档且包含动态变更，会显著抬升老系统改造复杂度和测试成本。",
    },
    {
      speaker: "运营负责人-林琳",
      summary: "希望保留至少一个强感知权益，否则试点上线后很难看到增长效果。",
    },
    {
      speaker: "客服代表-小周",
      summary: "用户最容易困惑的点是等级变更时机和权益失效规则，FAQ 必须提前准备。",
    },
  ],
  speakers: ["产品经理-阿宁", "研发负责人-赵工", "运营负责人-林琳", "客服代表-小周"],
  presetRoles: [
    {
      id: "eng",
      name: "研发负责人",
      niche: "技术 owner",
      interest: "稳定交付与复杂度可控",
      focus: ["开发周期", "边界条件", "存量改造成本"],
      style: "谨慎、偏结构化",
      stance: "保留",
      source: "预置模板",
      selected: true,
    },
    {
      id: "ops",
      name: "运营负责人",
      niche: "增长 owner",
      interest: "拉新与转化效率",
      focus: ["活动玩法", "权益吸引力", "执行节奏"],
      style: "结果导向、推进感强",
      stance: "支持",
      source: "预置模板",
      selected: true,
    },
    {
      id: "user",
      name: "典型用户",
      niche: "目标用户镜像",
      interest: "权益是否清晰且真正有感知",
      focus: ["认知成本", "权益门槛", "长期价值"],
      style: "直接、从体感出发",
      stance: "保留",
      source: "预置模板",
      selected: true,
    },
    {
      id: "boss",
      name: "老板",
      niche: "业务决策者",
      interest: "业务价值与投入产出比",
      focus: ["收益预期", "优先级", "对外叙事"],
      style: "压缩信息、追问核心",
      stance: "保留",
      source: "预置模板",
      selected: false,
    },
  ],
  generatedRoles: [
    {
      id: "support",
      name: "客服代表-小周",
      niche: "用户问题收集者",
      interest: "减少咨询成本与用户误解",
      focus: ["规则清晰度", "投诉风险", "上线后 FAQ 压力"],
      style: "细节敏感、会反复确认",
      stance: "保留",
      source: "来自 0318 会议纪要",
      selected: false,
    },
  ],
  recentRooms: [
    {
      title: "会员权益升级需求评审",
      topic: "是否值得先做单档试点",
      update: "15 分钟前",
      roles: 3,
      tag: "有明显分歧",
    },
    {
      title: "支付页优惠券改版评审",
      topic: "是否会拉高支付路径复杂度",
      update: "昨天",
      roles: 4,
      tag: "建议延后",
    },
  ],
  recentExports: [
    ["会员权益升级需求评审", "今天 16:40", "Markdown"],
    ["支付页优惠券改版评审", "昨天 11:08", "PDF"],
  ],
  messages: [
    {
      type: "system",
      speaker: "系统",
      label: "引导",
      content: "已载入本次评审的 PRD、背景材料和会议记录。你可以先抛出一个问题，系统会按首轮评审、交叉追问、收敛总结三个阶段推进。",
    },
  ],
  summary: {
    consensus: "会员权益升级方向具备增长潜力，但当前版本更适合验证核心权益是否真的被用户感知。",
    disagreement: "运营更倾向尽快上线试点，研发和客服担心规则复杂后带来的交付与解释成本。",
    risks: "若权益层级与领取规则过多，用户理解成本会迅速上升，且客服压力可能在首月明显增加。",
    next: "建议先用单一核心权益做最小闭环，限定一档试点人群，并在上线前补齐 FAQ 与埋点方案。",
  },
};

const viewTitles = {
  dashboard: "工作台",
  create: "新建评审室",
  review: "评审对话室",
  roles: "角色中心",
  history: "历史评审",
};

const stageConfig = [
  { key: "opening", label: "首轮评审", helper: "先让各角色从自身生态位给出第一反应" },
  { key: "cross", label: "交叉追问", helper: "围绕分歧点做补充、挑战与澄清" },
  { key: "closing", label: "收敛总结", helper: "系统提炼共识、分歧、风险与下一步" },
];

const roleReplies = {
  研发负责人:
    "如果现在就上完整的分层体系，我最担心的是规则分支太多，会员等级、领取条件、权益失效都会让实现和测试成本一起抬升。建议把第一版压缩到最关键的一档权益，先验证用户是否真的因为权益变化提升留存。",
  运营负责人:
    "从增长角度看，这个方向值得做，因为用户对身份感和专属权益是有感知的。但如果第一版太保守，可能看不到足够的数据波动。我会建议至少保留一个能明显被感知的核心权益，不然试点价值会被稀释。",
  典型用户:
    "如果我是用户，我会先问两件事：我为什么能拿到这个权益，以及这个权益到底对我有什么实际好处。只要用户需要花时间理解规则，体验就已经打折了。",
  老板:
    "我想先确认一件事，这次升级究竟是为了解决增长停滞，还是为了强化会员体系的长期认知。如果目标不清晰，这个需求很容易变成一个投入不小、但收益难讲清的项目。",
  "客服代表-小周":
    "从客服视角看，最容易爆掉的是规则解释。只要权益生效条件、过期机制和等级变更时机不够清楚，首周咨询量一定会上升，所以我会非常关心用户能不能一眼看懂。",
};

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function getAllRoles() {
  return [...state.presetRoles, ...state.generatedRoles];
}

function getSelectedRoles() {
  return getAllRoles().filter((role) => role.selected);
}

function getActiveRole() {
  return getAllRoles().find((role) => role.id === state.activeRoleId) ?? getAllRoles()[0];
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDashboard() {
  $("#recent-rooms").innerHTML = state.recentRooms
    .map(
      (room) => `
      <article class="room-card">
        <h4>${room.title}</h4>
        <p>${room.topic}</p>
        <div class="meta-row">
          <span class="meta-badge">${room.update}</span>
          <span class="meta-badge">${room.roles} 位角色</span>
          <span class="meta-badge">${room.tag}</span>
        </div>
      </article>`
    )
    .join("");

  $("#favorite-roles").innerHTML = state.presetRoles
    .slice(0, 4)
    .map(
      (role) => `
      <article class="role-card ${role.selected ? "selected" : ""}">
        <div>
          <h4>${role.name}</h4>
          <div class="tag-row"><span class="tag">${role.niche}</span></div>
        </div>
        <p class="role-meta">关注：${role.focus.join(" / ")}</p>
      </article>`
    )
    .join("");

  $("#recent-exports").innerHTML = state.recentExports
    .map(
      ([title, time, type]) => `
      <article class="export-card">
        <strong>${title}</strong>
        <div class="meta-row">
          <span class="meta-badge">${time}</span>
          <span class="meta-badge">${type}</span>
        </div>
      </article>`
    )
    .join("");
}

function renderCreate() {
  $("#room-name").value = state.room.title;
  $("#room-topic").value = state.room.topic;

  $("#file-list").innerHTML = state.files
    .map(
      (file) => `
      <div class="file-row">
        <strong>${file.name}</strong>
        <span>${file.type}</span>
        <span>${file.label}</span>
        <span>${file.status}</span>
      </div>`
    )
    .join("");

  $("#speaker-chips").innerHTML = state.speakers.map((speaker) => `<span class="mini-pill">${speaker}</span>`).join("");

  $("#transcript-panel").innerHTML = state.transcriptSegments
    .map(
      (segment) => `
      <article class="transcript-segment">
        <strong>${segment.speaker}</strong>
        <p>${segment.summary}</p>
      </article>`
    )
    .join("");

  $("#toggle-transcript").textContent = state.transcriptExpanded ? "收起详情" : "展开详情";
  $("#transcript-panel").classList.toggle("collapsed", !state.transcriptExpanded);

  renderRoleCardList("#preset-role-list", state.presetRoles, "preset");
  renderRoleCardList("#generated-role-list", state.generatedRoles, "generated");
  renderPreferenceGroup('[data-pref-group="focus"]', ["增长", "体验", "风险", "效率"], state.preferences.focus, "focus");
  renderPreferenceGroup('[data-pref-group="tone"]', ["直接", "克制"], state.preferences.tone, "tone");
  renderPreferenceGroup('[data-pref-group="habit"]', ["先问目标", "先问方案"], state.preferences.habit, "habit");
}

function renderRoleCardList(selector, roles, source) {
  $(selector).innerHTML = roles
    .map(
      (role) => `
      <article class="role-card ${role.selected ? "selected" : ""}">
        <div>
          <h4>${role.name}</h4>
          <div class="tag-row">
            <span class="tag">${role.niche}</span>
            <span class="tag">${role.stance}</span>
          </div>
        </div>
        <p class="role-meta">
          核心利益：${role.interest}<br />
          关注重点：${role.focus.join(" / ")}<br />
          风格：${role.style}
        </p>
        <div class="composer-actions">
          <button class="ghost-button small" data-toggle-role="${source}:${role.id}">
            ${role.selected ? "已加入本次评审" : "加入本次评审"}
          </button>
          <button class="ghost-button small" data-edit-role="${source}:${role.id}">编辑</button>
        </div>
      </article>`
    )
    .join("");
}

function renderPreferenceGroup(selector, options, active, group) {
  $(selector).innerHTML = options
    .map(
      (option) => `
      <button class="pref-chip ${option === active ? "active" : ""}" data-pref="${group}:${option}">
        ${option}
      </button>`
    )
    .join("");
}

function renderReview() {
  $("#review-room-title").textContent = state.room.title;
  $("#review-topic").textContent = state.room.topic;
  $("#round-badge").textContent = `第 ${state.round} 轮`;

  $("#review-files").innerHTML = state.files
    .map((file) => `<span class="mini-pill">${file.label} · ${file.name}</span>`)
    .join("");

  $("#review-selected-roles").innerHTML = getSelectedRoles()
    .map((role) => `<span class="mini-pill">${role.name}</span>`)
    .join("");

  $("#round-stage-bar").innerHTML = stageConfig
    .map(
      (stage, index) => `
      <article class="round-stage ${stage.key === state.roundStage ? "active" : ""}">
        <strong>${index + 1}. ${stage.label}</strong>
        <p>${stage.helper}</p>
      </article>`
    )
    .join("");

  $("#conversation-list").innerHTML = state.messages
    .map(
      (message) => `
      <article class="message-card ${message.type}">
        <div class="message-meta">
          <strong>${message.speaker}</strong>
          <span class="speaker-label">${message.label}</span>
        </div>
        <p class="message-content">${escapeHtml(message.content)}</p>
      </article>`
    )
    .join("");

  $("#inspector-role-list").innerHTML = getSelectedRoles()
    .map(
      (role) => `
      <article class="role-card">
        <div>
          <h4>${role.name}</h4>
          <div class="tag-row">
            <span class="tag">${role.niche}</span>
            <span class="tag">${role.stance}</span>
          </div>
        </div>
        <p class="role-meta">核心利益：${role.interest}<br />关注重点：${role.focus.join(" / ")}</p>
      </article>`
    )
    .join("");

  renderSummary("#summary-box");
}

function renderRoles() {
  const activeRole = getActiveRole();
  $("#role-table").innerHTML = getAllRoles()
    .map(
      (role) => `
      <article class="role-row ${activeRole && activeRole.id === role.id ? "active" : ""}" data-active-role="${role.id}">
        <strong>${role.name}</strong>
        <span>${role.niche}</span>
        <span>${role.focus.join(" / ")}</span>
        <span>${role.source}</span>
      </article>`
    )
    .join("");

  $("#role-detail-card").innerHTML = activeRole
    ? `
      <p class="eyebrow">Role Detail</p>
      <h4>${activeRole.name}</h4>
      <p>生态位：${activeRole.niche}</p>
      <p>核心利益：${activeRole.interest}</p>
      <p>关注重点：${activeRole.focus.join(" / ")}</p>
      <p>表达风格：${activeRole.style}</p>
      <p>来源：${activeRole.source}</p>
      <div class="sticky-actions">
        <button class="ghost-button" data-edit-role="${findRoleSource(activeRole.id)}:${activeRole.id}">编辑角色</button>
        <button class="primary-button" data-goto="create">用于新评审</button>
      </div>`
    : "";
}

function renderHistory() {
  $("#history-room-title").textContent = state.room.title;
  $("#history-roles").textContent = getSelectedRoles().map((role) => role.name).join(" / ");
  $("#history-chat").innerHTML = state.messages
    .map(
      (message) => `
      <article class="message-card ${message.type}">
        <div class="message-meta">
          <strong>${message.speaker}</strong>
          <span class="speaker-label">${message.label}</span>
        </div>
        <p class="message-content">${escapeHtml(message.content)}</p>
      </article>`
    )
    .join("");
  renderSummary("#history-summary");
}

function renderSummary(selector) {
  $(selector).innerHTML = `
    <h5>主要共识</h5>
    <p>${state.summary.consensus}</p>
    <h5>主要分歧</h5>
    <p>${state.summary.disagreement}</p>
    <h5>关键风险</h5>
    <p>${state.summary.risks}</p>
    <h5>建议下一步</h5>
    <p>${state.summary.next}</p>`;
}

function renderExportOptions() {
  $("#export-options").innerHTML = [
    {
      key: "markdown",
      title: "Markdown",
      desc: "适合继续整理成 PRD 修订稿或会议纪要。",
    },
    {
      key: "txt",
      title: "纯文本",
      desc: "适合快速留档或复制到其他工具。",
    },
  ]
    .map(
      (option) => `
      <label class="export-option ${state.exportType === option.key ? "active" : ""}">
        <input type="radio" name="export-type" value="${option.key}" ${state.exportType === option.key ? "checked" : ""} />
        <div>
          <strong>${option.title}</strong>
          <p>${option.desc}</p>
        </div>
      </label>`
    )
    .join("");

  $("#export-summary").checked = state.exportSummary;
  $("#export-roles").checked = state.exportRoles;
}

function renderView() {
  $("#view-title").textContent = viewTitles[state.currentView];
  $all(".view").forEach((view) => view.classList.toggle("active", view.dataset.view === state.currentView));
  $all(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.viewTarget === state.currentView));

  renderDashboard();
  renderCreate();
  renderReview();
  renderRoles();
  renderHistory();
  renderExportOptions();
}

function setView(view) {
  state.currentView = view;
  renderView();
}

function findRoleSource(id) {
  return state.presetRoles.some((role) => role.id === id) ? "preset" : "generated";
}

function findRole(source, id) {
  return (source === "preset" ? state.presetRoles : state.generatedRoles).find((role) => role.id === id);
}

function updateRole(source, id, updater) {
  const target = source === "preset" ? state.presetRoles : state.generatedRoles;
  const index = target.findIndex((role) => role.id === id);
  if (index >= 0) target[index] = updater(target[index]);
}

function openModal(id) {
  $("#" + id).classList.remove("hidden");
}

function closeModal(id) {
  $("#" + id).classList.add("hidden");
}

function openRoleEditor(source, id) {
  const role = findRole(source, id);
  if (!role) return;
  state.editingRole = { source, id };
  $("#modal-role-name").value = role.name;
  $("#modal-role-niche").value = role.niche;
  $("#modal-role-interest").value = role.interest;
  $("#modal-role-focus").value = role.focus.join(" / ");
  $("#modal-role-style").value = role.style;
  openModal("role-modal");
}

function saveRoleEditor() {
  if (!state.editingRole) return;
  const { source, id } = state.editingRole;
  updateRole(source, id, (role) => ({
    ...role,
    name: $("#modal-role-name").value.trim() || role.name,
    niche: $("#modal-role-niche").value.trim() || role.niche,
    interest: $("#modal-role-interest").value.trim() || role.interest,
    focus: $("#modal-role-focus")
      .value.split(/[\/、,，]/)
      .map((item) => item.trim())
      .filter(Boolean),
    style: $("#modal-role-style").value.trim() || role.style,
  }));
  closeModal("role-modal");
  renderView();
}

function toggleRole(source, id) {
  updateRole(source, id, (role) => ({ ...role, selected: !role.selected }));
  renderView();
}

function addGeneratedRoles() {
  state.generatedRoles.push(
    {
      id: `gen-${Date.now()}`,
      name: "研发负责人-赵工",
      niche: "技术 owner",
      interest: "限制改造范围，避免复杂规则侵入老系统",
      focus: ["灰度方案", "异常处理", "测试成本"],
      style: "先拆边界，再给结论",
      stance: "保留",
      source: "来自 0318 会议纪要",
      selected: false,
    },
    {
      id: `gen-ops-${Date.now()}`,
      name: "运营负责人-林琳",
      niche: "增长推进者",
      interest: "保留一个强感知权益，确保试点能看到转化效果",
      focus: ["活动节奏", "权益感知度", "转化提升"],
      style: "结论先行，偏强推动",
      stance: "支持",
      source: "来自 0318 会议纪要",
      selected: false,
    }
  );
  $("#api-status").textContent = "已通过本地逻辑模拟会议记录解析";
  renderView();
}

function updateSummary(input) {
  if (input.includes("支持")) {
    state.summary.disagreement = "运营认为应该尽快试点，而研发与用户视角都要求先简化权益规则并验证用户是否真正在意。";
    state.summary.next = "建议收敛到单一权益试点，并在 PRD 中补充目标用户、核心指标和 FAQ 口径。";
  } else if (input.includes("风险")) {
    state.summary.risks = "当前最主要的风险集中在规则复杂度、客服解释成本和用户对会员层级的理解门槛。";
  } else if (input.includes("目标")) {
    state.summary.consensus = "讨论逐步收敛到一个前提：本次需求需要先明确是为增长试点还是为长期会员认知服务。";
  }
}

function advanceStage() {
  if (state.roundStage === "opening") state.roundStage = "cross";
  else if (state.roundStage === "cross") state.roundStage = "closing";
  else {
    state.roundStage = "opening";
    state.round += 1;
  }
}

function sendRound() {
  const input = $("#composer-input").value.trim();
  if (!input) return;

  state.messages.push({
    type: "user",
    speaker: "你",
    label: "产品经理",
    content: input,
  });

  getSelectedRoles().forEach((role) => {
    state.messages.push({
      type: "role",
      speaker: role.name,
      label: role.niche,
      content: roleReplies[role.name] || `${role.name}认为这个方向需要进一步明确目标、范围和风险。`,
    });
  });

  state.messages.push({
    type: "stage",
    speaker: "系统",
    label: "阶段推进",
    content: `本轮已完成，当前将从「${stageConfig.find((stage) => stage.key === state.roundStage).label}」推进到下一阶段。`,
  });

  updateSummary(input);
  advanceStage();
  $("#composer-input").value = "";
  $("#api-status").textContent = "当前使用本地静态原型逻辑";
  renderView();
}

function buildExportContent() {
  const lines = [
    state.exportType === "markdown" ? `# ${state.room.title}` : state.room.title,
    "",
    `主题：${state.room.topic}`,
  ];

  if (state.exportRoles) {
    lines.push("", state.exportType === "markdown" ? "## 参与角色" : "参与角色");
    lines.push(...getSelectedRoles().map((role) => `- ${role.name}：${role.niche}`));
  }

  lines.push("", state.exportType === "markdown" ? "## 会话记录" : "会话记录");
  lines.push(...state.messages.map((message) => `- ${message.speaker}（${message.label}）：${message.content}`));

  if (state.exportSummary) {
    lines.push("", state.exportType === "markdown" ? "## 自动总结" : "自动总结");
    lines.push(`- 主要共识：${state.summary.consensus}`);
    lines.push(`- 主要分歧：${state.summary.disagreement}`);
    lines.push(`- 关键风险：${state.summary.risks}`);
    lines.push(`- 建议下一步：${state.summary.next}`);
  }

  return lines.join("\n");
}

function runExport() {
  const content = buildExportContent();
  const blob = new Blob([content], {
    type: state.exportType === "markdown" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.room.title}-评审记录.${state.exportType === "markdown" ? "md" : "txt"}`;
  link.click();
  URL.revokeObjectURL(url);
  closeModal("export-modal");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, article, .modal-backdrop, label.export-option, input[type='radio']");
    if (!target) return;

    if (target.dataset.viewTarget) setView(target.dataset.viewTarget);
    if (target.dataset.goto) setView(target.dataset.goto);
    if (target.id === "quick-start" || target.id === "launch-review") setView("review");
    if (target.id === "toggle-transcript") {
      state.transcriptExpanded = !state.transcriptExpanded;
      renderCreate();
    }
    if (target.id === "generate-roles") addGeneratedRoles();
    if (target.dataset.toggleRole) {
      const [source, id] = target.dataset.toggleRole.split(":");
      toggleRole(source, id);
    }
    if (target.dataset.editRole) {
      const [source, id] = target.dataset.editRole.split(":");
      openRoleEditor(source, id);
    }
    if (target.dataset.pref) {
      const [group, value] = target.dataset.pref.split(":");
      state.preferences[group] = value;
      renderCreate();
    }
    if (target.id === "send-round") sendRound();
    if (target.dataset.prompt) $("#composer-input").value = target.dataset.prompt;
    if (target.id === "refresh-summary") renderSummary("#summary-box");
    if (target.id === "copy-summary") {
      const text = [
        `主要共识：${state.summary.consensus}`,
        `主要分歧：${state.summary.disagreement}`,
        `关键风险：${state.summary.risks}`,
        `建议下一步：${state.summary.next}`,
      ].join("\n");
      navigator.clipboard?.writeText(text).catch(() => {});
    }
    if (target.id === "export-from-top" || target.id === "export-from-review" || target.classList.contains("export-trigger")) {
      openModal("export-modal");
    }
    if (target.dataset.activeRole) {
      state.activeRoleId = target.dataset.activeRole;
      renderRoles();
    }
    if (target.dataset.closeModal) closeModal(target.dataset.closeModal);
    if (target.id === "save-role-modal") saveRoleEditor();
    if (target.id === "run-export") runExport();

    if (target.name === "export-type" || target.closest(".export-option")) {
      const input = target.value ? target : target.querySelector("input[name='export-type']");
      if (input) {
        state.exportType = input.value;
        renderExportOptions();
      }
    }
  });

  $("#export-summary").addEventListener("change", (event) => {
    state.exportSummary = event.target.checked;
  });

  $("#export-roles").addEventListener("change", (event) => {
    state.exportRoles = event.target.checked;
  });

  $("#room-name").addEventListener("input", (event) => {
    state.room.title = event.target.value;
    renderReview();
    renderHistory();
  });

  $("#room-topic").addEventListener("input", (event) => {
    state.room.topic = event.target.value;
    renderReview();
  });

  $("#file-input").addEventListener("change", (event) => {
    const newFiles = Array.from(event.target.files || []).map((file) => ({
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      label: /prd/i.test(file.name) ? "PRD" : /会议|纪要|meeting/i.test(file.name) ? "会议记录" : "背景",
      status: "待解析",
    }));
    state.files = [...newFiles, ...state.files];
    renderCreate();
    renderReview();
  });
}

bindEvents();
renderView();
