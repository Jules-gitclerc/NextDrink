'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'
import { CalendarIcon, ClockIcon, MapPinIcon, Share2, CheckCircle, XCircle, HelpCircle, Trash2, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EventCardProps {
  event: {
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
  user: User | null
  onEventDeleted?: (eventId: string) => void
}

interface EventResponse {
  id: string
  user_id: string
  response: 'yes' | 'no' | 'maybe'
  profiles: {
    name: string
    avatar_url?: string
  } | null
}

export default function EventCard({ event, user, onEventDeleted }: EventCardProps) {
  const [responses, setResponses] = useState<EventResponse[]>([])
  const [userResponse, setUserResponse] = useState<'yes' | 'no' | 'maybe' | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchResponses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('event_responses')
        .select(`
          id,
          user_id,
          response,
          profiles (
            name,
            avatar_url
          )
        `)
        .eq('event_id', event.id)

      if (error) throw error

      setResponses((data as unknown as EventResponse[]) || [])

      // Trouver la réponse de l'utilisateur actuel
      if (user) {
        const currentUserResponse = data?.find(r => r.user_id === user.id)
        setUserResponse(currentUserResponse?.response || null)
      }
    } catch (error: unknown) {
      console.error('Error fetching responses:', error)
    }
  }, [event.id, user])

  useEffect(() => {
    fetchResponses()
  }, [fetchResponses])


  const handleResponse = async (response: 'yes' | 'no' | 'maybe') => {
    if (!user) {
      toast.error('Vous devez être connecté pour répondre')
      return
    }

    setLoading(true)

    try {
      // Utiliser upsert avec la configuration correcte
      const { error } = await supabase
        .from('event_responses')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          response: response
        }, {
          onConflict: 'event_id,user_id'
        })

      if (error) throw error

      setUserResponse(response)
      await fetchResponses()
      
      const responseText = {
        yes: 'participerez',
        no: 'ne participerez pas',
        maybe: 'êtes peut-être intéressé(e)'
      }
      
      toast.success(`Vous ${responseText[response]} à cet événement`)
    } catch (error: unknown) {
      console.error('Erreur lors de la mise à jour de la réponse:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour')
      // Recharger les réponses pour synchroniser l'état
      await fetchResponses()
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!user || user.id !== event.creator_id) {
      toast.error('Vous n\'êtes pas autorisé à supprimer cet événement')
      return
    }

    setDeleteLoading(true)

    try {
      // Supprimer d'abord toutes les réponses liées à l'événement
      const { error: responsesError } = await supabase
        .from('event_responses')
        .delete()
        .eq('event_id', event.id)

      if (responsesError) throw responsesError

      // Supprimer l'événement
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id)
        .eq('creator_id', user.id) // Sécurité supplémentaire

      if (eventError) throw eventError

      toast.success('Événement supprimé avec succès')
      setShowDeleteDialog(false)
      
      // Notifier le parent que l'événement a été supprimé
      if (onEventDeleted) {
        onEventDeleted(event.id)
      }
    } catch (error: unknown) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // Format HH:MM
  }

  const yesResponses = responses.filter(r => r.response === 'yes')
  const maybeResponses = responses.filter(r => r.response === 'maybe')
  const noResponses = responses.filter(r => r.response === 'no')
  const isEventFull = Boolean(event.max_participants && yesResponses.length >= event.max_participants)
  const participationRate = event.max_participants ? (yesResponses.length / event.max_participants) * 100 : 0

  // Calculer si l'événement est bientôt
  const eventDate = new Date(`${event.date}T${event.time}`)
  const now = new Date()
  const isUpcoming = eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000 && eventDate > now

  const responseIcons = {
    yes: CheckCircle,
    maybe: HelpCircle,
    no: XCircle
  }

  const responseColors = {
    yes: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
    maybe: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
    no: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={cn(
        "w-full overflow-hidden border-0 shadow-lg transition-all duration-300",
        "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
        "group-hover:shadow-xl group-hover:shadow-indigo-500/10",
        isUpcoming && "ring-2 ring-amber-200 dark:ring-amber-800"
      )}>
        {/* Header avec dégradé */}
        <div className="relative h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                  {event.title}
                </CardTitle>
                {isUpcoming && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      🔥 Bientôt
                    </Badge>
                  </motion.div>
                )}
                {isEventFull && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Complet
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.profiles?.avatar_url} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {event.profiles?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>Organisé par <span className="font-medium">{event.profiles?.name || 'Utilisateur'}</span></span>
              </div>
            </div>

            {/* Menu actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </DropdownMenuItem>
                {user && user.id === event.creator_id && (
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer l&apos;événement
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Trash2 className="h-5 w-5 text-red-500" />
                          Supprimer l&apos;événement
                        </DialogTitle>
                        <DialogDescription>
                          Êtes-vous sûr de vouloir supprimer l&apos;événement &quot;{event.title}&quot; ? Cette action est irréversible et supprimera également toutes les réponses des participants.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteDialog(false)}
                          disabled={deleteLoading}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteEvent}
                          disabled={deleteLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteLoading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Suppression...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer définitivement
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Détails avec icônes modernes */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">{formatDate(event.date)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">{formatTime(event.time)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-900 dark:text-purple-100">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Jauge de participation */}
          {event.max_participants && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Participation</span>
                <span className="font-medium">{yesResponses.length}/{event.max_participants} personnes</span>
              </div>
              <Progress value={participationRate} className="h-2" />
            </div>
          )}

          {/* Participants avec animations */}
          <AnimatePresence>
            {yesResponses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Participants confirmés ({yesResponses.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {yesResponses.slice(0, 6).map((response, index) => (
                    <motion.div
                      key={response.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-1 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={response.profiles?.avatar_url} />
                        <AvatarFallback className="text-xs bg-green-600 text-white">
                          {response.profiles?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-green-800 dark:text-green-200">
                        {response.profiles?.name || 'Utilisateur'}
                      </span>
                    </motion.div>
                  ))}
                  {yesResponses.length > 6 && (
                    <div className="flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full text-xs font-bold text-green-600 dark:text-green-400">
                      +{yesResponses.length - 6}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator />

          {/* Boutons de réponse modernes */}
          {user ? (
            <div className="grid grid-cols-3 gap-2">
              {(['yes', 'maybe', 'no'] as const).map((responseType) => {
                const Icon = responseIcons[responseType]
                const isSelected = userResponse === responseType
                const labels = {
                  yes: "J'y vais",
                  maybe: "Peut-être",
                  no: "Non merci"
                }
                
                return (
                  <motion.div key={responseType} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleResponse(responseType)}
                      disabled={loading || (responseType === 'yes' && isEventFull)}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full h-12 flex flex-col items-center justify-center space-y-1 transition-all duration-200",
                        isSelected && "shadow-lg",
                        !isSelected && responseColors[responseType]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{labels[responseType]}</span>
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                Connectez-vous pour participer à cet événement
              </p>
              <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Link href="/auth">Se connecter</Link>
              </Button>
            </div>
          )}

          {/* Stats des réponses */}
          {responses.length > 0 && (
            <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>{yesResponses.length} oui</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>{maybeResponses.length} peut-être</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>{noResponses.length} non</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
