export const content = {
  en: {
    meta: {
      title: 'Paws — Control coding agents from anywhere',
      description: 'Start, attach and control AI coding agents running on your computer from your phone.'
    },
    nav: {
      product: 'Product',
      how: 'How it works',
      openSource: 'Open source',
      docs: 'Docs',
      getPaws: 'Get Paws',
      appPc: 'App + PC',
      architecture: 'Architecture'
    },
    sectionLabels: { capabilities: 'PAWS / CAPABILITIES' },
    hero: {
      eyebrow: 'OPEN SOURCE · RUNS ON YOUR HARDWARE',
      title: 'Your coding agents. Within reach.',
      titleLines: ['Your coding agents.', 'Within reach.'],
      body: 'Start, steer and approve AI coding sessions on your computer — securely from your phone.',
      primary: 'Get started',
      secondary: 'View on GitHub'
    },
    terminal: {
      title: 'paws — live session',
      installLabel: 'Install and start Paws',
      lines: [
        '$ paws',
        '→ relay started · local machine',
        '✔ phone paired',
        '◐ agent · refactor-auth',
        '  edit src/auth/session.ts (+42 −8)',
        '✔ waiting for approval on your phone…'
      ]
    },
    agents: ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'OpenClaw', 'ACP Agents'],
    steps: [
      { title: 'Install Paws', body: 'Install the CLI on the computer where your coding agent runs.' },
      { title: 'Pair your device', body: 'Scan once to connect your phone or web client to the encrypted account.' },
      { title: 'Control the session', body: 'Start or attach an agent session, then steer it and handle permissions remotely.' }
    ],
    features: [
      { title: 'Remote sessions', body: 'Start, attach and follow coding-agent sessions away from your desk.' },
      { title: 'Encrypted sync', body: 'Session data is encrypted before it reaches the relay.' },
      { title: 'Permission handling', body: 'Review agent permission prompts from your paired device.' },
      { title: 'Open-source hosting', body: 'Inspect the code and run the Paws services on infrastructure you control.' }
    ],
    openSource: {
      eyebrow: 'OPEN BY DESIGN',
      title: 'Your machine stays the source of truth.',
      body: 'Paws connects your devices to the agents already running on your computer. Self-host the relay when you need full infrastructure control.',
      topology: ['Phone / Web', 'Encrypted relay', 'Paws CLI', 'Coding agent'],
      actions: { github: 'View on GitHub', selfHosting: 'Self-hosting guide' }
    },
    finalCta: { title: 'Take your agents with you.', body: 'Install Paws, pair your device and start with the guide.', action: 'Read the quick start' },
    footer: { privacy: 'Privacy', docs: 'Documentation', github: 'GitHub', englishDocs: 'English docs', chineseDocs: '中文文档' },
    labels: {
      language: 'Switch to Chinese', languageDestination: '中文', themeLight: 'Switch to light theme', themeDark: 'Switch to dark theme',
      menuOpen: 'Open navigation', menuClose: 'Close navigation', home: 'Paws home',
      primaryNavigation: 'Primary navigation',
      pauseAgents: 'Pause supported-agent animation', resumeAgents: 'Resume supported-agent animation',
      copy: 'Copy install command', copied: 'Install command copied', copyFailed: 'Could not copy; select the command manually',
      online: 'Online', running: 'Running', approvalPending: 'Approval required', complete: 'Complete',
      planned: 'Planned', shipped: 'Available now', currentSession: 'Current session',
      demoDisclaimer: 'Product demonstration — controls are not connected to an account.',
      agentMarquee: 'Supported coding agents'
    }
  },
  zh: {
    meta: {
      title: 'Paws — 随时控制电脑上的编程智能体',
      description: '通过手机启动、接入和控制电脑上运行的 AI 编程智能体。'
    },
    nav: {
      product: '产品能力',
      how: '工作方式',
      openSource: '开源与自托管',
      docs: '文档',
      getPaws: '开始使用',
      appPc: 'App + PC',
      architecture: '系统架构'
    },
    sectionLabels: { capabilities: 'PAWS / 产品能力' },
    hero: {
      eyebrow: '开源 · 运行在你的电脑上',
      title: '让你的编程智能体，随时触手可及。',
      titleLines: ['让编程智能体，', '随时触手可及。'],
      body: '通过手机安全地启动、引导和审批电脑上的 AI 编程会话。',
      primary: '开始使用',
      secondary: '查看 GitHub'
    },
    terminal: {
      title: 'paws — 实时会话',
      installLabel: '安装并启动 Paws',
      lines: [
        '$ paws',
        '→ 中继已启动 · 本机',
        '✔ 手机已配对',
        '◐ 智能体 · refactor-auth',
        '  编辑 src/auth/session.ts (+42 −8)',
        '✔ 正在等待你在手机上批准…'
      ]
    },
    agents: ['Claude Code', 'Codex', 'Gemini', 'OpenCode', 'OpenClaw', 'ACP Agents'],
    steps: [
      { title: '安装 Paws', body: '在运行编程智能体的电脑上安装 Paws CLI。' },
      { title: '绑定设备', body: '扫码一次，把手机或 Web 客户端接入你的加密账号。' },
      { title: '远程控制会话', body: '启动或接入智能体会话，然后远程发送指令并处理权限请求。' }
    ],
    features: [
      { title: '远程会话', body: '离开电脑后继续启动、接入和跟进编程智能体会话。' },
      { title: '加密同步', body: '会话数据在发送到中继服务之前完成加密。' },
      { title: '远程审批', body: '通过已绑定设备处理智能体的权限请求。' },
      { title: '开源自托管', body: '检查完整源码，并在自己控制的基础设施上运行 Paws 服务。' }
    ],
    openSource: {
      eyebrow: '从设计上保持开放',
      title: '你的电脑始终是会话的源头。',
      body: 'Paws 把你的设备连接到电脑上已经运行的智能体；需要完全掌控基础设施时，可以自行托管中继服务。',
      topology: ['手机 / Web', '加密中继', 'Paws CLI', '编程智能体'],
      actions: { github: '查看 GitHub', selfHosting: '自托管指南' }
    },
    finalCta: { title: '把编程智能体带在身边。', body: '安装 Paws、绑定设备，然后从快速上手开始。', action: '阅读快速上手' },
    footer: { privacy: '隐私', docs: '文档', github: 'GitHub', englishDocs: 'English docs', chineseDocs: '中文文档' },
    labels: {
      language: 'Switch to English', languageDestination: 'EN', themeLight: '切换到亮色主题', themeDark: '切换到深色主题',
      menuOpen: '打开导航', menuClose: '关闭导航', home: 'Paws 首页',
      primaryNavigation: '主导航',
      pauseAgents: '暂停智能体兼容列表动画', resumeAgents: '继续智能体兼容列表动画',
      copy: '复制安装命令', copied: '安装命令已复制', copyFailed: '无法自动复制，请手动选择命令',
      online: '在线', running: '运行中', approvalPending: '等待批准', complete: '已完成',
      planned: '计划中', shipped: '现已支持', currentSession: '当前会话',
      demoDisclaimer: '产品演示界面，不连接真实账号。',
      agentMarquee: '支持的编程智能体'
    }
  }
};
