export const STORY_SCENE_IDS = ['start', 'watch', 'approve', 'handoff'];

export const storyContent = {
  en: {
    intro: {
      eyebrow: 'ONE SESSION · EVERY SCREEN',
      title: 'Start here. Approve anywhere. Continue everywhere.',
      summary: 'A four-step demonstration of starting, watching, approving and continuing one Paws session across PC Web and App.'
    },
    scenes: [
      { id: 'start', number: '01', title: 'Start remotely from the browser', body: 'Choose an online machine, project and agent, then send the first task.' },
      { id: 'watch', number: '02', title: 'See every step', body: 'Follow skills, tool calls and subagents instead of treating the run as a black box.' },
      { id: 'approve', number: '03', title: 'Approve from your phone', body: 'Review a blocked command and decide without returning to the computer.' },
      { id: 'handoff', number: '04', title: 'Continue the same session', body: 'Move between App and PC Web without copying the conversation.' }
    ],
    consoles: {
      machine: 'Mac mini',
      project: 'paws',
      agent: 'Codex',
      sessionId: 'paws/refactor-auth',
      online: 'Online',
      running: 'Running',
      approvalPending: 'Approval required',
      complete: 'Complete',
      approveOnce: 'Approve once',
      allowSession: 'Allow for this session',
      reject: 'Reject',
      demoDisclaimer: 'Product demonstration — controls are not connected to an account.',
      pcSummary: {
        start: 'PC Web session composer with an online Mac mini, paws project and Codex selected.',
        watch: 'PC Web session showing skills, tools and subagents in progress.',
        approve: 'PC Web session paused while a command waits for approval.',
        handoff: 'PC Web showing the same session that is open in the App.'
      }
    },
    crewLabel: 'Paws Crew',
    crew: [
      { id: 'astro', role: 'REMOTE LAUNCH', title: 'Astronaut', body: 'Start work across distance.', alt: 'Paws astronaut mascot' },
      { id: 'explorer', role: 'ANYWHERE', title: 'Explorer', body: 'Continue after leaving the desk.', alt: 'Paws explorer mascot' },
      { id: 'hoodie', role: 'LIVE CODE', title: 'Developer', body: 'Follow agents and tool activity.', alt: 'Paws developer mascot' },
      { id: 'ninja', role: 'PERMISSION', title: 'Ninja', body: 'Make focused security decisions.', alt: 'Paws ninja mascot' },
      { id: 'scientist', role: 'ENCRYPTED SYNC', title: 'Scientist', body: 'Explain relay and sync architecture.', alt: 'Paws scientist mascot' },
      { id: 'barista', role: 'PC WEB', title: 'Barista', body: 'Settle into deep browser work.', alt: 'Paws barista mascot' },
      { id: 'florist', role: 'OPEN SOURCE', title: 'Florist', body: 'Grow open-source and self-hosted workflows.', alt: 'Paws florist mascot' }
    ],
    proof: [
      { id: 'remote-start', status: 'Mac mini · Online', title: 'Start remotely', body: 'Choose a machine, directory and agent from the browser.', evidence: 'Mac mini → paws → Codex' },
      { id: 'live-process', status: 'Agent · Running', title: 'See the process', body: 'Skills, tools and subagents remain visible.', evidence: 'Skill ✓ · Tool ◐ · Subagent ◐' },
      { id: 'approval', status: 'Approval required', title: 'Decide remotely', body: 'Approve or reject blocked operations from App or Web.', evidence: 'npm run build' },
      { id: 'session-overview', status: '5 states', title: 'Manage every session', body: 'Scan running, pending, idle, complete and failed work.', evidence: 'Running · Pending · Idle · Complete · Failed' },
      { id: 'encrypted-sync', status: 'Relay connected', title: 'Keep sync controlled', body: 'Connect clients to the daemon through the Paws relay.', evidence: 'App/Web → Relay → Daemon' },
      { id: 'open-source', status: 'Source available', title: 'Host it your way', body: 'Inspect the code and deploy the Paws services yourself.', evidence: 'GitHub · Self-hosting guide' }
    ],
    comparisonLabels: { topic: 'When you need to…', local: 'Local terminal only' },
    comparison: [
      { id: 'away', topic: 'Away from the computer', local: 'Return to the terminal or configure remote access', paws: 'View the same session in App or PC Web' },
      { id: 'approval', topic: 'Permission requests', local: 'Handle them at the terminal', paws: 'Approve or reject remotely' },
      { id: 'overview', topic: 'Multiple agents', local: 'Spread across terminal windows', paws: 'One cross-device session overview' },
      { id: 'start', topic: 'Starting work', local: 'Operate the target computer', paws: 'Start on an online machine remotely' },
      { id: 'hosting', topic: 'Service deployment', local: 'Depends on the individual tool', paws: 'Open-source, self-hostable Paws services' }
    ],
    architecture: {
      nodes: {
        clients: 'App / PC Web',
        relay: 'Encrypted Paws relay',
        daemon: 'Paws daemon on your computer',
        agents: 'Codex / Claude Code / Gemini / OpenCode / OpenClaw / ACP'
      },
      requirement: 'Remote start requires the target machine to be online.',
      note: 'The Paws Web and sync services can run on Aliyun for a more controllable domestic access path. Underlying agent login and API connectivity still depend on each provider.'
    },
    roadmap: {
      shipped: [
        { id: 'app', title: 'Mobile App' },
        { id: 'pc-web', title: 'PC Web' },
        { id: 'daemon', title: 'CLI / daemon' },
        { id: 'agents', title: 'Supported Agents' },
        { id: 'approval', title: 'Remote approval' },
        { id: 'handoff', title: 'Cross-device sessions' },
        { id: 'self-hosting', title: 'Self-hosting' }
      ],
      planned: [
        { id: 'browser-first', title: 'Browser-first improvements' },
        { id: 'chrome-extension', title: 'Chrome extension update' },
        { id: 'mascot-motion', title: 'Richer mascot motion assets' }
      ]
    }
  },
  zh: {
    intro: {
      eyebrow: '一个会话 · 所有屏幕',
      title: '在这里启动，随时审批，到处继续。',
      summary: '通过四幕演示，在 PC Web 与 App 之间启动、查看、审批并继续同一个 Paws 会话。'
    },
    scenes: [
      { id: 'start', number: '01', title: '浏览器里，远程开工', body: '选择在线机器、项目目录和 Agent，然后发送第一条任务。' },
      { id: 'watch', number: '02', title: '每一步，都看得见', body: 'Skill、工具调用和子 Agent 进度直接呈现在会话中。' },
      { id: 'approve', number: '03', title: '关键操作，手机拍板', body: '任务被权限请求阻塞时，不必赶回电脑。' },
      { id: 'handoff', number: '04', title: '同一个会话，跨端接力', body: 'App 与 PC Web 共享同一条消息时间线。' }
    ],
    consoles: {
      machine: 'Mac mini',
      project: 'paws',
      agent: 'Codex',
      sessionId: 'paws/refactor-auth',
      online: '在线',
      running: '运行中',
      approvalPending: '等待批准',
      complete: '已完成',
      approveOnce: '批准一次',
      allowSession: '本次会话允许',
      reject: '拒绝',
      demoDisclaimer: '产品演示界面，不连接真实账号。',
      pcSummary: {
        start: 'PC Web 新建会话，已选择在线 Mac mini、paws 项目和 Codex。',
        watch: 'PC Web 会话正在展示 Skill、工具和子 Agent 进度。',
        approve: 'PC Web 会话暂停，等待用户批准命令。',
        handoff: 'PC Web 与 App 正在显示同一个会话。'
      }
    },
    crewLabel: 'Paws 角色小队',
    crew: [
      { id: 'astro', role: '远程启动', title: '宇航员', body: '跨越距离，远程开始工作。', alt: 'Paws 宇航员土拨鼠' },
      { id: 'explorer', role: '随处继续', title: '探险家', body: '离开电脑以后继续任务。', alt: 'Paws 探险家土拨鼠' },
      { id: 'hoodie', role: '实时编程', title: '程序员', body: '查看 Agent 与工具活动。', alt: 'Paws 程序员土拨鼠' },
      { id: 'ninja', role: '权限审批', title: '忍者', body: '专注处理安全决策。', alt: 'Paws 忍者土拨鼠' },
      { id: 'scientist', role: '加密同步', title: '科学家', body: '解释中继与同步架构。', alt: 'Paws 科学家土拨鼠' },
      { id: 'barista', role: 'PC WEB', title: '咖啡师', body: '在浏览器中进行深度工作。', alt: 'Paws 咖啡师土拨鼠' },
      { id: 'florist', role: '开源生态', title: '花艺师', body: '发展开源与自托管工作流。', alt: 'Paws 花艺师土拨鼠' }
    ],
    proof: [
      { id: 'remote-start', status: 'Mac mini · 在线', title: '远程启动', body: '在浏览器里选择机器、目录和 Agent。', evidence: 'Mac mini → paws → Codex' },
      { id: 'live-process', status: 'Agent · 运行中', title: '查看执行过程', body: 'Skill、工具和子 Agent 始终可见。', evidence: 'Skill ✓ · 工具 ◐ · 子 Agent ◐' },
      { id: 'approval', status: '等待批准', title: '远程处理权限', body: '从 App 或 Web 批准、拒绝被阻塞的操作。', evidence: 'npm run build' },
      { id: 'session-overview', status: '五种状态', title: '管理全部会话', body: '查看运行中、等待、空闲、完成和失败。', evidence: '运行 · 等待 · 空闲 · 完成 · 失败' },
      { id: 'encrypted-sync', status: '中继已连接', title: '可控的同步链路', body: '客户端通过 Paws 中继连接本机 daemon。', evidence: 'App/Web → 中继 → daemon' },
      { id: 'open-source', status: '源码开放', title: '按你的方式部署', body: '检查源码并自行部署 Paws 服务。', evidence: 'GitHub · 自托管文档' }
    ],
    comparisonLabels: { topic: '当你需要……', local: '仅使用本机终端' },
    comparison: [
      { id: 'away', topic: '离开电脑后查看', local: '返回终端或自行配置远程方案', paws: '在 App 或 PC Web 查看同一会话' },
      { id: 'approval', topic: '权限请求', local: '在终端前处理', paws: '远程批准或拒绝' },
      { id: 'overview', topic: '多个 Agent', local: '分散在不同终端窗口', paws: '一个跨设备会话总览' },
      { id: 'start', topic: '启动新任务', local: '操作目标电脑', paws: '在在线机器上远程启动' },
      { id: 'hosting', topic: '服务部署', local: '取决于单个工具', paws: 'Paws 服务开源并可自托管' }
    ],
    architecture: {
      nodes: {
        clients: 'App / PC Web',
        relay: 'Paws 加密同步服务',
        daemon: '用户电脑上的 Paws daemon',
        agents: 'Codex / Claude Code / Gemini / OpenCode / OpenClaw / ACP'
      },
      requirement: '远程启动要求目标机器在线。',
      note: 'Paws 的 Web 与同步服务可部署在阿里云，国内访问路径更可控；底层 Agent 的账号登录与 API 网络要求仍取决于对应服务提供商。'
    },
    roadmap: {
      shipped: [
        { id: 'app', title: '移动 App' },
        { id: 'pc-web', title: 'PC Web' },
        { id: 'daemon', title: 'CLI / daemon' },
        { id: 'agents', title: '支持的 Agents' },
        { id: 'approval', title: '远程审批' },
        { id: 'handoff', title: '跨端会话' },
        { id: 'self-hosting', title: '自托管' }
      ],
      planned: [
        { id: 'browser-first', title: '浏览器优先增强' },
        { id: 'chrome-extension', title: 'Chrome 插件更新' },
        { id: 'mascot-motion', title: '更丰富的角色动作资产' }
      ]
    }
  }
};

export function getStoryContent(language) {
  return storyContent[language] ?? storyContent.en;
}
