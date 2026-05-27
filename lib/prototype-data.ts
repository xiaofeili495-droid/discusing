export type View = "dashboard" | "create" | "review" | "roles" | "history";
export type StageKey = "opening" | "cross" | "closing";
export type RoleSource = "preset" | "generated";
export type ExportType = "markdown" | "txt";

export type FileItem = {
  name: string;
  type: string;
  label: string;
  status: string;
};

export type Role = {
  id: string;
  name: string;
  niche: string;
  interest: string;
  focus: string[];
  style: string;
  stance: string;
  source: string;
  selected: boolean;
};

export type Message = {
  type: "system" | "user" | "role" | "stage";
  speaker: string;
  label: string;
  content: string;
};

export type Summary = {
  consensus: string;
  disagreement: string;
  risks: string;
  next: string;
};

export type TranscriptSegment = {
  speaker: string;
  summary: string;
};

export type DashboardRoom = {
  title: string;
  topic: string;
  update: string;
  roles: number;
  tag: string;
};

export type ExportLog = [string, string, string];

export type RoomPayload = {
  roomTitle: string;
  roomTopic: string;
  round: number;
  roundStage: StageKey;
  files: FileItem[];
  transcriptSegments: TranscriptSegment[];
  speakers: string[];
  presetRoles: Role[];
  generatedRoles: Role[];
  messages: Message[];
  summary: Summary;
};

export type DashboardPayload = {
  recentRooms: DashboardRoom[];
  recentExports: ExportLog[];
};

export type ReviewRoundRequest = {
  roomTitle: string;
  roomTopic: string;
  stage: StageKey;
  round: number;
  userMessage: string;
  roles: Role[];
  messages: Message[];
  summary: Summary;
};

export type ReviewRoundResponse = {
  nextStage: StageKey;
  nextRound: number;
  appendedMessages: Message[];
  summary: Summary;
};

export const stageConfig = [
  { key: "opening" as const, label: "首轮评审", helper: "先让各角色从自身生态位给出第一反应" },
  { key: "cross" as const, label: "交叉追问", helper: "围绕分歧点做补充、挑战与澄清" },
  { key: "closing" as const, label: "收敛总结", helper: "系统提炼共识、分歧、风险与下一步" },
];

export const roleReplies: Record<string, string> = {
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

export function guessFileLabel(name: string) {
  if (/prd/i.test(name)) return "PRD";
  if (/会议|纪要|meeting/i.test(name)) return "会议记录";
  return "背景";
}

export function getDashboardPayload(): DashboardPayload {
  return {
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
  };
}

export function getRoomPayload(): RoomPayload {
  return {
    roomTitle: "会员权益升级需求评审",
    roomTopic: "会员中心新增分层权益体系是否值得上线",
    round: 1,
    roundStage: "opening",
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
    messages: [
      {
        type: "system",
        speaker: "系统",
        label: "引导",
        content:
          "已载入本次评审的 PRD、背景材料和会议记录。你可以先抛出一个问题，系统会按首轮评审、交叉追问、收敛总结三个阶段推进。",
      },
    ],
    summary: {
      consensus: "会员权益升级方向具备增长潜力，但当前版本更适合验证核心权益是否真的被用户感知。",
      disagreement: "运营更倾向尽快上线试点，研发和客服担心规则复杂后带来的交付与解释成本。",
      risks: "若权益层级与领取规则过多，用户理解成本会迅速上升，且客服压力可能在首月明显增加。",
      next: "建议先用单一核心权益做最小闭环，限定一档试点人群，并在上线前补齐 FAQ 与埋点方案。",
    },
  };
}

export function buildGeneratedRoles(seed = Date.now().toString()): Role[] {
  return [
    {
      id: `gen-${seed}`,
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
      id: `gen-ops-${seed}`,
      name: "运营负责人-林琳",
      niche: "增长推进者",
      interest: "保留一个强感知权益，确保试点能看到转化效果",
      focus: ["活动节奏", "权益感知度", "转化提升"],
      style: "结论先行，偏强推动",
      stance: "支持",
      source: "来自 0318 会议纪要",
      selected: false,
    },
  ];
}

export function buildExportContent(input: {
  type: ExportType;
  roomTitle: string;
  roomTopic: string;
  roles: Role[];
  messages: Message[];
  summary: Summary;
  includeRoles: boolean;
  includeSummary: boolean;
}) {
  const lines = [
    input.type === "markdown" ? `# ${input.roomTitle}` : input.roomTitle,
    "",
    `主题：${input.roomTopic}`,
  ];

  if (input.includeRoles) {
    lines.push("", input.type === "markdown" ? "## 参与角色" : "参与角色");
    lines.push(...input.roles.map((role) => `- ${role.name}：${role.niche}`));
  }

  lines.push("", input.type === "markdown" ? "## 会话记录" : "会话记录");
  lines.push(...input.messages.map((message) => `- ${message.speaker}（${message.label}）：${message.content}`));

  if (input.includeSummary) {
    lines.push("", input.type === "markdown" ? "## 自动总结" : "自动总结");
    lines.push(`- 主要共识：${input.summary.consensus}`);
    lines.push(`- 主要分歧：${input.summary.disagreement}`);
    lines.push(`- 关键风险：${input.summary.risks}`);
    lines.push(`- 建议下一步：${input.summary.next}`);
  }

  return lines.join("\n");
}

export function buildNextSummary(current: Summary, userInput: string): Summary {
  const updated = { ...current };

  if (userInput.includes("支持")) {
    updated.disagreement =
      "运营认为应该尽快试点，而研发与用户视角都要求先简化权益规则并验证用户是否真正在意。";
    updated.next = "建议收敛到单一权益试点，并在 PRD 中补充目标用户、核心指标和 FAQ 口径。";
  } else if (userInput.includes("风险")) {
    updated.risks = "当前最主要的风险集中在规则复杂度、客服解释成本和用户对会员层级的理解门槛。";
  } else if (userInput.includes("目标")) {
    updated.consensus = "讨论逐步收敛到一个前提：本次需求需要先明确是为增长试点还是为长期会员认知服务。";
  }

  return updated;
}

export function buildReviewRoundResponse(input: ReviewRoundRequest): ReviewRoundResponse {
  const stageLabel = stageConfig.find((stage) => stage.key === input.stage)?.label ?? "本轮评审";
  const selectedRoles = input.roles.filter((role) => role.selected);

  const appendedMessages: Message[] = [
    {
      type: "user",
      speaker: "你",
      label: "产品经理",
      content: input.userMessage,
    },
    {
      type: "stage",
      speaker: "系统",
      label: "阶段",
      content: `${stageLabel}开始，角色将按顺序发言。`,
    },
    ...selectedRoles.map((role) => ({
      type: "role" as const,
      speaker: role.name,
      label: role.niche,
      content: roleReplies[role.name] ?? `${role.name} 暂无预设回复。`,
    })),
  ];

  let nextStage: StageKey = input.stage;
  let stageMessage: Message;

  if (input.stage === "opening") {
    nextStage = "cross";
    stageMessage = {
      type: "system",
      speaker: "系统",
      label: "引导",
      content: "首轮评审完成。你可以继续追问分歧点，系统会进入交叉追问阶段。",
    };
  } else if (input.stage === "cross") {
    nextStage = "closing";
    stageMessage = {
      type: "system",
      speaker: "系统",
      label: "引导",
      content: "交叉追问完成。系统已进入收敛总结阶段，建议开始判断是否上线、如何裁剪范围。",
    };
  } else {
    nextStage = "closing";
    stageMessage = {
      type: "system",
      speaker: "系统",
      label: "总结",
      content: "本次评审已形成阶段性结论，可导出记录或继续发起新一轮问题。",
    };
  }

  appendedMessages.push(stageMessage);

  return {
    nextStage,
    nextRound: input.round + 1,
    appendedMessages,
    summary: buildNextSummary(input.summary, input.userMessage),
  };
}
