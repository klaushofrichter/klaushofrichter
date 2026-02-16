import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'assets', 'apps.json')
const USERNAME = 'klaushofrichter'

function gh(endpoint) {
  const result = execSync(`gh api '${endpoint}' 2>/dev/null`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
  return JSON.parse(result)
}

function ghRaw(endpoint, extraArgs = '') {
  try {
    return execSync(`gh api '${endpoint}' ${extraArgs} 2>/dev/null`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
  } catch {
    return null
  }
}

function extractSummaryFromReadme(readmeContent, repoDescription) {
  if (!readmeContent) {
    return repoDescription || 'No description available'
  }

  const lines = readmeContent.split('\n')
  const proseLines = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip headings
    if (trimmed.startsWith('#')) continue
    // Skip badges (lines that are only images/links with no prose)
    if (/^\[!\[.*\]\(.*\)\]\(.*\)$/.test(trimmed)) continue
    if (/^!\[.*\]\(.*\)$/.test(trimmed)) continue
    // Skip empty lines
    if (trimmed === '') {
      if (proseLines.length > 0) break // End of first paragraph
      continue
    }
    // Skip HTML tags
    if (/^<.*>$/.test(trimmed)) continue
    // Skip lines that are only links
    if (/^\[.*\]\(.*\)$/.test(trimmed)) continue

    proseLines.push(trimmed)
  }

  if (proseLines.length === 0) {
    return repoDescription || 'No description available'
  }

  const paragraph = proseLines.join(' ')
  // Strip remaining markdown: bold, italic, inline code, links
  const cleaned = paragraph
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // bold/italic
    .replace(/`([^`]+)`/g, '$1') // inline code

  const words = cleaned.split(/\s+/)
  if (words.length > 50) {
    return words.slice(0, 50).join(' ') + '...'
  }
  return cleaned
}

async function main() {
  console.log('Fetching user profile...')
  const rawUser = gh(`/users/${USERNAME}`)
  const user = {
    login: rawUser.login,
    name: rawUser.name,
    avatarUrl: rawUser.avatar_url,
    htmlUrl: rawUser.html_url,
    bio: rawUser.bio,
    blog: rawUser.html_url,
    publicRepos: rawUser.public_repos,
  }

  console.log('Fetching repositories with GitHub Pages...')
  // Fetch all repos (paginated)
  let page = 1
  let allRepos = []
  while (true) {
    const repos = gh(`/users/${USERNAME}/repos?per_page=100&page=${page}`)
    if (repos.length === 0) break
    allRepos = allRepos.concat(repos)
    page++
  }

  const pagesRepos = allRepos.filter((r) => r.has_pages)
  console.log(`Found ${pagesRepos.length} repos with GitHub Pages`)

  const apps = []
  for (const repo of pagesRepos) {
    console.log(`  Processing ${repo.name}...`)

    // Skip repos with .nobrowse file
    const nobrowse = ghRaw(`/repos/${USERNAME}/${repo.name}/contents/.nobrowse`)
    if (nobrowse !== null) {
      console.log(`    Skipped (has .nobrowse)`)
      continue
    }

    // Fetch version from package.json
    let version = null
    try {
      const pkgContent = gh(`/repos/${USERNAME}/${repo.name}/contents/package.json`)
      if (pkgContent.content) {
        const decoded = Buffer.from(pkgContent.content, 'base64').toString('utf-8')
        const pkg = JSON.parse(decoded)
        version = pkg.version || null
      }
    } catch {
      // No package.json
    }

    // Fetch README for summary
    let summary = repo.description || 'No description available'
    try {
      const readmeRaw = ghRaw(`/repos/${USERNAME}/${repo.name}/readme`, '--header "Accept: application/vnd.github.raw+json"')
      if (readmeRaw) {
        summary = extractSummaryFromReadme(readmeRaw, repo.description)
      }
    } catch {
      // No README
    }

    apps.push({
      name: repo.name,
      pagesUrl: `https://${USERNAME}.github.io/${repo.name}/`,
      repoUrl: repo.html_url,
      lastUpdated: repo.pushed_at,
      version,
      summary,
    })
  }

  // Sort by lastUpdated descending
  apps.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())

  const data = { user, apps }
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log(`\nWritten ${apps.length} apps to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
