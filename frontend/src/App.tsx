import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import EventList from './pages/EventList'
import CalendarPage from './pages/Calendar'
import LoginPage from './pages/Login'
import EventForm from './pages/EventForm'
import { useAuth } from './hooks/useAuth'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {
  const { session } = useAuth()

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<EventList />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/new" element={session ? <EventForm /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
