'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

export function useNotifications(user: User | null) {
  useEffect(() => {
    if (!user) return

    // Écouter les nouveaux événements
    const eventsChannel = supabase
      .channel('new-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
        },
        async (payload) => {
          // Ne pas notifier si c'est l'utilisateur qui a créé l'événement
          if (payload.new.creator_id === user.id) return

          // Récupérer les détails du créateur
          const { data: creator } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.creator_id)
            .single()

          const creatorName = creator?.name || 'Un collègue'
          
          toast.info(
            `🍻 ${creatorName} a organisé un nouvel after-work : "${payload.new.title}"`,
            {
              duration: 8000,
              action: {
                label: 'Voir',
                onClick: () => {
                  window.location.href = '/'
                }
              }
            }
          )
        }
      )
      .subscribe()

    // Écouter les nouvelles réponses aux événements créés par l'utilisateur
    const responsesChannel = supabase
      .channel('event-responses')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_responses',
        },
        async (payload) => {
          // Vérifier si c'est une réponse à un événement créé par l'utilisateur
          const { data: event } = await supabase
            .from('events')
            .select('title, creator_id')
            .eq('id', payload.new.event_id)
            .single()

          if (!event || event.creator_id !== user.id) return
          if (payload.new.user_id === user.id) return // Ne pas notifier ses propres réponses

          // Récupérer les détails du participant
          const { data: participant } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.user_id)
            .single()

          const participantName = participant?.name || 'Quelqu\'un'
          const responseText: Record<string, string> = {
            yes: 'participera',
            no: 'ne participera pas',
            maybe: 'est peut-être intéressé(e)'
          }
          const finalResponseText = responseText[payload.new.response] || 'a répondu'

          toast.success(
            `✅ ${participantName} ${finalResponseText} à votre événement "${event.title}"`,
            {
              duration: 5000,
            }
          )
        }
      )
      .subscribe()

    return () => {
      eventsChannel.unsubscribe()
      responsesChannel.unsubscribe()
    }
  }, [user])
}
