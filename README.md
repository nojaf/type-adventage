# Type Advantage

Your opponent sends out a Poison type. You have three seconds to remember what
beats it. This app answers that in one tap.

Pick a type (or two, for dual types like Poison / Flying), say whether it is
theirs or yours, and it shows the damage multipliers both ways: when you attack
and when they attack. Installable as a PWA and works offline.

## Running it

```bash
bun install
bun dev
```

Then open the printed URL. On a phone, use `bun dev --host` and browse to your
machine's LAN address.

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `bun install`     | Install dependencies                  |
| `bun dev`         | Dev server with hot reload            |
| `bun run build`   | Type-check and build to `dist/`       |
| `bun run preview` | Serve the built `dist/` locally       |
| `bun fmt`         | Format everything                     |
| `bun lint`        | Type-aware lint with oxlint           |
| `bun check`       | Type-check                            |
| `bun run ci`      | Format check, lint, type-check, test  |
| `bun run icons`   | Regenerate the app icons in `public/` |

The service worker is disabled in dev. To exercise the offline behaviour, run
`bun run build && bun run preview`.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. One-time setup on the repo:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

The workflow passes `BASE_PATH=/<repo-name>/` to the build, so the asset URLs
and the service worker scope match wherever the repo ends up. Nothing to edit if
you rename the repo. For a user or org site (`<user>.github.io`), drop the
`BASE_PATH` env block from the workflow so the base stays `/`.

## How it works

- `src/types.ts` — the type chart and the multiplier maths. The chart is stored
  from the attacker's side: for each attacking type, which defenders take 2x,
  ½x, or nothing. Anything unlisted is neutral.
- `src/icons.ts` — the 18 type glyphs. Each one has to read as a flat
  silhouette, because the same path is drawn in the type's colour on a dark
  keyboard tile and in near-black on a bright badge. Internal detail is punched
  out with `fill-rule="evenodd"` rather than painted a second colour, which
  would disappear against one of the two.
- `src/main.ts` — state, rendering, and event delegation. No framework.

### Narrow screens

The layout holds from 233px up with no horizontal overflow. Two things make
that work, and both are easy to regress:

- Grid tracks are `minmax(0, 1fr)`, never bare `1fr`. A bare `1fr` is floored at
  the item's min-content width, so a long label silently pushes the whole grid
  wider than the viewport — including `#app`'s own implicit column, which
  stretches every row.
- `.results` sets `overflow-y: auto`, which computes `overflow-x` to `auto` as
  well. That means horizontal overflow inside it does _not_ show up in
  `document.documentElement.scrollWidth`; measure the containers directly.

Below 360px the header sheds the "Gen " prefix, and below 320px the second half
of the wordmark; below 300px the keyboard drops to two columns and the bulk "Clear"
button goes (each type chip still has its own remove button). The `Theirs` /
`Mine` toggle stays at every width; below about 420px the chips and Clear wrap
together onto a second line under it.

### Generations

The `Gen 6+` / `Gen 2-5` toggle in the header switches charts and is remembered
in `localStorage`. The differences:

- **Gen 6+** — Fairy exists. Steel resists neither Ghost nor Dark.
- **Gen 2-5** — No Fairy. Steel resists Ghost and Dark.

The picked types, and which side they belong to, deliberately aren't persisted:
they change every battle, so the app always opens ready for a fresh pick.

### Dual types

Multipliers multiply, so a dual type can reach 4x or ¼x. Immunity wins outright:
Ground does nothing to Poison / Flying no matter what the other half says.

When the picked types are the ones attacking, each target type is scored by the
_best_ multiplier either picked type can land, because the attacker chooses the
move. For the opponent's types that is the worst you can take, the number you
care about when deciding what to send in. For your own types it is the best you
can deal.

### Four views

The `Theirs` / `Mine` toggle says whose the picked types are, and the
`I attack` / `They attack` tabs say who throws the moves:

| Picked | I attack                                 | They attack                              |
| ------ | ---------------------------------------- | ---------------------------------------- |
| Theirs | Which of your move types hit them hard   | Which of your types their moves hit hard |
| Mine   | Which of their types your moves hit hard | Which of their move types hit you hard   |

Flipping the toggle keeps the picked types, so one pick answers all four.
