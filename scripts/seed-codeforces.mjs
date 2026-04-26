/**
 * Fetches Codeforces data for a handle and upserts into the judges table.
 *
 * Usage:
 *   node scripts/seed-codeforces.mjs [handle]
 *   node scripts/seed-codeforces.mjs Black_Be4rD
 *
 * Requires .env.local to be present (reads it manually).
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// --- Load .env.local manually (no dotenv dependency needed) ---
function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      process.env[key] = val
    }
  } catch {
    console.warn('No .env.local found — relying on environment variables')
  }
}

// --- Codeforces rating → title + color ---
function getRankMeta(rating) {
  if (rating >= 3000) return { title: 'Legendary Grandmaster', color: '#ff0000' }
  if (rating >= 2600) return { title: 'International Grandmaster', color: '#ff0000' }
  if (rating >= 2400) return { title: 'Grandmaster', color: '#ff0000' }
  if (rating >= 2300) return { title: 'International Master', color: '#ff8c00' }
  if (rating >= 2100) return { title: 'Master', color: '#ff8c00' }
  if (rating >= 1900) return { title: 'Candidate Master', color: '#aa00aa' }
  if (rating >= 1600) return { title: 'Expert', color: '#0000ff' }
  if (rating >= 1400) return { title: 'Specialist', color: '#03a89e' }
  if (rating >= 1200) return { title: 'Pupil', color: '#008000' }
  return { title: 'Newbie', color: '#808080' }
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`CF API error: ${data.comment}`)
  return data.result
}

async function getProblemsCount(handle) {
  console.log('  Fetching accepted submissions (this may take a moment)...')
  try {
    const submissions = await fetchJSON(
      `https://codeforces.com/api/user.status?handle=${handle}`
    )
    const solved = new Set()
    for (const s of submissions) {
      if (s.verdict === 'OK') {
        solved.add(`${s.problem.contestId}-${s.problem.index}`)
      }
    }
    return solved.size
  } catch (e) {
    console.warn('  Could not fetch problems count:', e.message)
    return 0
  }
}

async function main() {
  loadEnv()

  const handle = process.argv[2] || 'Black_Be4rD'
  console.log(`\nFetching Codeforces data for: ${handle}\n`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // 1. User info
  console.log('Fetching user info...')
  const [userInfo] = await fetchJSON(
    `https://codeforces.com/api/user.info?handles=${handle}`
  )

  // 2. Rating history
  console.log('Fetching rating history...')
  const ratingHistory = await fetchJSON(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  )

  // 3. Problems solved
  const problemsCount = await getProblemsCount(handle)

  // Build trend: all contests for sparkline
  const trend = ratingHistory.map((r) => ({
    contest: r.contestName,
    rating: r.newRating,
  }))

  const currentRating = userInfo.rating ?? 0
  const maxRating = userInfo.maxRating ?? 0
  const { title, color: titleColor } = getRankMeta(maxRating)

  const judgeRow = {
    name: 'Codeforces',
    handle,
    rating: currentRating,
    max_rating: maxRating,
    title,
    title_color: titleColor,
    contests_count: ratingHistory.length,
    problems_count: problemsCount,
    trend,
    order: 0,
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

  // Upsert: update existing row if name+handle match, else insert
  const { data: existing } = await db
    .from('judges')
    .select('id')
    .eq('name', 'Codeforces')
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

  console.log('\n✓ Done — judges table updated for Codeforces / ' + handle)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
