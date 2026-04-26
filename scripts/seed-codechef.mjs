/**
 * Fetches CodeChef data for a handle and upserts into the judges table.
 *
 * Usage:
 *   node scripts/seed-codechef.mjs [handle]
 *   node scripts/seed-codechef.mjs black_beard007
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

function getStarMeta(rating) {
  if (rating >= 2500) return { title: '7★ Divine', color: '#d44400' }
  if (rating >= 2200) return { title: '6★ Grandmaster', color: '#FFBF00' }
  if (rating >= 2000) return { title: '5★ Master', color: '#FFBF00' }
  if (rating >= 1800) return { title: '4★ Expert', color: '#3366CC' }
  if (rating >= 1600) return { title: '3★ Specialist', color: '#3366CC' }
  if (rating >= 1400) return { title: '2★ Beginner', color: '#1e7d22' }
  return { title: '1★ Newbie', color: '#666666' }
}

async function fetchCodeChefPage(handle) {
  const res = await fetch(`https://www.codechef.com/users/${handle}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching CodeChef page`)
  return res.text()
}

function parseHTML(html, handle) {
  // Extract Drupal.settings JSON blob which has rating history
  const settingsMatch = html.match(/jQuery\.extend\(Drupal\.settings,\s*(\{.*?\})\s*\);/)
  if (!settingsMatch) throw new Error('Could not find Drupal.settings in CodeChef page')
  const settings = JSON.parse(settingsMatch[1])

  const ratingHistory = settings?.date_versus_rating?.all ?? []
  if (!ratingHistory.length) throw new Error('No rating history found')

  // Current & highest rating from the trend itself
  const ratings = ratingHistory.map((r) => parseInt(r.rating, 10))
  const currentRating = ratings[ratings.length - 1]
  const maxRating = Math.max(...ratings)

  // Problems solved from page HTML
  const probMatch = html.match(/Problems Solved.*?(\d+)/)
  const problemsCount = probMatch ? parseInt(probMatch[1], 10) : 0

  // Build trend
  const trend = ratingHistory.map((r) => ({
    contest: r.name,
    rating: parseInt(r.rating, 10),
  }))

  return { currentRating, maxRating, problemsCount, trend, contestsCount: ratingHistory.length }
}

async function main() {
  loadEnv()

  const handle = process.argv[2] || 'black_beard007'
  console.log(`\nFetching CodeChef data for: ${handle}\n`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  console.log('Fetching CodeChef page...')
  const html = await fetchCodeChefPage(handle)

  console.log('Parsing data...')
  const { currentRating, maxRating, problemsCount, trend, contestsCount } = parseHTML(html, handle)

  const { title, color: titleColor } = getStarMeta(maxRating)

  const judgeRow = {
    name: 'CodeChef',
    handle,
    rating: currentRating,
    max_rating: maxRating,
    title,
    title_color: '#FFBF00', // user specified yellow
    contests_count: contestsCount,
    problems_count: problemsCount,
    trend,
    order: 1,
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
    .eq('name', 'CodeChef')
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

  console.log('\n✓ Done — judges table updated for CodeChef / ' + handle)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
