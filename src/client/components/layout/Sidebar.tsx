import SidebarSection from './SidebarSection'
import AgentList from '../agents/AgentList'
import ChannelList from '../channels/ChannelList'
import type { Agent, Channel, ViewId } from '../../pages/ControlRoom'

interface NavItem {
  id: ViewId
  label: string
}

interface SidebarProps {
  navItems: NavItem[]
  activeNavId: ViewId
  onNavChange: (id: ViewId) => void
  agents: Agent[]
  selectedAgentId: string
  onAgentSelect: (id: string) => void
  channels: Channel[]
  selectedChannelId: string
  onChannelSelect: (id: string) => void
}

export default function Sidebar({
  navItems,
  activeNavId,
  onNavChange,
  agents,
  selectedAgentId,
  onAgentSelect,
  channels,
  selectedChannelId,
  onChannelSelect,
}: SidebarProps) {
  const navIcons: Record<ViewId, string> = {
    messages: 'DM',
    activity: 'AC',
    tasks: 'TB',
    gateway: 'GW',
  }

  return (
    <div className="sidebar-shell">
      <div className="sidebar-rail">
        <div className="rail-logo">MC</div>
        <div className="rail-stack">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`rail-item ${activeNavId === item.id ? 'active' : ''}`}
              onClick={() => onNavChange(item.id)}
            >
              <span>{navIcons[item.id]}</span>
            </button>
          ))}
        </div>
        <div className="rail-footer">
          <button type="button" className="rail-item subtle">
            +
          </button>
          <div className="rail-avatar">SM</div>
        </div>
      </div>

      <div className="sidebar">
        <div className="sidebar-header">
          <div className="workspace-meta">
            <p className="workspace-title">Syed Muzamil</p>
            <p className="workspace-subtitle">Mission Control</p>
          </div>
          <button className="workspace-action" type="button">
            New
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeNavId === item.id ? 'active' : ''}`}
              onClick={() => onNavChange(item.id)}
            >
              <span className="nav-indicator" />
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <SidebarSection title="Agents" subtitle="Team roster">
          <AgentList
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelect={onAgentSelect}
          />
        </SidebarSection>

        <SidebarSection title="Channels" subtitle="Shared streams">
          <ChannelList
            channels={channels}
            selectedChannelId={selectedChannelId}
            onSelect={onChannelSelect}
          />
        </SidebarSection>

        <SidebarSection title="Projects" subtitle="Pinned workspaces">
          <div className="sidebar-pill-list">
            <button className="sidebar-pill" type="button">
              Launch Ops
            </button>
            <button className="sidebar-pill" type="button">
              Growth Lab
            </button>
            <button className="sidebar-pill" type="button">
              Infra Notes
            </button>
          </div>
        </SidebarSection>
      </div>
    </div>
  )
}
