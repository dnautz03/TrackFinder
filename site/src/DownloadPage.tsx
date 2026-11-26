import { useEffect, useState, type ReactNode } from 'react'
import { ArrowDownToLine, ArrowLeft, Check, Copy, ShieldCheck, TriangleAlert } from 'lucide-react'
import { AppleMark, GithubMark, WindowsMark, primaryClass } from '@/components/Buttons'
import { Wordmark } from '@/components/Nav'
import { Footer } from '@/components/sections/Footer'
import { DOWNLOAD_URL, HOME_URL, REPO_URL, FILE, type Os } from '@/lib/links'

/**
 * /download/ — opened by every download button.
 * ?os=windows|mac picks the guide, &start=1 also starts that file's download.
 * Before first paint an inline script in download/index.html sets <html data-os>
 * (from ?os, else from the platform), and CSS shows the matching guide, so the
 * prerendered page is already right without JavaScript.
 */

const OS_NAME: Record<Os, string> = { windows: 'Windows', mac: 'macOS' }

function currentOs(): Os {
  if (typeof document === 'undefined') return 'windows'
  return document.documentElement.dataset.os === 'mac' ? 'mac' : 'windows'
}

export default function DownloadPage() {
  const [os, setOs] = useState<Os | null>(null)
  const [started, setStarted] = useState<Os | null>(null)

  useEffect(() => {
    setOs(currentOs())
    const params = new URLSearchParams(window.location.search)
    const want = params.get('os')
    if (params.get('start') === '1' && (want === 'windows' || want === 'mac')) {
      // Drop start=1 so a reload or "back" doesn't download the file again
      params.delete('start')
      history.replaceState(null, '', `${window.location.pathname}?${params}`)
      setStarted(want)
      const t = window.setTimeout(() => window.location.assign(FILE[want]), 600)
      return () => window.clearTimeout(t)
    }
  }, [])

  const pick = (next: Os) => {
    document.documentElement.dataset.os = next
    setOs(next)
    const params = new URLSearchParams(window.location.search)
    params.set('os', next)
    history.replaceState(null, '', `${window.location.pathname}?${params}`)
  }

  return (
    <>
      <header className="border-b border-groove bg-night">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Wordmark href={HOME_URL} />
          <a
            href={HOME_URL}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-dust transition-colors hover:text-bone"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to site
          </a>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <section className="grid grid-cols-1 gap-10 pt-14 pb-12 sm:pt-20 lg:grid-cols-12 lg:gap-14 lg:pt-24">
          <div className="lg:col-span-8">
            <p className="plate mb-6 w-fit font-mono text-[11px] tracking-[0.06em] text-acid uppercase">
              {started ? `Downloading Underset for ${OS_NAME[started]}` : 'Install guide · Windows & macOS'}
            </p>
            <h1 className="type-display text-[clamp(2.4rem,8.4vw,4.25rem)] uppercase lg:text-[min(4.25rem,4.6vw)]">
              <span className="plate">Heads up:</span>
              <br />
              <span className="plate text-acid">your computer will warn you.</span>
            </h1>
            <p className="plate mt-8 max-w-[52ch] text-[1.0625rem] leading-relaxed text-dust sm:text-[1.25rem]">
              The first time you open Underset, Windows or macOS shows a warning about an unknown app.{' '}
              <strong className="font-semibold text-bone">This is expected.</strong> Underset is free, and it isn’t
              registered with Microsoft or Apple, because that registration costs money every year. Follow the steps
              below once and the warning never comes back.
            </p>
          </div>

          <aside className="self-end lg:col-span-4">
            <div className="plate rounded-2xl border border-groove p-6">
              <p className="flex items-center gap-2 font-semibold text-bone">
                <ArrowDownToLine className="size-4 text-acid" aria-hidden />
                {started ? 'Your download is starting…' : 'Download Underset'}
              </p>
              <p className="mt-2 text-[0.9375rem] text-dust">
                {started
                  ? 'Didn’t start after a few seconds? Download it again:'
                  : 'Pick your computer:'}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <a href={FILE.windows} className={primaryClass('sm')}>
                  <WindowsMark className="size-4" />
                  Windows (.exe)
                </a>
                <a href={FILE.mac} className={primaryClass('sm')}>
                  <AppleMark className="-mt-0.5 size-4" />
                  macOS (.dmg)
                </a>
              </div>
              <a
                href={DOWNLOAD_URL}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-dust underline decoration-groove underline-offset-4 hover:text-bone hover:decoration-acid"
              >
                <GithubMark className="size-3.5" />
                All files on GitHub
              </a>
            </div>
          </aside>
        </section>

        <section aria-labelledby="guide-title" className="border-t border-groove pt-12 pb-20 sm:pt-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="guide-title" className="plate type-display w-fit text-[clamp(1.9rem,5vw,3rem)] uppercase">
              Open it in 1 minute
            </h2>
            <div role="tablist" aria-label="Your computer" className="plate inline-flex w-fit rounded-full border border-groove p-1">
              {(['windows', 'mac'] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  role="tab"
                  id={`tab-${o}`}
                  aria-controls={`panel-${o}`}
                  aria-selected={os === o}
                  onClick={() => pick(o)}
                  className={`os-tab os-tab-${o} inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold transition-colors duration-300`}
                >
                  {o === 'windows' ? <WindowsMark className="size-4" /> : <AppleMark className="-mt-0.5 size-4" />}
                  {OS_NAME[o]}
                </button>
              ))}
            </div>
          </div>

          <div id="panel-windows" role="tabpanel" aria-labelledby="tab-windows" className="os-panel os-windows mt-12">
            <WindowsGuide />
          </div>
          <div id="panel-mac" role="tabpanel" aria-labelledby="tab-mac" className="os-panel os-mac mt-12">
            <MacGuide />
          </div>
        </section>

        <section aria-labelledby="why-title" className="grid grid-cols-1 gap-10 border-t border-groove py-20 lg:grid-cols-12 lg:gap-14">
          <h2 id="why-title" className="plate type-display w-fit text-[clamp(1.9rem,5vw,3rem)] uppercase lg:col-span-5">
            Why the <span className="text-acid">warning?</span>
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
            <Note icon={<TriangleAlert className="size-5 text-acid" aria-hidden />} title="What it means">
              Microsoft and Apple warn about every app that isn’t signed with a paid developer certificate. The warning
              means your computer doesn’t know who made the app. It does not mean anything harmful was found in it.
            </Note>
            <Note icon={<ShieldCheck className="size-5 text-acid" aria-hidden />} title="Stay safe">
              Only download Underset from this page or from{' '}
              <a href={REPO_URL} className="text-bone underline decoration-groove underline-offset-4 hover:decoration-acid">
                its GitHub page
              </a>
              . If you got the file from anywhere else, delete it and download it again from here.
            </Note>
          </div>
        </section>
      </main>
      <Footer home={HOME_URL} />
    </>
  )
}

/* ───────────────────────── Guides ───────────────────────── */

function WindowsGuide() {
  return (
    <ol className="grid gap-14">
      <Step n={1} title="Open the installer">
        In your <b>Downloads</b> folder, double-click <Code>Underset-Setup.exe</Code>.
      </Step>
      <Step
        n={2}
        title="“Windows protected your PC” → More info"
        mock={<WinSmartScreen />}
      >
        A blue window appears. There is no “Run” button yet. Don’t click “Don’t run”. Click the small{' '}
        <b>More info</b> link instead.
      </Step>
      <Step n={3} title="Click “Run anyway”" mock={<WinSmartScreen expanded />}>
        The window now shows <i>Publisher: Unknown publisher</i> and a new <b>Run anyway</b> button. Click it.
        The installer opens.
      </Step>
      <Step n={4} title="Install Underset">
        Accept the terms and follow the installer. It needs no administrator password.
      </Step>
      <Step n={5} title="Done. Only this once." last>
        Open Underset from the <b>Start menu</b>. The warning doesn’t come back. To remove it later:{' '}
        <b>Settings</b> → <b>Apps</b> → <b>Underset</b> → <b>Uninstall</b>.
        <Help title="No “More info” link, or the file disappeared?">
          Some antivirus apps block or delete new apps they don’t know yet. Open your antivirus, find Underset in its
          quarantine or blocked list, and choose <b>Restore</b> or <b>Allow</b>. Then try again from step 1.
        </Help>
      </Step>
    </ol>
  )
}

function MacGuide() {
  return (
    <ol className="grid gap-14">
      <Step n={1} title="Open the disk image, move it to Applications">
        In your <b>Downloads</b> folder, double-click <Code>Underset-macOS.dmg</Code> and accept the terms. Drag{' '}
        <b>Underset</b> into your <b>Applications</b> folder, then double-click it there. Needs macOS 14 Sonoma or
        newer.
      </Step>
      <Step n={2} title="Warning → click “Done”" mock={<MacAlert />}>
        macOS says <i>Apple could not verify “Underset” is free of malware</i>. Click <b>Done</b>.{' '}
        <b>Not “Move to Trash”</b>, or you’ll have to download it again.
      </Step>
      <Step n={3} title="Privacy & Security → “Open Anyway”" mock={<MacSettings />}>
        Open <b> System Settings</b> → <b>Privacy & Security</b> (in the left column). Scroll down to{' '}
        <b>Security</b>. Next to <i>“Underset” was blocked to protect your Mac</i>, click <b>Open Anyway</b>.
      </Step>
      <Step n={4} title="Confirm with your password" mock={<MacConfirm />}>
        macOS asks once more. Click <b>Open Anyway</b>, then type your Mac password or use Touch ID.
      </Step>
      <Step n={5} title="First start: let it set itself up" last>
        Underset asks to download its components (Python and the window libraries): about <b>0.5 GB</b> to download,{' '}
        <b>1.5 GB</b> on disk. Click <b>Install</b> and wait a few minutes. It happens only once, needs no admin
        password, and opens the app by itself when it’s done. Used it when it was called TrackFinder? Your components
        are reused, so there’s nothing new to download.
        <Help title="It says “Underset is damaged and can’t be opened”">
          <span className="block">
            The app isn’t broken: macOS just marked the download. Open the <b>Terminal</b> app (press ⌘ Space and type
            “Terminal”), paste this line, press Enter, then open Underset again:
          </span>
          <CopyLine text="xattr -dr com.apple.quarantine /Applications/Underset.app" />
        </Help>
      </Step>
    </ol>
  )
}

/* ───────────────────────── Building blocks ───────────────────────── */

function Step({
  n,
  title,
  children,
  mock,
  last,
}: {
  n: number
  title: string
  children: ReactNode
  mock?: ReactNode
  last?: boolean
}) {
  return (
    <li className="grid grid-cols-[2.75rem_1fr] gap-x-4 sm:grid-cols-[3.5rem_1fr] lg:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
      <span
        className={`grid size-11 place-items-center rounded-full border font-mono text-sm font-bold sm:size-14 sm:text-base ${
          last ? 'border-acid bg-acid text-night' : 'plate border-groove text-acid'
        }`}
        aria-hidden
      >
        {last ? <Check className="size-5" strokeWidth={3} /> : String(n).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <h3 className="plate w-fit text-xl font-semibold text-bone sm:text-2xl">
          <span className="sr-only">Step {n}: </span>
          {title}
        </h3>
        <div className="plate mt-3 max-w-[56ch] text-[1.0625rem] leading-relaxed text-dust [&_b]:font-semibold [&_b]:text-bone [&_i]:text-bone">
          {children}
        </div>
      </div>
      {mock && (
        <div className="col-span-2 mt-6 sm:col-start-2 sm:col-span-1 lg:col-start-3 lg:mt-0" aria-hidden>
          <p className="mb-2 font-mono text-[11px] tracking-[0.06em] text-dust uppercase">What you’ll see</p>
          {mock}
        </div>
      )}
    </li>
  )
}

function Note({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="plate">
      <p className="flex items-center gap-2.5 text-lg font-semibold text-bone">
        {icon}
        {title}
      </p>
      <p className="mt-3 leading-relaxed text-dust">{children}</p>
    </div>
  )
}

function Help({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group mt-6 rounded-xl border border-groove bg-deck">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold text-bone [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-acid transition-transform duration-300 group-open:rotate-45" aria-hidden>
          +
        </span>
      </summary>
      <div className="px-4 pb-4 text-[0.9375rem] leading-relaxed">{children}</div>
    </details>
  )
}

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-deck px-1.5 py-0.5 font-mono text-[0.85em] break-all text-bone">{children}</code>
}

function CopyLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard blocked: the text is selectable */
    }
  }
  return (
    <span className="mt-3 flex items-stretch gap-2">
      <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-groove bg-night px-3 py-2.5 font-mono text-[0.8125rem] whitespace-nowrap text-bone select-all">
        {text}
      </code>
      <button
        type="button"
        onClick={copy}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-groove px-3 text-sm font-semibold text-bone transition-colors hover:border-acid"
      >
        {copied ? <Check className="size-4 text-acid" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </span>
  )
}

/* ───────────── Mock-ups of the real dialogs (simplified, not screenshots) ───────────── */

/** Outline that marks what to click. */
const hit = 'outline-2 outline-offset-2 outline-acid [outline-style:solid] shadow-[0_0_0_6px_rgb(200_255_46/0.18)]'

function WinSmartScreen({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="max-w-md bg-[#0b62b8] p-6 font-[Segoe_UI,system-ui,sans-serif] text-white">
      <p className="text-[1.6rem] leading-tight font-light">Windows protected your PC</p>
      <p className="mt-4 text-sm leading-snug">
        Microsoft Defender SmartScreen prevented an unrecognized app from starting. Running this app might put your PC
        at risk.
      </p>
      {expanded ? (
        <p className="mt-3 text-sm leading-relaxed">
          App: Underset-Setup.exe
          <br />
          Publisher: Unknown publisher
        </p>
      ) : (
        <p className="mt-2 text-sm">
          <span className={`rounded-sm underline ${hit}`}>More info</span>
        </p>
      )}
      <div className="mt-10 flex justify-end gap-2 text-sm">
        {expanded && <span className={`border border-white px-6 py-1.5 ${hit}`}>Run anyway</span>}
        <span className="border border-white/70 px-6 py-1.5 opacity-80">Don’t run</span>
      </div>
    </div>
  )
}

function MacAppIcon() {
  return (
    <span className="grid size-14 place-items-center rounded-[14px] bg-night">
      <svg viewBox="0 0 20 20" className="size-8" fill="#c8ff2e">
        <rect x="1" y="7" width="3" height="6" rx="1" />
        <rect x="6" y="3" width="3" height="14" rx="1" />
        <rect x="11" y="5" width="3" height="10" rx="1" />
        <rect x="16" y="8" width="3" height="4" rx="1" />
      </svg>
    </span>
  )
}

const macFont = 'font-[-apple-system,BlinkMacSystemFont,system-ui,sans-serif]'

function MacAlert() {
  return (
    <div className={`max-w-[17.5rem] rounded-2xl bg-[#2b2b2d] p-5 text-center text-[#f2f2f7] ${macFont}`}>
      <div className="flex justify-center">
        <MacAppIcon />
      </div>
      <p className="mt-3 text-[0.9375rem] font-bold">“Underset” Not Opened</p>
      <p className="mt-2 text-xs leading-snug text-[#c7c7cc]">
        Apple could not verify “Underset” is free of malware that may harm your Mac or compromise your privacy.
      </p>
      <div className="mt-4 grid gap-2 text-[0.8125rem] font-medium">
        <span className={`rounded-lg bg-[#0a84ff] py-1.5 text-white ${hit}`}>Done</span>
        <span className="rounded-lg bg-[#48484a] py-1.5">Move to Trash</span>
      </div>
    </div>
  )
}

function MacSettings() {
  return (
    <div className={`max-w-md overflow-hidden rounded-xl bg-[#1e1e1e] text-[#f2f2f7] ${macFont}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[0.8125rem] font-semibold">Privacy & Security</span>
      </div>
      <div className="p-4">
        <p className="text-[0.8125rem] font-semibold">Security</p>
        <div className="mt-2 rounded-lg bg-[#2b2b2d] p-3.5 text-xs leading-snug">
          <p className="text-[#c7c7cc]">Allow applications from</p>
          <p className="mt-1">App Store & Known Developers</p>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <p>“Underset” was blocked to protect your Mac.</p>
            <span className={`shrink-0 rounded-md bg-[#48484a] px-2.5 py-1 font-medium ${hit}`}>Open Anyway</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MacConfirm() {
  return (
    <div className={`max-w-[17.5rem] rounded-2xl bg-[#2b2b2d] p-5 text-center text-[#f2f2f7] ${macFont}`}>
      <div className="flex justify-center">
        <MacAppIcon />
      </div>
      <p className="mt-3 text-[0.9375rem] font-bold">Open “Underset”?</p>
      <p className="mt-2 text-xs leading-snug text-[#c7c7cc]">
        Apple is not able to verify that it is free from malware. Only open it if you got it from a source you trust.
      </p>
      <div className="mt-4 grid gap-2 text-[0.8125rem] font-medium">
        <span className={`rounded-lg bg-[#0a84ff] py-1.5 text-white ${hit}`}>Open Anyway</span>
        <span className="rounded-lg bg-[#48484a] py-1.5">Cancel</span>
      </div>
    </div>
  )
}
