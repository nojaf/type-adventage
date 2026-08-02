import type { TypeId } from './types.ts'

/**
 * One glyph per type, drawn on a 24x24 grid and filled with `currentColor`.
 *
 * Every glyph has to read as a flat silhouette: the same path sits on a dark
 * keyboard tile in the type's colour and on a bright badge in near-black.
 * Internal detail is therefore punched out with `fill-rule="evenodd"` rather
 * than painted in a second colour, which would vanish on one of the two.
 */
const GLYPHS: Record<TypeId, string> = {
  normal:
    '<circle cx="12" cy="12" r="9.4" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="12" cy="12" r="4.2"/>',

  fire: '<path d="M12.6 2c.3 2.6-.6 4.3-2 5.9-1.7 1.9-3.9 3.6-3.9 6.9A6.4 6.4 0 0 0 19.4 15c0-2.4-1-4.4-2.3-6-.2 1-.7 1.8-1.5 2.4.2-3.6-1.2-7.1-3-9.4Z"/>',

  water:
    '<path d="M12 2.2c4 4.6 6.6 8 6.6 11.2a6.6 6.6 0 0 1-13.2 0C5.4 10.2 8 6.8 12 2.2Z"/>',

  electric: '<path d="M13.8 1.5 5 13.4h5.2L9.4 22.5 19 10.2h-5.6z"/>',

  grass:
    '<path d="M20.8 3.2C10.6 2.4 4.6 7 4.6 13.4c0 2 .6 3.7 1.6 5 .9-4.2 3.4-7.4 7.3-9.4-3 2.4-4.9 5.6-5.6 9.7 1 .5 2.2.8 3.4.8 5.6 0 9.5-5.7 9.5-16.3Z"/><path d="M6.2 18.4c-.7 1-1.2 2-1.5 3.1a.9.9 0 1 1-1.7-.5c.4-1.3 1-2.5 1.8-3.6Z"/>',

  ice: '<path d="M11 1.6h2v20.8h-2z"/><path d="M2.6 6.4 3.6 4.7l18 10.4-1 1.7z"/><path d="M21.6 4.7l1 1.7-18 10.4-1-1.7z"/><path d="m12 3.3 3 2.2-.9 1.3L12 5.5 9.9 6.8 9 5.5zM12 20.7l-3-2.2.9-1.3 2.1 1.3 2.1-1.3.9 1.3z"/>',

  // Fist with the knuckle groove cut out so it reads as a hand, not a mitten.
  fighting:
    '<path fill-rule="evenodd" d="M4.6 9.3c0-1.2 1-2.2 2.2-2.2h.7V3.9a2.2 2.2 0 0 1 4.4 0v3.2h1V2.9a2.2 2.2 0 0 1 4.4 0v4.6l1.3.6c1 .5 1.5 1.7 1.1 2.8l-1.7 4.9A5.4 5.4 0 0 1 12.8 22h-1.5a6.7 6.7 0 0 1-6.7-6.7Zm2 3h11a.9.9 0 0 1 0 1.8h-11a.9.9 0 0 1 0-1.8Z"/>',

  // Droplet with a skull punched through it.
  poison:
    '<path fill-rule="evenodd" d="M12 2.4c3.6 4.2 6 7.3 6 10.2a6 6 0 1 1-12 0c0-2.9 2.4-6 6-10.2Zm-1.9 8a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm3.8 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm-3.3 5.5h2.8l-.7 1.7h-1.4z"/><circle cx="19.2" cy="5" r="1.9"/><circle cx="5.2" cy="7" r="1.2"/>',

  // A slab of earth split by a fissure: the Ground identity is the quake.
  ground:
    '<path d="M2.4 7.4h9.2l-1.8 3.4 2.4 1.6-2 2.2 1.4 1.6H2.4a1.2 1.2 0 0 1-1.2-1.2V8.6a1.2 1.2 0 0 1 1.2-1.2Z"/><path d="M21.6 7.4h-8.4l-1.8 3.4 2.4 1.6-2 2.2 1.4 1.6h8.4a1.2 1.2 0 0 0 1.2-1.2V8.6a1.2 1.2 0 0 0-1.2-1.2Z"/><path d="M4.2 19.2h5.2v2.2H4.2zm10.6 0h5v2.2h-5z"/>',

  flying:
    '<path d="M22 4.4c-1.1 6.9-5.3 10.7-11.4 10.7-1.9 0-3.4-.3-4.6-.8 1.9-.3 3.5-1 4.8-2-3.5-.6-6-2.5-7.4-5.7 1.6 1.1 3.2 1.7 4.9 1.8C6.5 6.9 5.4 5.2 5 3.1c1.9 1.9 4 3 6.4 3.2 1.9.2 3.6-.1 5.1-.8 1.5-.7 2.7-1.1 5.5-1.1Z"/><path d="M9.6 16.9c-1.9 1.7-4.1 3-6.6 3.8a.9.9 0 0 1-.6-1.7c2.2-.7 4.1-1.8 5.7-3.2Z"/>',

  psychic:
    '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 3.2c3 0 5.3 2 5.3 4.8 0 2.4-1.9 4-4.2 4-1.9 0-3.2-1.2-3.2-2.8 0-1.4 1-2.4 2.4-2.4 1 0 1.8.6 1.8 1.5 0 .7-.5 1.2-1.1 1.2-.4 0-.7-.2-.8-.5.5-.1.7-.4.7-.7 0-.4-.4-.7-.9-.7-.7 0-1.2.6-1.2 1.4 0 1 .9 1.8 2.2 1.8 1.6 0 2.8-1.2 2.8-2.9 0-2-1.8-3.5-4.2-3.5-2.8 0-5 2-5 4.8 0 3.1 2.4 5.4 5.9 5.4a.9.9 0 0 1 0 1.8c-4.4 0-7.7-3-7.7-7.2 0-3.8 3-6.7 7.2-6.7Z"/>',

  bug: '<path d="M12 6.6c2.6 0 4.6 2.3 4.6 5.6S14.6 21 12 21s-4.6-5.5-4.6-8.8S9.4 6.6 12 6.6Z"/><path d="M12 2.4a3.1 3.1 0 0 1 3 2.4 6.2 6.2 0 0 0-6 0 3.1 3.1 0 0 1 3-2.4Z"/><path d="M9.6 1.9a.9.9 0 0 1 .5 1.2L9.4 4.6a.9.9 0 1 1-1.6-.8l.7-1.4a.9.9 0 0 1 1.1-.5Zm4.8 0a.9.9 0 0 1 1.1.5l.7 1.4a.9.9 0 1 1-1.6.8l-.7-1.5a.9.9 0 0 1 .5-1.2Z"/><path d="M7.3 8.3 3.1 6.1a.9.9 0 1 0-.8 1.6l4.3 2.2Zm0 5.4-4.2 2.2a.9.9 0 1 0 .8 1.6l4-2.1Zm9.4-5.4 4.2-2.2a.9.9 0 1 1 .8 1.6l-4.3 2.2Zm0 5.4 4.2 2.2a.9.9 0 1 1-.8 1.6l-4-2.1Z"/>',

  // A cairn: three stacked stones survive as a silhouette where facet lines do not.
  rock: '<path d="M12 2.2c2.8 0 5.1 1.6 5.1 3.5S14.8 9.2 12 9.2 6.9 7.6 6.9 5.7 9.2 2.2 12 2.2Z"/><path d="M9.2 10.6h5.6c3.2 0 5.8 1.7 5.8 3.7s-2.6 3.7-5.8 3.7H9.2c-3.2 0-5.8-1.7-5.8-3.7s2.6-3.7 5.8-3.7Z"/><path d="M6.8 19.2h10.4c1.8 0 3.2.7 3.2 1.5s-1.4 1.5-3.2 1.5H6.8c-1.8 0-3.2-.7-3.2-1.5s1.4-1.5 3.2-1.5Z"/>',

  // Ghost with the eyes punched through.
  ghost:
    '<path fill-rule="evenodd" d="M12 2a7.3 7.3 0 0 0-7.3 7.3v11.1c0 .9 1 1.4 1.7.9l1.9-1.4 2 1.4a1 1 0 0 0 1.2 0l2-1.4 1.9 1.4c.7.5 1.7 0 1.7-.9V9.3A7.3 7.3 0 0 0 12 2ZM9.5 7.6a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm5 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"/>',

  // A three-talon claw mark: reads as "dragon" at 20px where a full wyrm cannot.
  dragon:
    '<g><path d="M12 3.1c1 3.2 1.5 6.6 1.5 10.1 0 2.9-.4 5.7-1.1 8.3h-.8c-.7-2.6-1.1-5.4-1.1-8.3 0-3.5.5-6.9 1.5-10.1Z" transform="rotate(-27 12 22.2)"/><path d="M12 1.7c1.1 3.6 1.7 7.4 1.7 11.4 0 3.2-.4 6.3-1.3 9.1h-.8c-.9-2.8-1.3-5.9-1.3-9.1 0-4 .6-7.8 1.7-11.4Z"/><path d="M12 3.1c1 3.2 1.5 6.6 1.5 10.1 0 2.9-.4 5.7-1.1 8.3h-.8c-.7-2.6-1.1-5.4-1.1-8.3 0-3.5.5-6.9 1.5-10.1Z" transform="rotate(27 12 22.2)"/></g>',

  dark: '<path d="M13.6 2.3A9.8 9.8 0 1 0 21.7 14a7.7 7.7 0 0 1-8.1-11.7Z"/><path d="m17.5 2 .9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',

  // Hex nut: the bore is a cutout, not a dark overlay.
  steel:
    '<path fill-rule="evenodd" d="M12 1.9 20.7 7v10L12 22.1 3.3 17V7Zm0 6.1a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>',

  fairy:
    '<path d="M12 1.8c.9 4.7 3.5 7.4 8.2 8.2-4.7.9-7.3 3.5-8.2 8.2-.9-4.7-3.5-7.3-8.2-8.2 4.7-.8 7.3-3.5 8.2-8.2Z"/><path d="M18.4 15.6c.4 2 1.5 3.1 3.4 3.5-2 .4-3 1.5-3.4 3.5-.4-2-1.5-3.1-3.4-3.5 2-.4 3-1.5 3.4-3.5Z"/><path d="M5.6 14.4c.3 1.5 1.1 2.3 2.5 2.6-1.4.3-2.2 1.1-2.5 2.6-.3-1.5-1.1-2.3-2.5-2.6 1.4-.3 2.2-1.1 2.5-2.6Z"/>',
}

/** Inline SVG for a type glyph, sized in `em` so it tracks the label. */
export function typeIcon(id: TypeId, size = '1.15em'): string {
  return `<svg class="glyph" viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" aria-hidden="true" focusable="false">${GLYPHS[id]}</svg>`
}

/** The two climbing chevrons from the app icon, reused in the empty state. */
export function appMark(size = 56): string {
  return `<svg viewBox="0 0 512 512" width="${size}" height="${size}" aria-hidden="true" focusable="false">
    <polyline points="132,262 256,150 380,262" fill="none" stroke="#EE8130" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="132,358 256,246 380,358" fill="none" stroke="#6390F0" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

/** Chevron used on the keyboard drawer handle. */
export function chevron(): string {
  return `<svg class="chev" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 8.6 19.4 16l-1.8 1.8L12 12.2l-5.6 5.6L4.6 16z"/></svg>`
}
