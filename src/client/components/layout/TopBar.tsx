import type { Agent, Channel, ViewId } from '../../pages/ControlRoom'

interface TopBarProps {
  activeView: ViewId
  selectedAgent: Agent
  selectedChannel: Channel
  chatScope: 'agent' | 'channel'
}

const viewTitles: Record<ViewId, string> = {
  messages: 'Agent Messages',
  activity: 'Activity Feed',
  tasks: 'Task Board',
  gateway: 'Gateway Controls',
}

export default function TopBar({ activeView, selectedAgent, selectedChannel, chatScope }: TopBarProps) {
  const title =
    activeView === 'messages'
      ? chatScope === 'agent'
        ? selectedAgent.name
        : `# ${selectedChannel.name}`
      : viewTitles[activeView]
  const subtitle =
    activeView === 'messages'
      ? chatScope === 'agent'
        ? selectedAgent.role
        : selectedChannel.description
      : ''

  return (
    <div className="topbar">
      <div className="topbar-title">
        <p className="topbar-label">{viewTitles[activeView]}</p>
        <h1>{title}</h1>
        {activeView === 'messages' && <span className="topbar-subtitle">{subtitle}</span>}
      </div>
      <div className="topbar-actions">
        <div className="search-pill">
          <span className="search-icon" />
          <input type="search" placeholder="Search messages, tasks, files" />
        </div>
        <button className="action-btn" type="button">
          New Task
        </button>
      </div>
    </div>
  )
}
