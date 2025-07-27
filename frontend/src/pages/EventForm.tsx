import { useState } from 'react'
import { supabase } from '../hooks/useSupabase'

export default function EventForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('events').insert({
      title,
      description,
      date_time: date,
      location_name: location,
    })
    if (error) setMessage(error.message)
    else setMessage('Event created')
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="datetime-local"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
        Save
      </button>
      {message && <p>{message}</p>}
    </form>
  )
}
