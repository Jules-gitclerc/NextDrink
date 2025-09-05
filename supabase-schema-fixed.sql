-- Script SQL NextDrink - Version corrigée
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Supprimer les tables existantes si elles existent (optionnel, pour recommencer)
-- DROP TABLE IF EXISTS event_responses CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;  
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Créer la table profiles en premier
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 3. Créer la table events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 4. Créer la table event_responses
CREATE TABLE IF NOT EXISTS event_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response TEXT CHECK (response IN ('yes', 'no', 'maybe')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- 5. Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_responses ENABLE ROW LEVEL SECURITY;

-- 6. Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

DROP POLICY IF EXISTS "Anyone can view event responses" ON event_responses;
DROP POLICY IF EXISTS "Users can create their own responses" ON event_responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON event_responses;
DROP POLICY IF EXISTS "Users can delete their own responses" ON event_responses;

-- 7. Créer les politiques RLS pour profiles
CREATE POLICY "Users can view all profiles" ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Créer les politiques RLS pour events
CREATE POLICY "Anyone can view events" ON events 
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON events 
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own events" ON events 
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own events" ON events 
  FOR DELETE USING (auth.uid() = creator_id);

-- 9. Créer les politiques RLS pour event_responses
CREATE POLICY "Anyone can view event responses" ON event_responses 
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own responses" ON event_responses 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" ON event_responses 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses" ON event_responses 
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Créer la fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 12. Créer les index pour les performances
DROP INDEX IF EXISTS idx_events_creator_id;
DROP INDEX IF EXISTS idx_events_date;
DROP INDEX IF EXISTS idx_event_responses_event_id;
DROP INDEX IF EXISTS idx_event_responses_user_id;

CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_responses_event_id ON event_responses(event_id);
CREATE INDEX idx_event_responses_user_id ON event_responses(user_id);

-- 13. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'NextDrink database setup completed successfully!';
  RAISE NOTICE 'Tables created: profiles, events, event_responses';
  RAISE NOTICE 'RLS policies enabled';
  RAISE NOTICE 'Trigger for automatic profile creation enabled';
END $$;
