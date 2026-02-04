import type { Agent, Task } from '../../pages/ControlRoom'

interface TaskCardProps {
  task: Task
  agents: Agent[]
  isSelected: boolean
  onSelect: () => void
  animationDelay: string
}

export default function TaskCard({ task, agents, isSelected, onSelect, animationDelay }: TaskCardProps) {
  const assignees = task.assignees
    .map(assignee => agents.find(agent => agent.id === assignee)?.name ?? assignee)
    .slice(0, 2)

  return (
    <button
      type="button"
      className={`task-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ animationDelay }}
    >
      <div className="task-card-header">
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
        <span className="task-due">{task.due}</span>
      </div>
      <h4>{task.title}</h4>
      <div className="task-tags">
        {task.tags.map(tag => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="task-assignees">
        {assignees.map(name => (
          <span key={name}>{name}</span>
        ))}
      </div>
    </button>
  )
}
