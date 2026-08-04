import { describe, expect, test } from 'bun:test'
import {
  TYPES,
  effectiveness,
  multiplierAgainst,
  multiplierFrom,
} from './types.ts'
import type { TypeId, TypeInfo } from './types.ts'

const ALL: TypeId[] = TYPES.map((t: TypeInfo) => t.id)

describe('chart structure', () => {
  test('covers all 18 types in both directions', () => {
    expect(ALL).toHaveLength(18)
    for (const a of ALL) {
      for (const d of ALL) {
        const v: number = effectiveness(a, d, 'modern')
        expect([0, 0.5, 1, 2]).toContain(v)
      }
    }
  })

  test('each type has at least one weakness in the modern chart', () => {
    for (const d of ALL) {
      const attackers: TypeId[] = ALL.filter(
        (a: TypeId) => effectiveness(a, d, 'modern') === 2,
      )
      expect(attackers.length).toBeGreaterThan(0)
    }
  })
})

describe('modern chart (Gen 6+)', () => {
  // Attacker, defender, expected multiplier.
  const CASES: Array<[TypeId, TypeId, number]> = [
    // The immunities, which are the easiest thing to get wrong.
    ['normal', 'ghost', 0],
    ['fighting', 'ghost', 0],
    ['ghost', 'normal', 0],
    ['electric', 'ground', 0],
    ['ground', 'flying', 0],
    ['poison', 'steel', 0],
    ['psychic', 'dark', 0],
    ['dragon', 'fairy', 0],

    // Fairy, added in Gen 6.
    ['fairy', 'dragon', 2],
    ['fairy', 'dark', 2],
    ['fairy', 'fighting', 2],
    ['poison', 'fairy', 2],
    ['steel', 'fairy', 2],
    // Fairy is weak to Poison and Steel only; Fire is neutral on it.
    ['fire', 'fairy', 1],
    ['fairy', 'fire', 0.5],
    ['bug', 'fairy', 0.5],
    ['dark', 'fairy', 0.5],
    ['fighting', 'fairy', 0.5],

    // Gen 6 removed these two Steel resistances.
    ['ghost', 'steel', 1],
    ['dark', 'steel', 1],

    // Ordinary bread and butter.
    ['water', 'fire', 2],
    ['fire', 'grass', 2],
    ['grass', 'water', 2],
    ['ground', 'electric', 2],
    ['ice', 'dragon', 2],
    ['fighting', 'steel', 2],
    ['ground', 'poison', 2],
    ['psychic', 'poison', 2],
    ['fire', 'water', 0.5],
    ['grass', 'steel', 0.5],
    ['rock', 'steel', 0.5],
    ['normal', 'rock', 0.5],
    ['electric', 'grass', 0.5],
  ]

  for (const [a, d, want] of CASES) {
    test(`${a} -> ${d} is ${want}x`, () => {
      expect(effectiveness(a, d, 'modern')).toBe(want)
    })
  }
})

describe('classic chart (Gen 2-5)', () => {
  test('Steel resists Ghost and Dark', () => {
    expect(effectiveness('ghost', 'steel', 'classic')).toBe(0.5)
    expect(effectiveness('dark', 'steel', 'classic')).toBe(0.5)
  })

  test('everything else matches the modern chart', () => {
    for (const a of ALL) {
      for (const d of ALL) {
        if (d === 'steel' && (a === 'ghost' || a === 'dark')) continue
        expect(effectiveness(a, d, 'classic')).toBe(
          effectiveness(a, d, 'modern'),
        )
      }
    }
  })
})

describe('dual types', () => {
  test('multipliers stack to 4x', () => {
    // Rock hits both halves of Fire / Flying.
    expect(multiplierAgainst('rock', ['fire', 'flying'], 'modern')).toBe(4)
    // Ice hits both halves of Grass / Dragon.
    expect(multiplierAgainst('ice', ['grass', 'dragon'], 'modern')).toBe(4)
  })

  test('multipliers stack down to a quarter', () => {
    expect(multiplierAgainst('grass', ['poison', 'flying'], 'modern')).toBe(
      0.25,
    )
  })

  test('an immunity on either half wins outright', () => {
    // Ground is 2x on Poison but cannot touch Flying at all.
    expect(multiplierAgainst('ground', ['poison', 'flying'], 'modern')).toBe(0)
    expect(multiplierAgainst('ground', ['poison'], 'modern')).toBe(2)
  })

  test('Poison / Flying is countered by Electric, Ice, Psychic and Rock', () => {
    const best: TypeId[] = ALL.filter(
      (a: TypeId) => multiplierAgainst(a, ['poison', 'flying'], 'modern') === 2,
    )
    expect(best.toSorted()).toEqual(['electric', 'ice', 'psychic', 'rock'])
  })
})

describe('incoming damage', () => {
  test("takes the worst of the opponent's two types", () => {
    // Poison is 2x on Grass, Flying is 2x on Grass: still 2x.
    expect(multiplierFrom(['poison', 'flying'], 'grass', 'modern')).toBe(2)
    // Poison cannot touch Steel, but Flying hits it for half.
    expect(multiplierFrom(['poison', 'flying'], 'steel', 'modern')).toBe(0.5)
    // Neither half does anything to a type both are immune to.
    expect(multiplierFrom(['normal'], 'ghost', 'modern')).toBe(0)
  })
})
