import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFileSync } from 'node:fs'

const OUTPUT_PATH = new URL('../src/assets/apps.json', import.meta.url)
const USERNAME = 'klaushofrichter'
const RAW = ['--header', 'Accept: application/vnd.github.raw+json']

const run = promisify(execFile)

// Raw response body, or null if the call fails (e.g. a 404 for a missing file).
async function ghRaw(endpoint, extraArgs = []) {
  try {
    const { stdout } = await run('gh', ['api', endpoint, ...extraArgs], { maxBuffer: 10 * 1024 * 1024 })
    return stdout
  } catch {
    return null
  }
}

// Parsed JSON; a failure here is fatal, unlike ghRaw.
async function gh(endpoint, extraArgs = []) {
  const body = await ghRaw(endpoint, extraArgs)
  if (body === null) throw new Error(`gh api ${endpoint} failed`)
  return JSON.parse(body)
}

function extractSummaryFromReadme(readmeContent, repoDescription) {
  const proseLines = []

  for (const line of (readmeContent ?? '').split('\n')) {
    const trimmed = line.trim()
    // Skip headings
    if (trimmed.startsWith('#')) continue
    // Skip empty lines
    if (trimmed === '') {
      if (proseLines.length > 0) break // End of first paragraph
      continue
    }
    // Skip HTML tags
    if (/^<.*>$/.test(trimmed)) continue
    // Skip lines that are only a link, an image, or a badge (a linked image)
    if (/^!?\[.*\]\(.*\)$/.test(trimmed)) continue

    proseLines.push(trimmed)
  }

  if (proseLines.length === 0) {
    return repoDescription || 'No description available'
  }

  // Strip remaining markdown: bold, italic, inline code, links
  const cleaned = proseLines
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // bold/italic
    .replace(/`([^`]+)`/g, '$1') // inline code

  const words = cleaned.split(/\s+/)
  if (words.length > 50) {
    return words.slice(0, 50).join(' ') + '...'
  }
  return cleaned
}

function parseVersion(pkgJson) {
  try {
    return JSON.parse(pkgJson).version || null
  } catch {
    return null
  }
}

// One repo's entry, or null if it opts out with a .nobrowse file. The three
// lookups are independent, so they run together.
async function buildEntry(repo) {
  const base = `/repos/${USERNAME}/${repo.name}`
  const [nobrowse, pkgJson, readme] = await Promise.all([
    ghRaw(`${base}/contents/.nobrowse`),
    ghRaw(`${base}/contents/package.json`, RAW),
    ghRaw(`${base}/readme`, RAW),
  ])

  if (nobrowse !== null) {
    console.log(`  ${repo.name}: skipped (has .nobrowse)`)
    return null
  }
  console.log(`  ${repo.name}`)

  return {
    name: repo.name,
    pagesUrl: `https://${USERNAME}.github.io/${repo.name}/`,
    repoUrl: repo.html_url,
    lastUpdated: repo.pushed_at,
    version: pkgJson === null ? null : parseVersion(pkgJson),
    summary: extractSummaryFromReadme(readme, repo.description),
  }
}

async function main() {
  console.log('Fetching user profile and repositories...')
  const [rawUser, pages] = await Promise.all([
    gh(`/users/${USERNAME}`),
    gh(`/users/${USERNAME}/repos?per_page=100`, ['--paginate', '--slurp']),
  ])
  const user = {
    login: rawUser.login,
    name: rawUser.name,
    avatarUrl: rawUser.avatar_url,
    htmlUrl: rawUser.html_url,
    bio: rawUser.bio,
  }

  const pagesRepos = pages.flat().filter((r) => r.has_pages)
  console.log(`Found ${pagesRepos.length} repos with GitHub Pages`)

  const apps = (await Promise.all(pagesRepos.map(buildEntry))).filter(Boolean)

  // pushed_at is ISO 8601 UTC, which sorts correctly as text
  apps.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))

  writeFileSync(OUTPUT_PATH, JSON.stringify({ user, apps }, null, 2))
  console.log(`\nWritten ${apps.length} apps to ${OUTPUT_PATH.pathname}`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
