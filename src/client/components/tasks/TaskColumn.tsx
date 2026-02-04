import TaskCard from './TaskCard'
import type { Agent, Task, TaskStatus } from '../../pages/ControlRoom'

interface TaskColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  agents: Agent[]
  selectedTaskId: string
  onSelectTask: (id: string) => void
}

export default function TaskColumn({
  title,
  status,
  tasks,
  agents,
  selectedTaskId,
  onSelectTask,
}: TaskColumnProps) {
  return (
    <div className="task-column">
      <header className="task-column-header">
        <h3>{title}</h3>
        <span>{tasks.length}</span>
      </header>
      <div className="task-column-body">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            agents={agents}
            isSelected={task.id === selectedTaskId}
            onSelect={() => onSelectTask(task.id)}
            animationDelay={`${index * 70}ms`}
          />
        ))}
        {tasks.length === 0 && <p className="task-empty">No tasks here yet.</p>}
      </div>
      <div className={`task-column-accent ${status}`} />
    </div>
  )
}
