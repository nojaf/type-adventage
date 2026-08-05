import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/archivo'
import './style.css'
import { appMark, chevron, typeIcon } from './icons.ts'
import {
  GENERATION_LABEL,
  GENERATION_NOTE,
  TYPE_INFO,
  TYPES_IN,
  multiplierAgainst,
  multiplierFrom,
  multiplierLabel,
} from './types.ts'
import type { Generation, TypeId, TypeInfo } from './types.ts'

type Panel = 'attack' | 'defend'

interface State {
  gen: Generation
  selected: TypeId[]
  panel: Panel
  /** The type keyboard is a drawer so a long ladder can use the whole screen. */
  keysOpen: boolean
}

const STORE_KEY = 'type-advantage/state'
const MAX_SELECTED = 2

function load(): State {
  // Only the generation is worth remembering across sessions. The opponent
  // changes every battle, so the app always opens ready for a fresh pick.
  const fallback: State = {
    gen: 'modern',
    selected: [],
    panel: 'attack',
    keysOpen: true,
  }
  try {
    const raw: string | null = localStorage.getItem(STORE_KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw) as Partial<State>
    return {
      ...fallback,
      gen: saved.gen === 'classic' ? 'classic' : 'modern',
    }
  } catch {
    return fallback
  }
}

function save(state: State) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ gen: state.gen }))
  } catch {
    // Private browsing with storage disabled: the app still works, it just forgets.
  }
}

const state: State = load()

// --- rendering ---------------------------------------------------------

function badge(id: TypeId): string {
  const t: TypeInfo = TYPE_INFO[id]
  return `<span class="badge" style="--fill:${t.color};--ink:${t.ink}">${typeIcon(id)}${t.name}</span>`
}

/** One row of the effectiveness ladder: the multiplier, then the types on it. */
function rung(value: number, ids: TypeId[]): string {
  if (!ids.length) return ''
  const tier = value >= 2 ? 'high' : value === 0 ? 'zero' : 'low'
  return `
    <div class="rung rung--${tier}">
      <span class="rung__value">${multiplierLabel(value)}</span>
      <div class="rung__badges">${ids.map(badge).join('')}</div>
    </div>`
}

function ladder(
  order: number[],
  grouped: Map<number, TypeId[]>,
  emptyNote: string,
): string {
  const rows: string = order
    .map((v: number) => rung(v, grouped.get(v) ?? []))
    .filter(Boolean)
    .join('')
  return rows || `<p class="note">${emptyNote}</p>`
}

function group(
  values: Array<[TypeId, number]>,
  keep: (v: number) => boolean,
): Map<number, TypeId[]> {
  const out: Map<number, TypeId[]> = new Map()
  for (const [id, v] of values) {
    if (!keep(v)) continue
    const bucket: TypeId[] | undefined = out.get(v)
    if (bucket) bucket.push(id)
    else out.set(v, [id])
  }
  return out
}

function renderAttack(): string {
  const pool: TypeInfo[] = TYPES_IN[state.gen]
  const scored: Array<[TypeId, number]> = pool.map(
    (t: TypeInfo) =>
      [t.id, multiplierAgainst(t.id, state.selected, state.gen)] as [
        TypeId,
        number,
      ],
  )
  // 1x is the default assumption, so listing it would only add noise.
  const grouped: Map<number, TypeId[]> = group(scored, (v: number) => v !== 1)
  return ladder(
    [4, 2, 0.5, 0.25, 0],
    grouped,
    'Nothing is more or less effective. Any type hits for neutral damage.',
  )
}

function renderDefend(): string {
  const pool: TypeInfo[] = TYPES_IN[state.gen]
  const scored: Array<[TypeId, number]> = pool.map(
    (t: TypeInfo) =>
      [t.id, multiplierFrom(state.selected, t.id, state.gen)] as [
        TypeId,
        number,
      ],
  )
  const grouped: Map<number, TypeId[]> = group(scored, (v: number) => v !== 1)
  return ladder(
    [2, 0.5, 0],
    grouped,
    'Its moves hit every type for neutral damage.',
  )
}

function renderResults(): string {
  if (!state.selected.length) {
    return `
      <div class="empty">
        ${appMark(52)}
        <h2>Who are you up against?</h2>
        <p>Tap the opponent's type below. Add a second one for dual types like Poison / Flying.</p>
      </div>`
  }

  const names: string = state.selected
    .map((id: TypeId) => TYPE_INFO[id].name)
    .join(' / ')
  const heading =
    state.panel === 'attack'
      ? `Your moves against ${names}`
      : `${names} moves against you`
  const body: string =
    state.panel === 'attack' ? renderAttack() : renderDefend()

  return `
    <div class="tabs" role="tablist">
      <button role="tab" data-panel="attack" aria-selected="${state.panel === 'attack'}">Your attacks</button>
      <button role="tab" data-panel="defend" aria-selected="${state.panel === 'defend'}">Their attacks</button>
    </div>
    <h2 class="results__heading">${heading}</h2>
    ${body}`
}

function renderOpponent(): string {
  const slots: string = state.selected
    .map(
      (id: TypeId) =>
        `<button class="slot" data-drop="${id}" style="--fill:${TYPE_INFO[id].color};--ink:${TYPE_INFO[id].ink}">
           ${typeIcon(id)}<span class="slot__name">${TYPE_INFO[id].name}</span>
           <svg class="slot__x" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="m12 10.6 5-5 1.4 1.4-5 5 5 5-1.4 1.4-5-5-5 5L5.6 17l5-5-5-5L7 5.6z"/></svg>
           <span class="sr-only">Remove ${TYPE_INFO[id].name}</span>
         </button>`,
    )
    .join('')

  const hint =
    state.selected.length === 0
      ? '<span class="slot slot--ghost">Nothing picked</span>'
      : state.selected.length === 1
        ? '<button class="slot slot--ghost" data-open-keys>+ second type</button>'
        : ''

  const clear = state.selected.length
    ? '<button class="clear" data-clear>Clear</button>'
    : ''

  return `<span class="opponent__label">Opponent</span><div class="opponent__slots">${slots}${hint}</div>${clear}`
}

/**
 * With nothing picked there is no answer to give the screen to, and picking is
 * the only thing left to do, so the drawer stays open no matter what was
 * toggled earlier.
 */
function keysOpen(): boolean {
  return !state.selected.length || state.keysOpen
}

function renderKeyboard(): string {
  // Alphabetical, not the in-game order: you arrive knowing the name you want,
  // and scanning for it is faster than recalling where it sits in the chart.
  const keys: string = TYPES_IN[state.gen]
    .toSorted((a: TypeInfo, b: TypeInfo) => a.name.localeCompare(b.name))
    .map((t: TypeInfo) => {
      const on: boolean = state.selected.includes(t.id)
      const full: boolean = state.selected.length >= MAX_SELECTED && !on
      return `<button class="key${on ? ' is-on' : ''}" data-type="${t.id}"
        style="--fill:${t.color};--ink:${t.ink}"
        aria-pressed="${on}"${full ? ' disabled' : ''}>${typeIcon(t.id)}<span>${t.name}</span></button>`
    })
    .join('')

  // A toggle that cannot close anything is only a dead target, so the handle
  // appears once there is something to collapse back to.
  const handle = state.selected.length
    ? `<button class="handle" data-keys aria-expanded="${keysOpen()}" aria-controls="keys">
      ${chevron()}<span>${keysOpen() ? 'Hide types' : 'Pick a type'}</span>
    </button>`
    : ''
  return `
    ${handle}
    <div class="keys" id="keys"${keysOpen() ? '' : ' hidden'}>${keys}</div>`
}

function renderGenToggle(): string {
  // "Gen " is dropped on narrow screens, so it is a separate element. The
  // accessible name keeps the full label either way.
  return (['modern', 'classic'] as Generation[])
    .map((g: Generation) => {
      const [pre, rest] = GENERATION_LABEL[g].split(/(?<=Gen )/)
      return `<button data-gen="${g}" aria-pressed="${state.gen === g}"
        aria-label="${GENERATION_LABEL[g]} type chart" title="${GENERATION_NOTE[g]}"
      ><span class="gen__pre">${pre}</span>${rest}</button>`
    })
    .join('')
}

const app: HTMLDivElement = document.querySelector<HTMLDivElement>('#app')!

function render() {
  const accent: string = state.selected.length
    ? TYPE_INFO[state.selected[0]].color
    : '#4C5769'
  app.style.setProperty('--accent', accent)

  app.innerHTML = `
    <header class="topbar">
      <h1 class="wordmark">Type<em>Advantage</em></h1>
      <div class="gen" role="group" aria-label="Type chart generation">${renderGenToggle()}</div>
    </header>
    <div class="opponent">${renderOpponent()}</div>
    <main class="results" id="results">${renderResults()}</main>
    <footer class="keyboard${keysOpen() ? '' : ' is-closed'}">${renderKeyboard()}</footer>`

  save(state)
}

// --- interaction -------------------------------------------------------

app.addEventListener('click', (event: MouseEvent) => {
  const el = event.target as HTMLElement
  function hit(attr: string): string | null {
    return (
      (el.closest(`[${attr}]`) as HTMLElement | null)?.getAttribute(attr) ??
      null
    )
  }

  const type: string | null = hit('data-type')
  if (type) {
    toggleType(type as TypeId)
    return
  }

  const drop: string | null = hit('data-drop')
  if (drop) {
    state.selected = state.selected.filter((id: TypeId) => id !== drop)
    render()
    return
  }

  const gen: string | null = hit('data-gen')
  if (gen) {
    state.gen = gen as Generation
    const known: Set<TypeId> = new Set(
      TYPES_IN[state.gen].map((t: TypeInfo) => t.id),
    )
    state.selected = state.selected.filter((id: TypeId) => known.has(id))
    render()
    return
  }

  const panel: string | null = hit('data-panel')
  if (panel) {
    state.panel = panel as Panel
    render()
    return
  }

  if (el.closest('[data-keys]')) {
    state.keysOpen = !state.keysOpen
    render()
    return
  }

  if (el.closest('[data-open-keys]')) {
    state.keysOpen = true
    render()
    return
  }

  if (el.closest('[data-clear]')) {
    state.selected = []
    state.keysOpen = true
    render()
  }
})

function toggleType(id: TypeId) {
  if (state.selected.includes(id)) {
    state.selected = state.selected.filter((t: TypeId) => t !== id)
  } else if (state.selected.length < MAX_SELECTED) {
    state.selected = [...state.selected, id]
  }
  // With both slots filled the pick is done, so give the screen back to the
  // answer. Dropping below two means another pick is likely.
  state.keysOpen = state.selected.length < MAX_SELECTED
  render()
  document.getElementById('results')?.scrollTo({ top: 0 })
}

render()
