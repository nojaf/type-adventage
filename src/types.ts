/**
 * Pokemon type chart data.
 *
 * The chart is stored from the attacker's point of view: for each attacking
 * type we list which defending types take double, half, or no damage.
 * Everything not listed is neutral (1x).
 */

export type TypeId =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type Generation = "modern" | "classic";

export interface TypeInfo {
  id: TypeId;
  name: string;
  /** Badge fill, the canonical franchise colour for this type. */
  color: string;
  /** Text colour that clears 4.5:1 on top of `color`. */
  ink: string;
}

/** Canonical in-game type order. */
export const TYPES: TypeInfo[] = [
  { id: "normal", name: "Normal", color: "#A8A77A", ink: "#12161C" },
  { id: "fire", name: "Fire", color: "#EE8130", ink: "#12161C" },
  { id: "water", name: "Water", color: "#6390F0", ink: "#12161C" },
  { id: "electric", name: "Electric", color: "#F7D02C", ink: "#12161C" },
  { id: "grass", name: "Grass", color: "#7AC74C", ink: "#12161C" },
  { id: "ice", name: "Ice", color: "#96D9D6", ink: "#12161C" },
  { id: "fighting", name: "Fighting", color: "#C22E28", ink: "#FFFFFF" },
  { id: "poison", name: "Poison", color: "#A33EA1", ink: "#FFFFFF" },
  { id: "ground", name: "Ground", color: "#E2BF65", ink: "#12161C" },
  { id: "flying", name: "Flying", color: "#A98FF3", ink: "#12161C" },
  { id: "psychic", name: "Psychic", color: "#F95587", ink: "#12161C" },
  { id: "bug", name: "Bug", color: "#A6B91A", ink: "#12161C" },
  { id: "rock", name: "Rock", color: "#B6A136", ink: "#12161C" },
  { id: "ghost", name: "Ghost", color: "#735797", ink: "#FFFFFF" },
  { id: "dragon", name: "Dragon", color: "#6F35FC", ink: "#FFFFFF" },
  { id: "dark", name: "Dark", color: "#705746", ink: "#FFFFFF" },
  { id: "steel", name: "Steel", color: "#B7B7CE", ink: "#12161C" },
  { id: "fairy", name: "Fairy", color: "#D685AD", ink: "#12161C" },
];

export const TYPE_INFO: Record<TypeId, TypeInfo> = Object.fromEntries(
  TYPES.map((t: TypeInfo) => [t.id, t]),
) as Record<TypeId, TypeInfo>;

interface Matchups {
  strong?: TypeId[];
  weak?: TypeId[];
  immune?: TypeId[];
}

/** Gen 6+ chart: Fairy exists, Steel no longer resists Ghost and Dark. */
const MODERN: Record<TypeId, Matchups> = {
  normal: { weak: ["rock", "steel"], immune: ["ghost"] },
  fire: {
    strong: ["grass", "ice", "bug", "steel"],
    weak: ["fire", "water", "rock", "dragon"],
  },
  water: {
    strong: ["fire", "ground", "rock"],
    weak: ["water", "grass", "dragon"],
  },
  electric: {
    strong: ["water", "flying"],
    weak: ["electric", "grass", "dragon"],
    immune: ["ground"],
  },
  grass: {
    strong: ["water", "ground", "rock"],
    weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
  },
  ice: {
    strong: ["grass", "ground", "flying", "dragon"],
    weak: ["fire", "water", "ice", "steel"],
  },
  fighting: {
    strong: ["normal", "ice", "rock", "dark", "steel"],
    weak: ["poison", "flying", "psychic", "bug", "fairy"],
    immune: ["ghost"],
  },
  poison: {
    strong: ["grass", "fairy"],
    weak: ["poison", "ground", "rock", "ghost"],
    immune: ["steel"],
  },
  ground: {
    strong: ["fire", "electric", "poison", "rock", "steel"],
    weak: ["grass", "bug"],
    immune: ["flying"],
  },
  flying: {
    strong: ["grass", "fighting", "bug"],
    weak: ["electric", "rock", "steel"],
  },
  psychic: {
    strong: ["fighting", "poison"],
    weak: ["psychic", "steel"],
    immune: ["dark"],
  },
  bug: {
    strong: ["grass", "psychic", "dark"],
    weak: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
  },
  rock: {
    strong: ["fire", "ice", "flying", "bug"],
    weak: ["fighting", "ground", "steel"],
  },
  ghost: { strong: ["psychic", "ghost"], weak: ["dark"], immune: ["normal"] },
  dragon: { strong: ["dragon"], weak: ["steel"], immune: ["fairy"] },
  dark: { strong: ["psychic", "ghost"], weak: ["fighting", "dark", "fairy"] },
  steel: {
    strong: ["ice", "rock", "fairy"],
    weak: ["fire", "water", "electric", "steel"],
  },
  fairy: {
    strong: ["fighting", "dragon", "dark"],
    weak: ["fire", "poison", "steel"],
  },
};

/** Types that exist in each chart. Fairy arrived in Gen 6. */
export const TYPES_IN: Record<Generation, TypeInfo[]> = {
  modern: TYPES,
  classic: TYPES.filter((t: TypeInfo) => t.id !== "fairy"),
};

export const GENERATION_LABEL: Record<Generation, string> = {
  modern: "Gen 6+",
  classic: "Gen 2-5",
};

export const GENERATION_NOTE: Record<Generation, string> = {
  modern: "Fairy included. Steel resists neither Ghost nor Dark.",
  classic: "No Fairy type. Steel resists Ghost and Dark.",
};

/**
 * Effectiveness of one attacking type against one defending type.
 * Returns 2, 1, 0.5 or 0.
 */
export function effectiveness(
  attacker: TypeId,
  defender: TypeId,
  gen: Generation,
): number {
  // Gen 2-5 gave Steel two extra resistances that Gen 6 removed.
  if (gen === "classic" && defender === "steel") {
    if (attacker === "ghost" || attacker === "dark") return 0.5;
  }
  const m: Matchups = MODERN[attacker];
  if (m.immune?.includes(defender)) return 0;
  if (m.strong?.includes(defender)) return 2;
  if (m.weak?.includes(defender)) return 0.5;
  return 1;
}

/** Combined multiplier against a defender that may have one or two types. */
export function multiplierAgainst(
  attacker: TypeId,
  defenders: TypeId[],
  gen: Generation,
): number {
  return defenders.reduce(
    (total: number, d: TypeId) => total * effectiveness(attacker, d, gen),
    1,
  );
}

/** Best multiplier any of the attacking types can land on a single-type target. */
export function multiplierFrom(
  attackers: TypeId[],
  defender: TypeId,
  gen: Generation,
): number {
  return attackers.reduce(
    (best: number, a: TypeId) =>
      Math.max(best, effectiveness(a, defender, gen)),
    0,
  );
}

const LABELS: Map<number, string> = new Map([
  [4, "4×"],
  [2, "2×"],
  [1, "1×"],
  [0.5, "½×"],
  [0.25, "¼×"],
  [0, "0×"],
]);

export function multiplierLabel(value: number): string {
  return LABELS.get(value) ?? `${value}×`;
}
