import { REPO_URL } from '@/lib/links'
import { GithubMark } from '../Buttons'
import { Wordmark } from '../Nav'

export function Footer() {
  return (
    <footer className="border-t border-groove bg-night">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-12 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12">
        <div className="flex flex-col gap-3">
          <Wordmark />
          <p className="text-dust">Built for music lovers.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-dust lg:items-end">
          <a
            href={REPO_URL}
            className="inline-flex min-h-11 items-center gap-2 text-bone underline decoration-groove underline-offset-4 transition-colors hover:decoration-acid"
          >
            <GithubMark className="size-4" />
            TrackFinder on GitHub
          </a>
          <p>© 2026 TrackFinder · Not affiliated with 1001Tracklists, Spotify or SoundCloud.</p>
        </div>
      </div>
    </footer>
  )
}
