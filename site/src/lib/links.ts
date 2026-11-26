export const REPO_URL = 'https://github.com/dnautz03/Underset'
export const DOWNLOAD_URL = 'https://github.com/dnautz03/Underset/releases/latest'
// Direct downloads of the latest release assets (names from the README)
export const WINDOWS_ZIP = 'https://github.com/dnautz03/Underset/releases/latest/download/Underset-Windows.zip'
export const MAC_ZIP = 'https://github.com/dnautz03/Underset/releases/latest/download/Underset-macOS.zip'

export type Os = 'windows' | 'mac'
export const ZIP: Record<Os, string> = { windows: WINDOWS_ZIP, mac: MAC_ZIP }

// Base path of the site ('/' on Cloudflare, '/Underset/' on GitHub Pages)
export const HOME_URL = import.meta.env.BASE_URL

/** The install guide. With an OS it also starts that download when it opens. */
export function guideUrl(os?: Os) {
  return `${HOME_URL}download/${os ? `?os=${os}&start=1` : ''}`
}
