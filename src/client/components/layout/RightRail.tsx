import type { Agent, Channel, Task, ViewId } from '../../pages/ControlRoom'

interface RightRailProps {
  activeView: ViewId
  selectedAgent: Agent
  selectedChannel: Channel
  chatScope: 'agent' | 'channel'
  selectedTask: Task
  tasks: Task[]
}

export default function RightRail({
  activeView,
  selectedAgent,
  selectedChannel,
  chatScope,
  selectedTask,
  tasks,
}: RightRailProps) {
  const tasksInProgress = tasks.filter(task => task.status === 'in_progress').length
  const tasksReview = tasks.filter(task => task.status === 'review').length

  return (
    <div className="right-rail">
      {activeView === 'messages' && chatScope === 'agent' && (
        <div className="rail-card">
          <h2>Agent Profile</h2>
          <div className="rail-agent">
            <div className={`status-dot ${selectedAgent.status}`} />
            <div>
              <p className="rail-agent-name">{selectedAgent.name}</p>
              <p className="rail-agent-role">{selectedAgent.role}</p>
            </div>
          </div>
          <p className="rail-summary">{selectedAgent.summary}</p>
          <div className="rail-stats">
            <div>
              <span className="stat-label">Current Focus</span>
              <span className="stat-value">{selectedAgent.location}</span>
            </div>
            <div>
              <span className="stat-label">Priority Queue</span>
              <span className="stat-value">{tasksInProgress} active</span>
            </div>
          </div>
        </div>
      )}

      {activeView === 'messages' && chatScope === 'channel' && (
        <div className="rail-card">
          <h2>Channel Brief</h2>
          <p className="rail-task-title"># {selectedChannel.name}</p>
          <p className="rail-summary">{selectedChannel.description}</p>
          <div className="rail-stats">
            <div>
              <span className="stat-label">Members</span>
              <span className="stat-value">{selectedChannel.members}</span>
            </div>
            <div>
              <span className="stat-label">Focus</span>
              <span className="stat-value">Shared context</span>
            </div>
          </div>
        </div>
      )}

      {activeView === 'tasks' && (
        <div className="rail-card">
          <h2>Task Snapshot</h2>
          <p className="rail-task-title">{selectedTask.title}</p>
          <div className="rail-task-meta">
            <span className="task-pill">{selectedTask.priority}</span>
            <span className="task-pill">Due {selectedTask.due}</span>
          </div>
          <p className="rail-summary">Tags: {selectedTask.tags.join(', ')}</p>
          <div className="rail-stats">
            <div>
              <span className="stat-label">In Progress</span>
              <span className="stat-value">{tasksInProgress}</span>
            </div>
            <div>
              <span className="stat-label">Needs Review</span>
              <span className="stat-value">{tasksReview}</span>
            </div>
          </div>
        </div>
      )}

      {activeView === 'activity' && (
        <div className="rail-card">
          <h2>Focus Window</h2>
          <p className="rail-summary">
            The feed is filtered to mentions, task updates, and document drops from the past
            four hours.
          </p>
          <div className="rail-stats">
            <div>
              <span className="stat-label">Mentions</span>
              <span className="stat-value">4</span>
            </div>
            <div>
              <span className="stat-label">Documents</span>
              <span className="stat-value">2</span>
            </div>
          </div>
        </div>
      )}

      {activeView === 'gateway' && (
        <div className="rail-card">
          <h2>Gateway Health</h2>
          <div className="rail-health">
            <div className="health-row">
              <span className="health-label">Sandbox</span>
              <span className="health-status online">Operational</span>
            </div>
            <div className="health-row">
              <span className="health-label">Pairings</span>
              <span className="health-status warning">3 pending</span>
            </div>
            <div className="health-row">
              <span className="health-label">Backups</span>
              <span className="health-status online">Last sync 2h ago</span>
            </div>
          </div>
        </div>
      )}

      <div className="rail-card">
        <h2>Quick Actions</h2>
        <div className="rail-actions">
          <button type="button">Assign Task</button>
          <button type="button">Start Standup</button>
          <button type="button">Send Broadcast</button>
        </div>
      </div>
    </div>
  )
}
