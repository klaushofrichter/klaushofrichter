export interface UserProfile {
  login: string
  name: string
  avatarUrl: string
  htmlUrl: string
  bio: string | null
  blog: string
  publicRepos: number
}

export interface AppEntry {
  name: string
  pagesUrl: string
  repoUrl: string
  lastUpdated: string
  version: string | null
  summary: string
}

export interface AppsData {
  user: UserProfile
  apps: AppEntry[]
}
