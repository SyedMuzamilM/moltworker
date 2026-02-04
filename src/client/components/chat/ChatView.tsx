import type { Agent, Channel, Message } from '../../pages/ControlRoom'
import MessageList from './MessageList'
import MessageComposer from './MessageComposer'

interface ChatViewProps {
  agent?: Agent
  channel?: Channel
  messages: Message[]
  onSend: (message: string) => void
}

export default function ChatView({ agent, channel, messages, onSend }: ChatViewProps) {
  const headerTitle = agent ? agent.name : channel ? `# ${channel.name}` : 'Conversation'
  const headerSubtitle = agent ? agent.role : channel?.description ?? ''

  return (
    <div className="chat-view">
      <header className="chat-header">
        <div className="chat-title">
          {agent ? <span className={`status-dot ${agent.status}`} /> : <span className="channel-hash">#</span>}
          <div>
            <p className="chat-agent">{headerTitle}</p>
            <p className="chat-role">{headerSubtitle}</p>
          </div>
        </div>
        <div className="chat-actions">
          <button type="button">Brief</button>
          <button type="button">Delegate</button>
        </div>
      </header>
      <MessageList messages={messages} />
      <MessageComposer onSend={onSend} />
    </div>
  )
}
