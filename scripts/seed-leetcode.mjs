/**
 * Fetches LeetCode data for a handle and upserts into the judges table.
 *
 * Usage:
 *   node scripts/seed-leetcode.mjs [handle]
 *   node scripts/seed-leetcode.mjs OnikJahanSagor
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

function getTitle(rating) {
  if (rating >= 2500) return 'Grandmaster'
  if (rating >= 2000) return 'Guardian'
  if (rating >= 1500) return 'Knight'
  return 'Member'
}

async function graphql(query) {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from LeetCode GraphQL`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

async function main() {
  loadEnv()

  const handle = process.argv[2] || 'OnikJahanSagor'
  console.log(`\nFetching LeetCode data for: ${handle}\n`)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  console.log('Fetching user stats...')
  const statsData = await graphql(`{
    matchedUser(username: "${handle}") {
      profile { ranking }
      submitStats { acSubmissionNum { difficulty count } }
    }
  }`)

  console.log('Fetching contest history...')
  const contestData = await graphql(`{
    userContestRanking(username: "${handle}") {
      attendedContestsCount
      rating
      globalRanking
      topPercentage
    }
    userContestRankingHistory(username: "${handle}") {
      attended
      rating
      contest { title startTime }
    }
  }`)

  const user = statsData.matchedUser
  const contestRanking = contestData.userContestRanking
  const history = contestData.userContestRankingHistory.filter((r) => r.attended)

  const problemsCount =
    user.submitStats.acSubmissionNum.find((s) => s.difficulty === 'All')?.count ?? 0

  const currentRating = Math.round(contestRanking.rating)
  const maxRating = Math.round(Math.max(...history.map((r) => r.rating)))

  const trend = history.map((r) => ({
    contest: r.contest.title,
    rating: Math.round(r.rating),
  }))

  const judgeRow = {
    name: 'LeetCode',
    handle,
    rating: currentRating,
    max_rating: maxRating,
    title: getTitle(maxRating),
    title_color: '#FFA116',
    contests_count: contestRanking.attendedContestsCount,
    problems_count: problemsCount,
    trend,
    order: 3,
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
    .eq('name', 'LeetCode')
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

  console.log('\n✓ Done — judges table updated for LeetCode / ' + handle)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
