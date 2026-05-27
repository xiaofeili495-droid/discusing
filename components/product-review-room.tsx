"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  buildExportContent,
  getDashboardPayload,
  getRoomPayload,
  guessFileLabel,
  stageConfig,
  type DashboardPayload,
  type ExportLog,
  type ExportType,
  type FileItem,
  type Message,
  type Role,
  type RoleSource,
  type ReviewRoundResponse,
  type RoomPayload,
  type StageKey,
  type Summary,
  type TranscriptSegment,
  type View,
} from "@/lib/prototype-data";

type ModalState =
  | { type: null }
  | { type: "export" }
  | { type: "role"; roleSource: RoleSource; roleId: string };

const viewTitles: Record<View, string> = {
  dashboard: "工作台",
  create: "新建评审室",
  review: "评审对话室",
  roles: "角色中心",
  history: "历史评审",
};

function downloadTextFile(content: string, fileName: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProductReviewRoom() {
  const initialRoom = useMemo<RoomPayload>(() => getRoomPayload(), []);
  const initialDashboard = useMemo<DashboardPayload>(() => getDashboardPayload(), []);
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [round, setRound] = useState(initialRoom.round);
  const [roundStage, setRoundStage] = useState<StageKey>(initialRoom.roundStage);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isGeneratingRoles, setIsGeneratingRoles] = useState(false);
  const [apiStatus, setApiStatus] = useState("已载入本地原型数据");

  const [roomTitle, setRoomTitle] = useState(initialRoom.roomTitle);
  const [roomTopic, setRoomTopic] = useState(initialRoom.roomTopic);
  const [composerValue, setComposerValue] = useState("");
  const [files, setFiles] = useState<FileItem[]>(initialRoom.files);
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>(initialRoom.transcriptSegments);
  const [speakers, setSpeakers] = useState(initialRoom.speakers);
  const [presetRoles, setPresetRoles] = useState<Role[]>(initialRoom.presetRoles);
  const [generatedRoles, setGeneratedRoles] = useState<Role[]>(initialRoom.generatedRoles);
  const [activeRoleId, setActiveRoleId] = useState(initialRoom.presetRoles[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>(initialRoom.messages);
  const [summary, setSummary] = useState<Summary>(initialRoom.summary);
  const [recentRooms, setRecentRooms] = useState(initialDashboard.recentRooms);
  const [recentExports, setRecentExports] = useState<ExportLog[]>(initialDashboard.recentExports);
  const [focusPreference, setFocusPreference] = useState("增长");
  const [tonePreference, setTonePreference] = useState("直接");
  const [habitPreference, setHabitPreference] = useState("先问目标");
  const [exportType, setExportType] = useState<ExportType>("markdown");
  const [exportSummary, setExportSummary] = useState(true);
  const [exportRoles, setExportRoles] = useState(true);
  const [roleDraft, setRoleDraft] = useState({
    name: "",
    niche: "",
    interest: "",
    focus: "",
    style: "",
  });

  const allRoles = useMemo(() => [...presetRoles, ...generatedRoles], [presetRoles, generatedRoles]);
  const selectedRoles = useMemo(() => allRoles.filter((role) => role.selected), [allRoles]);
  const activeRole = useMemo(
    () => allRoles.find((role) => role.id === activeRoleId) ?? allRoles[0],
    [activeRoleId, allRoles]
  );

  useEffect(() => {
    let alive = true;

    async function bootstrapFromApi() {
      try {
        const [dashboardRes, roomRes] = await Promise.all([
          fetch("/api/prototype/dashboard"),
          fetch("/api/prototype/room"),
        ]);

        if (!dashboardRes.ok || !roomRes.ok) {
          throw new Error("bootstrap_failed");
        }

        const dashboardData = (await dashboardRes.json()) as DashboardPayload;
        const roomData = (await roomRes.json()) as RoomPayload;

        if (!alive) return;

        setRecentRooms(dashboardData.recentRooms);
        setRecentExports(dashboardData.recentExports);
        setRoomTitle(roomData.roomTitle);
        setRoomTopic(roomData.roomTopic);
        setRound(roomData.round);
        setRoundStage(roomData.roundStage);
        setFiles(roomData.files);
        setTranscriptSegments(roomData.transcriptSegments);
        setSpeakers(roomData.speakers);
        setPresetRoles(roomData.presetRoles);
        setGeneratedRoles(roomData.generatedRoles);
        setActiveRoleId(roomData.presetRoles[0]?.id ?? "");
        setMessages(roomData.messages);
        setSummary(roomData.summary);
        setApiStatus("已连接原型 API 路由");
      } catch {
        if (!alive) return;
        setApiStatus("API 不可用，当前使用本地回退数据");
      } finally {
        if (alive) setIsBootstrapping(false);
      }
    }

    void bootstrapFromApi();

    return () => {
      alive = false;
    };
  }, []);

  function findRole(source: RoleSource, id: string) {
    const targetList = source === "preset" ? presetRoles : generatedRoles;
    return targetList.find((item) => item.id === id);
  }

  function updateRole(source: RoleSource, id: string, updater: (role: Role) => Role) {
    const setter = source === "preset" ? setPresetRoles : setGeneratedRoles;
    setter((roles) => roles.map((role) => (role.id === id ? updater(role) : role)));
  }

  function findRoleSource(id: string): RoleSource {
    return presetRoles.some((role) => role.id === id) ? "preset" : "generated";
  }

  function openRoleModal(source: RoleSource, id: string) {
    const role = findRole(source, id);
    if (!role) return;
    setRoleDraft({
      name: role.name,
      niche: role.niche,
      interest: role.interest,
      focus: role.focus.join(" / "),
      style: role.style,
    });
    setModalState({ type: "role", roleSource: source, roleId: id });
  }

  function saveRoleModal() {
    if (modalState.type !== "role") return;
    updateRole(modalState.roleSource, modalState.roleId, (role) => ({
      ...role,
      name: roleDraft.name || role.name,
      niche: roleDraft.niche || role.niche,
      interest: roleDraft.interest || role.interest,
      focus: roleDraft.focus
        .split(/[\/、,，]/)
        .map((item) => item.trim())
        .filter(Boolean),
      style: roleDraft.style || role.style,
    }));
    setActiveRoleId(modalState.roleId);
    setModalState({ type: null });
  }

  function toggleRole(source: RoleSource, id: string) {
    updateRole(source, id, (role) => ({ ...role, selected: !role.selected }));
  }

  function updateSummary(nextInput: string) {
    setSummary((current) => {
      const updated = { ...current };
      if (nextInput.includes("支持")) {
        updated.disagreement =
          "运营认为应该尽快试点，而研发与用户视角都要求先简化权益规则并验证用户是否真正在意。";
        updated.next = "建议收敛到单一权益试点，并在 PRD 中补充目标用户、核心指标和 FAQ 口径。";
      } else if (nextInput.includes("风险")) {
        updated.risks = "当前最主要的风险集中在规则复杂度、客服解释成本和用户对会员层级的理解门槛。";
      }
      return updated;
    });
  }

  function handleExport() {
    async function run() {
      try {
        const response = await fetch("/api/prototype/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: exportType,
            roomTitle,
            roomTopic,
            roles: selectedRoles,
            messages,
            summary,
            includeRoles: exportRoles,
            includeSummary: exportSummary,
          }),
        });

        if (!response.ok) throw new Error("export_failed");
        const data = (await response.json()) as { content: string };
        const ext = exportType === "markdown" ? "md" : "txt";
        const mime = exportType === "markdown" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
        downloadTextFile(data.content, `${roomTitle}-评审记录.${ext}`, mime);
      } catch {
        const ext = exportType === "markdown" ? "md" : "txt";
        const mime = exportType === "markdown" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
        const fallback = buildExportContent({
          type: exportType,
          roomTitle,
          roomTopic,
          roles: selectedRoles,
          messages,
          summary,
          includeRoles: exportRoles,
          includeSummary: exportSummary,
        });
        downloadTextFile(fallback, `${roomTitle}-评审记录.${ext}`, mime);
      } finally {
        setModalState({ type: null });
      }
    }

    void run();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
      label: guessFileLabel(file.name),
      status: "待解析",
    }));
    setFiles((current) => [...nextFiles, ...current]);
  }

  function handleLaunchReview() {
    setCurrentView("review");
  }

  function handleSendRound() {
    if (!composerValue.trim()) return;

    async function run() {
      const nextInput = composerValue.trim();

      try {
        const response = await fetch("/api/prototype/review-round", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomTitle,
            roomTopic,
            stage: roundStage,
            round,
            userMessage: nextInput,
            roles: selectedRoles,
            messages,
            summary,
          }),
        });

        if (!response.ok) throw new Error("review_round_failed");
        const data = (await response.json()) as ReviewRoundResponse;

        setMessages((current) => [...current, ...data.appendedMessages]);
        setRoundStage(data.nextStage);
        setRound(data.nextRound);
        setSummary(data.summary);
        setApiStatus("当前轮次由 review-round API 编排完成");
      } catch {
        setMessages((current) => [
          ...current,
          {
            type: "user",
            speaker: "你",
            label: "产品经理",
            content: nextInput,
          },
          {
            type: "system",
            speaker: "系统",
            label: "回退",
            content: "review-round 接口当前不可用，前端已保留输入但未继续推进本轮评审。",
          },
        ]);
        updateSummary(nextInput);
        setApiStatus("review-round 接口异常，已使用最小回退逻辑");
      } finally {
        setComposerValue("");
      }
    }

    void run();
  }

  function addGeneratedRole() {
    async function run() {
      setIsGeneratingRoles(true);
      try {
        const meetingRecord = files.find((file) => file.label === "会议记录");
        const response = await fetch("/api/prototype/parse-meeting-record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: meetingRecord?.name ?? "会议记录" }),
        });
        if (!response.ok) throw new Error("parse_failed");

        const data = (await response.json()) as {
          speakers: string[];
          transcriptSegments: TranscriptSegment[];
          generatedRoles: Role[];
        };

        setSpeakers(data.speakers);
        setTranscriptSegments(data.transcriptSegments);
        setGeneratedRoles((current) => [...current, ...data.generatedRoles]);
        setApiStatus("已通过 API 模拟会议记录解析");
      } catch {
        setGeneratedRoles((current) => [
          ...current,
          {
            id: `gen-${Date.now()}`,
            name: "研发负责人-赵工",
            niche: "技术 owner",
            interest: "限制改造范围，避免复杂规则侵入老系统",
            focus: ["灰度方案", "异常处理", "测试成本"],
            style: "先拆边界，再给结论",
            stance: "保留",
            source: "本地回退生成",
            selected: false,
          },
        ]);
        setApiStatus("解析接口不可用，已使用本地回退逻辑");
      } finally {
        setIsGeneratingRoles(false);
      }
    }

    void run();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">PR</div>
          <div>
            <p className="eyebrow">Product Review Room</p>
            <h1>产品评审室</h1>
          </div>
        </div>

        <nav className="nav-list">
          {(["dashboard", "create", "review", "roles", "history"] as View[]).map((view) => (
            <button
              key={view}
              className={`nav-item ${currentView === view ? "active" : ""}`}
              onClick={() => setCurrentView(view)}
            >
              <span>{viewTitles[view]}</span>
              <small>
                {view === "dashboard" && "最近评审与角色资产"}
                {view === "create" && "上传 PRD 与生成角色"}
                {view === "review" && "1 vs N 需求评审"}
                {view === "roles" && "沉淀生态位与关注重点"}
                {view === "history" && "会话记录与导出"}
              </small>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>本原型聚焦个人产品经理的需求评审工作流。</p>
          <button className="ghost-button" onClick={() => setCurrentView("review")}>
            继续上次评审
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Review Copilot</p>
            <h2>{viewTitles[currentView]}</h2>
          </div>

          <div className="topbar-actions">
            <label className="search-field">
              <span>搜索</span>
              <input type="text" placeholder="角色、评审主题、导出记录" />
            </label>
            <span className="status-chip soft">{isBootstrapping ? "正在读取原型 API..." : apiStatus}</span>
            <button className="ghost-button" onClick={() => setModalState({ type: "export" })}>
              导出记录
            </button>
          </div>
        </header>

        <section className={`view ${currentView === "dashboard" ? "active" : ""}`}>
          <section className="hero-card">
            <div>
              <p className="eyebrow">需求评审，不止是聊天</p>
              <h3>把 PRD、会议纪要和干系人视角放进同一个工作台里。</h3>
              <p className="hero-copy">
                上传材料，拉起虚拟评审团，提前暴露风险与分歧，并把角色生态位、核心利益和关注重点沉淀成可复用资产。
              </p>
            </div>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setCurrentView("create")}>
                新建评审室
              </button>
              <button className="ghost-button" onClick={() => setCurrentView("roles")}>
                进入角色中心
              </button>
            </div>
          </section>

          <section className="grid-dashboard">
            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Recent Rooms</p>
                  <h3>最近评审室</h3>
                </div>
                <button className="ghost-button small" onClick={() => setCurrentView("history")}>
                  查看全部
                </button>
              </div>
              <div className="room-list">
                {recentRooms.map((room) => (
                  <article key={room.title} className="room-card">
                    <h4>{room.title}</h4>
                    <p>{room.topic}</p>
                    <div className="meta-row">
                      <span className="meta-badge">{room.update}</span>
                      <span className="meta-badge">{room.roles} 位角色</span>
                      <span className="meta-badge">{room.tag}</span>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Role Assets</p>
                  <h3>常用角色模板</h3>
                </div>
                <button className="ghost-button small" onClick={() => setCurrentView("roles")}>
                  管理角色
                </button>
              </div>
              <div className="role-grid compact">
                {presetRoles.slice(0, 4).map((role) => (
                  <article key={role.id} className={`role-card ${role.selected ? "selected" : ""}`}>
                    <div>
                      <h4>{role.name}</h4>
                      <div className="tag-row">
                        <span className="tag">{role.niche}</span>
                      </div>
                    </div>
                    <p className="role-meta">关注：{role.focus.join(" / ")}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Export Log</p>
                  <h3>最近导出</h3>
                </div>
              </div>
              <div className="export-list">
                {recentExports.map(([title, time, type]) => (
                  <article key={`${title}-${time}`} className="export-card">
                    <strong>{title}</strong>
                    <div className="meta-row">
                      <span className="meta-badge">{time}</span>
                      <span className="meta-badge">{type}</span>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </section>

        <section className={`view ${currentView === "create" ? "active" : ""}`}>
          <section className="section-stack">
            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Step 1</p>
                  <h3>基础信息</h3>
                </div>
                <span className="status-chip">MVP Flow</span>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>评审室名称</span>
                  <input value={roomTitle} onChange={(event) => setRoomTitle(event.target.value)} />
                </label>
                <label className="field">
                  <span>评审主题</span>
                  <input value={roomTopic} onChange={(event) => setRoomTopic(event.target.value)} />
                </label>
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Step 2</p>
                  <h3>上传材料</h3>
                </div>
                <span className="subtle-text">支持 PDF / DOCX / MD / TXT</span>
              </div>

              <label className="upload-dropzone">
                <input type="file" multiple onChange={handleFileChange} />
                <strong>拖拽或点击上传 PRD、背景材料、会议记录</strong>
                <span>会议记录需为已整理文本，并标明说话人。</span>
              </label>

              <div className="file-table">
                {files.map((file) => (
                  <div key={`${file.name}-${file.status}`} className="file-row">
                    <strong>{file.name}</strong>
                    <span>{file.type}</span>
                    <span>{file.label}</span>
                    <span>{file.status}</span>
                  </div>
                ))}
              </div>

              <div className="speaker-detection">
                <div className="panel-header slim">
                  <h4>识别到的说话人</h4>
                  <span className="status-chip soft">可用于一键生成角色</span>
                </div>
                <div className="chip-group">
                  {speakers.map((speaker) => (
                    <span key={speaker} className="mini-pill">
                      {speaker}
                    </span>
                  ))}
                </div>
              </div>

              <div className="transcript-preview">
                <div className="panel-header slim">
                  <h4>会议记录解析预览</h4>
                  <button className="ghost-button small" onClick={() => setTranscriptExpanded((current) => !current)}>
                    {transcriptExpanded ? "收起详情" : "展开详情"}
                  </button>
                </div>
                <div className={`transcript-panel ${transcriptExpanded ? "" : "collapsed"}`}>
                  {transcriptSegments.map((segment) => (
                    <article key={segment.speaker} className="transcript-segment">
                      <strong>{segment.speaker}</strong>
                      <p>{segment.summary}</p>
                    </article>
                  ))}
                </div>
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Step 3</p>
                  <h3>角色配置</h3>
                </div>
                <button className="ghost-button small" onClick={addGeneratedRole}>
                  {isGeneratingRoles ? "正在生成角色..." : "从会议记录生成角色"}
                </button>
              </div>

              <div className="role-config-layout">
                <div>
                  <h4 className="section-subtitle">预置模板</h4>
                  <div className="role-grid">
                    {presetRoles.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        onToggle={() => toggleRole("preset", role.id)}
                        onEdit={() => openRoleModal("preset", role.id)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="section-subtitle">生成角色草稿 / 已选角色</h4>
                  <div className="role-grid">
                    {generatedRoles.map((role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        onToggle={() => toggleRole("generated", role.id)}
                        onEdit={() => openRoleModal("generated", role.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Step 4</p>
                  <h3>我的评审风格</h3>
                </div>
              </div>

              <div className="preference-grid">
                <PreferenceGroup
                  title="关注倾向"
                  value={focusPreference}
                  options={["增长", "体验", "风险", "效率"]}
                  onChange={setFocusPreference}
                />
                <PreferenceGroup
                  title="表达方式"
                  value={tonePreference}
                  options={["直接", "克制"]}
                  onChange={setTonePreference}
                />
                <PreferenceGroup
                  title="提问习惯"
                  value={habitPreference}
                  options={["先问目标", "先问方案"]}
                  onChange={setHabitPreference}
                />
              </div>

              <div className="sticky-actions">
                <button className="ghost-button">保存草稿</button>
                <button className="primary-button" onClick={handleLaunchReview}>
                  开始评审
                </button>
              </div>
            </article>
          </section>
        </section>

        <section className={`view ${currentView === "review" ? "active" : ""}`}>
          <div className="review-layout">
            <aside className="panel-card review-sidebar">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Review Brief</p>
                  <h3>{roomTitle}</h3>
                </div>
              </div>

              <div className="summary-stack">
                <div>
                  <span className="caption">当前主题</span>
                  <p>{roomTopic}</p>
                </div>
                <div>
                  <span className="caption">上传材料</span>
                  <div className="mini-list">
                    {files.map((file) => (
                      <span key={file.name} className="mini-pill">
                        {file.label} · {file.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="caption">参与角色</span>
                  <div className="mini-list">
                    {selectedRoles.map((role) => (
                      <span key={role.id} className="mini-pill">
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <section className="panel-card review-conversation">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">1 vs N Review</p>
                  <h3>评审对话室</h3>
                </div>
                <span className="status-chip">第 {round} 轮</span>
              </div>

              <div className="round-stage-bar">
                {stageConfig.map((stage, index) => (
                  <article key={stage.key} className={`round-stage ${roundStage === stage.key ? "active" : ""}`}>
                    <strong>
                      {index + 1}. {stage.label}
                    </strong>
                    <p>{stage.helper}</p>
                  </article>
                ))}
              </div>

              <div className="conversation-list">
                {messages.map((message, index) => (
                  <article key={`${message.speaker}-${index}`} className={`message-card ${message.type}`}>
                    <div className="message-meta">
                      <strong>{message.speaker}</strong>
                      <span className="speaker-label">{message.label}</span>
                    </div>
                    <p className="message-content">{message.content}</p>
                  </article>
                ))}
              </div>

              <div className="composer">
                <textarea
                  rows={3}
                  value={composerValue}
                  onChange={(event) => setComposerValue(event.target.value)}
                  placeholder="输入你想抛给评审团的问题，例如：这个方案最大的风险是什么？"
                />
                <div className="composer-actions">
                  <div className="quick-prompts">
                    <button className="ghost-button small" onClick={() => setComposerValue("请指出最大风险")}>
                      请指出最大风险
                    </button>
                    <button
                      className="ghost-button small"
                      onClick={() => setComposerValue("请分别给出是否支持上线")}
                    >
                      请分别给出是否支持上线
                    </button>
                  </div>
                  <button className="primary-button" onClick={handleSendRound}>
                    发起本轮评审
                  </button>
                </div>
              </div>
            </section>

            <aside className="panel-card review-inspector">
              <div className="inspector-block">
                <div className="panel-header slim">
                  <h4>角色视角</h4>
                </div>
                <div className="inspector-role-list">
                  {selectedRoles.map((role) => (
                    <article key={role.id} className="role-card">
                      <div>
                        <h4>{role.name}</h4>
                        <div className="tag-row">
                          <span className="tag">{role.niche}</span>
                          <span className="tag">{role.stance}</span>
                        </div>
                      </div>
                      <p className="role-meta">
                        核心利益：{role.interest}
                        <br />
                        关注重点：{role.focus.join(" / ")}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="inspector-block">
                <div className="panel-header slim">
                  <h4>自动总结</h4>
                  <button className="ghost-button small" onClick={() => setSummary((current) => ({ ...current }))}>
                    刷新
                  </button>
                </div>
                <SummaryBox summary={summary} />
              </div>

              <div className="inspector-actions">
                <button
                  className="ghost-button"
                  onClick={async () => {
                    const text = [
                      `主要共识：${summary.consensus}`,
                      `主要分歧：${summary.disagreement}`,
                      `关键风险：${summary.risks}`,
                      `建议下一步：${summary.next}`,
                    ].join("\n");
                    try {
                      await navigator.clipboard.writeText(text);
                    } catch {
                      window.alert("当前环境不支持复制，但总结内容已显示在右侧。");
                    }
                  }}
                >
                  复制总结
                </button>
                <button className="primary-button" onClick={() => setModalState({ type: "export" })}>
                  导出记录
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className={`view ${currentView === "roles" ? "active" : ""}`}>
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Role Library</p>
                <h3>角色中心</h3>
              </div>
              <div className="chip-group">
                <span className="filter-chip active">预置模板</span>
                <span className="filter-chip">我的角色</span>
                <span className="filter-chip">来源于会议记录</span>
              </div>
            </div>

            <div className="role-library-layout">
              <div className="role-table">
                {allRoles.map((role) => (
                  <article
                    key={role.id}
                    className={`role-row ${activeRole?.id === role.id ? "active" : ""}`}
                    onClick={() => setActiveRoleId(role.id)}
                  >
                    <strong>{role.name}</strong>
                    <span>{role.niche}</span>
                    <span>{role.focus.join(" / ")}</span>
                    <span>{role.source}</span>
                  </article>
                ))}
              </div>

              {activeRole ? (
                <aside className="role-detail-card">
                  <p className="eyebrow">Role Detail</p>
                  <h4>{activeRole.name}</h4>
                  <p>生态位：{activeRole.niche}</p>
                  <p>核心利益：{activeRole.interest}</p>
                  <p>关注重点：{activeRole.focus.join(" / ")}</p>
                  <p>表达风格：{activeRole.style}</p>
                  <p>来源：{activeRole.source}</p>
                  <div className="sticky-actions">
                    <button
                      className="ghost-button"
                      onClick={() => openRoleModal(findRoleSource(activeRole.id), activeRole.id)}
                    >
                      编辑角色
                    </button>
                    <button className="primary-button" onClick={() => setCurrentView("create")}>
                      用于新评审
                    </button>
                  </div>
                </aside>
              ) : null}
            </div>
          </section>
        </section>

        <section className={`view ${currentView === "history" ? "active" : ""}`}>
          <section className="panel-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Archive</p>
                <h3>历史评审详情</h3>
              </div>
              <div className="topbar-actions">
                <button className="ghost-button" onClick={() => setModalState({ type: "export" })}>
                  导出 Markdown
                </button>
                <button className="primary-button" onClick={() => setModalState({ type: "export" })}>
                  导出 TXT
                </button>
              </div>
            </div>

            <div className="history-layout">
              <div className="history-main">
                <div className="history-meta">
                  <div>
                    <span className="caption">评审室名称</span>
                    <p>{roomTitle}</p>
                  </div>
                  <div>
                    <span className="caption">时间</span>
                    <p>2026-04-01 14:20</p>
                  </div>
                  <div>
                    <span className="caption">参与角色</span>
                    <p>{selectedRoles.map((role) => role.name).join(" / ")}</p>
                  </div>
                </div>

                <div className="history-chat">
                  {messages.map((message, index) => (
                    <article key={`history-${message.speaker}-${index}`} className={`message-card ${message.type}`}>
                      <div className="message-meta">
                        <strong>{message.speaker}</strong>
                        <span className="speaker-label">{message.label}</span>
                      </div>
                      <p className="message-content">{message.content}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="summary-box sticky-summary">
                <SummaryBox summary={summary} />
              </div>
            </div>
          </section>
        </section>
      </main>

      {modalState.type === "role" ? (
        <div className="modal-shell">
          <div className="modal-backdrop" onClick={() => setModalState({ type: null })} />
          <div className="modal-card">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Role Editor</p>
                <h3>编辑角色</h3>
              </div>
              <button className="ghost-button small" onClick={() => setModalState({ type: null })}>
                关闭
              </button>
            </div>

            <div className="modal-form-grid">
              <label className="field">
                <span>名称</span>
                <input
                  value={roleDraft.name}
                  onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className="field">
                <span>生态位</span>
                <input
                  value={roleDraft.niche}
                  onChange={(event) => setRoleDraft((current) => ({ ...current, niche: event.target.value }))}
                />
              </label>
              <label className="field modal-span-2">
                <span>核心利益</span>
                <input
                  value={roleDraft.interest}
                  onChange={(event) => setRoleDraft((current) => ({ ...current, interest: event.target.value }))}
                />
              </label>
              <label className="field modal-span-2">
                <span>关注重点</span>
                <input
                  value={roleDraft.focus}
                  onChange={(event) => setRoleDraft((current) => ({ ...current, focus: event.target.value }))}
                />
              </label>
              <label className="field modal-span-2">
                <span>表达风格</span>
                <input
                  value={roleDraft.style}
                  onChange={(event) => setRoleDraft((current) => ({ ...current, style: event.target.value }))}
                />
              </label>
            </div>

            <div className="sticky-actions">
              <button className="ghost-button" onClick={() => setModalState({ type: null })}>
                取消
              </button>
              <button className="primary-button" onClick={saveRoleModal}>
                保存角色
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalState.type === "export" ? (
        <div className="modal-shell">
          <div className="modal-backdrop" onClick={() => setModalState({ type: null })} />
          <div className="modal-card modal-card-narrow">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Export</p>
                <h3>导出评审记录</h3>
              </div>
              <button className="ghost-button small" onClick={() => setModalState({ type: null })}>
                关闭
              </button>
            </div>

            <div className="export-options">
              {[
                {
                  key: "markdown" as const,
                  title: "Markdown",
                  desc: "适合继续整理成 PRD 修订稿或会议纪要。",
                },
                {
                  key: "txt" as const,
                  title: "纯文本",
                  desc: "适合快速留档或复制到其他工具。",
                },
              ].map((option) => (
                <label key={option.key} className={`export-option ${exportType === option.key ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="export-type"
                    checked={exportType === option.key}
                    onChange={() => setExportType(option.key)}
                  />
                  <div>
                    <strong>{option.title}</strong>
                    <p>{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="export-checks">
              <label>
                <input type="checkbox" checked={exportSummary} onChange={() => setExportSummary((v) => !v)} /> 包含自动总结
              </label>
              <label>
                <input type="checkbox" checked={exportRoles} onChange={() => setExportRoles((v) => !v)} /> 包含参与角色
              </label>
            </div>

            <div className="sticky-actions">
              <button className="ghost-button" onClick={() => setModalState({ type: null })}>
                取消
              </button>
              <button className="primary-button" onClick={handleExport}>
                开始导出
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RoleCard({
  role,
  onToggle,
  onEdit,
}: {
  role: Role;
  onToggle: () => void;
  onEdit: () => void;
}) {
  return (
    <article className={`role-card ${role.selected ? "selected" : ""}`}>
      <div>
        <h4>{role.name}</h4>
        <div className="tag-row">
          <span className="tag">{role.niche}</span>
          <span className="tag">{role.stance}</span>
        </div>
      </div>
      <p className="role-meta">
        核心利益：{role.interest}
        <br />
        关注重点：{role.focus.join(" / ")}
        <br />
        风格：{role.style}
      </p>
      <div className="composer-actions">
        <button className="ghost-button small" onClick={onToggle}>
          {role.selected ? "已加入本次评审" : "加入本次评审"}
        </button>
        <button className="ghost-button small" onClick={onEdit}>
          编辑
        </button>
      </div>
    </article>
  );
}

function PreferenceGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="preference-block">
      <span>{title}</span>
      <div className="chip-group selectable">
        {options.map((option) => (
          <button
            key={option}
            className={`pref-chip ${value === option ? "active" : ""}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryBox({ summary }: { summary: Summary }) {
  return (
    <>
      <h5>主要共识</h5>
      <p>{summary.consensus}</p>
      <h5>主要分歧</h5>
      <p>{summary.disagreement}</p>
      <h5>关键风险</h5>
      <p>{summary.risks}</p>
      <h5>建议下一步</h5>
      <p>{summary.next}</p>
    </>
  );
}
