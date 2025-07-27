import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signInWithEmail(email)
    setSent(true)
  }

  return (
    <div className="p-4">
      {sent ? (
        <p>Check your email for the magic link.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
            Send Magic Link
          </button>
        </form>
      )}
    </div>
  )
}
