import { useState } from 'react'

interface MessageComposerProps {
  onSend: (message: string) => void
}

export default function MessageComposer({ onSend }: MessageComposerProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <div className="composer-input">
        <textarea
          rows={2}
          placeholder="Message the agent with context, constraints, and expected output"
          value={value}
          onChange={event => setValue(event.target.value)}
        />
        <div className="composer-actions">
          <button type="button" className="ghost-btn">
            Attach
          </button>
          <button type="submit" className="primary-btn">
            Send
          </button>
        </div>
      </div>
    </form>
  )
}
