import type { Agent } from '../../pages/ControlRoom'

interface AgentListItemProps {
  agent: Agent
  isSelected: boolean
  onSelect: () => void
}

export default function AgentListItem({ agent, isSelected, onSelect }: AgentListItemProps) {
  return (
    <button
      type="button"
      className={`agent-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <span className={`status-dot ${agent.status}`} />
      <div className="agent-meta">
        <span className="agent-name">{agent.name}</span>
        <span className="agent-role">{agent.role}</span>
      </div>
      <span className="agent-location">{agent.location}</span>
    </button>
  )
}
