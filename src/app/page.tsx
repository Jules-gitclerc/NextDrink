'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EventCard from '@/components/EventCard'
import { EventCardSkeleton } from '@/components/EventCardSkeleton'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { PlusIcon, Calendar, Sparkles, TrendingUp, Clock } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  time: string
  location: string
  creator_id: string
  max_participants?: number
  created_at: string
  profiles?: {
    name: string
    avatar_url?: string
  }
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  // Activer les notifications en temps réel
  useNotifications(user)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchEvents()

    // S'abonner aux changements en temps réel
    const eventsSubscription = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchEvents() // Recharger les événements quand il y a un changement
        }
      )
      .subscribe()

    return () => {
      eventsSubscription.unsubscribe()
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) throw error

      setEvents(data || [])
    } catch (error: unknown) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour gérer la suppression d'événement
  const handleEventDeleted = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }

  // Organiser les événements par catégorie
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}`)
    const now = new Date()
    return eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 && eventDate > now
  })

  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}`)
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate >= now && eventDate <= weekFromNow && !upcomingEvents.includes(event)
  })

  const laterEvents = events.filter(event => 
    !upcomingEvents.includes(event) && !thisWeekEvents.includes(event)
  )

  const stats = {
    totalEvents: events.length,
    thisWeek: thisWeekEvents.length,
    upcoming: upcomingEvents.length
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 text-white md:p-12"
      >
        <div className="absolute inset-0 bg-black/10" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-white/10 blur-xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-xl"
        />
        
        <div className="relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-8 w-8 text-yellow-300" />
              <h1 className="text-4xl font-bold md:text-6xl">
                NextDrink
              </h1>
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl opacity-90 max-w-2xl md:text-2xl"
            >
              Organisez et participez aux after-work entre collègues d&apos;ESN.
              <br className="hidden sm:block" />
              Créez des moments de convivialité uniques ! 🍻
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 md:gap-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold md:text-3xl">{stats.totalEvents}</div>
                <div className="text-sm opacity-80 md:text-base">Événements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold md:text-3xl">{stats.thisWeek}</div>
                <div className="text-sm opacity-80 md:text-base">Cette semaine</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold md:text-3xl">{stats.upcoming}</div>
                <div className="text-sm opacity-80 md:text-base">Bientôt</div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              {user ? (
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                >
                  <Link href="/create-event">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Organiser un after-work
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                  >
                    <Link href="/auth?mode=signup">
                      Rejoindre NextDrink
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    asChild 
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Link href="/auth">
                      Se connecter
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Events Section */}
      <section className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Bientôt ({upcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Semaine ({thisWeekEvents.length})
                </TabsTrigger>
                <TabsTrigger value="later" className="text-xs sm:text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Plus tard ({laterEvents.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="space-y-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <EventCardSkeleton />
                      </motion.div>
                    ))}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <EmptyState
                    icon="🔥"
                    title="Aucun événement imminent"
                    description="Les prochains événements apparaissent ici 24h avant."
                    action={user ? {
                      label: "Créer un événement",
                      href: "/create-event"
                    } : {
                      label: "Se connecter",
                      href: "/auth"
                    }}
                  />
                ) : (
                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {upcomingEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <EventCard event={event} user={user} onEventDeleted={handleEventDeleted} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="week" className="space-y-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {[1, 2].map((i) => (
                      <EventCardSkeleton key={i} />
                    ))}
                  </div>
                ) : thisWeekEvents.length === 0 ? (
                  <EmptyState
                    icon="📅"
                    title="Rien cette semaine"
                    description="Organisez un événement pour cette semaine !"
                    action={user ? {
                      label: "Organiser",
                      href: "/create-event"
                    } : {
                      label: "Se connecter",
                      href: "/auth"
                    }}
                  />
                ) : (
                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {thisWeekEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <EventCard event={event} user={user} onEventDeleted={handleEventDeleted} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="later" className="space-y-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {[1, 2].map((i) => (
                      <EventCardSkeleton key={i} />
                    ))}
                  </div>
                ) : laterEvents.length === 0 ? (
                  <EmptyState
                    icon="🚀"
                    title="Rien de prévu plus tard"
                    description="Planifiez des événements pour les semaines à venir."
                    action={user ? {
                      label: "Planifier",
                      href: "/create-event"
                    } : {
                      label: "Se connecter",
                      href: "/auth"
                    }}
                  />
                ) : (
                  <div className="grid gap-6 max-w-4xl mx-auto">
                    {laterEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <EventCard event={event} user={user} onEventDeleted={handleEventDeleted} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>
    </div>
  )
}

// Composant EmptyState
interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action: {
    label: string
    href: string
  }
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-4"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="text-6xl mb-4"
      >
        {icon}
      </motion.div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
        <Link href={action.href}>
          <PlusIcon className="w-4 h-4 mr-2" />
          {action.label}
        </Link>
      </Button>
    </motion.div>
  )
}
