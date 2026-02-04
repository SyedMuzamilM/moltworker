import type { Activity, Agent } from '../../pages/ControlRoom'

interface ActivityFeedProps {
  activities: Activity[]
  agents: Agent[]
}

const typeLabels: Record<Activity['type'], string> = {
  mention: 'Mention',
  comment: 'Comment',
  assignment: 'Assignment',
  document: 'Document',
}

export default function ActivityFeed({ activities, agents }: ActivityFeedProps) {
  return (
    <div className="activity-feed">
      {activities.map((activity, index) => {
        const agent = agents.find(item => item.id === activity.agentId)
        return (
          <div
            key={activity.id}
            className="activity-card"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="activity-header">
              <span className="activity-type">{typeLabels[activity.type]}</span>
              <span className="activity-time">{activity.time}</span>
            </div>
            <h3>{activity.title}</h3>
            <p>{activity.detail}</p>
            <div className="activity-footer">
              <span className={`status-dot ${agent?.status ?? 'idle'}`} />
              <span>{agent?.name ?? 'Unknown'}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
