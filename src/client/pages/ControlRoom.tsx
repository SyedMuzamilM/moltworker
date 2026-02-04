import { useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import RightRail from '../components/layout/RightRail'
import ChatView from '../components/chat/ChatView'
import TaskBoard from '../components/tasks/TaskBoard'
import ActivityFeed from '../components/activity/ActivityFeed'
import GatewayView from '../components/gateway/GatewayView'

export type ViewId = 'messages' | 'activity' | 'tasks' | 'gateway'
export type AgentStatus = 'online' | 'idle' | 'focus' | 'offline' | 'blocked'
export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'
export type ChannelStatus = 'active' | 'steady' | 'quiet'

export type Agent = {
  id: string
  name: string
  role: string
  status: AgentStatus
  summary: string
  location: string
}

export type Task = {
  id: string
  title: string
  status: TaskStatus
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  assignees: string[]
  due: string
  tags: string[]
}

export type Channel = {
  id: string
  name: string
  description: string
  members: number
  status: ChannelStatus
}

export type Message = {
  id: string
  authorId: string
  authorName: string
  content: string
  time: string
  direction: 'inbound' | 'outbound'
}

export type Activity = {
  id: string
  type: 'mention' | 'comment' | 'assignment' | 'document'
  title: string
  detail: string
  time: string
  agentId: string
}

const navItems: { id: ViewId; label: string }[] = [
  { id: 'messages', label: 'Messages' },
  { id: 'activity', label: 'Activity' },
  { id: 'tasks', label: 'Task Board' },
  { id: 'gateway', label: 'Gateway' },
]

const agents: Agent[] = [
  {
    id: 'jarvis',
    name: 'Jarvis',
    role: 'Squad Lead',
    status: 'focus',
    summary: 'Coordinating sprint priorities and delegations.',
    location: 'Mission Control',
  },
  {
    id: 'product-analyst',
    name: 'Shuri',
    role: 'Product Analyst',
    status: 'online',
    summary: 'Testing onboarding flows and edge cases.',
    location: 'Product Lab',
  },
  {
    id: 'customer-researcher',
    name: 'Fury',
    role: 'Customer Researcher',
    status: 'idle',
    summary: 'Mining reviews for recurring pain points.',
    location: 'Research Vault',
  },
  {
    id: 'seo-analyst',
    name: 'Vision',
    role: 'SEO Analyst',
    status: 'online',
    summary: 'Drafting keyword briefs and SERP scans.',
    location: 'Search Deck',
  },
  {
    id: 'content-writer',
    name: 'Loki',
    role: 'Content Writer',
    status: 'focus',
    summary: 'Writing narrative drafts with conversion hooks.',
    location: 'Drafting Bay',
  },
  {
    id: 'social-media-manager',
    name: 'Quill',
    role: 'Social Media',
    status: 'idle',
    summary: 'Building thread variants for launch.',
    location: 'Social Deck',
  },
  {
    id: 'designer',
    name: 'Wanda',
    role: 'Designer',
    status: 'online',
    summary: 'Refreshing the UI system and layouts.',
    location: 'Design Studio',
  },
  {
    id: 'email-marketing',
    name: 'Pepper',
    role: 'Email Marketing',
    status: 'offline',
    summary: 'Queueing lifecycle sequence improvements.',
    location: 'Lifecycle Wing',
  },
  {
    id: 'developer',
    name: 'Friday',
    role: 'Developer',
    status: 'focus',
    summary: 'Shipping backend updates and review fixes.',
    location: 'Engineering Core',
  },
  {
    id: 'notion-agent',
    name: 'Wong',
    role: 'Documentation',
    status: 'idle',
    summary: 'Curating internal playbooks and summaries.',
    location: 'Knowledge Base',
  },
]

const channels: Channel[] = [
  {
    id: 'general',
    name: 'general',
    description: 'Teamwide updates and shared context.',
    members: 12,
    status: 'active',
  },
  {
    id: 'mission-control',
    name: 'mission-control',
    description: 'Task assignments, priorities, and decisions.',
    members: 8,
    status: 'active',
  },
  {
    id: 'launch-room',
    name: 'launch-room',
    description: 'Launch content drafts and approval flow.',
    members: 6,
    status: 'steady',
  },
  {
    id: 'product-watch',
    name: 'product-watch',
    description: 'QA findings, edge cases, and UX notes.',
    members: 5,
    status: 'steady',
  },
  {
    id: 'heartbeat-log',
    name: 'heartbeat-log',
    description: 'Cron wakeups and heartbeat summaries.',
    members: 4,
    status: 'quiet',
  },
]

const tasks: Task[] = [
  {
    id: 'task-001',
    title: 'Design Slack-like Control UI layout',
    status: 'in_progress',
    priority: 'P0',
    assignees: ['designer', 'developer'],
    due: 'Today',
    tags: ['ui', 'mission-control'],
  },
  {
    id: 'task-002',
    title: 'Draft product risk checklist for onboarding',
    status: 'review',
    priority: 'P1',
    assignees: ['product-analyst'],
    due: 'Tomorrow',
    tags: ['product', 'qa'],
  },
  {
    id: 'task-003',
    title: 'Compile customer feedback on pairing flow',
    status: 'assigned',
    priority: 'P2',
    assignees: ['customer-researcher'],
    due: 'This week',
    tags: ['research'],
  },
  {
    id: 'task-004',
    title: 'Finalize launch thread options',
    status: 'inbox',
    priority: 'P2',
    assignees: ['social-media-manager'],
    due: 'This week',
    tags: ['social'],
  },
  {
    id: 'task-005',
    title: 'SEO brief for multi-agent session docs',
    status: 'in_progress',
    priority: 'P1',
    assignees: ['seo-analyst'],
    due: 'Friday',
    tags: ['seo', 'docs'],
  },
  {
    id: 'task-006',
    title: 'Lifecycle email sequence for new users',
    status: 'assigned',
    priority: 'P2',
    assignees: ['email-marketing'],
    due: 'Next week',
    tags: ['email', 'lifecycle'],
  },
  {
    id: 'task-007',
    title: 'Refactor admin gateway UI components',
    status: 'done',
    priority: 'P3',
    assignees: ['developer'],
    due: 'Yesterday',
    tags: ['gateway'],
  },
]

const activities: Activity[] = [
  {
    id: 'activity-001',
    type: 'mention',
    title: 'Jarvis mentioned you in UI layout task',
    detail: 'Need a final pass on the sidebar hierarchy.',
    time: '10m ago',
    agentId: 'jarvis',
  },
  {
    id: 'activity-002',
    type: 'comment',
    title: 'Shuri added QA notes',
    detail: 'Found a regression in pairing flow when offline.',
    time: '25m ago',
    agentId: 'product-analyst',
  },
  {
    id: 'activity-003',
    type: 'document',
    title: 'Wong published a new playbook',
    detail: 'Agent heartbeat checklist is now updated.',
    time: '1h ago',
    agentId: 'notion-agent',
  },
  {
    id: 'activity-004',
    type: 'assignment',
    title: 'Loki assigned to launch copy',
    detail: 'Review CTA variants and provide feedback.',
    time: '2h ago',
    agentId: 'content-writer',
  },
]

const initialMessages: Record<string, Message[]> = {
  jarvis: [
    {
      id: 'm-001',
      authorId: 'jarvis',
      authorName: 'Jarvis',
      content: 'We need a clean layout plan for the control UI. Focus on clarity, not ornament.',
      time: '09:12',
      direction: 'inbound',
    },
    {
      id: 'm-002',
      authorId: 'you',
      authorName: 'You',
      content: 'Understood. I will propose a Slack-like shell with task board and activity views.',
      time: '09:14',
      direction: 'outbound',
    },
  ],
  'product-analyst': [
    {
      id: 'm-003',
      authorId: 'product-analyst',
      authorName: 'Shuri',
      content: 'I need access to the latest onboarding flow to finish the QA checklist.',
      time: '09:03',
      direction: 'inbound',
    },
  ],
  'customer-researcher': [
    {
      id: 'm-004',
      authorId: 'customer-researcher',
      authorName: 'Fury',
      content: 'Collected ten quotes from user reviews. Ready to summarize when you want.',
      time: '08:42',
      direction: 'inbound',
    },
  ],
  'seo-analyst': [
    {
      id: 'm-005',
      authorId: 'seo-analyst',
      authorName: 'Vision',
      content: 'SERP scan done. I can share keyword clusters for agent sessions.',
      time: '08:15',
      direction: 'inbound',
    },
  ],
  'content-writer': [
    {
      id: 'm-006',
      authorId: 'content-writer',
      authorName: 'Loki',
      content: 'Drafting v1 of the launch copy now. Will send a summary shortly.',
      time: '08:03',
      direction: 'inbound',
    },
  ],
  'social-media-manager': [
    {
      id: 'm-007',
      authorId: 'social-media-manager',
      authorName: 'Quill',
      content: 'Need clarity on the hero message before I lock the thread.',
      time: '07:55',
      direction: 'inbound',
    },
  ],
  designer: [
    {
      id: 'm-008',
      authorId: 'designer',
      authorName: 'Wanda',
      content: 'I can take UI layout once I get the component boundaries.',
      time: '07:49',
      direction: 'inbound',
    },
  ],
  'email-marketing': [
    {
      id: 'm-009',
      authorId: 'email-marketing',
      authorName: 'Pepper',
      content: 'Lifecycle sequence draft is queued. Confirm the product positioning.',
      time: '07:32',
      direction: 'inbound',
    },
  ],
  developer: [
    {
      id: 'm-010',
      authorId: 'developer',
      authorName: 'Friday',
      content: 'Gateway UI will be embedded in the new shell. Let me know theme details.',
      time: '07:18',
      direction: 'inbound',
    },
  ],
  'notion-agent': [
    {
      id: 'm-011',
      authorId: 'notion-agent',
      authorName: 'Wong',
      content: 'Docs are structured. Ready for new templates when you are.',
      time: '07:10',
      direction: 'inbound',
    },
  ],
}

const channelMessages: Record<string, Message[]> = {
  general: [
    {
      id: 'c-001',
      authorId: 'jarvis',
      authorName: 'Jarvis',
      content: 'Daily standup at 18:00. Share blockers before then.',
      time: '08:55',
      direction: 'inbound',
    },
    {
      id: 'c-002',
      authorId: 'wanda',
      authorName: 'Wanda',
      content: 'UI kit refresh ready for review. Dropping previews shortly.',
      time: '09:05',
      direction: 'inbound',
    },
  ],
  'mission-control': [
    {
      id: 'c-003',
      authorId: 'jarvis',
      authorName: 'Jarvis',
      content: 'Focus today: control UI and onboarding QA. Keep notes in task board.',
      time: '09:01',
      direction: 'inbound',
    },
  ],
  'launch-room': [
    {
      id: 'c-004',
      authorId: 'loki',
      authorName: 'Loki',
      content: 'Drafted three hooks for the launch thread. Feedback welcome.',
      time: '08:40',
      direction: 'inbound',
    },
  ],
  'product-watch': [
    {
      id: 'c-005',
      authorId: 'shuri',
      authorName: 'Shuri',
      content: 'Found a conflict in pairing flow when device is offline. Logging repro steps.',
      time: '08:20',
      direction: 'inbound',
    },
  ],
  'heartbeat-log': [
    {
      id: 'c-006',
      authorId: 'system',
      authorName: 'Heartbeat',
      content: '09:00 — All agents checked in. No blockers reported.',
      time: '09:00',
      direction: 'inbound',
    },
  ],
}

export default function ControlRoom() {
  const [activeView, setActiveView] = useState<ViewId>('messages')
  const [selectedAgentId, setSelectedAgentId] = useState('jarvis')
  const [selectedChannelId, setSelectedChannelId] = useState('general')
  const [chatScope, setChatScope] = useState<'agent' | 'channel'>('agent')
  const [selectedTaskId, setSelectedTaskId] = useState('task-001')
  const [messagesByAgent, setMessagesByAgent] = useState(initialMessages)
  const [messagesByChannel, setMessagesByChannel] = useState(channelMessages)

  const selectedAgent = useMemo(
    () => agents.find(agent => agent.id === selectedAgentId) ?? agents[0],
    [selectedAgentId],
  )

  const selectedChannel = useMemo(
    () => channels.find(channel => channel.id === selectedChannelId) ?? channels[0],
    [selectedChannelId],
  )

  const selectedTask = useMemo(
    () => tasks.find(task => task.id === selectedTaskId) ?? tasks[0],
    [selectedTaskId],
  )

  const activeMessages = chatScope === 'agent' ? messagesByAgent : messagesByChannel
  const activeChatId = chatScope === 'agent' ? selectedAgentId : selectedChannelId
  const chatMessages = activeMessages[activeChatId] ?? []

  const handleSend = (content: string) => {
    if (!content.trim()) return
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      authorId: 'you',
      authorName: 'You',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'outbound',
    }

    if (chatScope === 'agent') {
      setMessagesByAgent(prev => ({
        ...prev,
        [selectedAgentId]: [...(prev[selectedAgentId] ?? []), newMessage],
      }))
      return
    }

    setMessagesByChannel(prev => ({
      ...prev,
      [selectedChannelId]: [...(prev[selectedChannelId] ?? []), newMessage],
    }))
  }

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId)
    setChatScope('agent')
    setActiveView('messages')
  }

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId)
    setChatScope('channel')
    setActiveView('messages')
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          navItems={navItems}
          activeNavId={activeView}
          onNavChange={setActiveView}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentSelect={handleAgentSelect}
          channels={channels}
          selectedChannelId={selectedChannelId}
          onChannelSelect={handleChannelSelect}
        />
      }
      topbar={
        <TopBar
          activeView={activeView}
          selectedAgent={selectedAgent}
          selectedChannel={selectedChannel}
          chatScope={chatScope}
        />
      }
      rightRail={
        <RightRail
          activeView={activeView}
          selectedAgent={selectedAgent}
          selectedChannel={selectedChannel}
          chatScope={chatScope}
          selectedTask={selectedTask}
          tasks={tasks}
        />
      }
    >
      {activeView === 'messages' && (
        <ChatView
          agent={chatScope === 'agent' ? selectedAgent : undefined}
          channel={chatScope === 'channel' ? selectedChannel : undefined}
          messages={chatMessages}
          onSend={handleSend}
        />
      )}
      {activeView === 'activity' && <ActivityFeed activities={activities} agents={agents} />}
      {activeView === 'tasks' && (
        <TaskBoard
          tasks={tasks}
          agents={agents}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />
      )}
      {activeView === 'gateway' && <GatewayView />}
    </AppShell>
  )
}
