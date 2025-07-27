import EventCard from '../components/EventCard'
import { useEvents } from '../hooks/useEvents'

export default function EventList() {
  const { events } = useEvents()

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      <div className="grid gap-4">
        {events.map(e => <EventCard key={e.id} event={e} />)}
      </div>
    </div>
  )
}
