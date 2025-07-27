import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { parse, startOfWeek, getDay, format } from 'date-fns'
import { useEvents } from '../hooks/useEvents'

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
})

export default function CalendarPage() {
  const { events } = useEvents()

  const calendarEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    start: new Date(e.date_time),
    end: new Date(new Date(e.date_time).getTime() + 2 * 60 * 60 * 1000),
  }))

  return (
    <div className="p-4">
      <Calendar localizer={localizer} events={calendarEvents} style={{ height: 500 }} />
    </div>
  )
}
