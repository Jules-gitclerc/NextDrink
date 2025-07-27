import type { Event } from "../hooks/useEvents"
import { format } from 'date-fns'

interface Props {
  event: Event
}

export default function EventCard({ event }: Props) {
  return (
    <div className="border rounded p-4 shadow-sm space-y-2">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-sm text-gray-500">{format(new Date(event.date_time), 'PPpp')}</p>
      <p>{event.location_name}</p>
    </div>
  )
}
