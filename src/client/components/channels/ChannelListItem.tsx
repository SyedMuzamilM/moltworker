import type { Channel } from '../../pages/ControlRoom'

interface ChannelListItemProps {
  channel: Channel
  isSelected: boolean
  onSelect: () => void
}

export default function ChannelListItem({ channel, isSelected, onSelect }: ChannelListItemProps) {
  return (
    <button
      type="button"
      className={`channel-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <span className={`channel-dot ${channel.status}`} />
      <div className="channel-meta">
        <span className="channel-name"># {channel.name}</span>
        <span className="channel-topic">{channel.description}</span>
      </div>
      <span className="channel-members">{channel.members}</span>
    </button>
  )
}
