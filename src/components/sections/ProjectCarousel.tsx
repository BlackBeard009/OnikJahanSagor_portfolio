'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProjectCarousel({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0)
  const n = images.length
  if (!n) return <div className="p-visual" style={{ background: 'var(--bg)' }} />

  const prev = () => setIdx((idx - 1 + n) % n)
  const next = () => setIdx((idx + 1) % n)

  return (
    <div className="p-visual">
      <div className="p-images">
        {images.map((src, i) => (
          <div key={i} className={`p-img${i === idx ? ' active' : ''}`}>
            <div className="frame">
              <img
                src={src}
                alt={`${title} screenshot ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="p-img-ctrl">
        <div>
          <span style={{ color: 'var(--ink-4)' }}>screen </span>
          <span>{String(idx + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={i === idx ? 'on' : ''}
                onClick={() => setIdx(i)}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
          <div className="arrows">
            <button onClick={prev} aria-label="Previous"><ChevronLeft size={12} /></button>
            <button onClick={next} aria-label="Next"><ChevronRight size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
