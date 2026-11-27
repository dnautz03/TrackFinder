// Run with: npm test  (Node's built-in runner; samples are the desktop app's saved fixtures)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isBlocked, looksReal, parseArtistSearch, parseSearchPages, parseSetSearch } from '../worker/parse.ts'
import {
  collectSets, foldName, latestSet, fmtRange, nameIn, pickArtist, presetFor, presetRange, shortTitle, shouldStop,
  titlePerformerPart, type Candidate, type PreviewSet,
} from '../src/lib/preview.ts'

const SET_ITEM = `
<div class="bItm action oItm" data-id="2jrdk51t" id="2jrdk51t">
 <div class="bCont"><div class="bTitle" onclick="cancelBubble();">
  <a class="" href="/tracklist/2jrdk51t/franky-rizardo-flow-682-2026-11-09.html">Franky Rizardo - FLOW 682</a>
 </div></div>
 <div class="mediaRow iRow">
  <div title="tracklist date"><i class="fa fa-calendar fa-20 spR"></i> 2026-11-09</div>
  <div title="IDed tracks / total tracks"><i class="fa fa-check fa-20 spR"></i> 04/16</div>
 </div>
</div>`
const PAGER = `<ul class="pagination bs"><li class="disabled"><a href="#">Prev</a></li><li class="active"><a href="#">1</a></li>
<li class="" onclick="submitForm(this, { form: 'searchForm', page: 2, noAnker: true } );"><a href="#">Next</a></li></ul>`
const SET_PAGE = `<html><body><div id="csMiddle"><div id="sDivTracklists">${SET_ITEM}
<div class="bItm oItm"><div class="bTitle"><a href="/tracklist/9yj0689/x.html">Franky Rizardo @ Time Warp</a></div>
<div title="IDed tracks / total tracks">all/31</div></div></div>${PAGER}</div></body></html>`
const ARTIST_PAGE = `<div id="csMiddle"><div class="bItm oItm" data-id="14mvm9w">
 <div class="bCont acSa"><div class="bTitle">
  <a class="notranslate" href="/artist/martin-garrix/tracklists.html" title="open artist page">Martin Garrix</a>
  <img alt="Netherlands" class="flag" height="32" src="/images/flags/nl.png" title="Netherlands" width="32"/>
 </div>
 <div class="left"><span class="badge spR">326</span> tracks <span class="badge spR">1547</span> tracklists</div></div>
</div></div>`
const TURNSTILE = `<title>1001Tracklists</title><script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
<input type="hidden" name="captcha" value="1"> <div id="turnstile-container" class="c"></div>`

test('parses an artist card', () => {
  assert.deepEqual(parseArtistSearch(ARTIST_PAGE), [
    { id: 'martin-garrix', name: 'Martin Garrix', country: 'Netherlands', tracklists: 1547, tracks: 326 },
  ])
})

test('parses tracklist search results and pagination', () => {
  assert.deepEqual(parseSetSearch(SET_PAGE), [
    {
      id: '2jrdk51t',
      url: 'https://www.1001tracklists.com/tracklist/2jrdk51t/franky-rizardo-flow-682-2026-11-09.html',
      title: 'Franky Rizardo - FLOW 682',
      date: '2026-11-09',
      ided: 4,
      total: 16,
    },
    { id: '9yj0689', url: 'https://www.1001tracklists.com/tracklist/9yj0689/x.html', title: 'Franky Rizardo @ Time Warp', date: null, ided: 31, total: 31 },
  ])
  assert.deepEqual(parseSearchPages(SET_PAGE), [1, 2])
  assert.deepEqual(parseSearchPages('<div></div>'), [1, 1])
  assert.deepEqual(parseSetSearch('<div id="csMiddle">no results</div>'), [])
  assert.throws(() => parseSetSearch('<div>changed layout</div>'))
})

test('detects human checks', () => {
  assert.equal(isBlocked(206, SET_PAGE), true)
  assert.equal(isBlocked(200, TURNSTILE), true)
  assert.equal(isBlocked(200, SET_PAGE), false)
  assert.equal(looksReal(SET_PAGE), true)
  assert.equal(looksReal(TURNSTILE), false)
})

test('folds names like the desktop app', () => {
  assert.equal(foldName('  Tiësto  '), 'tiesto')
  assert.equal(foldName('Don’t'), "don't")
  assert.ok(nameIn('Tiesto', 'Tiësto b2b Martin Garrix'))
  assert.ok(!nameIn('Martin', 'Martinez Brothers'))
  assert.equal(titlePerformerPart('Tiësto b2b Martin Garrix @ Mainstage, Ultra'), 'Tiësto b2b Martin Garrix')
})

const c = (id: string, name: string, tracklists: number): Candidate => ({ id, name, country: null, tracklists, tracks: 0 })

test('picks an artist only when unambiguous', () => {
  const found = [c('martin-garrix', 'Martin Garrix', 1547), c('martin-garrix-x', 'Martin Garrix & Friends', 3)]
  assert.equal(pickArtist(found, 'martin garrix')?.id, 'martin-garrix')
  assert.equal(pickArtist(found, 'Martin Garr'), null)
  assert.equal(pickArtist([c('a1', 'Antares', 5), c('a2', 'Antares', 9)], 'Antares'), null)
  assert.equal(pickArtist([c('m', 'Martin (JP)', 0), c('x', 'Martin Solveig', 400)], 'Martin'), null)
})

test('period presets', () => {
  assert.deepEqual(presetRange('last30', '2026-11-27'), ['2026-10-28', '2026-11-27'])
  assert.deepEqual(presetRange('summer', '2026-11-27'), ['2026-06-01', '2026-08-31'])
  assert.deepEqual(presetRange('summer', '2026-07-10'), ['2026-06-01', '2026-07-10'])
  assert.deepEqual(presetRange('summer', '2026-03-01'), ['2025-06-01', '2025-08-31'])
  assert.deepEqual(presetRange('year', '2026-11-27'), ['2026-01-01', '2026-11-27'])
  assert.equal(presetFor('2026-06-01', '2026-08-31', '2026-11-27'), 'summer')
  assert.equal(presetFor('2026-06-02', '2026-08-31', '2026-11-27'), 'custom')
  assert.equal(fmtRange('2026-06-01', '2026-08-31'), '1 Jun – 31 Aug 2026')
  assert.equal(fmtRange('2025-12-01', '2026-01-15'), '1 Dec 2025 – 15 Jan 2026')
})

const s = (id: string, title: string, date: string | null): PreviewSet => ({ id, url: id, title, date, ided: 1, total: 2 })

test('collects sets: period, other DJs, duplicates', () => {
  const pages = [
    s('a', 'Franky Rizardo - FLOW 684', '2026-11-23'),
    s('b', 'Martin Garrix @ Club', '2026-11-20'), // another DJ
    s('c', 'Radio Show - Guest Mix by Franky Rizardo', '2026-11-19'), // name only after the performer part
    s('d', 'Franky Rizardo @ Old Show', '2026-05-01'), // outside the period
    s('a', 'Franky Rizardo - FLOW 684 (edited)', '2026-11-23'), // repeated on the next page
    s('e', 'Franky Rizardo b2b X @ Y', null), // no date: kept
  ]
  const { sets, skipped } = collectSets(pages, 'Franky Rizardo', '2026-06-01', '2026-11-27')
  assert.deepEqual(sets.map((x) => [x.id, x.title]), [['a', 'Franky Rizardo - FLOW 684 (edited)'], ['e', 'Franky Rizardo b2b X @ Y']])
  assert.equal(skipped, 2)
})

test('paging stops like the desktop app', () => {
  const found = [s('a', 't', '2026-07-01'), s('b', 't', '2026-05-20')]
  assert.equal(shouldStop([], 1, 3, '2026-06-01', 1), 'done')
  assert.equal(shouldStop(found, 3, 3, '2026-01-01', 3), 'done')
  assert.equal(shouldStop(found, 1, 3, '2026-06-01', 1), 'done') // oldest set is before the start
  assert.equal(shouldStop(found, 1, 3, '2026-01-01', 1), null)
  assert.equal(shouldStop(found, 10, 12, '2026-01-01', 10), 'cap')
})

test('short titles', () => {
  assert.equal(shortTitle('Franky Rizardo - FLOW 682 2026-11-09', 'Franky Rizardo'), 'FLOW 682')
  assert.equal(shortTitle(null, 'X'), 'Untitled set')
})

test('latest set: the first set the DJ performed, newest first', () => {
  const pages = [
    s('x', 'Radio Show - Guest Mix by Franky Rizardo', '2026-11-25'), // only mentions the DJ
    s('a', 'Franky Rizardo - FLOW 684', '2026-11-23'),
    s('b', 'Franky Rizardo @ Time Warp', '2026-11-21'),
  ]
  assert.equal(latestSet(pages, 'Franky Rizardo', '2026-11-27')?.id, 'a')
  assert.equal(latestSet(pages.slice(0, 1), 'Franky Rizardo', '2026-11-27'), null)
  assert.deepEqual(presetRange('latest', '2026-11-27'), ['2005-01-01', '2026-11-27'])
  assert.equal(presetFor('2005-01-01', '2026-11-27', '2026-11-27'), 'custom') // never picked by dates
})
