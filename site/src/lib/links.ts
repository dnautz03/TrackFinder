export const REPO_URL = 'https://github.com/dnautz03/Underset'
export const DOWNLOAD_URL = 'https://github.com/dnautz03/Underset/releases/latest'
// Direct downloads of the latest release assets (names from the README)
export const WINDOWS_FILE = 'https://github.com/dnautz03/Underset/releases/latest/download/Underset-Setup.exe'
export const MAC_FILE = 'https://github.com/dnautz03/Underset/releases/latest/download/Underset-macOS.dmg'

export type Os = 'windows' | 'mac'
export const FILE: Record<Os, string> = { windows: WINDOWS_FILE, mac: MAC_FILE }

// Base path of the site ('/' on Cloudflare, '/Underset/' on GitHub Pages)
export const HOME_URL = import.meta.env.BASE_URL

/** The install guide. With an OS it also starts that download when it opens. */
export function guideUrl(os?: Os) {
  return `${HOME_URL}download/${os ? `?os=${os}&start=1` : ''}`
}

/** The live preview: see a DJ's sets from the phone, no download. */
export const TRY_URL = `${HOME_URL}try/`
