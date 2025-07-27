import { useEffect, useState } from 'react'
import { supabase } from './useSupabase'

export interface Event {
  id: number
  title: string
  description: string
  date_time: string
  location_name: string
  location_lat: number | null
  location_lng: number | null
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    supabase.from('events').select('*').then(({ data }) => {
      if (data) setEvents(data)
    })
  }, [])

  return { events }
}
