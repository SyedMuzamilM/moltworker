import type { Message } from '../../pages/ControlRoom'

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`message-item ${message.direction}`}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="message-meta">
            <span className="message-author">{message.authorName}</span>
            <span className="message-time">{message.time}</span>
          </div>
          <p className="message-content">{message.content}</p>
        </div>
      ))}
    </div>
  )
}
