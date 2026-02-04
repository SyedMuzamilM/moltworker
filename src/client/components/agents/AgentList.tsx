import AgentListItem from './AgentListItem'
import type { Agent } from '../../pages/ControlRoom'

interface AgentListProps {
  agents: Agent[]
  selectedAgentId: string
  onSelect: (id: string) => void
}

export default function AgentList({ agents, selectedAgentId, onSelect }: AgentListProps) {
  return (
    <div className="agent-list">
      {agents.map(agent => (
        <AgentListItem
          key={agent.id}
          agent={agent}
          isSelected={agent.id === selectedAgentId}
          onSelect={() => onSelect(agent.id)}
        />
      ))}
    </div>
  )
}
