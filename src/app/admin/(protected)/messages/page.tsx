'use client'
import { useState, useEffect, useCallback } from 'react'
import { ContactMessage } from '@/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/messages')
    setMessages(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'PUT' })
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Contact Messages</h1>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <GlassCard key={msg.id} className={msg.read ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{msg.name}</span>
                    {!msg.read && <Badge variant="cyan">New</Badge>}
                  </div>
                  <p className="text-gray-400 text-sm">{msg.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-gray-500 text-xs">{new Date(msg.created_at).toLocaleDateString()}</span>
                  {!msg.read && (
                    <Button size="sm" variant="outline" onClick={() => markRead(msg.id)}>Mark read</Button>
                  )}
                </div>
              </div>
              {msg.subject && <p className="text-gray-300 text-sm font-medium mb-1">{msg.subject}</p>}
              <p className="text-gray-400 text-sm leading-relaxed">{msg.message}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
