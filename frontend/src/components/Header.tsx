import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="p-4 bg-gray-800 text-white flex gap-4">
      <Link to="/">Events</Link>
      <Link to="/calendar">Calendar</Link>
      <Link to="/new">Create Event</Link>
    </header>
  )
}
