import ChannelListItem from './ChannelListItem'
import type { Channel } from '../../pages/ControlRoom'

interface ChannelListProps {
  channels: Channel[]
  selectedChannelId: string
  onSelect: (id: string) => void
}

export default function ChannelList({ channels, selectedChannelId, onSelect }: ChannelListProps) {
  return (
    <div className="channel-list">
      {channels.map(channel => (
        <ChannelListItem
          key={channel.id}
          channel={channel}
          isSelected={channel.id === selectedChannelId}
          onSelect={() => onSelect(channel.id)}
        />
      ))}
    </div>
  )
}
