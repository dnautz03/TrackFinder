/**
 * Illustrative data for the hero animation. Artists and titles are invented
 * and the panel is labelled "Example" on the page.
 */
export type TrackKind = 'keep' | 'id' | 'dupe'

export interface SetTrack {
  /** start position inside its set, 0–1 */
  at: number
  artist: string
  title: string
  kind: TrackKind
}

export interface ExampleSet {
  label: string
  minutes: number
  tracks: SetTrack[]
}

export const EXAMPLE_SETS: ExampleSet[] = [
  {
    label: 'Jun 08',
    minutes: 92,
    tracks: [
      { at: 0.0, artist: 'Mira Kessel', title: 'Low Orbit', kind: 'keep' },
      { at: 0.24, artist: 'Oscuro & Vane', title: 'Night Shift', kind: 'keep' },
      { at: 0.5, artist: 'ID', title: 'ID', kind: 'id' },
      { at: 0.76, artist: 'Talen Roux', title: 'Static Bloom', kind: 'keep' },
    ],
  },
  {
    label: 'Jul 13',
    minutes: 118,
    tracks: [
      { at: 0.0, artist: 'Juno Raas', title: 'Paper Moons', kind: 'keep' },
      { at: 0.3, artist: 'Mira Kessel', title: 'Low Orbit', kind: 'dupe' },
      { at: 0.55, artist: 'Kaelo', title: 'Undertow', kind: 'keep' },
      { at: 0.8, artist: 'ID', title: 'Unreleased', kind: 'id' },
    ],
  },
  {
    label: 'Aug 22',
    minutes: 75,
    tracks: [
      { at: 0.0, artist: 'Oscuro & Vane', title: 'Night Shift', kind: 'dupe' },
      { at: 0.28, artist: 'Seren Moto', title: 'Glasshouse', kind: 'keep' },
      { at: 0.6, artist: 'Talen Roux', title: 'Afterlight', kind: 'keep' },
    ],
  },
]

/** Gap between sets on the shared timeline, as a fraction of one set. */
export const SET_GAP = 0.05

export interface TimelineMarker extends SetTrack {
  id: number
  setIndex: number
  /** absolute position on the whole timeline, 0–1 */
  pos: number
  /** h:mm:ss inside its set */
  stamp: string
}

export interface SetSpan {
  label: string
  start: number
  end: number
}

export function buildTimeline() {
  const n = EXAMPLE_SETS.length
  const unit = 1 / (n + SET_GAP * (n - 1))
  const spans: SetSpan[] = []
  const markers: TimelineMarker[] = []
  let id = 0
  EXAMPLE_SETS.forEach((set, s) => {
    const start = s * unit * (1 + SET_GAP)
    const end = start + unit
    spans.push({ label: set.label, start, end })
    set.tracks.forEach((t) => {
      const secs = Math.round(t.at * set.minutes * 60)
      const h = Math.floor(secs / 3600)
      const mm = Math.floor((secs % 3600) / 60)
      const ss = secs % 60
      markers.push({
        ...t,
        id: id++,
        setIndex: s,
        // nudge off the set edge so the playhead visibly "hits" it
        pos: start + Math.max(t.at, 0.02) * unit,
        stamp: `${h}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
      })
    })
  })
  return { spans, markers }
}
