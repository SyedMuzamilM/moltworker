import TaskColumn from './TaskColumn'
import type { Agent, Task, TaskStatus } from '../../pages/ControlRoom'

interface TaskBoardProps {
  tasks: Task[]
  agents: Agent[]
  selectedTaskId: string
  onSelectTask: (id: string) => void
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'inbox', title: 'Inbox' },
  { status: 'assigned', title: 'Assigned' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'review', title: 'Review' },
  { status: 'done', title: 'Done' },
]

export default function TaskBoard({ tasks, agents, selectedTaskId, onSelectTask }: TaskBoardProps) {
  return (
    <div className="task-board">
      {columns.map(column => (
        <TaskColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={tasks.filter(task => task.status === column.status)}
          agents={agents}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
        />
      ))}
    </div>
  )
}
