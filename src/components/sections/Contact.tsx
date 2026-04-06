'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
})

type FormData = z.infer<typeof schema>

export function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 px-6 max-w-2xl mx-auto">
      <h2 className="section-heading text-center">Get In Touch</h2>
      <p className="section-subheading text-center">Let&apos;s work together</p>

      <GlassCard>
        {status === 'success' ? (
          <div className="text-center py-8">
            <p className="text-green-400 text-lg font-semibold">Message sent!</p>
            <p className="text-gray-400 mt-2">I&apos;ll get back to you soon.</p>
            <Button className="mt-6" onClick={() => setStatus('idle')}>Send another</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" placeholder="Alice Smith" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" placeholder="alice@example.com" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Subject" placeholder="What's this about?" {...register('subject')} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">Message</label>
              <textarea
                {...register('message')}
                rows={5}
                placeholder="Your message..."
                className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan/50 transition-colors text-sm resize-none"
              />
              {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
            </div>
            <Button type="submit" disabled={status === 'sending'} className="self-end mt-2">
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </Button>
            {status === 'error' && <p className="text-red-400 text-sm">Failed to send. Please try again.</p>}
          </form>
        )}
      </GlassCard>
    </section>
  )
}
