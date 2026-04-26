/**
 * Fetches AtCoder data for a handle and upserts into the judges table.
 *
 * Usage:
 *   node scripts/seed-atcoder.mjs [handle]
 *   node scripts/seed-atcoder.mjs Black_Beard
 *
 * Requires .env.local to be present (reads it manually).
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
    }
  } catch {
    console.warn('No .env.local found — relying on environment variables')
  }
}

function getRankMeta(rating) {
  if (rating >= 2800) return { title: 'Red', color: '#FF0000' }
  if (rating >= 2400) return { title: 'Orange', color: '#FF8000' }
  if (rating >= 2000) return { title: 'Yellow', color: '#C0C000' }
  if (rating >= 1600) return { title: 'Blue', color: '#0000FF' }
  if (rating >= 1200) return { title: 'Cyan', color: '#00C0C0' }
  if (rating >= 800)  return { title: 'Green', color: '#008000' }
  if (rating >= 400)  return { title: 'Brown', color: '#804000' }
  return { title: 'Gray', color: '#808080' }
}

async function fetchHistory(handle) {
  const res = await fetch(`https://atcoder.jp/users/${handle}/history/json`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching AtCoder history`)
  return res.json()
}

async function fetchProblemsCount(handle) {
  try {
    const res = await fetch(`https://atcoder.jp/users/${handle}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const html = await res.text()
    const nums = [...html.matchAll(/<td[^>]*>\s*(\d+)\s*<\/td>/g)].map((m) =>
      parseInt(m[1], 10)
    )
    // Second non-trivial number in the stats table is accepted problems
    const candidates = nums.filter((n) => n > 0 && n < 10000)
    return candidates[1] ?? 0
  } catch {
    return 0
  }
}

async function main() {
  loadEnv()

  const handle = process.argv[2] || 'Black_Beard'
  console.log(`\nFetching AtCoder data for: ${handle}\n`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  console.log('Fetching contest history...')
  const history = await fetchHistory(handle)
  if (!history.length) throw new Error('No contest history found')

  console.log('Fetching profile page for problems count...')
  const problemsCount = await fetchProblemsCount(handle)

  const ratings = history.map((r) => r.NewRating)
  const currentRating = ratings[ratings.length - 1]
  const maxRating = Math.max(...ratings)
  const { title } = getRankMeta(maxRating)

  const trend = history.map((r) => ({
    contest: r.ContestNameEn || r.ContestName,
    rating: r.NewRating,
  }))

  const judgeRow = {
    name: 'AtCoder',
    handle,
    rating: currentRating,
    max_rating: maxRating,
    title,
    title_color: '#00C0C0', // user specified cyan
    contests_count: history.length,
    problems_count: problemsCount,
    trend,
    order: 2,
  }

  console.log('\nData to upsert:')
  console.log(`  handle:          ${judgeRow.handle}`)
  console.log(`  rating:          ${judgeRow.rating}`)
  console.log(`  max_rating:      ${judgeRow.max_rating}`)
  console.log(`  title:           ${judgeRow.title}`)
  console.log(`  title_color:     ${judgeRow.title_color}`)
  console.log(`  contests_count:  ${judgeRow.contests_count}`)
  console.log(`  problems_count:  ${judgeRow.problems_count}`)
  console.log(`  trend points:    ${judgeRow.trend.length}`)

  const { data: existing } = await db
    .from('judges')
    .select('id')
    .eq('name', 'AtCoder')
    .eq('handle', handle)
    .maybeSingle()

  let error
  if (existing) {
    console.log('\nExisting row found — updating...')
    ;({ error } = await db.from('judges').update(judgeRow).eq('id', existing.id))
  } else {
    console.log('\nNo existing row — inserting...')
    ;({ error } = await db.from('judges').insert(judgeRow))
  }

  if (error) {
    console.error('\nSupabase error:', error.message)
    process.exit(1)
  }

  console.log('\n✓ Done — judges table updated for AtCoder / ' + handle)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
