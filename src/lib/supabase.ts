import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description?: string
          date: string
          time: string
          location: string
          creator_id: string
          created_at: string
          max_participants?: number
        }
        Insert: {
          id?: string
          title: string
          description?: string
          date: string
          time: string
          location: string
          creator_id: string
          created_at?: string
          max_participants?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          time?: string
          location?: string
          creator_id?: string
          created_at?: string
          max_participants?: number
        }
      }
      event_responses: {
        Row: {
          id: string
          event_id: string
          user_id: string
          response: 'yes' | 'no' | 'maybe'
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          response: 'yes' | 'no' | 'maybe'
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          response?: 'yes' | 'no' | 'maybe'
          created_at?: string
        }
      }
    }
  }
}
